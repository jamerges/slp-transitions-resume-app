import { priceOf, LIST } from "./pricing";
/** Pure, importable from client components. Module 0 is free for everyone.
 *  Ground opens Module 1. The full program opens the rest. */
/** "free" is the Module 0 link: it opens nothing paid but carries a stable session id so progress syncs. */
export type CourseProduct = "free" | "ground" | "os";

export function canOpen(moduleN: number, access: { product: CourseProduct } | null | undefined): boolean {
  if (moduleN <= 0) return true;           // the setup is free
  if (!access) return false;
  if (moduleN === 1) return access.product === "ground" || access.product === "os";
  return access.product === "os";
}

/** What the $24 is called where a buyer can see it. "Ground" and "Explore"
 *  stay as the module names inside the course; this is the product. */
export const GROUND_NAME = "Getting Started for SLPs";
export const GROUND_SUB = "Want out and don't know what else you could do? Your number, your reasons, the people who already made the move, and the r\u00e9sum\u00e9 pass. The first month, in one kit.";
/** One place owns the price. $19 sits between the $9 report and the $24 Suite
 *  so the ladder reads at a glance, and it credits in full toward the program:
 *  its job is deposits, not margin. */
export const GROUND_PRICE = priceOf("ground");
/** What Module 1 costs when there is no sale. */
export const GROUND_LIST_PRICE = LIST.ground;

/**
 * 2026-09-21: the $19 was Module 1 alone and sold nothing. It is now the
 * first month: Module 1 plus the first three people lessons and the two
 * r\u00e9sum\u00e9 lessons. canOpen() stays module-level for the full program;
 * canOpenLesson() adds the per-lesson allowance for kit owners.
 */
export const KIT_LESSONS: readonly string[] = ["3.1", "3.2", "3.3", "4.2", "4.7"];
export function canOpenLesson(lessonId: string, moduleN: number, access: { product: CourseProduct } | null | undefined): boolean {
  if (canOpen(moduleN, access)) return true;
  return !!access && access.product === "ground" && KIT_LESSONS.includes(lessonId);
}
/** What the kit is, for the pages that describe it. Lesson titles must match lib/course.ts. */
export const KIT = {
  lessons: 12,
  parts: [
    { title: "Your reasons, in writing", where: "Module 1, seven lessons", gets: "So the decision is made once, on paper, instead of every Sunday night.", lessons: ["You're allowed to want out", "Why leaving isn't a wasted degree", "What actually gave you energy", "What you can't afford to lose", "What you keep when you leave", "Tell one person", "Your why, in writing"] },
    { title: "The people who already made the move", where: "Connect, three lessons", gets: "Who to talk to first, the message that gets answered with your details filled in, and three sent on the first night.", lessons: ["Where to find people in your target field", "Messages that get answered", "Reach out to three people"] },
    { title: "The r\u00e9sum\u00e9 pass", where: "Translate, two lessons", gets: "Every bullet with a number, in words a hiring manager can picture, and one application sent properly.", lessons: ["Translating clinical work into business language", "Send one application properly"] },
  ],
} as const;
