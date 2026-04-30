import { NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { buildExplorePrompt, type ExploreInput } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExploreInput;
    if (!body.resumeText) {
      return NextResponse.json({ error: "Missing resumeText" }, { status: 400 });
    }
    const result = await callClaude({
      userPrompt: buildExplorePrompt(body),
      maxTokens: 4000,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/explore]", err);
    return NextResponse.json(
      { error: err?.message || "Exploration generation failed" },
      { status: 500 }
    );
  }
}
