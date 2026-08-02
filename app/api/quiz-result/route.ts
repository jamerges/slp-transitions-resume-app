import { NextResponse } from "next/server";
import { PATHS } from "@/lib/quiz";
import { sendQuizResultEmail } from "@/lib/email";
import { upsertSubscriber, QUIZ_PATH_GROUPS } from "@/lib/mailerlite";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { email, name, topSlug, runnerUpSlug } = (await req.json()) as {
      email?: string;
      name?: string;
      topSlug?: string;
      runnerUpSlug?: string;
    };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    const top = topSlug ? PATHS[topSlug] : undefined;
    if (!top) return NextResponse.json({ error: "Missing result" }, { status: 400 });
    const runnerUp = runnerUpSlug ? PATHS[runnerUpSlug] : null;

    // Subscribe first — the list is the point. Never let an email failure block it.
    // Two groups: the master quiz group and the one for this specific path, so a
    // sequence can target "everyone whose quiz said informatics" directly.
    await upsertSubscriber({
      email,
      name,
      groups: [process.env.MAILERLITE_GROUP_ID || "", QUIZ_PATH_GROUPS[top.roleOption] || ""],
      fields: { quiz_result: top.label },
    });

    let emailed = false;
    try {
      await sendQuizResultEmail({ to: email, name, top, runnerUp });
      emailed = true;
    } catch (e) {
      console.error("[/api/quiz-result] email failed", e);
    }

    // Always release the result — a delivery hiccup shouldn't hold it hostage.
    return NextResponse.json({ ok: true, emailed });
  } catch (err: any) {
    console.error("[/api/quiz-result]", err);
    return NextResponse.json({ ok: true, emailed: false });
  }
}
