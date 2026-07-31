import { NextResponse } from "next/server";
import { PATHS } from "@/lib/quiz";
import { sendQuizResultEmail } from "@/lib/email";

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
    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;
    if (apiKey && groupId) {
      try {
        const resp = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            email,
            groups: [groupId],
            fields: {
              name: name || "",
              // Segmentable: lets you email "everyone whose quiz said informatics".
              quiz_result: top.label,
            },
          }),
        });
        if (!resp.ok) {
          console.error("[/api/quiz-result] MailerLite", resp.status, (await resp.text()).slice(0, 240));
        }
      } catch (e) {
        console.error("[/api/quiz-result] MailerLite failed", e);
      }
    }

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
