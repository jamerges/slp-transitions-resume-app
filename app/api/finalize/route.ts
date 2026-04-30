import { NextResponse } from "next/server";
import Stripe from "stripe";
import { callClaude } from "@/lib/anthropic";
import { buildFullPrompt } from "@/lib/prompts";
import { retrieveInputs, retrieveResult, stashResult } from "@/lib/stash";
import { sendFullResultsEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 120;

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Payment not complete (status: ${session.payment_status})` },
        { status: 402 }
      );
    }

    const cached = await retrieveResult(sessionId);
    if (cached?.results) {
      return NextResponse.json(cached);
    }

    const inputs = await retrieveInputs(
      sessionId,
      session.metadata?.payload || null
    );
    if (!inputs) {
      return NextResponse.json(
        {
          error:
            "Could not retrieve your inputs. They may have expired. Please email hello@slptransitions.com with your Stripe receipt and we'll generate your results manually.",
        },
        { status: 410 }
      );
    }

    let results: any;
    let generationError: string | null = null;
    try {
      results = await callClaude({
        userPrompt: buildFullPrompt({
          resumeText: inputs.resumeText,
          jobTitle: inputs.jobTitle,
          jobDesc: inputs.jobDesc,
          goals: inputs.goals,
          writingSample: inputs.writingSample,
        }),
        maxTokens: 8000,
      });
      if (!results.professionalSummary || !results.translatedBullets) {
        throw new Error("Generated response missing required fields");
      }
    } catch (err: any) {
      console.error("[/api/finalize] generation failed", err);
      generationError = err?.message || "Generation failed";
    }

    let emailSent = false;
    let emailError: string | null = null;
    if (results) {
      try {
        await sendFullResultsEmail({
          to: inputs.email,
          jobTitle: inputs.jobTitle,
          results,
        });
        emailSent = true;
      } catch (err: any) {
        console.error("[/api/finalize] email failed", err);
        emailError = err?.message || "Email failed";
      }

      const payload = {
        results,
        inputs: {
          jobTitle: inputs.jobTitle,
          goals: inputs.goals,
          writingSample: inputs.writingSample,
          email: inputs.email,
        },
        emailSent,
        emailError,
      };
      stashResult(sessionId, payload).catch((e) =>
        console.error("[/api/finalize] result cache failed", e)
      );
      return NextResponse.json(payload);
    }

    return NextResponse.json(
      {
        error: generationError,
        inputs: {
          jobTitle: inputs.jobTitle,
          goals: inputs.goals,
          writingSample: inputs.writingSample,
          email: inputs.email,
        },
      },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("[/api/finalize]", err);
    return NextResponse.json(
      { error: err?.message || "Finalize failed" },
      { status: 500 }
    );
  }
}
