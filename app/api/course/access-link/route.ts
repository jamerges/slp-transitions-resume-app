import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signAccess, unlockUrl } from "@/lib/course-access";

export const runtime = "nodejs";

/**
 * Owner-only: mint an access link by hand. Authenticated with CRON_SECRET,
 * the same way the crons are, so no new secret. Two uses:
 *   ?product=os                 a full-program link for reviewing on production
 *   ?product=ground&sid=cs_…    resend a buyer's link (the session must be a paid Ground purchase)
 * Never exposed in the UI. Call it with curl from a terminal, not from chat.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const product = u.searchParams.get("product");
  if (product === "os") {
    return NextResponse.json({ unlockUrl: unlockUrl(signAccess({ sid: `owner-${Date.now()}`, product: "os" })) });
  }
  if (product === "ground") {
    const sid = u.searchParams.get("sid") || "";
    const key = process.env.STRIPE_SECRET_KEY;
    if (!sid || !key) return NextResponse.json({ error: "sid and STRIPE_SECRET_KEY required" }, { status: 400 });
    const s = await new Stripe(key, { apiVersion: "2025-02-24.acacia" }).checkout.sessions.retrieve(sid);
    if (s.payment_status !== "paid" || s.metadata?.product !== "ground") return NextResponse.json({ error: "Not a paid Ground session" }, { status: 400 });
    return NextResponse.json({ unlockUrl: unlockUrl(signAccess({ sid, product: "ground" })), email: s.customer_details?.email || "" });
  }
  return NextResponse.json({ error: "product must be os or ground" }, { status: 400 });
}
