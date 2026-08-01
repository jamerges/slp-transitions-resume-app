import { NextResponse } from "next/server";
import { assertKeyPriceMatch } from "@/lib/stripe-guard";
import { assertReadableResume } from "@/lib/anthropic";
import Stripe from "stripe";
import { stashInputs } from "@/lib/stash";
import type { ExploreInput } from "@/lib/prompts";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    assertKeyPriceMatch(key, REPORT_PRICE_ID, "STRIPE_REPORT_PRICE_ID ($9 report)");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

const REPORT_PRICE_ID =
  process.env.STRIPE_REPORT_PRICE_ID || "price_1Tz6TjKyPrmclvwmJBqCzPcB";

export async function POST(req: Request) {
  try {
    const inputs = (await req.json()) as ExploreInput;
    if (!inputs.goals) {
      return NextResponse.json({ error: "Missing required inputs" }, { status: 400 });
    }
    // Quiz buyers check out before uploading anything — asking for a resume at
    // peak motivation (and often on a phone) was the biggest drop in the funnel.
    // The resume is collected on /report after payment instead. Only validate it
    // when it is actually present, i.e. the in-app wizard path.
    if (inputs.resumeText) {
      try {
        assertReadableResume(inputs.resumeText);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 422 });
      }
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://app.slptransitions.com";

    const stashKey = randomUUID();
    // Explore inputs are always > 450 chars (resume text), so this goes to Redis.
    const { inMetadata, payload } = await stashInputs(stashKey, inputs as any);

    const metadata: Record<string, string> = {
      stash_key: stashKey,
      product: "pivot_report",
    };
    if (inMetadata && payload) {
      metadata.payload = payload;
    }

    // Email is collected by Stripe Checkout itself (explore users haven't
    // given us one) — report-finalize reads session.customer_details.email.
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: REPORT_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[/api/report-checkout]", err);
    return NextResponse.json(
      { error: err?.message || "Checkout creation failed" },
      { status: 500 }
    );
  }
}
