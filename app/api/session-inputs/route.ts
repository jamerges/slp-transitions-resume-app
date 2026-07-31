import { NextResponse } from "next/server";
import Stripe from "stripe";
import { retrieveInputs } from "@/lib/stash";

export const runtime = "nodejs";

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripe;
}

// Lets a paying customer carry their resume + answers into a new run without
// retyping anything. Requires a paid Stripe session id, which is unguessable
// and belongs to the customer themselves.
export async function GET(req: Request) {
  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not paid" }, { status: 402 });
    }

    const inputs = await retrieveInputs(
      session.metadata?.stash_key || sessionId,
      session.metadata?.payload || null
    );
    if (!inputs?.resumeText) {
      return NextResponse.json({ error: "Inputs expired" }, { status: 410 });
    }

    return NextResponse.json({
      resumeText: inputs.resumeText,
      goals: inputs.goals || null,
      email: inputs.email || session.customer_details?.email || "",
      writingSample: inputs.writingSample || "",
    });
  } catch (err: any) {
    console.error("[/api/session-inputs]", err);
    return NextResponse.json({ error: err?.message || "Lookup failed" }, { status: 500 });
  }
}
