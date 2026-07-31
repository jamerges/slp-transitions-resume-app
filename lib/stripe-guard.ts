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
  ]);
  if (keyIsLive && KNOWN_TEST_PRICES.has(priceId)) {
    throw new Error(
      `Stripe is in LIVE mode but ${label} is still the test price (${priceId}). ` +
        `Create the live price in the Stripe dashboard and set the matching env var in Vercel.`
    );
  }
}
