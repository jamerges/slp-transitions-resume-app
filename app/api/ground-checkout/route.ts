import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertKeyPriceMatch } from "@/lib/stripe-guard";

export const runtime = "nodejs";

/**
 * $24 Ground: Week 1 of Transition OS. No inputs to stash: the product is
 * access, and access is issued from the Stripe session id after payment
 * (see ground-finalize). Refuses to run without its price id rather than
 * falling back, so a half-configured environment fails at the button and
 * not at the buyer.
 */
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    const price = process.env.STRIPE_GROUND_PRICE_ID;
    if (!price) throw new Error("STRIPE_GROUND_PRICE_ID is not set");
    assertKeyPriceMatch(key, price, "STRIPE_GROUND_PRICE_ID ($24 Ground)");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

export async function POST(req: Request) {
  try {
    const { email, stage, path } = (await req.json().catch(() => ({}))) as { email?: string; stage?: string; path?: string };
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
    const metadata: Record<string, string> = { product: "ground" };
    if (stage) metadata.stage = String(stage).slice(0, 20);
    if (path) metadata.path = String(path).slice(0, 40);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_GROUND_PRICE_ID!, quantity: 1 }],
      success_url: `${origin}/course/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/course/ground?canceled=1`,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: true,
      ...(email && email.includes("@") ? { customer_email: email } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[/api/ground-checkout]", err);
    return NextResponse.json({ error: err?.message || "Checkout creation failed" }, { status: 500 });
  }
}
