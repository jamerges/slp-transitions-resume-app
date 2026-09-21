import { NextResponse } from "next/server";
import Stripe from "stripe";
import { priceOf, type PricedProduct } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What each checkout is about to charge, next to what the page shows. Price
 * ids and amounts are public (they are on every checkout page), so this needs
 * no auth, and it answers "is the Vercel env pointing at the right price?"
 * without reading logs. Never returns the key or anything from a customer.
 */
const IDS: Record<PricedProduct, string | undefined> = {
  suite: process.env.STRIPE_PRICE_ID || "price_1TzOQ0KyPrmclvwmStUeaCoj",
  report: process.env.STRIPE_REPORT_PRICE_ID,
  ground: process.env.STRIPE_GROUND_PRICE_ID,
};

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
  const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  const out: Record<string, unknown> = { mode: key.startsWith("sk_live") ? "live" : "test" };
  for (const k of Object.keys(IDS) as PricedProduct[]) {
    const id = IDS[k];
    if (!id) { out[k] = { id: null, ok: false, reason: "env var not set" }; continue; }
    try {
      const p = await stripe.prices.retrieve(id);
      const charges = (p.unit_amount ?? 0) / 100;
      out[k] = { id, charges, shows: priceOf(k), active: p.active, ok: charges === priceOf(k) && p.active };
    } catch (e: any) {
      out[k] = { id, ok: false, reason: e?.message?.slice(0, 120) || "lookup failed" };
    }
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
