import { NextResponse } from "next/server";
import { upsertSubscriber, WAITLIST_GROUPS } from "@/lib/mailerlite";

export const runtime = "nodejs";

/** Until STRIPE_GROUND_PRICE_ID exists, the buy page collects emails here so
 *  nobody who wanted Ground on launch week is lost. */
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  await upsertSubscriber({ email, groups: [WAITLIST_GROUPS.ground] });
  return NextResponse.json({ ok: true });
}
