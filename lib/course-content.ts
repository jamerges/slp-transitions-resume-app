// Lesson content for Modules 2–6 lives in content/course/modules/module-N.json
// (see content/course/LESSON_SPEC.md). This file types it and loads it. A
// module with no JSON yet is simply "not built": the quest log shows its
// lesson titles and nothing else.
import m2 from "@/content/course/modules/module-2.json";
import m3 from "@/content/course/modules/module-3.json";
import m4 from "@/content/course/modules/module-4.json";
import m5 from "@/content/course/modules/module-5.json";
import m6 from "@/content/course/modules/module-6.json";

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
  | { type: "tool"; name: string };

export interface LessonContent {
  id: string;
  tldr: string;
  blocks: Block[];
  action?: { label: string; prompt: string; done: string };
  takeaways: string[];
  sources?: string[];
}

const ALL: LessonContent[] = [m2, m3, m4, m5, m6].flat() as LessonContent[];
const BY_ID: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.id, l]));

export const contentFor = (id: string): LessonContent | undefined => BY_ID[id];
/** Ids that have authored content, used by lib/course.ts to unlock modules. */
export const contentIds: Set<string> = new Set(ALL.map((l) => l.id));
/** The one-line summary shown under a lesson title, taken from its TL;DR. */
export const summaryFor = (id: string): string => BY_ID[id]?.tldr || "";
export const hasContent = (id: string) => !!BY_ID[id];
/** Word count of the prose, for the reading-time label. */
export const wordCount = (c: LessonContent) =>
  c.blocks.reduce((n, b) => n + ("text" in b && typeof b.text === "string" ? b.text.split(/\s+/).length : "items" in b ? (b.items as any[]).map((i) => (typeof i === "string" ? i : i.label)).join(" ").split(/\s+/).length : 0), 0) + c.tldr.split(/\s+/).length;
