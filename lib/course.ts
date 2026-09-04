// Transition OS: course data model and the content of Modules 0 and 1.
// Every number here traces to content/research-facts.md or to SOURCES below.
// Later modules are listed so the quest log shows the whole road; their
// lessons are written after James approves the sample.
import type { Progress } from "./course-progress";

export type LessonType = "video" | "explainer" | "interactive" | "action" | "checkpoint";

export interface Resource { label: string; href: string; kind: "worksheet" | "sheet" | "pdf" | "link" | "tool" }

export interface Lesson {
  id: string;            // "1.2"
  module: number;
  title: string;
  type: LessonType;
  minutes: number;
  summary: string;       // one line under the title
  /** Which client component renders it. Missing = written later. */
  component?: string;
  action?: { label: string; prompt: string; done: string };
  resources?: Resource[];
  sources?: string[];    // keys into SOURCES
}

export interface Module {
  n: number;
  slug: string;
  title: string;
  phase: string;         // Ground / Explore / Translate / Test / Leap
  week: string;
  tagline: string;
  lessons: Lesson[];
  built: boolean;        // false = titles only, shown locked
}

export const XP_PER_LESSON = 20;
export const XP_PER_ACTION = 40;

export const SOURCES: Record<string, { label: string; href?: string; note?: string }> = {
  bls: { label: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook: Speech-Language Pathologists, May 2025 wages", href: "https://www.bls.gov/ooh/healthcare/speech-language-pathologists.htm", note: "Median $97,870; 25th–75th percentile $77,730–$114,570; top 10% above $134,160." },
  ashaDebt: { label: "ASHA, Student Advocacy Day 2024: student loan debt", href: "https://www.asha.org/news/2024/student-advocacy-day-2024-targets-student-loan-debt/", note: "More than two-thirds of CSD master's students report unpaid debt; the most common band is $10,000–$50,000; SLP master's programs cost $23,000–$75,000." },
  arkes: { label: "Arkes & Blumer (1985), The psychology of sunk cost, Organizational Behavior and Human Decision Processes 35, 124–140", note: "The season-ticket study: people who paid more attended more plays, because of what they had already spent." },
  facts: { label: "SLP Transitions research file (documented SLP transitions, 2025–2026)", note: "Timelines of 6–15 months; path salary bands; the CAPM and $20k quotes." },
  voc: { label: "SLP Transitions voice-of-customer corpus (reader mail, forum threads)", note: "The five stages; the recurring themes: degree grief, identity fusion, fear of the bottom rung." },
  marante: { label: "Marante, Hall-Mills & Farquharson (2023), School-based SLPs' stress and burnout, LSHSS 54(2)", href: "https://pubs.asha.org/doi/10.1044/2022_LSHSS-22-00047", note: "453 school-based SLPs: high emotional exhaustion, feeling ineffective and overextended; perceived workload manageability was the strongest predictor of stress and burnout." },
};

export interface BadgeDef { id: BadgeId; label: string; blurb: string; xp: number; icon: string; when: (p: Progress) => boolean }
export type BadgeId =
  | "starting-line" | "said-it-out-loud" | "verdict" | "ground-complete"
  | "first-reach-out" | "first-translation" | "proof-artifact" | "application-1" | "interview-1" | "offer";

export const BADGES: BadgeDef[] = [
  { id: "starting-line", label: "Starting line", blurb: "You set a target date. Most people never do.", xp: 30, icon: "🏁", when: (p) => p.completed.includes("0.2") },
  { id: "verdict", label: "A verdict", blurb: "Bad workplace, bad fit, or bad season. You named it.", xp: 30, icon: "⚖️", when: (p) => p.completed.includes("1.2") },
  { id: "said-it-out-loud", label: "Said it out loud", blurb: "One person knows. The secret stopped costing you energy.", xp: 60, icon: "🗣️", when: (p) => p.actions.includes("1.6") },
  { id: "ground-complete", label: "Grounded", blurb: "Module 1 done. You know why, and you know which problem you have.", xp: 100, icon: "🌱", when: (p) => ["1.1","1.2","1.3","1.4","1.5","1.6","1.7"].every((id) => p.completed.includes(id)) },
  { id: "first-reach-out", label: "First reach-out", blurb: "One message sent to someone who made the move.", xp: 60, icon: "✉️", when: (p) => p.actions.includes("2.9") },
  { id: "first-translation", label: "First translation", blurb: "One clinical bullet, rewritten in the buyer's language.", xp: 60, icon: "🔁", when: (p) => p.actions.includes("3.5") },
  { id: "proof-artifact", label: "Proof artifact", blurb: "You made a thing. Certificates can't compete with it.", xp: 100, icon: "🧩", when: (p) => p.actions.includes("4.3") },
  { id: "application-1", label: "Application 1", blurb: "Tailored, translated, sent inside 48 hours of posting.", xp: 60, icon: "📨", when: (p) => p.actions.includes("3.8") },
  { id: "interview-1", label: "Interview 1", blurb: "Bridge statement delivered without flinching.", xp: 100, icon: "🎙️", when: (p) => p.actions.includes("5.4") },
  { id: "offer", label: "Offer", blurb: "The whole point.", xp: 300, icon: "🏆", when: (p) => p.actions.includes("5.8") },
];

const R = {
  workbook1: { label: "Module 1 workbook (Word)", href: "/course/module-1-workbook.docx", kind: "worksheet" as const },
  sunkSheet: { label: "Sunk-cost calculator (this lesson, saved to your map)", href: "#", kind: "tool" as const },
  fears: { label: "5 hidden fears stopping SLPs from making a career change", href: "https://slptransitions.com/5-hidden-fears-stopping-slps-from-making-a-career-change-and-how-to-overcome-them/", kind: "link" as const },
  stages: { label: "You're allowed to want out: the five stages", href: "https://slptransitions.com/youre-allowed-to-want-out/", kind: "link" as const },
  quit: { label: "Should you quit? Bad workplace, bad fit, bad season", href: "https://slptransitions.com/should-you-quit-slp/", kind: "link" as const },
  paths: { label: "The 20 paths, with sourced salary ranges", href: "https://slptransitions.com/alternative-careers-speech-pathologists-slps/", kind: "link" as const },
};

export const MODULES: Module[] = [
  {
    n: 0, slug: "start", title: "Start here", phase: "Setup", week: "Day 1", built: true,
    tagline: "Fifteen minutes. Your map, your rules of the road.",
    lessons: [
      { id: "0.1", module: 0, title: "Welcome from James", type: "video", minutes: 3, component: "Welcome",
        summary: "What this is, what it isn't, and the refund promise.", sources: ["facts"] },
      { id: "0.2", module: 0, title: "Your starting line", type: "interactive", minutes: 5, component: "StartingLine",
        summary: "Stage, path, income floor, hours, target date. It builds your 90-day map.",
        action: { label: "Set my target date", prompt: "Pick the date you want to be in a new role. Ninety days from now is the default and it is realistic for the fast paths; the long builds take 6–15 months and the map adjusts.", done: "Target date set." } },
      { id: "0.3", module: 0, title: "Three lies, three guardrails", type: "explainer", minutes: 4, component: "ThreeLies",
        summary: "The beliefs that stall people, and the three facts the internet keeps getting wrong.", sources: ["facts"] },
    ],
  },
  {
    n: 1, slug: "ground", title: "Ground", phase: "Ground", week: "Week 1", built: true,
    tagline: "Permission, identity, and the honest decision.",
    lessons: [
      { id: "1.1", module: 1, title: "You're allowed to want out", type: "explainer", minutes: 6, component: "FiveStages",
        summary: "The five stages of leaving, where you are, and the one move at each.", resources: [R.stages, R.workbook1], sources: ["voc", "facts"] },
      { id: "1.2", module: 1, title: "Bad workplace, bad fit, or bad season?", type: "interactive", minutes: 8, component: "DecisionTree",
        summary: "\"I want to quit\" is three problems wearing one trench coat. Sort yours.", resources: [R.quit, R.workbook1], sources: ["facts", "voc"] },
      { id: "1.3", module: 1, title: "The sunk-cost audit", type: "interactive", minutes: 7, component: "SunkCost",
        summary: "The degree is spent either way. Run the only numbers that are still live.", resources: [R.sunkSheet, R.fears], sources: ["bls", "ashaDebt", "arkes", "facts"] },
      { id: "1.4", module: 1, title: "What you're protecting", type: "interactive", minutes: 8, component: "Dials",
        summary: "Five dials that decide which paths fit: pay floor, hours, distance from clinical, people-time, tech.", resources: [R.paths], sources: ["facts"] },
      { id: "1.5", module: 1, title: "Still you", type: "video", minutes: 5, component: "Identity",
        summary: "Three people who kept the part of the work they loved. Same competence, new title.", sources: ["voc"] },
      { id: "1.6", module: 1, title: "Tell one person", type: "action", minutes: 3, component: "TellOne",
        summary: "The smallest possible disclosure. It costs less than the secret does.",
        action: { label: "I told someone", prompt: "Pick one person who will not argue with you: a partner, a friend outside the field, a former colleague who left. Say one sentence: \"I'm looking at what else I could do with my SLP background.\" That's it. No plan required.", done: "Said out loud. The secret stopped costing you energy." },
        sources: ["voc"] },
      { id: "1.7", module: 1, title: "Checkpoint: Ground", type: "checkpoint", minutes: 2, component: "Checkpoint1",
        summary: "Your verdict, your dials, and one sentence in pull language. Unlocks Explore." },
    ],
  },
  {
    n: 2, slug: "explore", title: "Explore", phase: "Explore", week: "Weeks 2–3", built: false,
    tagline: "The twenty paths and the one that fits.",
    lessons: [
      { id: "2.1", module: 2, title: "The map: twenty paths by timeline", type: "explainer", minutes: 9, summary: "" },
      { id: "2.2", module: 2, title: "The fast exits", type: "video", minutes: 8, summary: "Liaison, utilization review, clinical educator, case management." },
      { id: "2.3", module: 2, title: "The most-travelled roads", type: "video", minutes: 9, summary: "Customer success, project management, data, content." },
      { id: "2.4", module: 2, title: "The long builds", type: "video", minutes: 7, summary: "Informatics, instructional design, UX, software, conversation design." },
      { id: "2.5", module: 2, title: "The three guardrails, in full", type: "explainer", minutes: 6, summary: "" },
      { id: "2.6", module: 2, title: "Pick one: your Pivot Report", type: "interactive", minutes: 8, summary: "" },
      { id: "2.7", module: 2, title: "Path deep-dive (your top two)", type: "interactive", minutes: 10, summary: "" },
      { id: "2.8", module: 2, title: "Messages that get answered", type: "video", minutes: 9, summary: "" },
      { id: "2.9", module: 2, title: "Reach out to three people", type: "action", minutes: 20, summary: "" },
    ],
  },
  {
    n: 3, slug: "translate", title: "Translate", phase: "Translate", week: "Weeks 3–5", built: false,
    tagline: "Your experience in the buyer's language.",
    lessons: [
      { id: "3.1", module: 3, title: "The seven-second problem", type: "explainer", minutes: 5, summary: "" },
      { id: "3.2", module: 3, title: "The translation layer", type: "video", minutes: 10, summary: "" },
      { id: "3.3", module: 3, title: "Numbers you already have", type: "interactive", minutes: 8, summary: "" },
      { id: "3.4", module: 3, title: "The AI trap", type: "video", minutes: 6, summary: "" },
      { id: "3.5", module: 3, title: "Build your résumé in the Suite", type: "interactive", minutes: 15, summary: "" },
      { id: "3.6", module: 3, title: "LinkedIn as the background check", type: "video", minutes: 8, summary: "" },
      { id: "3.7", module: 3, title: "The cover letter as costly signal", type: "video", minutes: 6, summary: "" },
      { id: "3.8", module: 3, title: "Send one application properly", type: "action", minutes: 30, summary: "" },
    ],
  },
  {
    n: 4, slug: "test", title: "Test", phase: "Test", week: "Weeks 5–8", built: false,
    tagline: "Proof artifacts and the bridge.",
    lessons: [
      { id: "4.1", module: 4, title: "Why proof beats certificates", type: "video", minutes: 6, summary: "" },
      { id: "4.2", module: 4, title: "The proof-artifact menu", type: "interactive", minutes: 8, summary: "" },
      { id: "4.3", module: 4, title: "Make it in a week", type: "action", minutes: 120, summary: "" },
      { id: "4.4", module: 4, title: "The bridge options", type: "video", minutes: 7, summary: "" },
      { id: "4.5", module: 4, title: "Money, loans and the bridge", type: "interactive", minutes: 9, summary: "" },
      { id: "4.6", module: 4, title: "The referral engine", type: "video", minutes: 7, summary: "" },
      { id: "4.7", module: 4, title: "Keep two conversations warm", type: "action", minutes: 15, summary: "" },
    ],
  },
  {
    n: 5, slug: "leap", title: "Leap", phase: "Leap", week: "Weeks 8–12", built: false,
    tagline: "Interviews, offers, and the first 90 days.",
    lessons: [
      { id: "5.1", module: 5, title: "How career changers get screened", type: "video", minutes: 7, summary: "" },
      { id: "5.2", module: 5, title: "Bridge statements", type: "interactive", minutes: 9, summary: "" },
      { id: "5.3", module: 5, title: "Screening questions that filter you out", type: "interactive", minutes: 8, summary: "" },
      { id: "5.4", module: 5, title: "The mock interview", type: "interactive", minutes: 15, summary: "" },
      { id: "5.5", module: 5, title: "Salary and the offer", type: "video", minutes: 8, summary: "" },
      { id: "5.6", module: 5, title: "Volume without despair", type: "video", minutes: 6, summary: "" },
      { id: "5.7", module: 5, title: "The first 90 days", type: "video", minutes: 7, summary: "" },
      { id: "5.8", module: 5, title: "Accept, or keep going", type: "action", minutes: 5, summary: "" },
    ],
  },
  {
    n: 6, slug: "after", title: "After", phase: "After", week: "Alumni", built: false,
    tagline: "Tell your story. Pay it forward.",
    lessons: [
      { id: "6.1", module: 6, title: "Tell your story", type: "action", minutes: 15, summary: "" },
      { id: "6.2", module: 6, title: "The next rung", type: "video", minutes: 4, summary: "" },
      { id: "6.3", module: 6, title: "Pay it forward", type: "action", minutes: 10, summary: "" },
    ],
  },
];

export const LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const moduleOf = (l: Lesson) => MODULES.find((m) => m.n === l.module)!;
export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return LESSONS.slice(i + 1).find((l) => moduleOf(l).built);
}
export const TYPE_LABEL: Record<LessonType, string> = { video: "Video", explainer: "Animated explainer", interactive: "Interactive", action: "Action", checkpoint: "Checkpoint" };

// The five dials (lesson 1.4). Each path's profile mirrors the sign of its
// scores on the income, time, proximity, people and tech questions in
// lib/quiz.ts: 1 = the path rewards a high setting, 0 = a low one, 0.5 = either.
export interface DialProfile { pay: number; hours: number; clinical: number; people: number; tech: number }
export const DIAL_PROFILES: Record<string, DialProfile> = {
  "liaison-ur":           { pay: 1,   hours: 0,   clinical: 1,   people: 0.6, tech: 0.3 },
  "customer-success":     { pay: 0.8, hours: 0.3, clinical: 0.6, people: 0.9, tech: 0.5 },
  "clinical-educator":    { pay: 0.7, hours: 0.2, clinical: 1,   people: 1,   tech: 0.5 },
  "leadership":           { pay: 0.9, hours: 0.2, clinical: 1,   people: 0.9, tech: 0.4 },
  "sales-bd":             { pay: 0.9, hours: 0.2, clinical: 0.7, people: 1,   tech: 0.4 },
  "research-coordinator": { pay: 0,   hours: 0,   clinical: 0.7, people: 0.4, tech: 0.5 },
  "informatics":          { pay: 1,   hours: 0.7, clinical: 0.8, people: 0.2, tech: 1 },
  "project-management":   { pay: 0.6, hours: 0.7, clinical: 0.3, people: 0.6, tech: 0.5 },
  "data-analysis":        { pay: 0.5, hours: 1,   clinical: 0.3, people: 0.1, tech: 0.9 },
  "instructional-design": { pay: 0.3, hours: 0.7, clinical: 0.4, people: 0.3, tech: 0.7 },
  "content-marketing":    { pay: 0.4, hours: 0.7, clinical: 0.2, people: 0.3, tech: 0.6 },
};
