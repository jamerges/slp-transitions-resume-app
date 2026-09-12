import { NextResponse } from "next/server";
import Stripe from "stripe";
import { claimOnce } from "@/lib/stash";
import { signAccess, unlockUrl, ACCESS_COOKIE, cookieOptions } from "@/lib/course-access";
import { sendGroundAccessEmail } from "@/lib/email";
import { upsertSubscriber, CUSTOMER_GROUPS } from "@/lib/mailerlite";
import { markCustomer, markGroundBuyer } from "@/lib/quiz-log";

export const runtime = "nodejs";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

/**
 * Turns a paid Ground session into access. Called by the welcome page (browser
 * path) and by the Stripe webhook (safety net); both may run, so everything
 * here is idempotent. The response sets the access cookie directly, so the
 * buyer who stays in the tab is in without touching email. The email carries
 * the same link for every other browser.
 */
export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId?: string };
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: `Payment not complete (status: ${session.payment_status})` }, { status: 402 });
    }
    if (session.metadata?.product !== "ground") {
      return NextResponse.json({ error: "Not a Ground purchase" }, { status: 400 });
    }
    const email = session.customer_details?.email || session.customer_email || "";
    const token = signAccess({ sid: session.id, product: "ground" });
    const link = unlockUrl(token);

    let emailSent = false;
    if (email && (await claimOnce(`ground_access:${session.id}`))) {
      try { await sendGroundAccessEmail({ to: email, unlockUrl: link }); emailSent = true; }
      catch (e) { console.error("[/api/ground-finalize] access email failed", e); }
    }
    if (email) {
      markCustomer(email).catch(() => {});
      markGroundBuyer(email, session.amount_total ?? 2400, session.id).catch(() => {});
      upsertSubscriber({ email, groups: [CUSTOMER_GROUPS.ground], fields: { customer_product: "$24 Before You Start Looking (Modules 1-2)" } }).catch(() => {});
    }

    const res = NextResponse.json({ ok: true, unlockUrl: link, email, emailSent });
    res.cookies.set(ACCESS_COOKIE, token, cookieOptions);
    return res;
  } catch (err: any) {
    console.error("[/api/ground-finalize]", err);
    return NextResponse.json({ error: err?.message || "Could not finish your purchase" }, { status: 500 });
  }
}
