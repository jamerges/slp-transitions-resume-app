import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signAccess, unlockUrl, type CourseProduct } from "@/lib/course-access";
import { isAccessRevoked } from "@/lib/quiz-log";
import { rateLimit } from "@/lib/stash";
import { sendCourseLinkEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Send me my link again." There are no accounts, so a buyer on a new device
 * needs the signed link from their purchase email. This looks up paid course
 * sessions in Stripe by the address they bought with, mints a fresh link for
 * the best one (full program over Module 1, most recent first), and emails it
 * to that address only. It always answers the same way, whether or not a
 * purchase exists, so it cannot be used to check who has bought. Rate limited
 * per address and per IP through Redis.
 */
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}
const COURSE_PRODUCTS: CourseProduct[] = ["os", "ground"];
const OK = { ok: true, message: "If there is a purchase under that address, the link is on its way." };

export async function POST(req: Request) {
  let email = "";
  try { email = String(((await req.json()) as { email?: string }).email || "").trim().toLowerCase(); } catch { /* falls through to the 400 */ }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter the email you bought with." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = (await rateLimit(`findlink:${email}`, 3, 3600)) && (await rateLimit(`findlink:ip:${ip}`, 10, 3600));
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });

  try {
    const sessions = await getStripe().checkout.sessions.list({ customer_details: { email }, limit: 100 });
    const paid = sessions.data.filter((s) => s.payment_status === "paid" && COURSE_PRODUCTS.includes(s.metadata?.product as CourseProduct));
    // Full program beats Module 1; within a product, the newest purchase.
    paid.sort((a, b) => (COURSE_PRODUCTS.indexOf(a.metadata!.product as CourseProduct) - COURSE_PRODUCTS.indexOf(b.metadata!.product as CourseProduct)) || b.created - a.created);
    for (const s of paid) {
      if (await isAccessRevoked(s.id)) continue;
      const product = s.metadata!.product as CourseProduct;
      const link = unlockUrl(signAccess({ sid: s.id, product }));
      await sendCourseLinkEmail({ to: email, unlockUrl: link });
      break;
    }
  } catch (err) {
    console.error("[/api/course/find-link]", err);
    // Still the same answer: a lookup failure must not read as "no purchase".
  }
  return NextResponse.json(OK);
}
