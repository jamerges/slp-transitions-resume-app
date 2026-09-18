import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { signAccess, unlockUrl, getCourseAccess, ACCESS_COOKIE, cookieOptions } from "@/lib/course-access";
import { rateLimit } from "@/lib/stash";
import { upsertSubscriber, COURSE_GROUPS } from "@/lib/mailerlite";
import { sendFreeLinkEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The free tier's login. Module 0 needs no email, so a visitor's starting line
 * and verdict live in one browser until they ask for a way back. This mints a
 * signed link with product "free" (opens nothing paid, but carries a stable
 * session id so progress syncs like a buyer's), sets the cookie on this
 * browser, emails the link, and adds the address to the free-course group.
 * The session id is an HMAC of the address, so asking twice keeps one store.
 */
const clean = (v: unknown, n = 80) => String(v ?? "").replace(/[\r\n]/g, " ").trim().slice(0, n);

export async function POST(req: Request) {
  let body: { email?: string; summary?: Record<string, unknown> } = {};
  try { body = await req.json(); } catch { /* 400 below */ }
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
  if (!(await rateLimit(`freelink:${email}`, 5, 3600))) return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });

  // A buyer who fills this in keeps their paid cookie; nothing is downgraded.
  const existing = await getCourseAccess();
  if (existing && existing.product !== "free") return NextResponse.json({ ok: true, already: existing.product });

  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const sid = "free_" + createHmac("sha256", secret).update(`free:${email}`).digest("hex").slice(0, 24);
  const token = signAccess({ sid, product: "free" });
  const link = unlockUrl(token);
  const summary = { floor: clean(body.summary?.floor), date: clean(body.summary?.date), verdict: clean(body.summary?.verdict) };

  try { await sendFreeLinkEmail({ to: email, unlockUrl: link, summary }); }
  catch (err) { console.error("[/api/course/free-link] email", err); return NextResponse.json({ error: "Could not send the email. Try again in a minute." }, { status: 502 }); }
  upsertSubscriber({ email, groups: [COURSE_GROUPS.free], fields: summary.verdict ? { stage: summary.verdict } : undefined }).catch(() => { /* logged inside */ });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, token, cookieOptions);
  return res;
}
