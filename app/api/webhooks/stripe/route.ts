import { NextResponse } from "next/server";
import Stripe from "stripe";

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

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    if (!sig || !secret) {
      // Webhook secret not configured — accept and log without verification (dev only)
      event = JSON.parse(raw) as Stripe.Event;
    } else {
      event = getStripe().webhooks.constructEvent(raw, sig, secret);
    }
  } catch (err: any) {
    console.error("[stripe-webhook] signature verification failed", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      console.log("[stripe-webhook] checkout.session.completed", {
        id: s.id,
        email: s.customer_email,
        amount: s.amount_total,
        job_title: s.metadata?.job_title,
      });
      break;
    }
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
      console.log(`[stripe-webhook] ${event.type}`, (event.data.object as any).id);
      break;
    default:
      // ignore
      break;
  }

  return NextResponse.json({ received: true });
}
