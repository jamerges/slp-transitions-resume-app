import prices from "./stripe-prices.json";

/**
 * Which Stripe price the Pivot Report charges.
 *
 * With a live key it is `reportLive` in lib/stripe-prices.json. Since
 * 2026-11-21 the code decides this, not Vercel: editing an env var there needs
 * a code emailed to James each time, and a price id is not a secret. To change
 * the report's price, create the price in Stripe, put its id in that file and
 * push. next.config.mjs reads the same file at build time and asks Stripe what
 * that price charges, so every page and email shows the same number.
 *
 * With a test key (local development) it is still STRIPE_REPORT_PRICE_ID from
 * .env.local, falling back to the old $9 test price.
 *
 * The STRIPE_REPORT_PRICE_ID variable in Vercel is no longer read in
 * production. It can be deleted there.
 */
export function reportPriceId(): string {
  const live = (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live");
  return live ? prices.reportLive : process.env.STRIPE_REPORT_PRICE_ID || "price_1Tz6TjKyPrmclvwmJBqCzPcB";
}
