import { NextResponse } from "next/server";
import { markUnsubscribed, unsubToken } from "@/lib/quiz-log";
import { upsertSubscriber } from "@/lib/mailerlite";

export const runtime = "nodejs";

/**
 * One-click opt-out for the app-sent follow-ups. The token is an HMAC of the
 * address, so the link only works for the person it was sent to. Also flips
 * the MailerLite record so the campaign side stops too.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const token = url.searchParams.get("t") || "";
  const page = (title: string, body: string, status = 200) =>
    new NextResponse(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<div style="max-width:520px;margin:60px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1F2937;line-height:1.6">
<h1 style="font-size:22px">${title}</h1><p>${body}</p></div>`,
      { status, headers: { "content-type": "text/html; charset=utf-8" } }
    );

  if (!email || !token || token !== unsubToken(email)) {
    return page("That link didn't work", "It may have been altered in transit. Reply to any email from James and he'll take you off by hand.", 400);
  }
  await markUnsubscribed(email);
  // Best effort on the marketing side; the Redis flag is what the cron obeys.
  upsertSubscriber({ email, status: "unsubscribed" }).catch(() => {});
  return page("You're unsubscribed", "No more follow-ups from the quiz. Anything you bought still arrives as normal.");
}
