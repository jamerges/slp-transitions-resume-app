import type { StageKey } from "./quiz";

/**
 * The stage map: where a reader is, the belief holding them there, the one
 * move out, and what the next stage looks like. One source of truth for the
 * quiz result page, the printable sheet at /quiz/map, and both quiz emails.
 *
 * Every line echoes the published five-stages article
 * (slptransitions.com/youre-allowed-to-want-out/) so the map and the article
 * say the same thing. Nothing here is invented biography; the stories named
 * are the three interviews already on the site.
 */
export interface StageMove {
  label: string;
  detail: string;
  /** Where the move lives. Null means "it is on this page already". */
  href: string | null;
  cta: string | null;
}
export interface StageInfo {
  n: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** What it feels like, in the reader's own terms. */
  here: string;
  /** The belief that keeps people at this stage. */
  belief: string;
  /** Why the belief is wrong, briefly. */
  truth: string;
  move: StageMove;
  next: { name: string; line: string };
}

const SITE = "https://slptransitions.com";
const APP = "https://app.slptransitions.com";

export const STAGE_MAP: Record<StageKey, StageInfo> = {
  private: {
    n: 1,
    name: "Private doubt",
    here: "You haven't told anyone. You search at 11pm, clear the history, and show up Monday as the person who says everything is fine.",
    belief: "Looking means deciding.",
    truth: "Looking is research. You can read every article on this site and still be a working clinician on Monday. Most people who eventually leave spend months here before they say a word.",
    move: {
      label: "Work out what you're reacting to",
      detail: "Bad workplace, bad fit, or bad season are three different problems with three different fixes, and only one of them means leaving the field. Answer that one question, alone, honestly.",
      href: `${SITE}/should-you-quit-slp/`,
      cta: "Take the three-question check",
    },
    next: { name: "Guilt and identity", line: "The degree, the loans, and who you are if you're not an SLP." },
  },
  guilt: {
    n: 2,
    name: "Guilt and identity",
    here: "The degree. The loans. The families who still text you updates. And underneath all of it: who are you if you're not an SLP?",
    belief: "Leaving wastes the degree, and wanting out means you care less than you should.",
    truth: "The years are spent whether you stay or go. The degree goes with you: clinical liaison, utilization review, customer success and informatics all hire on it. Caring about the work and not being able to keep doing it inside its conditions are two different facts.",
    move: {
      label: "See the five fears named",
      detail: "Not to fix them today. Just to see them written down, so they stop running things from the back seat.",
      href: `${SITE}/5-hidden-fears-stopping-slps-from-making-a-career-change-and-how-to-overcome-them/`,
      cta: "Read the five fears",
    },
    next: { name: "Permission-seeking", line: "Reading exit stories, hunting for someone enough like you that it counts." },
  },
  permission: {
    n: 3,
    name: "Permission-seeking",
    here: "You read every \"I left, here's what I do\" post to the end, then scroll back up to check what setting they were in and how many years they had.",
    belief: "It works for other people. Not you.",
    truth: "Jeannette taught herself to code between shifts. Rachel built a practice from one training she was already giving for free. Mattie rebuilt her career in her fifties. None of them had a shortcut you don't have.",
    move: {
      label: "Read one story, for the first month only",
      detail: "Pick the one whose starting point looks most like yours. Skip the last month, because the last month is always the offer letter. The first month is the part you can copy.",
      href: `${SITE}/category/real-transitions/`,
      cta: "Pick a story",
    },
    next: { name: "Practical panic", line: "\"What else could I even do?\" That is the question this quiz just answered." },
  },
  panic: {
    n: 4,
    name: "Practical panic",
    here: "You've said it out loud, to a partner or to the steering wheel. Now the question is what else you could even do, and every posting seems to want someone else.",
    belief: "You'd have to start over at the bottom.",
    truth: "Lateral moves exist, and several pay more than clinical work from day one: clinical liaison $84,000 to $135,000, customer success $75,000 to $120,000. The people who landed them did not go back to school first.",
    move: {
      label: "Stop reading twenty paths and pick one",
      detail: "Your result on this page is the one. The first move is written under it. One path with a first move beats twenty paths with none.",
      href: null,
      cta: null,
    },
    next: { name: "Action", line: "A target role, applications out, and a résumé that still reads clinical to a recruiter." },
  },
  action: {
    n: 5,
    name: "Action",
    here: "You have a target role or two, you've applied to some things, and the silence is starting to feel personal.",
    belief: "If you were good enough, you'd be getting callbacks.",
    truth: "A recruiter gives a résumé about seven seconds. \"Managed a caseload of 62 students\" lands in the clinical pile no matter who wrote it. You get sorted by vocabulary long before anyone judges your ability.",
    move: {
      label: "Fix the résumé before you send another application",
      detail: "Translate it line by line against a real posting, and do the same to your LinkedIn, because they check it before they call.",
      href: `${APP}/?from=quiz`,
      cta: "Translate my résumé",
    },
    next: { name: "Out", line: "Documented transitions take six to fifteen months. One SLP sent 113 applications for 7 interviews and 1 offer. Knowing that is the difference between pacing yourself and quitting in month four." },
  },
};

export const STAGE_ORDER: StageKey[] = ["private", "guilt", "permission", "panic", "action"];

/** Which product, if any, the result page and emails lead with for a stage.
 *  Stages 1 to 3 get the map and no pitch; a stage-2 reader greeted with a
 *  checkout button stops reading. Stage 4 arrived asking "what else could I
 *  do", which is what the report answers. Stage 5 already has a résumé, so the
 *  report is a detour and the Suite is the thing. */
export type StageOffer = "map" | "report" | "suite";
export function offerForStage(stage: StageKey | null | undefined): StageOffer {
  if (!stage) return "report";
  if (stage === "action") return "suite";
  if (stage === "panic") return "report";
  return "map";
}

/** The printable sheet. Stage and path slug only: never a name or email in a URL. */
export function mapUrl(stage: StageKey | null | undefined, pathSlug: string, base = APP): string {
  const q = new URLSearchParams();
  if (stage) q.set("stage", stage);
  if (pathSlug) q.set("path", pathSlug);
  return `${base}/quiz/map?${q.toString()}`;
}
