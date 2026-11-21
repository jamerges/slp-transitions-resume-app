/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The workbook is served from content/ by an access-gated route, so the
  // files must be traced into that function’s bundle.
  outputFileTracingIncludes: {
    "/api/course/workbook": ["./content/course/workbook/**"],
  },
  async headers() {
    return [
      // The quiz is embedded as an iframe on slptransitions.com/career-quiz/,
      // replacing the old Typeform embed. Everything else stays unframeable.
      // The story form is embedded the same way on /share-your-story/.
      ...["/quiz/embed", "/share/embed"].map((source) => ({
        source,
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://slptransitions.com https://www.slptransitions.com;",
          },
        ],
      })),
    ];
  },
};

// What the Pivot Report costs, read from Stripe when the app is built, so the
// price a buyer sees can never differ from the price they are charged
// (lib/pricing.ts). On a production build a failure stops the build: Vercel
// then keeps serving the last good deployment instead of one whose pages say
// $9 while Stripe charges something else. Anywhere else it falls back to 9.
async function reportPrice() {
  const id = process.env.STRIPE_REPORT_PRICE_ID;
  const key = process.env.STRIPE_SECRET_KEY;
  const production = process.env.VERCEL_ENV === "production";
  let why = "STRIPE_REPORT_PRICE_ID or STRIPE_SECRET_KEY is not set";
  if (id && key) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await fetch(`https://api.stripe.com/v1/prices/${id}`, { headers: { Authorization: `Bearer ${key}` } });
        if (r.ok) {
          const p = await r.json();
          if (p.currency === "usd" && Number.isInteger(p.unit_amount) && p.unit_amount > 0 && p.unit_amount % 100 === 0) {
            return p.unit_amount / 100;
          }
          why = `price ${id} is not a whole-dollar USD amount`;
          break;
        }
        why = `Stripe answered ${r.status} for price ${id}`;
        if (r.status < 500 && r.status !== 429) break;
      } catch (e) {
        why = `could not reach Stripe (${e?.message || e})`;
      }
      await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
    }
  }
  if (production) throw new Error(`Report price: ${why}. Build stopped so the last good deployment stays live.`);
  console.warn(`[report price] ${why}; showing $9.`);
  return 9;
}

export default async function config() {
  const price = await reportPrice();
  console.log(`[report price] $${price}`);
  return { ...nextConfig, env: { NEXT_PUBLIC_REPORT_PRICE: String(price) } };
}
