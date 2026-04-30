import { NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { buildPreviewPrompt, type PreviewInput } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PreviewInput;
    if (!body.resumeText || !body.jobDesc || !body.jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await callClaude({
      userPrompt: buildPreviewPrompt(body),
      maxTokens: 2000,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/preview]", err);
    return NextResponse.json(
      { error: err?.message || "Preview generation failed" },
      { status: 500 }
    );
  }
}
