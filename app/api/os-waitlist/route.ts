import { NextResponse } from "next/server";
import { upsertSubscriber, WAITLIST_GROUPS } from "@/lib/mailerlite";
import { rateLimit } from "@/lib/stash";

export const runtime = "nodejs";

/**
 * "Tell me when it opens" for the full program. The form sits on the sales
 * page at slptransitions.com/transition-os/ (built by
 * scripts/build_course_page.py), which is another origin, so this route
 * answers with CORS headers for the marketing site only.
 *
 * It adds the address to the MailerLite group "Waitlist · Transition OS
 * (opening notice)". The page promises one email when the program opens, so
 * that group is for the opening notice and nothing else.
 */
const ALLOWED = new Set(["https://slptransitions.com", "https://www.slptransitions.com", "https://app.slptransitions.com"]);

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const dev = process.env.NODE_ENV === "development" && /^http:\/\/localhost(:\d+)?$/.test(origin);
  if (!ALLOWED.has(origin) && !dev) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  const body = (await req.json().catch(() => ({}))) as { email?: string; website?: string };
  // `website` is a field no person sees. A filled one is a bot: answer as if it worked.
  if (body.website) return NextResponse.json({ ok: true }, { headers });
  const email = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "That email address doesn't look right. Check it and try again." }, { status: 400, headers });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`oswait:${ip}`, 8, 3600))) {
    return NextResponse.json({ error: "Too many tries from this connection. Try again in an hour." }, { status: 429, headers });
  }
  // upsertSubscriber answers false when MailerLite refuses or the key is missing.
  const saved = await upsertSubscriber({ email, groups: [WAITLIST_GROUPS.os] }).catch(() => false);
  if (!saved) {
    return NextResponse.json({ error: "That didn't save. Try again in a minute." }, { status: 502, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}
