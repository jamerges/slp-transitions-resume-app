import { NextResponse } from "next/server";
import Stripe from "stripe";
import { callClaude } from "@/lib/anthropic";
import { buildReportPrompt, type ExploreInput } from "@/lib/prompts";
import { claimOnce, retrieveInputs, retrieveResult, stashResult } from "@/lib/stash";
import { sendReportEmail, sendResumeLinkEmail } from "@/lib/email";
import { upsertSubscriber, CUSTOMER_GROUPS, QUIZ_PATH_GROUPS } from "@/lib/mailerlite";

export const runtime = "nodejs";
// Full generation measured at ~140s with all sections; 300 is the Fluid-compute ceiling on Hobby.
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
    if (cached?.report) {
      return NextResponse.json(cached);
    }

    const inputs = (await retrieveInputs(
      session.metadata?.stash_key || sessionId,
      session.metadata?.payload || null
    )) as unknown as ExploreInput | null;
    if (!inputs) {
      return NextResponse.json(
        {
          error:
            "Could not retrieve your answers — they may have expired. Email hello@slptransitions.com with your receipt and we'll generate your report manually.",
        },
        { status: 410 }
      );
    }

    // Quiz buyers pay first and add their resume here, after checkout. Missing
    // resume is a normal state on this path, not an error — tell the client to
    // show the intake form rather than burning a generation on nothing.
    if (!inputs.resumeText || inputs.resumeText.trim().length < 50) {
      const buyerEmail = session.customer_details?.email || "";
      // Their way back if they bought on a phone. Latched so a page refresh
      // doesn't re-send it.
      if (buyerEmail && (await claimOnce(`resume_link:${sessionId}`))) {
        sendResumeLinkEmail({ to: buyerEmail, sessionId }).catch((e) =>
          console.error("[/api/report-finalize] resume-link email failed", e)
        );
      }
      return NextResponse.json({
        needsIntake: true,
        email: buyerEmail,
        targetRole: inputs.goals?.targetRoles?.[0] || "",
      });
    }

    let report: any;
    try {
      report = await callClaude({
        userPrompt: buildReportPrompt(inputs),
        maxTokens: 6000,
      });
      if (!report.readinessProfile || !report.topRoles) {
        throw new Error("Generated report missing required fields");
      }
    } catch (err: any) {
      console.error("[/api/report-finalize] generation failed", err);
      return NextResponse.json(
        { error: err?.message || "Report generation failed — refresh to retry" },
        { status: 502 }
      );
    }

    const email = session.customer_details?.email || "";
    let emailSent = false;
    if (email) {
      try {
        await sendReportEmail({ to: email, report, sessionId });
        emailSent = true;
      } catch (err: any) {
        console.error("[/api/report-finalize] email failed", err);
      }
    }

    // Buyers land in a Customers group so they can be excluded from acquisition
    // sends and targeted for the $24 upsell. Never block the report on this.
    if (email) {
      upsertSubscriber({
        email,
        groups: [CUSTOMER_GROUPS.report, QUIZ_PATH_GROUPS[inputs.goals?.targetRoles?.[0] || ""] || ""],
        fields: {
          customer_product: "$9 Pivot Report",
          transition_stage: inputs.goals?.transitionStage || "",
        },
      }).catch((e) => console.error("[report-finalize] mailerlite", e));
    }

    const payload = { report, email, emailSent };
    stashResult(sessionId, payload).catch((e) =>
      console.error("[/api/report-finalize] result cache failed", e)
    );
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("[/api/report-finalize]", err);
    return NextResponse.json(
      { error: err?.message || "Finalize failed" },
      { status: 500 }
    );
  }
}
