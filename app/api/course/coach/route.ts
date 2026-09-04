import { NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { rateLimit } from "@/lib/stash";
import { PATHS } from "@/lib/quiz";

/**
 * The mock-interview coach (lesson 5.4). Asks one question at a time for the
 * reader's path, then gives feedback against the three things that actually
 * screen career changers out. Uses the same system prompt as the Suite, so its
 * salary facts and guardrails match the rest of the site.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

interface Turn { role: "coach" | "you"; text: string }

export async function POST(req: Request) {
  try {
    const { path, pull, turns } = (await req.json()) as { path?: string; pull?: string; turns?: Turn[] };
    const p = (path && PATHS[path]) || PATHS["customer-success"];
    const history = Array.isArray(turns) ? turns.slice(-8) : [];

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
    if (!(await rateLimit(`coach:${ip}`, 40, 3600))) {
      return NextResponse.json({ error: "That is a lot of practice for one hour. Come back shortly." }, { status: 429 });
    }

    const asked = history.filter((t) => t.role === "coach").length;
    const transcript = history.map((t) => `${t.role === "coach" ? "INTERVIEWER" : "CANDIDATE"}: ${t.text}`).join("\n\n");

    const userPrompt = `You are running a mock interview for a speech-language pathologist moving into: ${p.label} (documented range ${p.range}, typical timeline ${p.timeline}).
${pull ? `Their own reason for leaving, in their words: "${pull}"` : ""}

Rules for you:
- Ask ONE question at a time. Five questions total, then a short close.
- Questions must be ones a real hiring manager for this role asks a career changer, in this order: (1) why are you leaving clinical work, (2) what in your clinical work maps to this role, (3) a behavioural question about a difficult stakeholder, (4) something specific to ${p.label}, (5) what have you done to prepare.
- After each candidate answer, give feedback in at most 60 words before asking the next question. Cover what landed, whether anything read as escaping burnout rather than moving toward the work, and whether a real number was missing.
- Never invent salary figures beyond the documented range above. Never say Epic certification can be self-obtained; it requires employer sponsorship.
- Warm and plain. No corporate jargon. No em-dashes. Never use "it is not X, it is Y" constructions.
- Questions asked so far: ${asked}. ${asked >= 5 ? "Give the closing summary now: two things they did well and one to fix before the real interview." : "Continue."}

${transcript ? `Transcript so far:\n${transcript}` : "Nothing yet. Open with a one-line greeting and question 1."}

Reply with JSON only: {"text": "your next message to the candidate"}`;

    const out = await callClaude({ userPrompt, maxTokens: 700 });
    const text = typeof out?.text === "string" ? out.text : typeof out === "string" ? out : "Let us start. Why are you leaving clinical work?";
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("[/api/course/coach]", e);
    return NextResponse.json({ error: "The coach is unavailable right now. Try again in a minute." }, { status: 500 });
  }
}
