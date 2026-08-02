import { NextResponse } from "next/server";
import { assertKeyPriceMatch } from "@/lib/stripe-guard";
import Stripe from "stripe";
import { stashInputs, type StashedInputs } from "@/lib/stash";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    assertKeyPriceMatch(key, PRICE_ID, "STRIPE_PRICE_ID ($24 suite)");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

// LIVE $24 price. The fallback used to be the *test* price, so any deploy
// where STRIPE_PRICE_ID went missing silently checked out against test mode
// while the key was live — which is exactly how this broke. Price IDs are
// not secrets, so defaulting to the real one is safe and fails closed.
// Set STRIPE_PRICE_ID to a test price to run this flow in test mode.
const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_1TzOQ0KyPrmclvwmStUeaCoj";

export async function POST(req: Request) {
  try {
    const inputs = (await req.json()) as StashedInputs;
    if (!inputs.resumeText || !inputs.jobDesc || !inputs.jobTitle || !inputs.email) {
      return NextResponse.json({ error: "Missing required inputs" }, { status: 400 });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://app.slptransitions.com";

    const stashKey = randomUUID();
    const { inMetadata, payload } = await stashInputs(stashKey, inputs);

    const metadata: Record<string, string> = {
      stash_key: stashKey,
      job_title: inputs.jobTitle.slice(0, 480),
      email: inputs.email.slice(0, 480),
    };
    if (inMetadata && payload) {
      metadata.payload = payload;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: inputs.email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[/api/checkout]", err);
    return NextResponse.json(
      { error: err?.message || "Checkout creation failed" },
      { status: 500 }
    );
  }
}
