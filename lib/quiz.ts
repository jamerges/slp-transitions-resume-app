// Career quiz — questions, scoring, and result paths.
// Salary ranges and timelines come from content/research-facts.md (documented
// SLP transitions), not estimates. Keep them honest.

export interface QuizPath {
  slug: string;
  label: string;
  /** Exact ROLE_OPTIONS chip this result carries into the app. Explicit, so a
   *  wording change to either list can't silently break the hand-off. */
  roleOption: string;
  /** Large visual for the result card and email. */
  icon: string;
  range: string;
  timeline: string;
  why: string;
  entryDoor: string;
  firstMove: string;
  caveat: string;
}

export const PATHS: Record<string, QuizPath> = {
  "customer-success": {
    slug: "customer-success",
    icon: "🤝",
    label: "Customer Success / Implementation",
    roleOption: "Customer Success / Implementation",
    range: "$75,000–$120,000",
    timeline: "3–9 months",
    why: "You've spent years keeping people engaged in a long program they didn't always feel like showing up for. That is the job — companies just call it retention.",
    entryDoor: "Implementation Specialist or Onboarding Manager first, then CSM. At speech-tech and AAC companies (Expressable, Tobii Dynavox, Lingraphica, PRC-Saltillo), your CCC is itself the qualifying credential.",
    firstMove: "Search LinkedIn for \"Customer Success\" + \"CCC-SLP\" and find three people who've already made this exact move.",
    caveat: "The best odds-to-effort path on this list — but you'll need to learn the vocabulary of churn, onboarding, and health scores.",
  },
  "project-management": {
    slug: "project-management",
    icon: "🗺️",
    label: "Project / Program Management",
    roleOption: "Project / Program Management",
    range: "$85,000–$100,000+",
    timeline: "12–15 months",
    why: "A caseload is concurrent project management with worse tooling. You've been tracking timelines, stakeholders, and deliverables for years without the title.",
    entryDoor: "Google PM certificate (free to start) → CAPM ($175) → PMP. Healthcare organizations and nonprofits are the friendliest first stop.",
    firstMove: "Start the free Google Project Management certificate this week — one module is enough to know if it fits.",
    caveat: "Certificates alone don't sell. One transitioner put it bluntly: \"no one took me seriously with a CAPM\" — it's certification *plus* translated experience that works.",
  },
  "data-analysis": {
    slug: "data-analysis",
    icon: "📊",
    label: "Healthcare Data / Analytics",
    roleOption: "Data Analysis",
    range: "$70,000–$105,000",
    timeline: "6–24 months",
    why: "You already collect data, look for patterns, and change course based on what it says. Most people entering analytics have to learn that instinct.",
    entryDoor: "Healthcare organizations — hospital quality teams, behavioral health orgs, payers. Not big tech. Google Data Analytics certificate or DataCamp is the standard route.",
    firstMove: "Rebuild one month of your own progress-monitoring data in a spreadsheet with a pivot table and one chart. That's a portfolio piece.",
    caveat: "The longest grind on this list if you go it alone — one SLP sent 500+ applications over six months. Referrals cut that dramatically.",
  },
  "liaison-ur": {
    slug: "liaison-ur",
    icon: "🏥",
    label: "Clinical Liaison / Utilization Review",
    roleOption: "Clinical Liaison / Utilization Review",
    range: "$80,000–$135,000",
    timeline: "Fast — often weeks, not months",
    why: "Your clinical license isn't a liability here, it's the entire qualification. No bootcamp, no portfolio, no certificate.",
    entryDoor: "Clinical/Rehab Liaison at Encompass Health, Select Medical, or Lifepoint. Utilization Review is heavily remote. State Disability Determination Services is another door.",
    firstMove: "Search \"clinical liaison\" and \"utilization review\" with your license in the title — you likely already qualify for postings live today.",
    caveat: "You stay adjacent to the system you're leaving. For some people that's ideal; for others it feels like a halfway house. Be honest with yourself about which you are.",
  },
  informatics: {
    slug: "informatics",
    icon: "🖥️",
    label: "Clinical Informatics / EHR",
    roleOption: "Clinical Informatics / EHR",
    range: "$97,000–$154,000",
    timeline: "6–18 months",
    why: "If you've been the person who fixes the documentation system, you've been doing informatics unpaid. Clinical credibility plus workflow knowledge is exactly the hiring profile.",
    entryDoor: "Sponsor-track junior analyst roles, go-live/activation support gigs, or consulting firms (Nordic, Tegria). CAHIMS through HIMSS is the self-serve entry credential — no experience prerequisite.",
    firstMove: "Write one page on the EMR rollout you survived: the problem, who you had to convince, what changed after. That's your interview story.",
    caveat: "Important: Epic certification cannot be self-obtained — it requires employer sponsorship. Anyone selling you an \"Epic cert\" is selling something else.",
  },
  "instructional-design": {
    slug: "instructional-design",
    icon: "🎓",
    label: "Instructional Design / Learning",
    roleOption: "Instructional Design",
    range: "$70,000–$100,000",
    timeline: "6–12 months",
    why: "Therapy goals are learning objectives. Session sequencing is curriculum scaffolding. Progress monitoring is evaluation. You already think like an instructional designer.",
    entryDoor: "Portfolio, not credentials — 3–5 samples built in Articulate Storyline or Rise, each with a short process write-up. Spec work counts.",
    firstMove: "Take one training you've already delivered to colleagues and rebuild it as a single Rise module. That's sample number one.",
    caveat: "Skip the $3,000 certificate — hiring managers want the portfolio. Also be aware this field got more competitive with the influx of transitioning teachers.",
  },
  "content-marketing": {
    slug: "content-marketing",
    icon: "✍️",
    label: "Content / Marketing",
    roleOption: "Content Strategy / Marketing",
    range: "$80,000–$141,000",
    timeline: "~12 months",
    why: "Explaining something complicated to a frightened parent, in words they can act on, is the exact skill content marketing pays for.",
    entryDoor: "Health-tech and ed-tech companies need people who understand clinicians. Freelance is a legitimate on-ramp — one SLP started with a single $200 article and now runs a micro-agency.",
    firstMove: "Publish one piece explaining something clinical to a non-clinical audience. One published piece beats a certificate here.",
    caveat: "Income is lumpy at the start, especially freelance. The ceiling is high but the first year is the hardest.",
  },
  "clinical-educator": {
    slug: "clinical-educator",
    icon: "🧑‍🏫",
    label: "Clinical Educator / Trainer",
    roleOption: "Clinical Educator / Trainer",
    range: "$75,000–$116,000",
    timeline: "Moderate",
    why: "You've trained teachers, families, and students for years. Device and AAC companies need exactly that — someone clinically credible who can teach.",
    entryDoor: "Device and AAC companies: Tobii Dynavox (Learning Consultant roles), PRC-Saltillo, Lingraphica, Passy-Muir. Your clinical credibility is the requirement.",
    firstMove: "List every device, platform, or protocol you've trained someone on. That list is your qualification — most SLPs undersell it.",
    caveat: "Often involves travel. Worth checking the percentage before you fall in love with a posting.",
  },
};

export interface QuizOption {
  label: string;
  scores: Partial<Record<string, number>>;
}
export interface QuizQuestion {
  id: string;
  /** Short group label shown above the question, so the quiz reads as
   *  deliberate sections (experience → energy → constraints → style)
   *  rather than a random list. */
  section: string;
  prompt: string;
  help?: string;
  multi?: boolean;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "done",
    section: "Your experience",
    prompt: "Which of these have you actually done?",
    help: "Pick everything that applies — this matters more than what you enjoy, because it's what opens doors.",
    multi: true,
    options: [
      { label: "Been a superuser or helped roll out an EMR / documentation system", scores: { informatics: 4, "project-management": 1 } },
      { label: "Supervised CFs or students, or trained colleagues", scores: { "instructional-design": 2, "clinical-educator": 3, "customer-success": 1 } },
      { label: "Built a program, caseload system, or workflow from scratch", scores: { "project-management": 4 } },
      { label: "Tracked and analyzed outcome data beyond what was required", scores: { "data-analysis": 4, informatics: 1 } },
      { label: "Handled authorizations, appeals, or insurance documentation", scores: { "liaison-ur": 4 } },
      { label: "Chosen, trialed, or implemented AAC or assistive tech", scores: { "customer-success": 2, "clinical-educator": 3 } },
      { label: "Created materials or trainings that other people reused", scores: { "instructional-design": 4, "content-marketing": 2 } },
      { label: "Not yet — my experience is mostly direct treatment", scores: {} },
    ],
  },
  {
    id: "flow",
    section: "What energizes you",
    prompt: "When work feels genuinely good, what are you doing?",
    options: [
      { label: "Creating order from chaos — designing systems, moving projects forward", scores: { "project-management": 3, informatics: 1 } },
      { label: "Helping one person get unstuck, in real time", scores: { "customer-success": 2, "clinical-educator": 2, "liaison-ur": 1 } },
      { label: "Finding the pattern in messy information", scores: { "data-analysis": 3, informatics: 2 } },
      { label: "Making something other people use — a resource, guide, or tool", scores: { "instructional-design": 3, "content-marketing": 2 } },
      { label: "Winning someone over to a plan they were unsure about", scores: { "customer-success": 2, "liaison-ur": 2, "content-marketing": 1 } },
    ],
  },
  {
    id: "regret",
    section: "What energizes you",
    prompt: "If a door opened tomorrow, what would you regret not trying?",
    help: "Ignore feasibility for a second — that's what the rest of the quiz is for.",
    options: [
      { label: "Running projects and programs at scale", scores: { "project-management": 3 } },
      { label: "Working with the data behind the decisions", scores: { "data-analysis": 3, informatics: 1 } },
      { label: "Teaching, training, or designing how people learn", scores: { "instructional-design": 3, "clinical-educator": 2 } },
      { label: "Being the trusted expert clients rely on", scores: { "customer-success": 3, "liaison-ur": 2 } },
      { label: "Telling the story — writing, content, marketing", scores: { "content-marketing": 3 } },
    ],
  },
  {
    id: "income",
    section: "Your reality",
    prompt: "What's your honest income requirement for the next role?",
    help: "No judgment — this genuinely changes which paths are realistic right now.",
    options: [
      { label: "I need to match or beat my SLP pay from day one", scores: { "liaison-ur": 3, "customer-success": 2, informatics: 2, "instructional-design": -2, "content-marketing": -2 } },
      { label: "I can take a small dip for better conditions", scores: { "customer-success": 1, "project-management": 1 } },
      { label: "I have runway and can invest 6–12 months in a bigger jump", scores: { "data-analysis": 2, informatics: 2, "project-management": 2 } },
      { label: "Income matters less than hours and flexibility right now", scores: { "content-marketing": 2, "instructional-design": 1, "liaison-ur": 1 } },
    ],
  },
  {
    id: "time",
    section: "Your reality",
    prompt: "Realistically, how much time can you put in outside of work?",
    options: [
      { label: "Almost none — I'm running on empty", scores: { "liaison-ur": 3, "customer-success": 2, "clinical-educator": 1, "data-analysis": -2, "instructional-design": -1 } },
      { label: "A couple of hours a week", scores: { "customer-success": 1, informatics: 1 } },
      { label: "A few hours a week, consistently", scores: { "instructional-design": 2, "project-management": 2, "content-marketing": 1 } },
      { label: "I'm ready to go hard for a defined stretch", scores: { "data-analysis": 3, informatics: 2, "project-management": 2 } },
    ],
  },
  {
    id: "people",
    section: "How you like to work",
    prompt: "Day to day, how much live people-time do you want?",
    help: "This is about your calendar — how many hours of live human interaction feel right. The next question is about the field itself; they're different dials.",
    options: [
      { label: "I still love 1:1 — I want better conditions and pay, not less contact", scores: { "clinical-educator": 3, "customer-success": 2, "liaison-ur": 1 } },
      { label: "I want people contact, but as accounts and colleagues — not a caseload", scores: { "customer-success": 3, "liaison-ur": 2, "project-management": 1 } },
      { label: "I'd rather influence people through systems, data, or content", scores: { "data-analysis": 3, informatics: 2, "content-marketing": 2, "instructional-design": 2 } },
      { label: "I want as little live people-time as possible for a while", scores: { "data-analysis": 3, informatics: 3, "instructional-design": 1, "content-marketing": 1 } },
    ],
  },
  {
    id: "proximity",
    section: "How you like to work",
    prompt: "And how close do you want to stay to the clinical world?",
    help: "Subject matter, not people-time. Plenty of roles are deep in the clinical world with almost no live sessions — and vice versa.",
    options: [
      { label: "I want to stay close to clinical — that knowledge is my edge", scores: { "liaison-ur": 3, informatics: 2, "clinical-educator": 3 } },
      { label: "Clinical-adjacent, but out of direct care", scores: { "customer-success": 2, informatics: 2, "instructional-design": 1 } },
      { label: "I want a clean break into business or tech", scores: { "project-management": 2, "data-analysis": 2, "content-marketing": 2 } },
      { label: "I honestly don't know yet", scores: {} },
    ],
  },
  {
    id: "tech",
    section: "How you like to work",
    prompt: "What's your relationship with new tools and software?",
    options: [
      { label: "I'm the one colleagues come to for help", scores: { informatics: 3, "data-analysis": 1, "clinical-educator": 1 } },
      { label: "I actively enjoy learning new platforms", scores: { informatics: 2, "instructional-design": 2, "data-analysis": 2 } },
      { label: "I learn what I need, when I need it", scores: { "customer-success": 1, "project-management": 1 } },
      { label: "I'd rather work with people than systems", scores: { "clinical-educator": 2, "customer-success": 2, "liaison-ur": 1 } },
    ],
  },
];

export type QuizAnswers = Record<string, string[]>;

export function scoreQuiz(answers: QuizAnswers): { top: QuizPath; runnerUp: QuizPath | null } {
  const totals: Record<string, number> = {};
  for (const slug of Object.keys(PATHS)) totals[slug] = 0;

  for (const q of QUESTIONS) {
    for (const chosen of answers[q.id] || []) {
      const opt = q.options.find((o) => o.label === chosen);
      if (!opt) continue;
      for (const [slug, pts] of Object.entries(opt.scores)) {
        if (slug in totals) totals[slug] += pts as number;
      }
    }
  }

  const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const top = PATHS[ranked[0][0]];
  const runnerUp = ranked[1] && ranked[1][1] > 0 ? PATHS[ranked[1][0]] : null;
  return { top, runnerUp };
}
