// Live/test mismatch is the classic launch-day failure: you swap in a live
// secret key, forget a price ID, and Stripe rejects every checkout with an
// opaque error. Fail loudly and specifically instead.
export function assertKeyPriceMatch(secretKey: string, priceId: string, label: string): void {
  const keyIsLive = secretKey.startsWith("sk_live_");
  // Test-mode price IDs can't be distinguished by prefix, so we rely on the
  // known test defaults baked into the code.
  const KNOWN_TEST_PRICES = new Set([
    "price_1TRlBQKyPrmclvwmo8coeL30", // $24 test
    "price_1Tz6TjKyPrmclvwmJBqCzPcB", // $9 test
    "price_1UEfLQKyPrmclvwm04D8JjvY", // $24 Ground test (2026-09-11, superseded)
    "price_1UErFiKyPrmclvwmJlcQC7fE", // $19 Before You Start Looking test (2026-09-12)
  ]);
  if (keyIsLive && KNOWN_TEST_PRICES.has(priceId)) {
    throw new Error(
      `Stripe is in LIVE mode but ${label} is still the test price (${priceId}). ` +
        `Create the live price in the Stripe dashboard and set the matching env var in Vercel.`
    );
  }
}

import type Stripe from "stripe";
const verified = new Map<string, number>();
/**
 * The page shows priceOf(); Stripe charges the price id's unit_amount. They
 * can drift when a sale flips in code before the env var points at the new
 * price. This retrieves the price once per process and refuses the checkout
 * if the two disagree, so a half-done price change fails at the button.
 */
export async function assertPriceAmount(stripe: Stripe, priceId: string, dollars: number, label: string): Promise<void> {
  let cents = verified.get(priceId);
  if (cents === undefined) {
    const price = await stripe.prices.retrieve(priceId);
    cents = price.unit_amount ?? -1;
    verified.set(priceId, cents);
  }
  if (cents !== Math.round(dollars * 100)) {
    verified.delete(priceId);
    // The detail goes to the log; the buyer sees a sentence they can act on.
    console.error(`[price guard] ${label}: Stripe price ${priceId} charges $${(cents / 100).toFixed(2)} but the page shows $${dollars}. Point the env var at a $${dollars} price.`);
    throw new Error(`The ${label} price is being updated. Try again in a few minutes, and nothing has been charged.`);
  }
}
