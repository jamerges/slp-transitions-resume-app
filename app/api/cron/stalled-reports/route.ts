import { NextResponse } from "next/server";
import Stripe from "stripe";
import { claimOnce, retrieveInputs, retrieveResult } from "@/lib/stash";
import { sendReportReminderEmail, sendOpsAlert } from "@/lib/email";

/**
 * Daily sweep for $9 buyers who paid but never added a resume.
 *
 * Why this exists: on 2026-09-03 a replay showed four of the first six Pivot
 * Report buyers had stalled at the resume step. They got one link on purchase
 * day and then nothing. This sends exactly one reminder, 48 hours or more
 * after payment, to anyone still stalled within the last 14 days.
 *
 * Invoked by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` when that env var is set; the route
 * refuses to run without it so it cannot be triggered from outside.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

const DAY = 86_400;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const sessions = await getStripe().checkout.sessions.list({
    created: { gte: now - 14 * DAY, lte: now - 2 * DAY },
    status: "complete",
    limit: 100,
  });

  const reminded: string[] = [];
  const skipped = { notReport: 0, delivered: 0, hasResume: 0, alreadyReminded: 0, noEmail: 0 };

  for (const s of sessions.data) {
    if (s.payment_status !== "paid" || s.metadata?.product !== "pivot_report") {
      skipped.notReport++;
      continue;
    }
    const email = s.customer_details?.email || s.customer_email || "";
    if (!email) { skipped.noEmail++; continue; }

    const cached = await retrieveResult(s.id);
    if (cached?.report) { skipped.delivered++; continue; }

    const inputs = (await retrieveInputs(
      s.metadata?.stash_key || s.id,
      s.metadata?.payload || null
    )) as { resumeText?: string } | null;
    if (inputs?.resumeText && inputs.resumeText.trim().length >= 50) {
      skipped.hasResume++;
      continue;
    }

    if (!(await claimOnce(`reminder48:${s.id}`))) { skipped.alreadyReminded++; continue; }

    await sendReportReminderEmail({ to: email, sessionId: s.id });
    reminded.push(email);
  }

  if (reminded.length) {
    await sendOpsAlert({
      subject: `Stalled-report reminders sent: ${reminded.length}`,
      lines: reminded.map((e) => `reminded: ${e}`),
    }).catch(() => {});
  }

  return NextResponse.json({ scanned: sessions.data.length, reminded: reminded.length, skipped });
}
