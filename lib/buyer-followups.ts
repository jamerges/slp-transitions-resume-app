import Stripe from "stripe";
import { claimOnce, previewsBetween, PREVIEW_TTL_DAYS } from "./stash";
import { isUnsubscribed, unsubUrl, latestCompletionFor } from "./quiz-log";
import { PATHS } from "./quiz";
import { sendBuyerFeedbackEmail, sendPreviewFollowupEmail, sendUnfinishedCheckoutEmail, sendOpsAlert } from "./email";
import { SUPPORT_EMAIL } from "./contact";
import { GROUND_NAME } from "./course-tiers";

/**
 * Three notes, run once a day from the quiz follow-up cron (and on demand from
 * /api/cron/buyer-followups, where ?dry=1 lists without sending):
 *
 * 1. Feedback. Three to five days after a paid purchase, one plain email asks
 *    whether it helped, restates the refund, and asks permission to quote.
 *    Once per address (90 days), never for a refunded or free order.
 * 2. Unbought preview. The day after a free Suite preview, one email with the
 *    link back while it still works. Once per address (30 days), never to
 *    someone who has bought the Suite since.
 *
 * 3. Unfinished checkout (2026-11-21). Someone opened the Pivot Report's
 *    checkout and did not pay. Four to twenty-eight hours later, one email
 *    asks what stopped them and links back to their result. Once per address
 *    (30 days), never to someone who has bought anything since, and only when
 *    the checkout carried an address (the quiz gate prefills it).
 *
 * All skip opt-outs (the same /api/unsubscribe link the quiz notes use) and
 * the support address, and all report what they sent in one ops alert.
 * The first two started 2026-11-11; nothing earlier is in their windows.
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
  unfinished: string[];
  skipped: Record<string, number>;
  errors: string[];
}

export async function runBuyerFollowups(opts: { dry?: boolean } = {}): Promise<FollowupRun> {
  const dry = !!opts.dry;
  const run: FollowupRun = { dry, feedback: [], previews: [], unfinished: [], skipped: {}, errors: [] };
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

  // ---- 3. Unfinished report checkouts ----
  // The cron runs once a day, so a 4 to 28 hour window gives every checkout
  // exactly one pass; the latch covers an on-demand run in between.
  try {
    const seen = new Set<string>();
    for await (const s of getStripe().checkout.sessions.list({ created: { gte: now - 28 * 3600, lte: now - 4 * 3600 }, limit: 100 })) {
      if (s.metadata?.product !== "pivot_report" || s.status === "complete" || s.payment_status === "paid") continue;
      const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
      if (!email) { skip("checkout without an address"); continue; }
      if (seen.has(email)) continue;
      seen.add(email);
      if (email === owner) { skip("owner"); continue; }
      if (await isUnsubscribed(email)) { skip("unsubscribed"); continue; }
      // Paid for anything in the last month, including a second try at this checkout?
      let bought = false;
      for await (const paid of getStripe().checkout.sessions.list({
        customer_details: { email }, status: "complete", created: { gte: now - 30 * DAY }, limit: 20,
      })) {
        if (paid.payment_status === "paid") { bought = true; break; }
      }
      if (bought) { skip("bought since"); continue; }
      const done = await latestCompletionFor(email).catch(() => null);
      const path = done?.slug ? PATHS[done.slug] : null;
      const label = `${email}${path ? ` (${path.label})` : ""}`;
      if (dry) { run.unfinished.push(label); continue; }
      if (!(await claimOnce(`ab:${email}`, 30 * DAY))) { skip("already nudged"); continue; }
      await sendUnfinishedCheckoutEmail({
        to: email, name: done?.name, pathLabel: path?.label,
        link: path ? `${APP_URL}/quiz?path=${path.slug}` : `${APP_URL}/quiz`,
        unsubUrl: unsubUrl(email),
      });
      run.unfinished.push(label);
    }
  } catch (e: any) {
    run.errors.push(`unfinished: ${e?.message || e}`);
  }

  if (!dry && (run.feedback.length || run.previews.length || run.unfinished.length || run.errors.length)) {
    await sendOpsAlert({
      subject: `Buyer follow-ups: ${run.feedback.length} feedback, ${run.previews.length} preview, ${run.unfinished.length} unfinished checkout${run.errors.length ? `, ${run.errors.length} error(s)` : ""}`,
      lines: [
        ...run.feedback.map((x) => `feedback: ${x}`),
        ...run.previews.map((x) => `preview: ${x}`),
        ...run.unfinished.map((x) => `unfinished checkout: ${x}`),
        ...run.errors.map((x) => `ERROR ${x}`),
      ],
    }).catch(() => {});
  }
  return run;
}
