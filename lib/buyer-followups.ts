import Stripe from "stripe";
import { claimOnce, previewsBetween, PREVIEW_TTL_DAYS } from "./stash";
import { isUnsubscribed, unsubUrl } from "./quiz-log";
import { sendBuyerFeedbackEmail, sendPreviewFollowupEmail, sendOpsAlert } from "./email";
import { SUPPORT_EMAIL } from "./contact";
import { GROUND_NAME } from "./course-tiers";

/**
 * Two notes, run once a day from the quiz follow-up cron (and on demand from
 * /api/cron/buyer-followups, where ?dry=1 lists without sending):
 *
 * 1. Feedback. Three to five days after a paid purchase, one plain email asks
 *    whether it helped, restates the refund, and asks permission to quote.
 *    Once per address (90 days), never for a refunded or free order.
 * 2. Unbought preview. The day after a free Suite preview, one email with the
 *    link back while it still works. Once per address (30 days), never to
 *    someone who has bought the Suite since.
 *
 * Both skip opt-outs (the same /api/unsubscribe link the quiz notes use) and
 * the support address, and both report what they sent in one ops alert.
 * Started 2026-11-11; nothing earlier is in either window.
 */
const DAY = 86_400;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

function productName(s: Stripe.Checkout.Session): string | null {
  const p = s.metadata?.product;
  if (p === "pivot_report") return "Pivot Report";
  if (p === "ground") return `${GROUND_NAME} kit`;
  if (!p && s.metadata?.job_title) return "Career Pivot Suite";
  return null;   // "os" and anything unrecognised: say nothing
}

export interface FollowupRun {
  dry: boolean;
  feedback: string[];
  previews: string[];
  skipped: Record<string, number>;
  errors: string[];
}

export async function runBuyerFollowups(opts: { dry?: boolean } = {}): Promise<FollowupRun> {
  const dry = !!opts.dry;
  const run: FollowupRun = { dry, feedback: [], previews: [], skipped: {}, errors: [] };
  const skip = (why: string) => { run.skipped[why] = (run.skipped[why] || 0) + 1; };
  const owner = SUPPORT_EMAIL.toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  // ---- 1. Feedback ----
  try {
    const refunded = new Set<string>();
    for await (const r of getStripe().refunds.list({ created: { gte: now - 6 * DAY }, limit: 100 })) {
      if (typeof r.payment_intent === "string") refunded.add(r.payment_intent);
    }
    for await (const s of getStripe().checkout.sessions.list({
      created: { gte: now - 5 * DAY, lte: now - 3 * DAY }, status: "complete", limit: 100,
    })) {
      const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
      const product = productName(s);
      if (!email || !product) { skip("not a product"); continue; }
      if (s.payment_status !== "paid" || !s.amount_total) { skip("free or unpaid"); continue; }
      if (email === owner) { skip("owner"); continue; }
      if (typeof s.payment_intent === "string" && refunded.has(s.payment_intent)) { skip("refunded"); continue; }
      if (await isUnsubscribed(email)) { skip("unsubscribed"); continue; }
      if (dry) { run.feedback.push(`${email} (${product})`); continue; }
      if (!(await claimOnce(`fb:${email}`, 90 * DAY))) { skip("already asked"); continue; }
      await sendBuyerFeedbackEmail({ to: email, name: s.customer_details?.name || undefined, product, unsubUrl: unsubUrl(email) });
      run.feedback.push(`${email} (${product})`);
    }
  } catch (e: any) {
    run.errors.push(`feedback: ${e?.message || e}`);
  }

  // ---- 2. Unbought previews ----
  try {
    const ms = Date.now();
    for (const p of await previewsBetween(ms - 44 * 3_600_000, ms - 20 * 3_600_000)) {
      if (p.email === owner) { skip("owner"); continue; }
      if (await isUnsubscribed(p.email)) { skip("unsubscribed"); continue; }
      // Bought the Suite since running it? Then there is nothing to remind them of.
      let bought = false;
      for await (const s of getStripe().checkout.sessions.list({
        customer_details: { email: p.email }, status: "complete", created: { gte: Math.floor(p.at / 1000) - 60 }, limit: 20,
      })) {
        if (s.payment_status === "paid" && !s.metadata?.product && s.metadata?.job_title) { bought = true; break; }
      }
      if (bought) { skip("bought the Suite"); continue; }
      if (dry) { run.previews.push(`${p.email} (${p.jobTitle})`); continue; }
      if (!(await claimOnce(`pvfu:${p.email}`, 30 * DAY))) { skip("already reminded"); continue; }
      const until = new Date(p.at + PREVIEW_TTL_DAYS * 86_400_000).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Los_Angeles" });
      await sendPreviewFollowupEmail({
        to: p.email, jobTitle: p.jobTitle || "your target role", score: p.score,
        link: `${APP_URL}/?preview=${p.id}`, until, unsubUrl: unsubUrl(p.email),
      });
      run.previews.push(`${p.email} (${p.jobTitle})`);
    }
  } catch (e: any) {
    run.errors.push(`previews: ${e?.message || e}`);
  }

  if (!dry && (run.feedback.length || run.previews.length || run.errors.length)) {
    await sendOpsAlert({
      subject: `Buyer follow-ups: ${run.feedback.length} feedback, ${run.previews.length} preview${run.errors.length ? `, ${run.errors.length} error(s)` : ""}`,
      lines: [
        ...run.feedback.map((x) => `feedback: ${x}`),
        ...run.previews.map((x) => `preview: ${x}`),
        ...run.errors.map((x) => `ERROR ${x}`),
      ],
    }).catch(() => {});
  }
  return run;
}
