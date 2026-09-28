/**
 * One place for what things cost. Every price a buyer sees reads from here,
 * and the checkout routes refuse to create a session unless the Stripe price
 * they are about to charge matches priceOf() to the cent (lib/stripe-guard.ts
 * assertPriceAmount). Flip SALE.on and every surface and every guard move
 * together; a Stripe price left at the old amount fails at the button, not
 * at the buyer.
 */
export type PricedProduct = "report" | "suite" | "ground";

/** List prices, what each product costs when there is no sale. */
export const LIST: Record<PricedProduct, number> = { report: 9, suite: 24, ground: 19 };

/** 2026-09-21: everything is $9 for a limited time (James). */
// The sale ends when the day ends on Oct 5 (James, 2026-09-28). Nothing flips
// by itself: turning it off also needs the Stripe env vars back on list-price
// ids, or assertPriceAmount refuses every Suite and kit checkout.
export const SALE = { on: true, price: 9, note: "until Oct 5" } as const;

export const priceOf = (k: PricedProduct): number => (SALE.on ? Math.min(SALE.price, LIST[k]) : LIST[k]);
/** The struck-through price, or null when nothing is reduced. */
export const wasOf = (k: PricedProduct): number | null => (SALE.on && LIST[k] > priceOf(k) ? LIST[k] : null);
/** " until Oct 5, was $24" or "" */
export const wasNote = (k: PricedProduct): string => { const w = wasOf(k); return w ? ` ${SALE.note}, was $${w}` : ""; };
