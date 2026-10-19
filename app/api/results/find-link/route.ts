import { NextResponse } from "next/server";
import Stripe from "stripe";
import { rateLimit, retrieveResult } from "@/lib/stash";
import { sendResultsLinkEmail, type ResultLink } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Send me my results again." The Suite and the Pivot Report have no accounts:
 * the results page link is the only way back in. This looks up paid Suite and
 * report sessions in Stripe by the address they bought with, keeps the ones
 * whose results still open (Suite results expire; a report can always rebuild
 * from the quiz), and emails the links to that address only. Like
 * /api/course/find-link it always answers the same way, so it can't be used to
 * check who has bought, and it's rate limited per address and per IP.
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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
const OK = { ok: true, message: "If there is a purchase under that address, the links are on their way." };

export async function POST(req: Request) {
  let email = "";
  try { email = String(((await req.json()) as { email?: string }).email || "").trim().toLowerCase(); } catch { /* falls through to the 400 */ }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter the email you bought with." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = (await rateLimit(`findresults:${email}`, 3, 3600)) && (await rateLimit(`findresults:ip:${ip}`, 10, 3600));
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });

  try {
    const sessions = await getStripe().checkout.sessions.list({ customer_details: { email }, limit: 100 });
    const links: ResultLink[] = [];
    for (const s of sessions.data.sort((a, b) => b.created - a.created)) {
      if (s.payment_status !== "paid") continue;
      const product = s.metadata?.product;
      const date = new Date(s.created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (product === "pivot_report") {
        // The report page rebuilds from the quiz answers if the stored copy is gone.
        links.push({ label: `Pivot Report, bought ${date}`, url: `${APP_URL}/report?session_id=${encodeURIComponent(s.id)}` });
      } else if (!product && s.metadata?.job_title) {
        // A Suite package can't be rebuilt once its inputs expire, so only send links that still open.
        if (await retrieveResult(s.id)) {
          links.push({ label: `Career Pivot Suite: ${s.metadata.job_title}, bought ${date}`, url: `${APP_URL}/success?session_id=${encodeURIComponent(s.id)}` });
        }
      }
    }
    if (links.length) await sendResultsLinkEmail({ to: email, links });
  } catch (err) {
    console.error("[/api/results/find-link]", err);
    // Still the same answer: a lookup failure must not read as "no purchase".
  }
  return NextResponse.json(OK);
}
