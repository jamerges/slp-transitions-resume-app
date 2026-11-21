// Lesson content for Modules 2–7 lives in content/course/modules/module-N.json
// (see content/course/LESSON_SPEC.md). This file types it and loads it. A
// module with no JSON yet is simply "not built": the quest log shows its
// lesson titles and nothing else.
import m2 from "@/content/course/modules/module-2.json";
import m3 from "@/content/course/modules/module-3.json";
import m4 from "@/content/course/modules/module-4.json";
import m5 from "@/content/course/modules/module-5.json";
import m6 from "@/content/course/modules/module-6.json";
import m7 from "@/content/course/modules/module-7.json";

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "numbers"; items: { value: string; label: string }[] }
  | { type: "quote"; text: string; from?: string }
  | { type: "callout"; tone?: "soft" | "warm"; title?: string; text: string }
  | { type: "example"; title?: string; before: string; after: string }
  | { type: "script"; title?: string; text: string }
  | { type: "story"; name: string; was: string; now: string; text: string; href?: string }
  | { type: "paths"; note?: string }
  /** One copyable script per path, keyed by quiz slug; the reader's own path opens first. */
  | { type: "bypath"; title?: string; note?: string; items: Record<string, string> }
  /** One written answer, saved under the lesson's id and printed in the workbook. */
  | { type: "ask"; label: string; prompt: string; lines?: number }
  | { type: "tool"; name: string }
  /** Two columns set against each other: what most people do and what works. */
  | { type: "compare"; title?: string; left: { label: string; items: string[] }; right: { label: string; items: string[] } }
  /** A sequence drawn with arrows: a search order, a funnel, the stages of hiring. */
  | { type: "flow"; title?: string; items: { label: string; note?: string }[] }
  /** Two to four parallel ideas side by side. */
  | { type: "cards"; items: { title: string; text: string }[] }
  /** One or two situation questions that make the reader use the lesson. */
  | { type: "check"; items: { q: string; options: string[]; answer: number; why: string }[] };

export interface LessonContent {
  id: string;
  tldr: string;
  blocks: Block[];
  action?: { label: string; prompt: string; done: string };
  takeaways: string[];
  sources?: string[];
}

const ALL: LessonContent[] = [m2, m3, m4, m5, m6, m7].flat() as LessonContent[];
const BY_ID: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.id, l]));

export const contentFor = (id: string): LessonContent | undefined => BY_ID[id];
/** Ids that have authored content, used by lib/course.ts to unlock modules. */
export const contentIds: Set<string> = new Set(ALL.map((l) => l.id));
/** The one-line summary shown under a lesson title, taken from its TL;DR. */
export const summaryFor = (id: string): string => BY_ID[id]?.tldr || "";
export const hasContent = (id: string) => !!BY_ID[id];
/** Every word a reader would read in a block, whatever its shape. */
const wordsIn = (v: unknown): number =>
  typeof v === "string" ? v.split(/\s+/).filter(Boolean).length
  : Array.isArray(v) ? v.reduce((n: number, x) => n + wordsIn(x), 0)
  : v && typeof v === "object" ? Object.entries(v as Record<string, unknown>).reduce((n, [k, x]) => (k === "type" || k === "name" || k === "tone" || k === "answer" ? n : n + wordsIn(x)), 0)
  : 0;
/** Word count of the lesson, for the reading-time label. */
export const wordCount = (c: LessonContent) => c.blocks.reduce((n, b) => n + wordsIn(b), 0);
