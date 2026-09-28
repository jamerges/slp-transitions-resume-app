import { NextResponse } from "next/server";
import Stripe from "stripe";
import { callClaude } from "@/lib/anthropic";
import { buildReportPrompt, buildQuizReportPrompt, type ExploreInput } from "@/lib/prompts";
import { claimOrProceed, releaseOnce, retrieveInputs, retrieveResult, stashResult } from "@/lib/stash";
import { sendReportEmail } from "@/lib/email";
import { upsertSubscriber, CUSTOMER_GROUPS, QUIZ_PATH_GROUPS } from "@/lib/mailerlite";
import { latestCompletionFor, markCustomer } from "@/lib/quiz-log";
import { intakeStageLabel, slugForRoleOption, tidyReport } from "@/lib/report-quiz";
import { PATHS, type QuizSnapshot } from "@/lib/quiz";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const runtime = "nodejs";
// Full generation measured at ~140s with all sections; 300 is the Fluid-compute ceiling on Hobby.
export const maxDuration = 300;

const DAY = 86_400;
// The report is the thing they paid for; keep it reachable from the emailed
// link well past the 7-day input window. It holds no résumé text.
const RESULT_TTL = 60 * DAY;

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

const hasResume = (i: ExploreInput | null) => !!i?.resumeText && i.resumeText.trim().length >= 50;

/**
 * Two editions of the $9 report:
 * - "resume": built from the résumé (desktop buyers who pasted it before
 *   paying, or anyone who adds it afterwards on /report).
 * - "quiz": built from the quiz answers the moment payment clears. Until
 *   2026-09-28 a buyer without a résumé got an upload form instead, and six of
 *   the first eight never came back to it. The quiz edition can be rebuilt
 *   from a résumé once, free (report-intake, then this route again).
 */
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
    const email = session.customer_details?.email || session.customer_email || "";

    let inputs = (await retrieveInputs(
      session.metadata?.stash_key || sessionId,
      session.metadata?.payload || null
    )) as unknown as ExploreInput | null;

    const cached = await retrieveResult(sessionId);
    const wantsUpgrade = cached?.report?.edition === "quiz" && hasResume(inputs);
    if (cached?.report && !wantsUpgrade) {
      return NextResponse.json(cached);
    }

    // What the quiz edition is built from, best source first: the answers
    // carried through checkout; the top path the checkout stored (sessions
    // from before 2026-09-28); the buyer's quiz completion by email (inputs
    // expired after 7 days).
    let snap: QuizSnapshot | null = inputs?.quiz || null;
    if (!hasResume(inputs) && !snap) {
      const slug = slugForRoleOption(inputs?.goals?.targetRoles?.[0]);
      if (slug) snap = { top: slug };
    }
    // Older checkouts carried the path but not the stage key; the buyer's own
    // quiz completion usually has it.
    if (!hasResume(inputs) && snap && !snap.st && !inputs?.goals?.transitionStage && email) {
      const c = await latestCompletionFor(email).catch(() => null);
      if (c?.stage) snap = { ...snap, st: c.stage };
    }
    if (!hasResume(inputs) && !snap && email) {
      const c = await latestCompletionFor(email).catch(() => null);
      if (c && PATHS[c.slug]) {
        snap = { top: c.slug, st: c.stage || null };
        inputs = inputs || {
          resumeText: "",
          goals: {
            targetRoles: [PATHS[c.slug].roleOption], targetIndustries: [], workPreferences: [],
            topSkills: "", whyLeaving: "", transitionStage: "",
          },
        };
      }
    }

    if (!inputs) {
      return NextResponse.json(
        { error: `We couldn't find your answers. Email ${SUPPORT_EMAIL} with your receipt and we'll build your report by hand.` },
        { status: 410 }
      );
    }
    if (!hasResume(inputs) && !snap) {
      // Nothing to build from at all (should not happen for a quiz buyer).
      return NextResponse.json({
        needsIntake: true,
        email,
        targetRole: inputs.goals?.targetRoles?.[0] || "",
        transitionStage: inputs.goals?.transitionStage || "",
      });
    }

    // A compacted quiz checkout omits empty fields; the prompt builders expect them.
    const g: any = inputs.goals || {};
    inputs.goals = { ...g, targetRoles: g.targetRoles || [], workPreferences: g.workPreferences || [], topSkills: g.topSkills || "", whyLeaving: g.whyLeaving || "" };
    inputs.resumeText = inputs.resumeText || "";
    const edition: "resume" | "quiz" = hasResume(inputs) ? "resume" : "quiz";
    if (edition === "quiz" && snap && !inputs.goals.transitionStage) {
      inputs.goals.transitionStage = intakeStageLabel(snap.st);
    }

    // The browser and the Stripe webhook both call this within seconds of
    // payment. One builds; the other waits for the result instead of paying
    // for a second generation and sending a second email.
    const lock = `gen:${edition}:${sessionId}`;
    if (!(await claimOrProceed(lock, 600))) {
      for (let waited = 0; waited < 240; waited += 4) {
        await new Promise((r) => setTimeout(r, 4000));
        const done = await retrieveResult(sessionId);
        if (done?.report?.edition === edition || (edition === "quiz" && done?.report)) {
          return NextResponse.json(done);
        }
      }
      return NextResponse.json(
        { error: "Your report is still being built. Refresh this page in a minute." },
        { status: 503 }
      );
    }

    let report: any;
    try {
      report = await callClaude({
        userPrompt: edition === "quiz" && snap ? buildQuizReportPrompt(inputs, snap) : buildReportPrompt(inputs),
        maxTokens: 6000,
      });
      if (!report.readinessProfile || !report.topRoles) {
        throw new Error("Generated report missing required fields");
      }
      report = tidyReport(report, edition);
      report.edition = edition;
    } catch (err: any) {
      await releaseOnce(lock).catch(() => {});
      console.error("[/api/report-finalize] generation failed", err);
      if (wantsUpgrade) {
        // Keep what they already have; the résumé version can be retried.
        return NextResponse.json({ ...cached, upgradeFailed: true });
      }
      return NextResponse.json(
        { error: "Report generation failed. Your payment is confirmed, so refresh this page to try again." },
        { status: 502 }
      );
    }

    let emailSent = false;
    if (email && (await claimOrProceed(`report_email:${edition}:${sessionId}`, RESULT_TTL))) {
      try {
        await sendReportEmail({ to: email, report, sessionId });
        emailSent = true;
      } catch (err: any) {
        console.error("[/api/report-finalize] email failed", err);
      }
    }

    // Buyers land in a Customers group so they can be excluded from acquisition
    // sends and targeted for the $24 upsell. Once, on first delivery. Never
    // block the report on this.
    if (email && !cached) {
      markCustomer(email).catch(() => {});
      upsertSubscriber({
        email,
        groups: [CUSTOMER_GROUPS.report, QUIZ_PATH_GROUPS[inputs.goals?.targetRoles?.[0] || ""] || ""],
        fields: {
          customer_product: "$9 Pivot Report",
          transition_stage: inputs.goals?.transitionStage || "",
        },
      }).catch((e) => console.error("[report-finalize] mailerlite", e));
    }

    const payload = { report, email, emailSent: emailSent || !!cached?.emailSent, transitionStage: inputs.goals?.transitionStage || "" };
    await stashResult(sessionId, payload, RESULT_TTL).catch((e) =>
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
