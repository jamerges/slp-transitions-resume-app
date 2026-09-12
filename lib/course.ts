// Transition OS: course data model and the content of Modules 0 and 1.
// Every number here traces to content/research-facts.md or to SOURCES below.
// Later modules are listed so the quest log shows the whole road; their
// lessons are written after James approves the sample.
import type { Progress } from "./course-progress";
import { contentIds, summaryFor } from "./course-content";

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
  money: { label: "Course research file: PSLF, income-driven repayment, COBRA and ASHA certification (Sept 2026), compiled from studentaid.gov, dol.gov, healthcare.gov, KFF and asha.org", note: "Federal loan rules changed through 2025 and 2026 and parts are still being litigated. Verify your own plan and employer before acting." },
  forums: { label: "Voice-of-customer corpus, forums (Sept 2026): 101 threads on r/slp, r/SLPcareertransitions, r/careerguidance, Mumsnet, blog comments", note: "Quotes are verbatim and short; usernames removed. Money and 'what else can I do' are the two most common worries; loans/PSLF is the loudest unmet one.", href: "https://slptransitions.com/youre-allowed-to-want-out/" },
  marante: { label: "Marante, Hall-Mills & Farquharson (2023), School-based SLPs' stress and burnout, LSHSS 54(2)", href: "https://pubs.asha.org/doi/10.1044/2022_LSHSS-22-00047", note: "453 school-based SLPs: high emotional exhaustion, feeling ineffective and overextended; perceived workload manageability was the strongest predictor of stress and burnout." },
};

export interface BadgeDef { id: BadgeId; label: string; blurb: string; xp: number; icon: string; when: (p: Progress) => boolean }
export type BadgeId =
  | "starting-line" | "said-it-out-loud" | "verdict" | "ground-complete"
  | "first-reach-out" | "first-translation" | "proof-artifact" | "application-1" | "interview-1" | "offer";

export const BADGES: BadgeDef[] = [
  { id: "starting-line", label: "Starting line", blurb: "You set a target date. Most people never do.", xp: 30, icon: "🏁", when: (p) => p.completed.includes("0.2") },
  { id: "verdict", label: "A verdict", blurb: "Bad workplace, bad fit, or bad season. You named it.", xp: 30, icon: "⚖️", when: (p) => p.completed.includes("1.2") },
  { id: "said-it-out-loud", label: "Said it out loud", blurb: "One person knows. The secret stopped costing you energy.", xp: 60, icon: "🗣️", when: (p) => p.actions.includes("1.7") },
  { id: "ground-complete", label: "Grounded", blurb: "Module 1 done. You know why, and you know which problem you have.", xp: 100, icon: "🌱", when: (p) => ["1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8"].every((id) => p.completed.includes(id)) },
  { id: "first-reach-out", label: "First reach-out", blurb: "One message sent to someone who made the move.", xp: 60, icon: "✉️", when: (p) => p.actions.includes("3.3") },
  { id: "first-translation", label: "First translation", blurb: "One clinical bullet, rewritten in the buyer's language.", xp: 60, icon: "🔁", when: (p) => p.actions.includes("4.5") },
  { id: "proof-artifact", label: "Proof artifact", blurb: "You made a thing. Certificates can't compete with it.", xp: 100, icon: "🧩", when: (p) => p.actions.includes("5.3") },
  { id: "application-1", label: "Application 1", blurb: "Tailored, translated, sent inside 48 hours of posting.", xp: 60, icon: "📨", when: (p) => p.actions.includes("4.7") },
  { id: "interview-1", label: "Interview 1", blurb: "Bridge statement delivered without flinching.", xp: 100, icon: "🎙️", when: (p) => p.actions.includes("6.4") },
  { id: "offer", label: "Offer", blurb: "The whole point.", xp: 300, icon: "🏆", when: (p) => p.actions.includes("6.8") },
];

const R = {
  workbook1: { label: "Companion workbook (Word)", href: "/course/transition-os-workbook.docx", kind: "worksheet" as const },
  workbookPdf: { label: "Companion workbook (PDF, print-ready)", href: "/course/transition-os-workbook.pdf", kind: "worksheet" as const },
  sunkSheet: { label: "Sunk-cost calculator (this lesson, saved to your map)", href: "#", kind: "tool" as const },
  fears: { label: "5 hidden fears stopping SLPs from making a career change", href: "https://slptransitions.com/5-hidden-fears-stopping-slps-from-making-a-career-change-and-how-to-overcome-them/", kind: "link" as const },
  stages: { label: "You're allowed to want out: the five stages", href: "https://slptransitions.com/youre-allowed-to-want-out/", kind: "link" as const },
  quit: { label: "Should you quit? Bad workplace, bad fit, bad season", href: "https://slptransitions.com/should-you-quit-slp/", kind: "link" as const },
  paths: { label: "The 20 paths, with sourced salary ranges", href: "https://slptransitions.com/alternative-careers-speech-pathologists-slps/", kind: "link" as const },
  companies: { label: "120 companies that hire former SLPs", href: "/companies", kind: "link" as const },
  jobs: { label: "Open roles this week, by path", href: "/jobs", kind: "link" as const },
  suite: { label: "Career Pivot Suite (included)", href: "/", kind: "tool" as const },
  resumePost: { label: "The non-clinical SLP resume", href: "https://slptransitions.com/slp-resume-non-clinical/", kind: "link" as const },
  linkedinPost: { label: "Your LinkedIn profile is screening you out", href: "https://slptransitions.com/slp-linkedin-career-change/", kind: "link" as const },
  coverPost: { label: "The non-clinical cover letter", href: "https://slptransitions.com/slp-cover-letter-non-clinical/", kind: "link" as const },
  tracker: { label: "Outreach and application tracker (Sheets or Notion)", href: "/course/transition-os-tracker-README.md", kind: "sheet" as const },
  storyForm: { label: "Share your story", href: "https://slptransitions.com/about/", kind: "link" as const },
};

export const MODULES: Module[] = [
  {
    n: 0, slug: "start", title: "Start here", phase: "Setup", week: "Day 1", built: true,
    tagline: "Fifteen minutes to set up your map: where you're starting from, what you can't afford to lose, and a date to aim at.",
    lessons: [
      { id: "0.1", module: 0, title: "Welcome from James", type: "video", minutes: 3, component: "Welcome",
        summary: "Three minutes on how the program works, what to expect from it, and the refund promise.", sources: ["facts"] },
      { id: "0.2", module: 0, title: "Your starting line", type: "interactive", minutes: 5, resources: [R.workbook1, R.workbookPdf], component: "StartingLine",
        summary: "Tell the program where you're starting from. It builds your map from these answers, and you can change them any time.",
        action: { label: "Set my target date", prompt: "Pick the date you want to be in a new role. Ninety days from now is the default and it is realistic for the fast paths; the long builds take 6–15 months and the map adjusts.", done: "Target date set." } },
      { id: "0.3", module: 0, title: "Three things I believed", type: "explainer", minutes: 3, component: "ThreeLies",
        summary: "The three beliefs that kept me in the building longer than I needed to be. Check which ones you're carrying.", sources: ["facts"] },
    ],
  },
  {
    n: 1, slug: "ground", title: "Ground", phase: "Ground", week: "Week 1", built: true,
    tagline: "You're allowed to want out. This week is for working out what's actually wrong, so the fix matches the problem.",
    lessons: [
      { id: "1.1", module: 1, title: "You're allowed to want out", type: "explainer", minutes: 6, component: "FiveStages",
        summary: "Most people leave in five stages. Find yours, and take the one small move that belongs to it.", resources: [R.stages], sources: ["voc", "facts", "forums"] },
      { id: "1.2", module: 1, title: "Bad workplace, bad fit, or bad season?", type: "interactive", minutes: 8, component: "DecisionTree",
        summary: "Six questions to work out whether the problem is your workplace, the work itself, or this season of your life.", resources: [R.quit], sources: ["facts", "voc", "forums"] },
      { id: "1.3", module: 1, title: "The sunk-cost audit", type: "interactive", minutes: 7, component: "SunkCost",
        summary: "Separate the money you've already spent from the money still on the table, so the tuition stops making the decision for you.", resources: [R.sunkSheet, R.fears, R.workbook1, R.workbookPdf], sources: ["bls", "ashaDebt", "arkes", "facts", "forums"] },
      { id: "1.4", module: 1, title: "What actually gave you energy", type: "interactive", minutes: 8, component: "EnergyAudit",
        summary: "Go through your last month of work and mark what gave you energy and what took it. It is better evidence than any preference test.", resources: [], sources: ["voc", "forums"] },
      { id: "1.5", module: 1, title: "What you can't afford to lose", type: "interactive", minutes: 8, component: "Dials",
        summary: "Four dials for what you need to protect: pay, closeness to clinical work, people-time, and tools. The paths reorder as you move them.", resources: [R.paths], sources: ["facts"] },
      { id: "1.6", module: 1, title: "What you keep when you leave", type: "video", minutes: 5, resources: [R.workbook1, R.workbookPdf], component: "Identity",
        summary: "Three people who left and kept the part of the work they loved. Watch for what each of them took with them.", sources: ["voc", "forums"] },
      { id: "1.7", module: 1, title: "Tell one person", type: "action", minutes: 3, resources: [R.workbook1, R.workbookPdf], component: "TellOne",
        summary: "Say one sentence to one person. It's the cheapest way to stop this from feeling like a secret.",
        action: { label: "I told someone", prompt: "Pick one person who will not argue with you: a partner, a friend outside the field, a former colleague who left. Say one sentence: \"I'm looking at what else I could do with my SLP background.\" That's it. No plan required.", done: "Said out loud. The secret stopped costing you energy." },
        sources: ["voc", "forums"] },
      { id: "1.8", module: 1, title: "Checkpoint: Ground", type: "checkpoint", minutes: 2, resources: [R.workbook1, R.workbookPdf], component: "Checkpoint1",
        summary: "Gather what you worked out this week into one sentence about where you're going. That sentence opens Explore." },
    ],
  },
  {
    n: 2, slug: "explore", title: "Explore", phase: "Explore", week: "Weeks 2\u20133", built: false,
    tagline: "Twenty real paths with what each one pays and how long it takes.",
    lessons: [
      { id: "2.1", module: 2, title: "The map: twenty paths by timeline", type: "explainer", minutes: 9, summary: "", resources: [R.paths] },
      { id: "2.2", module: 2, title: "Four jobs your licence already qualifies you for", type: "video", minutes: 8, summary: "Liaison, utilization review, clinical educator, case management.", resources: [R.jobs, R.companies] },
      { id: "2.3", module: 2, title: "Where SLPs actually land", type: "video", minutes: 9, summary: "Customer success, project management, data, content.", resources: [R.paths, R.companies] },
      { id: "2.4", module: 2, title: "Careers that take 12 months or more", type: "video", minutes: 7, summary: "Informatics, instructional design, UX, software, conversation design.", resources: [R.paths] },
      { id: "2.5", module: 2, title: "Epic, MSL and UX research: what they really require", type: "explainer", minutes: 6, summary: "Three claims that cost SLPs money, and the real route behind each one.", resources: [R.paths] },
      { id: "2.6", module: 2, title: "Try paths against your r\u00e9sum\u00e9", type: "interactive", minutes: 8, summary: "", resources: [R.suite] },
      { id: "2.7", module: 2, title: "Compare paths side by side", type: "interactive", minutes: 10, summary: "", resources: [R.jobs, R.companies] },
    ],
  },
  {
    n: 3, slug: "connect", title: "Connect", phase: "Connect", week: "Weeks 3\u20135", built: false,
    tagline: "Find the people already doing the job, and learn what to say to them.",
    lessons: [
      { id: "3.1", module: 3, title: "Where to find people in your target field", type: "explainer", minutes: 7, summary: "", resources: [R.companies] },
      { id: "3.2", module: 3, title: "Messages that get answered", type: "video", minutes: 9, summary: "", resources: [R.workbook1] },
      { id: "3.3", module: 3, title: "Reach out to three people", type: "action", minutes: 20, summary: "", resources: [R.tracker, R.workbook1] },
      { id: "3.4", module: 3, title: "LinkedIn: what recruiters check", type: "video", minutes: 8, summary: "", resources: [R.linkedinPost] },
      { id: "3.5", module: 3, title: "Why referrals beat applications", type: "video", minutes: 7, summary: "", resources: [R.jobs, R.companies] },
      { id: "3.6", module: 3, title: "Keep two conversations warm", type: "action", minutes: 15, summary: "", resources: [R.tracker, R.workbook1] },
      { id: "3.7", module: 3, title: "Recruiters, and how to follow up", type: "video", minutes: 6, summary: "", resources: [R.tracker] },
    ],
  },
  {
    n: 4, slug: "translate", title: "Translate", phase: "Translate", week: "Weeks 5\u20137", built: false,
    tagline: "Rewrite your r\u00e9sum\u00e9 and cover letter so a hiring manager can see what you already do.",
    lessons: [
      { id: "4.1", module: 4, title: "How your r\u00e9sum\u00e9 actually gets screened", type: "explainer", minutes: 5, summary: "", resources: [R.resumePost] },
      { id: "4.2", module: 4, title: "Translating clinical work into business language", type: "video", minutes: 10, summary: "", resources: [R.resumePost, R.workbook1] },
      { id: "4.3", module: 4, title: "Numbers you already have", type: "interactive", minutes: 8, summary: "", resources: [R.workbook1] },
      { id: "4.4", module: 4, title: "Why AI-written applications get rejected", type: "video", minutes: 6, summary: "", resources: [R.coverPost] },
      { id: "4.5", module: 4, title: "Build your r\u00e9sum\u00e9 in the Suite", type: "interactive", minutes: 15, summary: "", resources: [R.suite, R.resumePost] },
      { id: "4.6", module: 4, title: "Writing a cover letter worth reading", type: "video", minutes: 6, summary: "", resources: [R.coverPost] },
      { id: "4.7", module: 4, title: "Send one application properly", type: "action", minutes: 30, summary: "", resources: [R.tracker, R.jobs] },
    ],
  },
  {
    n: 5, slug: "test", title: "Test", phase: "Test", week: "Weeks 7\u20139", built: false,
    tagline: "Build one piece of proof, and work out the money before you move.",
    lessons: [
      { id: "5.1", module: 5, title: "Do certificates actually help?", type: "video", minutes: 6, summary: "", resources: [R.paths] },
      { id: "5.2", module: 5, title: "Pick one thing to build", type: "interactive", minutes: 8, summary: "", resources: [R.workbook1] },
      { id: "5.3", module: 5, title: "Make it in a week", type: "action", minutes: 120, summary: "", resources: [R.workbook1] },
      { id: "5.4", module: 5, title: "Keeping the paycheck while you leave", type: "video", minutes: 7, summary: "", resources: [R.jobs] },
      { id: "5.5", module: 5, title: "Student loans, pay cuts and health insurance", type: "interactive", minutes: 9, summary: "", resources: [R.workbook1] },
    ],
  },
  {
    n: 6, slug: "leap", title: "Leap", phase: "Leap", week: "Weeks 9\u201312", built: false,
    tagline: "Interviews, the three questions every career changer gets, and how to handle the offer.",
    lessons: [
      { id: "6.1", module: 6, title: "How career changers get screened", type: "video", minutes: 7, summary: "", resources: [R.workbook1] },
      { id: "6.2", module: 6, title: "Explaining why you're changing careers", type: "interactive", minutes: 9, summary: "", resources: [R.workbook1] },
      { id: "6.3", module: 6, title: "Screening questions that filter you out", type: "interactive", minutes: 8, summary: "", resources: [R.workbook1] },
      { id: "6.4", module: 6, title: "The mock interview", type: "interactive", minutes: 15, summary: "", resources: [R.suite] },
      { id: "6.5", module: 6, title: "Salary and the offer", type: "video", minutes: 8, summary: "", resources: [R.paths, R.workbook1, R.workbookPdf] },
      { id: "6.6", module: 6, title: "What a real job search takes", type: "video", minutes: 6, summary: "", resources: [R.tracker, R.jobs] },
      { id: "6.7", module: 6, title: "The first 90 days", type: "video", minutes: 7, summary: "", resources: [R.workbook1] },
      { id: "6.8", module: 6, title: "Accept, or keep going", type: "action", minutes: 5, summary: "", resources: [R.workbook1] },
    ],
  },
  {
    n: 7, slug: "after", title: "After", phase: "After", week: "Alumni", built: false,
    tagline: "What to do once you're in, and how to help the next person out.",
    lessons: [
      { id: "7.1", module: 7, title: "Tell your story", type: "action", minutes: 15, summary: "", resources: [R.storyForm] },
      { id: "7.2", module: 7, title: "A year in: what changes", type: "video", minutes: 4, summary: "", resources: [R.paths] },
      { id: "7.3", module: 7, title: "Answer one message from someone starting out", type: "action", minutes: 10, summary: "", resources: [R.storyForm] },
    ],
  },
];

// A module is "built" when Modules 0/1 (hand-coded React) or when its lessons
// have authored JSON in content/course/modules. Authoring a module's JSON is
// therefore the only step needed to unlock it in the quest log.
for (const m of MODULES) {
  if (m.n <= 1) { m.built = true; continue; }
  m.built = m.lessons.some((l) => contentIds.has(l.id));
  for (const l of m.lessons) {
    if (!l.summary) l.summary = summaryFor(l.id);
  }
}

/** A hue per module so the chapters feel distinct without leaving the palette.
 *  All of them sit in the emerald-to-teal range except Test, which borrows the
 *  warning amber because that module is where the money and the risk live. */
export const MODULE_ACCENT: Record<number, { tint: string; ink: string; edge: string }> = {
  0: { tint: "#F0FAF3", ink: "#2D6A4F", edge: "#D8F3DC" },
  1: { tint: "#F0FAF3", ink: "#2D6A4F", edge: "#D8F3DC" },
  2: { tint: "#EFF6FF", ink: "#1E40AF", edge: "#BFDBFE" },
  3: { tint: "#ECFEFF", ink: "#155E75", edge: "#A5F3FC" },
  4: { tint: "#F5F3FF", ink: "#5B21B6", edge: "#DDD6FE" },
  5: { tint: "#FEF6E7", ink: "#92400E", edge: "#FDE68A" },
  6: { tint: "#ECFDF5", ink: "#065F46", edge: "#A7F3D0" },
  7: { tint: "#FDF2F8", ink: "#9D174D", edge: "#FBCFE8" },
};

export const LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const moduleOf = (l: Lesson) => MODULES.find((m) => m.n === l.module)!;
export function prevLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return LESSONS.slice(0, Math.max(0, i)).reverse().find((l) => moduleOf(l).built);
}
export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return LESSONS.slice(i + 1).find((l) => moduleOf(l).built);
}
export const TYPE_LABEL: Record<LessonType, string> = { video: "Video", explainer: "Animated explainer", interactive: "Interactive", action: "Action", checkpoint: "Checkpoint" };

// The five dials (lesson 1.5). Each path's profile mirrors the sign of its
// scores on the income, time, proximity, people and tech questions in
// lib/quiz.ts: 1 = the path rewards a high setting, 0 = a low one, 0.5 = either.
// (The "hours outside work" dial was dropped 2026-09-04: it read as two
// different questions, job-search time now vs. hours in the new job.)
export interface DialProfile { pay: number; clinical: number; people: number; tech: number }
/** Clinical tasks from the energy audit (1.4), and the paths each one points at.
 *  Read by the audit itself and by the path map in 2.1, so the two agree. */
export const ENERGY_PATHS: Record<string, string[]> = {
  "Direct therapy sessions": ["clinical-educator", "customer-success"],
  "Evaluations and report writing": ["research-coordinator", "liaison-ur", "data-analysis"],
  "IEP or care-plan meetings": ["project-management", "leadership", "customer-success"],
  "Progress notes and documentation": ["informatics", "liaison-ur"],
  "Parent and family conversations": ["customer-success", "sales-bd", "clinical-educator"],
  "Supervising CFs or students": ["clinical-educator", "instructional-design", "leadership"],
  "Training colleagues or staff": ["clinical-educator", "instructional-design", "sales-bd"],
  "Scheduling and caseload management": ["project-management", "leadership"],
  "Insurance, authorisations, appeals": ["liaison-ur"],
  "Data collection and progress monitoring": ["data-analysis", "research-coordinator", "informatics"],
  "Choosing or trialling AAC and devices": ["sales-bd", "clinical-educator", "customer-success"],
  "Materials and resource creation": ["instructional-design", "content-marketing"],
  "Meetings with administrators": ["leadership", "project-management"],
  "Advocating for a client or a service": ["sales-bd", "liaison-ur", "content-marketing"],
  "Learning a new system or platform": ["informatics", "data-analysis", "instructional-design"],
};

export const DIAL_PROFILES: Record<string, DialProfile> = {
  "liaison-ur":           { pay: 1,   clinical: 1,   people: 0.6, tech: 0.3 },
  "customer-success":     { pay: 0.8, clinical: 0.6, people: 0.9, tech: 0.5 },
  "clinical-educator":    { pay: 0.7, clinical: 1,   people: 1,   tech: 0.5 },
  "leadership":           { pay: 0.9, clinical: 1,   people: 0.9, tech: 0.4 },
  "sales-bd":             { pay: 0.9, clinical: 0.7, people: 1,   tech: 0.4 },
  "research-coordinator": { pay: 0,   clinical: 0.7, people: 0.4, tech: 0.5 },
  "informatics":          { pay: 1,   clinical: 0.8, people: 0.2, tech: 1 },
  "project-management":   { pay: 0.6, clinical: 0.3, people: 0.6, tech: 0.5 },
  "data-analysis":        { pay: 0.5, clinical: 0.3, people: 0.1, tech: 0.9 },
  "instructional-design": { pay: 0.3, clinical: 0.4, people: 0.3, tech: 0.7 },
  "content-marketing":    { pay: 0.4, clinical: 0.2, people: 0.3, tech: 0.6 },
};
