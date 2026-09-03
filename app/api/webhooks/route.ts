import { NextResponse, after } from "next/server";
import Stripe from "stripe";
import { claimOnce, retrieveInputs, retrieveResult, type StashedInputs } from "@/lib/stash";
import { sendResumeLinkEmail, sendOpsAlert } from "@/lib/email";

export const runtime = "nodejs";
// Fulfilment runs after the 200 response via after(), but the function must
// stay alive long enough for a full generation to finish.
export const maxDuration = 300;

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";

/**
 * Server-side fulfilment safety net.
 *
 * Delivery used to depend entirely on the buyer's browser surviving the
 * redirect to /report and a ~90s generation. It doesn't always: one $9 buyer
 * paid at 3:32am, never completed, and nothing in the system noticed — no
 * alert, no retry, no second email. Stripe tells us about the payment
 * regardless of what the browser did, so fulfilment belongs here too.
 *
 * Everything below is idempotent. Generation is guarded by the result cache
 * that finalize checks first, and the resume-link email shares finalize's
 * `resume_link:` latch, so the browser path and this path can both run without
 * double-sending or double-charging tokens.
 */
async function fulfil(session: Stripe.Checkout.Session): Promise<void> {
  const sessionId = session.id;
  const email = session.customer_details?.email || session.customer_email || "";
  const product = session.metadata?.product === "pivot_report" ? "report" : "suite";
  const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
  const note: string[] = [
    `product: ${product === "report" ? "$9 Pivot Report" : "$24 Career Pivot Suite"}`,
    `amount: $${amount}`,
    `email: ${email || "(none captured)"}`,
    `session: ${sessionId}`,
  ];

  try {
    // Already delivered by the browser path? Nothing to do but say so.
    const cached = await retrieveResult(sessionId);
    if (cached?.report || cached?.results) {
      note.push("status: already delivered before webhook ran");
      await sendOpsAlert({ subject: `Sale: $${amount} (delivered)`, lines: note });
      return;
    }

    const inputs = (await retrieveInputs(
      session.metadata?.stash_key || sessionId,
      session.metadata?.payload || null
    )) as StashedInputs | null;

    const hasResume = !!inputs?.resumeText && inputs.resumeText.trim().length >= 50;

    if (!hasResume) {
      // Pay-first path: the resume arrives on /report. Send the way back from
      // here rather than trusting the browser to have loaded that page at all.
      if (email && (await claimOnce(`resume_link:${sessionId}`))) {
        await sendResumeLinkEmail({ to: email, sessionId });
        note.push("status: awaiting resume — sent the add-your-resume link");
      } else {
        note.push("status: awaiting resume — link already sent by the browser path");
      }
      note.push(`recover: ${APP_URL}/report?session_id=${sessionId}`);
      await sendOpsAlert({ subject: `Sale: $${amount} — awaiting resume`, lines: note });
      return;
    }

    // Inputs are complete, so deliver. Reuse the finalize route rather than
    // duplicating generation, caching and email logic in a second place.
    const route = product === "report" ? "report-finalize" : "finalize";
    const resp = await fetch(`${APP_URL}/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const body = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      note.push(`status: FULFILMENT FAILED (${resp.status})`);
      note.push(`error: ${String(body?.error || "").slice(0, 300)}`);
      note.push(`recover: ${APP_URL}/report?session_id=${sessionId}`);
      await sendOpsAlert({ subject: `⚠️ PAID BUT NOT DELIVERED — $${amount}`, lines: note });
      return;
    }
    if (body?.needsIntake) {
      note.push("status: finalize reports the resume is still missing");
      await sendOpsAlert({ subject: `Sale: $${amount} — awaiting resume`, lines: note });
      return;
    }
    note.push(`status: delivered by webhook (email sent: ${body?.emailSent === true})`);
    await sendOpsAlert({ subject: `Sale: $${amount} (delivered)`, lines: note });
  } catch (err: any) {
    console.error("[stripe-webhook] fulfilment error", err);
    note.push(`status: FULFILMENT THREW — ${String(err?.message || err).slice(0, 300)}`);
    note.push(`recover: ${APP_URL}/report?session_id=${sessionId}`);
    // A failed alert must not mask the original failure in the logs.
    await sendOpsAlert({
      subject: `⚠️ PAID BUT NOT DELIVERED — $${amount}`,
      lines: note,
    }).catch((e) => console.error("[stripe-webhook] alert failed", e));
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  // Fail closed. An unsigned request must never reach fulfil(): it sends
  // customer email and spends generation, so a forged body is a free product
  // plus a mailbox. The old "accept unverified in dev" branch is exactly how
  // the 2026-08-15 synthetic test passed against a route Stripe never called.
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error("[stripe-webhook] signature verification failed", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      console.log("[stripe-webhook] checkout.session.completed", {
        id: s.id,
        email: s.customer_details?.email,
        amount: s.amount_total,
        product: s.metadata?.product,
      });
      // Stripe retries anything that doesn't answer within seconds, and a
      // generation takes ~90s — so acknowledge first and fulfil after.
      after(() => fulfil(s));
      break;
    }
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
      console.log(`[stripe-webhook] ${event.type}`, (event.data.object as any).id);
      break;
    default:
      // ignore
      break;
  }

  return NextResponse.json({ received: true });
}
