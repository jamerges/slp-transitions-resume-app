import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/course-access";
import { claimOnce } from "@/lib/stash";
import { sendModule1SummaryEmail, sendOpsAlert } from "@/lib/email";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Finishing Module 1 puts the answers in their inbox, so the work survives the
 * browser it was done in. Sends once per purchase (claimOnce on the Stripe
 * session id), and only ever to the email on that session, never to an address
 * supplied by the page.
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

export async function POST(req: Request) {
  const access = await getCourseAccess();
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });
  try {
    const { summary } = (await req.json()) as { summary?: Record<string, string> };
    if (!summary) return NextResponse.json({ error: "Missing summary" }, { status: 400 });

    // The address comes from Stripe, not from the request body.
    let to = "";
    if (access.sid.startsWith("cs_")) {
      const s = await getStripe().checkout.sessions.retrieve(access.sid);
      to = s.customer_details?.email || s.customer_email || "";
    }
    if (!to) return NextResponse.json({ ok: true, emailed: false, reason: "no address on this access" });
    if (!(await claimOnce(`m1summary:${access.sid}`))) return NextResponse.json({ ok: true, emailed: false, reason: "already sent" });

    await sendModule1SummaryEmail({ to, summary });
    sendOpsAlert({ subject: "Module 1 finished", lines: [`email: ${to}`, `session: ${access.sid}`] }).catch(() => {});
    return NextResponse.json({ ok: true, emailed: true });
  } catch (err: any) {
    console.error("[/api/course/module1-complete]", err);
    return NextResponse.json({ error: err?.message || "Could not send your summary" }, { status: 500 });
  }
}
