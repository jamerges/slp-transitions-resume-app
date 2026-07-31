import { NextResponse } from "next/server";
import Stripe from "stripe";
import { callClaude } from "@/lib/anthropic";
import { retrieveInputs, retrieveResult, stashResult } from "@/lib/stash";

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

// Sections a buyer can refine, with the JSON shape each must return.
const REFINABLE: Record<string, { label: string; spec: string }> = {
  professionalSummary: {
    label: "Professional Summary",
    spec: `{"professionalSummary": "3-4 sentences, no clinical jargon, anchored in their actual numbers"}`,
  },
  coverLetter: {
    label: "Cover Letter",
    spec: `{"coverLetter": "Full cover letter as single string with \\n line breaks. Must reference at least one specific from the job description and one real accomplishment with its number from the resume."}`,
  },
  elevatorPitch: {
    label: "Elevator Pitch",
    spec: `{"elevatorPitch": "30-second pitch, pull-framed, no burnout language"}`,
  },
  linkedinHeadline: {
    label: "LinkedIn Headline",
    spec: `{"linkedinHeadline": "Optimized headline"}`,
  },
  linkedinAbout: {
    label: "LinkedIn About",
    spec: `{"linkedinAbout": "LinkedIn About section, 3 short paragraphs, first person. \\n line breaks between paragraphs."}`,
  },
  translatedBullets: {
    label: "Translated Bullets",
    spec: `{"translatedBullets": [{"original": "their bullet", "translated": "rewritten in the job description's own vocabulary", "section": "Job Title or section"}]}`,
  },
};

const MAX_REFINES = 10; // generous cap; guards runaway cost per purchase

export async function POST(req: Request) {
  try {
    const { sessionId, section, instruction } = (await req.json()) as {
      sessionId?: string;
      section?: string;
      instruction?: string;
    };
    if (!sessionId || !section || !REFINABLE[section]) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const cleanInstruction = (instruction || "").slice(0, 500).trim();
    if (!cleanInstruction) {
      return NextResponse.json({ error: "Tell us what to change" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not verified" }, { status: 402 });
    }

    const cached = await retrieveResult(sessionId);
    if (!cached?.results) {
      return NextResponse.json(
        { error: "Results have expired from our cache (they were emailed to you). Re-run the tool or email hello@slptransitions.com." },
        { status: 410 }
      );
    }
    const refineCount = cached.refineCount || 0;
    if (refineCount >= MAX_REFINES) {
      return NextResponse.json(
        { error: "Refine limit reached for this purchase. Email hello@slptransitions.com if you need more." },
        { status: 429 }
      );
    }

    // Original inputs give the model the resume/JD context; may have expired (6h TTL) —
    // fall back to refining from the current section content alone.
    const inputs = await retrieveInputs(
      session.metadata?.stash_key || sessionId,
      session.metadata?.payload || null
    );

    const { label, spec } = REFINABLE[section];
    const current = JSON.stringify(cached.results[section] ?? null);
    const context = inputs
      ? `Resume:\n---\n${inputs.resumeText}\n---\nTarget role: ${inputs.jobTitle}\nJob Description:\n---\n${inputs.jobDesc}\n---\n`
      : `Target role: ${cached.inputs?.jobTitle || "unknown"}\n(Original resume/JD no longer cached — work from the current version below and keep every factual claim unchanged.)\n`;

    const result = await callClaude({
      userPrompt: `${context}
The candidate purchased a full translation package. They want their ${label} revised.

CURRENT VERSION:
${current}

THEIR REVISION REQUEST: "${cleanInstruction}"

Rewrite the ${label} to honor their request while keeping every rule (no banned words, no invented facts or numbers, no burnout language, anchored in their real experience). Keep what already works — change what they asked for.

Return ONLY this JSON: ${spec}`,
      maxTokens: 3000,
    });

    const newValue = result[section];
    if (newValue == null) {
      return NextResponse.json({ error: "Refine failed — please try again" }, { status: 502 });
    }

    const updated = {
      ...cached,
      results: { ...cached.results, [section]: newValue },
      refineCount: refineCount + 1,
    };
    stashResult(sessionId, updated).catch((e) =>
      console.error("[/api/refine] cache update failed", e)
    );

    return NextResponse.json({ value: newValue, refinesLeft: MAX_REFINES - refineCount - 1 });
  } catch (err: any) {
    console.error("[/api/refine]", err);
    return NextResponse.json({ error: err?.message || "Refine failed" }, { status: 500 });
  }
}
