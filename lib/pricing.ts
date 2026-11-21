/**
 * One place for what things cost. Every price a buyer sees reads from here,
 * and the checkout routes refuse to create a session unless the Stripe price
 * they are about to charge matches priceOf() to the cent (lib/stripe-guard.ts
 * assertPriceAmount). Flip SALE.on and every surface and every guard move
 * together; a Stripe price left at the old amount fails at the button, not
 * at the buyer.
 */
export type PricedProduct = "report" | "suite" | "ground";

/**
 * The report's price is whatever its Stripe price charges. next.config.mjs
 * asks Stripe what the report's price id (lib/report-price-id.ts) charges when
 * the app is built and passes the amount in as NEXT_PUBLIC_REPORT_PRICE, so
 * changing the price is one step: put another price id in
 * lib/stripe-prices.json and push. Every page, email and the checkout guard
 * then agree, and there is no second number to forget.
 * (2026-11-21, for the $19 test. The Suite and the kit still read LIST.)
 */
const REPORT_FROM_STRIPE = Number(process.env.NEXT_PUBLIC_REPORT_PRICE);

/** List prices, what each product costs when there is no sale. */
export const LIST: Record<PricedProduct, number> = {
  report: Number.isFinite(REPORT_FROM_STRIPE) && REPORT_FROM_STRIPE > 0 ? REPORT_FROM_STRIPE : 9,
  suite: 24,
  ground: 19,
};

/** 2026-09-21: everything is $9 for a limited time (James). */
// The sale ends when the day ends on Oct 5 (James, 2026-09-28). Nothing flips
// by itself: turning it off also needs the Stripe env vars back on list-price
// ids, or assertPriceAmount refuses every Suite and kit checkout.
export const SALE = { on: false, price: 9, note: "until Oct 5" } as const;  // ended 2026-10-06 06:00

export const priceOf = (k: PricedProduct): number => (SALE.on ? Math.min(SALE.price, LIST[k]) : LIST[k]);
/** The struck-through price, or null when nothing is reduced. */
export const wasOf = (k: PricedProduct): number | null => (SALE.on && LIST[k] > priceOf(k) ? LIST[k] : null);
/** " until Oct 5, was $24" or "" */
export const wasNote = (k: PricedProduct): string => { const w = wasOf(k); return w ? ` ${SALE.note}, was $${w}` : ""; };
