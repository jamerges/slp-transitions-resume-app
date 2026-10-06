import { NextResponse } from "next/server";
import Stripe from "stripe";
import { retrieveResult } from "@/lib/stash";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Owner-only, read-only: every paid checkout in the last ?days= (default 30,
 * max 120), straight from live Stripe, with whether each one was delivered and
 * whether it was refunded. Stripe is the only source of truth for sales; this
 * is how to read it without the dashboard. Authenticated with CRON_SECRET like
 * the crons. Call it with curl from a terminal, never from chat.
 */
const DAY = 86_400;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
  const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get("days")) || 30, 1), 120);
  const since = Math.floor(Date.now() / 1000) - days * DAY;

  const refunded = new Map<string, number>();
  for await (const r of stripe.refunds.list({ created: { gte: since }, limit: 100 })) {
    if (r.status === "succeeded" && typeof r.payment_intent === "string") {
      refunded.set(r.payment_intent, (refunded.get(r.payment_intent) || 0) + r.amount);
    }
  }

  const sales = [];
  for await (const s of stripe.checkout.sessions.list({ created: { gte: since }, status: "complete", limit: 100 })) {
    if (s.payment_status !== "paid") continue;
    const product = s.metadata?.product || "suite";
    let delivered: boolean | null = null;
    if (product === "pivot_report") delivered = !!(await retrieveResult(s.id))?.report;
    else if (product !== "ground" && product !== "os") delivered = !!(await retrieveResult(s.id))?.results;
    const pi = typeof s.payment_intent === "string" ? s.payment_intent : "";
    sales.push({
      at: new Date(s.created * 1000).toISOString(),
      product,
      amount: (s.amount_total || 0) / 100,
      email: s.customer_details?.email || s.customer_email || "",
      sessionId: s.id,
      delivered,
      refunded: pi && refunded.has(pi) ? refunded.get(pi)! / 100 : 0,
    });
    if (sales.length >= 500) break;
  }

  const gross = sales.reduce((t, s) => t + s.amount, 0);
  const refunds = sales.reduce((t, s) => t + s.refunded, 0);
  return NextResponse.json({ mode: key.startsWith("sk_live") ? "live" : "test", days, count: sales.length, gross, refunds, sales });
}
