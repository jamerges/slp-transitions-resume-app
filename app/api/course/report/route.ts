import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/course-access";
import { sendOpsAlert } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Two things a buyer can send back to the program: the questions they were
 * asked in an interview (lesson 6.4) and where they landed (lesson 7.1). Both
 * need the access cookie, carry no name or email from the page, and go to the
 * ops inbox keyed by the Stripe session id, which is enough to build the
 * question bank and the alumni salary sheet by hand until there are enough
 * rows to automate. Nothing is published without asking.
 */
const MAX = 4000;
const clean = (v: unknown) => String(v ?? "").slice(0, MAX).trim();

export async function POST(req: Request) {
  const access = await getCourseAccess();
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });
  try {
    const { kind, payload } = (await req.json()) as { kind?: string; payload?: Record<string, unknown> };
    if ((kind !== "questions" && kind !== "landed") || !payload) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const lines = kind === "questions"
      ? [`session: ${access.sid}`, `role: ${clean(payload.role)}`, "questions:", ...clean(payload.questions).split("\n").map((l) => `  ${l}`)]
      : [`session: ${access.sid}`, `title: ${clean(payload.title)}`, `path: ${clean(payload.path)}`, `starting band: ${clean(payload.start)}`, `band now: ${clean(payload.now) || "(same or too soon)"}`];
    await sendOpsAlert({ subject: kind === "questions" ? "Course: interview questions reported" : "Course: where an SLP landed", lines });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[/api/course/report]", err);
    return NextResponse.json({ error: err?.message || "Could not send" }, { status: 500 });
  }
}
