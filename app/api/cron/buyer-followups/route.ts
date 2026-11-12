import { NextResponse } from "next/server";
import { runBuyerFollowups } from "@/lib/buyer-followups";

/**
 * On-demand run of the buyer follow-ups (the daily run rides the quiz
 * follow-up cron, so vercel.json keeps two jobs). CRON_SECRET bearer.
 * ?dry=1 lists who would get what and sends nothing.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  return NextResponse.json(await runBuyerFollowups({ dry }));
}
