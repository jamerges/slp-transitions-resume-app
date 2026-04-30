import { NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { buildFullPrompt, type FullInput } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FullInput;
    if (!body.resumeText || !body.jobDesc || !body.jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await callClaude({
      userPrompt: buildFullPrompt(body),
      maxTokens: 8000,
    });
    if (!result.professionalSummary || !result.translatedBullets) {
      return NextResponse.json(
        { error: "Missing required fields in response: " + Object.keys(result).join(", ") },
        { status: 502 }
      );
    }
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/full]", err);
    return NextResponse.json(
      { error: err?.message || "Full results generation failed" },
      { status: 500 }
    );
  }
}
