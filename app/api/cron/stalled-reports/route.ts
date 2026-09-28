import { NextResponse } from "next/server";
import Stripe from "stripe";
import { retrieveResult } from "@/lib/stash";
import { sendOpsAlert } from "@/lib/email";

/**
 * Daily safety net for $9 buyers whose report never got built.
 *
 * History: from 2026-09-03 this sent "add your résumé" reminders, because a
 * pay-first buyer got nothing until they uploaded one. Six of the first eight
 * never did, and none of the six September buyers received a report even
 * after two reminders each. Since 2026-09-28 report-finalize builds a quiz
 * edition the moment payment clears, so this now delivers instead of nagging:
 * any paid report session from the instant era with no stored result gets
 * built and emailed. Sessions from before then are the hand-rescue list
 * (content/master-plan.md, Phase 1) and are left alone here, so a personal
 * note from James isn't pre-empted by a machine one.
 *
 * Invoked by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` when that env var is set; the route
 * refuses to run without it so it cannot be triggered from outside.
 */
export const runtime = "nodejs";
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

const DAY = 86_400;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
/** First checkout that could get the quiz edition. */
const INSTANT_SINCE = Date.parse("2026-09-28T00:00:00Z") / 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  // Paginate: a busy fortnight can pass 100 sessions, and anything past the
  // first page would silently go unchecked.
  const sessions: Stripe.Checkout.Session[] = [];
  for await (const s of getStripe().checkout.sessions.list({
    created: { gte: Math.max(now - 14 * DAY, INSTANT_SINCE), lte: now - 3600 },
    status: "complete",
    limit: 100,
  })) {
    sessions.push(s);
    if (sessions.length >= 1000) break;
  }

  const todo: Stripe.Checkout.Session[] = [];
  let delivered = 0;
  for (const s of sessions) {
    if (s.payment_status !== "paid" || s.metadata?.product !== "pivot_report") continue;
    if ((await retrieveResult(s.id))?.report) { delivered++; continue; }
    todo.push(s);
  }

  const results = await Promise.allSettled(
    todo.map(async (s) => {
      const resp = await fetch(`${APP_URL}/api/report-finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: s.id }),
      });
      const body = await resp.json().catch(() => ({}));
      const who = s.customer_details?.email || s.customer_email || "(no email)";
      if (!resp.ok || !body?.report) throw new Error(`${who} ${s.id}: ${resp.status} ${String(body?.error || (body?.needsIntake ? "nothing to build from" : "")).slice(0, 160)}`);
      return `${who}: built and emailed (${body.report.edition || "?"} edition)`;
    })
  );
  const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  const failed = results.flatMap((r) => (r.status === "rejected" ? [String(r.reason?.message || r.reason)] : []));

  if (ok.length || failed.length) {
    await sendOpsAlert({
      subject: failed.length ? `⚠️ Report safety net: ${failed.length} still not delivered` : `Report safety net delivered ${ok.length}`,
      lines: [...ok, ...failed.map((f) => `FAILED ${f}`)],
    }).catch(() => {});
  }

  return NextResponse.json({ scanned: sessions.length, alreadyDelivered: delivered, built: ok.length, failed: failed.length });
}
