import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertReadableResume } from "@/lib/anthropic";
import { retrieveInputs, updateInputs, type StashedInputs } from "@/lib/stash";

export const runtime = "nodejs";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

/**
 * Attaches the resume (and the two grounding answers) to an already-paid $9
 * report session. Quiz buyers check out first — this is where the inputs the
 * generator needs actually arrive.
 */
export async function POST(req: Request) {
  try {
    const { sessionId, resumeText, transitionStage, whyLeaving } =
      (await req.json()) as {
        sessionId?: string;
        resumeText?: string;
        transitionStage?: string;
        whyLeaving?: string;
      };

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }
    if (!resumeText) {
      return NextResponse.json({ error: "Missing resume" }, { status: 400 });
    }
    try {
      assertReadableResume(resumeText);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }

    // Never let an unpaid session write inputs — this endpoint is the door to a
    // paid generation.
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Payment not complete (status: ${session.payment_status})` },
        { status: 402 }
      );
    }

    const stashKey = session.metadata?.stash_key || sessionId;
    const existing = (await retrieveInputs(
      stashKey,
      session.metadata?.payload || null
    )) as StashedInputs | null;

    const merged: StashedInputs = {
      // Carry through anything the original checkout stashed (e.g. the wizard
      // path's workPreferenceLabels) so this merge never drops a field the
      // prompt builders read.
      ...(existing || {}),
      resumeText,
      jobTitle: existing?.jobTitle || "",
      jobDesc: existing?.jobDesc || "",
      email: existing?.email || session.customer_details?.email || "",
      goals: {
        targetRoles: existing?.goals?.targetRoles || [],
        targetIndustries: existing?.goals?.targetIndustries || [],
        workPreferences: existing?.goals?.workPreferences || [],
        topSkills: existing?.goals?.topSkills || "",
        whyLeaving: whyLeaving || existing?.goals?.whyLeaving || "",
        transitionStage: transitionStage || existing?.goals?.transitionStage || "",
      },
    };

    await updateInputs(stashKey, merged);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[/api/report-intake]", err);
    return NextResponse.json(
      { error: err?.message || "Could not save your resume" },
      { status: 500 }
    );
  }
}
