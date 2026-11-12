import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { callClaude, assertReadableResume } from "@/lib/anthropic";
import { buildPreviewPrompt, type PreviewInput } from "@/lib/prompts";
import { dashless } from "@/lib/report-quiz";
import { rateLimit, stashPreview } from "@/lib/stash";
import { sendPreviewEmail } from "@/lib/email";

export const runtime = "nodejs";
// Generation runs 30 to 50 seconds; the save and the email follow it.
export const maxDuration = 90;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Body = PreviewInput & { email?: string; writingSample?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.resumeText || !body.jobDesc || !body.jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
      assertReadableResume(body.resumeText);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    // Each preview is a model call, and since 2026-11-11 an email. Cap both.
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    if (!(await rateLimit(`preview:${ip}`, 12, 3600))) {
      return NextResponse.json(
        { error: "You've run a lot of previews in the last hour. Try again in a little while." },
        { status: 429 }
      );
    }

    const raw = await callClaude({
      userPrompt: buildPreviewPrompt(body),
      maxTokens: 3000,
    });
    const preview = dashless(raw);

    // The email step promises "we'll send your results here". Until 2026-11-11
    // nothing was sent: the address only went to the mailing list, and closing
    // the tab lost the preview. Save it and send it, with a link that reopens
    // it with the résumé and posting in place. Never fails the response.
    let savedId: string | undefined;
    let emailed = false;
    const email = (body.email || "").trim();
    if (EMAIL_RE.test(email)) {
      try {
        const id = randomBytes(16).toString("hex");
        const saved = await stashPreview(id, {
          inputs: {
            resumeText: body.resumeText,
            jobTitle: body.jobTitle,
            jobDesc: body.jobDesc,
            goals: body.goals,
            email,
            writingSample: body.writingSample || undefined,
          },
          preview,
          at: Date.now(),
        });
        if (saved) savedId = id;
        if (await rateLimit(`previewmail:${email.toLowerCase()}`, 4, 86400)) {
          await sendPreviewEmail({
            to: email,
            jobTitle: body.jobTitle,
            preview,
            link: saved ? `${APP_URL}/?preview=${id}` : null,
          });
          emailed = true;
        }
      } catch (e) {
        console.error("[/api/preview] save or email failed", e);
      }
    }

    return NextResponse.json({ ...preview, savedId, emailed });
  } catch (err: any) {
    console.error("[/api/preview]", err);
    return NextResponse.json(
      { error: err?.message || "Preview generation failed" },
      { status: 500 }
    );
  }
}
