import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/course-access";
import { loadCourseProgress, saveCourseProgress } from "@/lib/quiz-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A buyer's course progress (answers, the people list, XP), keyed by the
 * Stripe session id in their access cookie, so the list they build over
 * months is there on the next laptop and after a cleared browser. Free
 * visitors get a 403 and stay browser-only. The page merges what it holds with
 * what is stored, then writes the union back; the store never decides.
 */
const MAX_BYTES = 400_000;

export async function GET() {
  const access = await getCourseAccess();
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });
  const { progress, store } = await loadCourseProgress(access.sid);
  return NextResponse.json({ progress, store }, { headers: { "Cache-Control": "no-store" } });
}

async function write(req: Request) {
  const access = await getCourseAccess();
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });
  const text = await req.text();
  if (text.length > MAX_BYTES) return NextResponse.json({ error: "Too large" }, { status: 413 });
  let body: any;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || !Array.isArray(body.completed) || typeof body.answers !== "object") {
    return NextResponse.json({ error: "Bad shape" }, { status: 400 });
  }
  const ok = await saveCourseProgress(access.sid, body);
  return NextResponse.json({ ok });
}

export const PUT = write;
/** navigator.sendBeacon can only POST, and it is what saves the last edit when the tab closes. */
export const POST = write;
