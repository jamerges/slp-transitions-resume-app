import { NextResponse } from "next/server";
import { intakeStageLabel, sanitizeQuizSnapshot } from "@/lib/report-quiz";
import { assertKeyPriceMatch, assertPriceAmount } from "@/lib/stripe-guard";
import { priceOf } from "@/lib/pricing";
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
    // `email` and `returnTo` ride along from the quiz; the wizard sends neither.
    const inputs = (await req.json()) as ExploreInput & { email?: string; returnTo?: string; quizStage?: string; quiz?: unknown };
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

    await assertPriceAmount(getStripe(), REPORT_PRICE_ID, priceOf("report"), "Pivot Report");
    // The quiz already asked where the buyer is. Carry it through so the
    // post-payment intake opens with that answer picked instead of asking again.
    // The quiz answers themselves, so the report can be built the moment
    // payment clears instead of waiting on a résumé (report-finalize).
    const quiz = sanitizeQuizSnapshot(inputs.quiz);
    if (quiz) inputs.quiz = quiz;
    else delete inputs.quiz;
    // With the snapshot aboard, report-finalize derives the stage itself, so
    // leave the long label out: a quiz payload then fits Stripe metadata and
    // checkout still works if Redis is down.
    if (!quiz && inputs.quizStage && inputs.goals && !inputs.goals.transitionStage) {
      inputs.goals.transitionStage = intakeStageLabel(inputs.quizStage);
    }
    delete inputs.quizStage;
    const fromQuiz = inputs.returnTo === "quiz";
    delete inputs.returnTo;
    if (quiz && !inputs.resumeText) {
      const g: any = inputs.goals;
      for (const k of Object.keys(g)) if (g[k] === "" || (Array.isArray(g[k]) && !g[k].length)) delete g[k];
      for (const k of ["resumeText", "jobTitle", "jobDesc"] as const) if (!(inputs as any)[k]) delete (inputs as any)[k];
    }
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

    // report-finalize reads session.customer_details.email. Quiz buyers already
    // typed their address at the result gate, so prefill it rather than asking
    // twice; wizard buyers type it on Stripe's page.
    const email = typeof inputs.email === "string" ? inputs.email.trim() : "";
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: REPORT_PRICE_ID, quantity: 1 }],
      ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { customer_email: email } : {}),
      success_url: `${origin}/report?session_id={CHECKOUT_SESSION_ID}`,
      // Back out of Stripe to the result, not the Suite: /quiz restores it.
      cancel_url: fromQuiz ? `${origin}/quiz?canceled=1` : `${origin}/?canceled=1`,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: true,
      custom_text: { submit: { message: "One-time payment, no subscription. 30-day refund if it doesn't help." } },
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
