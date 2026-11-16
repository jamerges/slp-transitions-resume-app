// The workbook, as a list of small actions. One model drives three things: the
// filled-in page a buyer works from (/course/workbook), the same page with
// nothing filled in (?blank=1), and the blank PDFs printed from it
// (scripts/workbook-render/render.sh).
//
// An action is one thing a person can finish in a sitting: a verb-first line, a
// time, one sentence on why or what good enough looks like, and somewhere for
// the answer to land. Where a lesson's tool already saved the answer, the
// workbook shows it. Where nothing saves it, the workbook has its own field
// (saved under shared.wb[id], or shared.notes[lesson] when the lesson asks the
// same question).
//
// Adding a lesson that saves something: add an action here, or it never shows.
import { PATHS } from "@/lib/quiz";
import { STAGE_META } from "./scenes";

export interface Ctx {
  A: Record<string, any>;       // answers by lesson id
  SH: Record<string, any>;      // the shared slot the tools write to
  completed: string[];
  actions: string[];
}
export interface WbAction {
  id: string;
  lesson: string;
  do: string;
  /** Minutes, for the total. `time` overrides how it is shown. */
  minutes: number;
  time?: string;
  why: string;
  /** What the lesson already saved, as one or more short lines. */
  answer?: (c: Ctx) => string | string[] | null;
  /** Defaults to: the answer exists, or the field below has something in it. */
  done?: (c: Ctx) => boolean;
  /** A field of the workbook's own. `note` ties it to that lesson's written answer. */
  write?: { label?: string; lines: number; hint?: string; note?: string };
  /** Where the answer gets used later. */
  next?: string;
}
export interface WbModule { n: number; outcome: string; actions: WbAction[] }

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const FLOORS = ["Match my SLP pay from day one", "A small dip for better conditions", "Runway for a bigger jump"];
const VERDICT: Record<string, string> = { workplace: "Bad workplace", fit: "Bad fit", season: "Bad season" };
const TRADES = [
  ["move", "move to a new city for the right role"], ["dip", "take a dip in pay for the right first door"],
  ["benefits", "go without employer benefits for a while"], ["commute", "commute again"],
  ["remote", "work fully remote"], ["office", "be in an office most days"],
] as const;
const APP_STATUS: Record<string, string> = { sent: "sent", screen: "phone screen", interview: "interview", offer: "offer", no: "no" };

const did = (c: Ctx, id: string) => c.completed.includes(id) || c.actions.includes(id);
const acted = (c: Ctx, id: string) => c.actions.includes(id);
const ticks = (v: unknown) => (Array.isArray(v) ? v.filter(Boolean).length : 0);
const ticked = (v: unknown) => (Array.isArray(v) && ticks(v) > 0 ? `${ticks(v)} of ${v.length} checked` : null);
const allTicked = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(Boolean);
const people = (c: Ctx): any[] => (Array.isArray(c.SH.contacts) ? c.SH.contacts.filter((x: any) => x?.name) : []);
const apps = (c: Ctx): any[] => (Array.isArray(c.SH.apps) ? c.SH.apps.filter((x: any) => x?.company) : []);
const half = (n: number) => Math.round(n * 2) / 2;

export const WORKBOOK: WbModule[] = [
  {
    n: 0, outcome: "Four numbers the rest of the program runs on",
    actions: [
      { id: "m0-hourly", lesson: "0.2", minutes: 4, do: "Work out what an hour of your work really pays",
        why: "Divide your salary by the hours you really work, kitchen-table documentation included.",
        answer: (c) => { const s = c.A["0.2"] || {}; return s.hourly > 0 ? `$${Number(s.hourly).toFixed(2)} an hour, over ${Math.round((s.hours || 0) * (s.weeks || 0)).toLocaleString("en-US")} hours a year` : null; },
        next: "Every path's pay is compared against this number." },
      { id: "m0-floor", lesson: "0.2", minutes: 2, do: "Set the pay your next job has to clear",
        why: "This is the number your budget needs, before anything you would like on top.",
        answer: (c) => { const s = c.A["0.2"] || {}; return s.floor >= 0 && s.floor != null ? FLOORS[s.floor] + (s.floorDollars > 0 ? `: about ${money(s.floorDollars)} a year before tax` : "") : null; },
        next: "The path map flags anything that pays under it." },
      { id: "m0-date", lesson: "0.2", minutes: 1, do: "Pick the date you are aiming at",
        why: "Ninety days from today is the default. A date gives you something to plan backward from.",
        answer: (c) => { const d = c.A["0.2"]?.date; if (!d) return null; const t = new Date(`${d}T12:00:00`); return isNaN(t.getTime()) ? String(d) : t.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); } },
      { id: "m0-trades", lesson: "0.2", minutes: 2, do: "Tick what you would trade to get there",
        why: "A move, a commute, a dip in pay. Decide now, before a posting decides for you.",
        answer: (c) => { const t = c.A["0.2"]?.trades; return t && Object.keys(t).length ? TRADES.filter(([k]) => t[k] !== undefined).map(([k, text]) => `${t[k] ? "Yes" : "No"}: ${text}`) : null; } },
      { id: "m0-verdict", lesson: "0.3", minutes: 8, do: "Name the problem: workplace, fit, or season",
        why: "A bad workplace needs a new employer. A bad fit needs a new job. Know which before you plan.",
        answer: (c) => (c.A["0.3"]?.verdict ? VERDICT[c.A["0.3"].verdict] : null) },
      { id: "m0-beliefs", lesson: "0.4", minutes: 3, do: "Check the three beliefs you are carrying",
        why: "Starting over, needing a certificate first, wasting the degree. See which ones are yours.",
        done: (c) => did(c, "0.4") },
    ],
  },
  {
    n: 1, outcome: "Your reasons for leaving, in writing",
    actions: [
      { id: "m1-stage", lesson: "1.1", minutes: 6, do: "Find your stage, and do its one move",
        why: "Each stage has one small move. Do that one before the next.",
        answer: (c) => { const k = c.A["1.1"]?.stage || c.A["0.2"]?.stage; const s = STAGE_META.find((x) => x.key === k); return s ? [`Stage ${s.n}: ${s.name}`, `Your move: ${s.move}`] : null; } },
      { id: "m1-degree", lesson: "1.3", minutes: 7, do: "Put your real numbers into the degree calculator",
        why: "The tuition is spent whether you stay or go. Seeing both sides stops it arguing with you.",
        answer: (c) => { const s = c.A["1.3"]; return s && s.years != null ? `${s.years} years in · ${money(s.debt || 0)} of debt · ${money(s.salary || 0)} now${s.path && PATHS[s.path] ? ` · against ${PATHS[s.path].label}` : ""}` : null; } },
      { id: "m1-sentence", lesson: "1.3", minutes: 2, do: "Write the sentence about your degree as it sounds in your head",
        why: "You can only answer a sentence once it is written down.",
        write: { lines: 2, hint: "The real version, before you tidy it." } },
      { id: "m1-energy", lesson: "1.4", minutes: 8, do: "Mark what gave you energy last month, and what took it",
        why: "Go by what happened in the last month. It is better evidence than a preference test.",
        answer: (c) => { const m: Record<string, string> = c.A["1.4"]?.energy || {}; const up = Object.keys(m).filter((k) => m[k] === "up"), down = Object.keys(m).filter((k) => m[k] === "down"); return up.length || down.length ? [up.length ? `Gave energy: ${up.join(", ")}` : "", down.length ? `Took it: ${down.join(", ")}` : ""].filter(Boolean) : null; },
        next: "What you mark points at paths in Module 2." },
      { id: "m1-outside", lesson: "1.4", minutes: 5, do: "Ask two people what you are good at",
        why: "Write it in their words. They see things you have stopped noticing.",
        answer: (c) => c.A["1.4"]?.outside || null },
      { id: "m1-dials", lesson: "1.5", minutes: 8, do: "Set your four dials",
        why: "Pay, distance from clinical work, people time, tools. Set them where you are, on an ordinary week.",
        answer: (c) => { const top: string[] = c.A["1.5"]?.top || []; const names = top.map((s) => PATHS[s]?.label).filter(Boolean); return names.length ? `Your top three: ${names.join(", ")}` : null; },
        next: "Your top three paths carry into Module 2." },
      { id: "m1-miss", lesson: "1.6", minutes: 3, do: "Finish the sentence: I will miss being the person who…",
        why: "Name it now. It tells you what the next job has to keep.",
        write: { lines: 2 } },
      { id: "m1-tell", lesson: "1.7", minutes: 3, do: "Tell one person",
        why: "One safe person, this week. Said out loud, it becomes a plan someone else knows about.",
        answer: (c) => (c.A["1.7"]?.who ? `You told: ${c.A["1.7"].who}` : null),
        write: { label: "What they said back", lines: 2 } },
      { id: "m1-private", lesson: "1.7", minutes: 5, do: "Switch on your privacy settings",
        why: "Start with LinkedIn: turn off “Share profile updates with your network” before you edit anything.",
        answer: (c) => { const v = c.A["1.7"]?.private; return Array.isArray(v) && ticks(v) > 0 ? `${ticks(v)} of ${v.length} in place` : null; },
        done: (c) => allTicked(c.A["1.7"]?.private) },
      { id: "m1-why", lesson: "1.8", minutes: 5, do: "Write your two lists and your one sentence",
        why: "What you are moving away from, what you are moving toward, and where you are going.",
        answer: (c) => { const cp = c.A["1.8"] || {}; const out = [(cp.pushes || []).length ? `Moving away from: ${cp.pushes.join(" · ")}` : "", (cp.pulls || []).length ? `Moving toward: ${cp.pulls.join(" · ")}` : "", cp.why ? `Where you are going: ${cp.why}` : ""].filter(Boolean); return out.length ? out : null; },
        done: (c) => !!c.A["1.8"]?.why,
        next: "The sentence opens your LinkedIn About in Module 3 and your interview answer in Module 6." },
    ],
  },
  {
    n: 2, outcome: "One path, and the hours you can give it",
    actions: [
      { id: "m2-hours", lesson: "2.0", minutes: 5, do: "Set your hours a week, and block the first one",
        why: "Six real hours beat fifteen imagined ones. Put the first block on the calendar you look at.",
        answer: (c) => { const h = Number(c.SH.time?.hours) || 0; if (!h) return null; const proof = half(h * 0.6), ppl = half(h * 0.3); return `${h} hours a week: about ${proof} on proof, ${ppl} on people, ${Math.max(0, half(h - proof - ppl))} on reading`; } },
      { id: "m2-path", lesson: "2.1", minutes: 5, do: "Name the path you would take a call about",
        why: "One path, and the catch that comes with it. You can change it later.",
        write: { lines: 2, note: "2.1" },
        next: "Module 3 finds people who already hold this job." },
      { id: "m2-credential", lesson: "2.5", minutes: 10, do: "Check three postings before you buy a credential",
        why: "Count how many of the three name it. Spend nothing until two people in the job agree.",
        write: { lines: 2, note: "2.5", hint: "The credential, and how many postings asked for it." } },
      { id: "m2-report", lesson: "2.6", minutes: 4, do: "Run your paths through the Pivot Report",
        why: "Three paths ranked for you, with the first job title to apply for in each.",
        done: (c) => did(c, "2.6") },
    ],
  },
  {
    n: 3, outcome: "Three messages sent, two conversations kept warm",
    actions: [
      { id: "m3-names", lesson: "3.1", minutes: 15, do: "Save three names",
        why: "People who hold your target job. Find them before you write a word.",
        answer: (c) => { const p = people(c); return p.length ? p.slice(0, 5).map((x) => `${x.name}${x.role || x.company ? ` · ${[x.role, x.company].filter(Boolean).join(", ")}` : ""}`) : null; },
        write: { lines: 3, hint: "Name · title · company" },
        done: (c) => people(c).length >= 3 || !!(c.SH.wb || {})["m3-names"] },
      { id: "m3-check", lesson: "3.2", minutes: 5, do: "Run your first message through the five checks",
        why: "One specific thing about them, one question, and a yes that costs them under a minute.",
        answer: (c) => ticked(c.SH.msgcheck), done: (c) => allTicked(c.SH.msgcheck) },
      { id: "m3-send", lesson: "3.3", minutes: 20, do: "Send three messages tonight",
        why: "About one in four gets no reply, so three sent is usually two conversations.",
        answer: (c) => { const n = people(c).filter((x) => (x.stage && x.stage !== "to") || x.sent).length; return n ? `${n} sent so far` : null; },
        done: (c) => acted(c, "3.3") || people(c).filter((x) => (x.stage && x.stage !== "to") || x.sent).length >= 3 },
      { id: "m3-heard", lesson: "3.3", minutes: 3, do: "Write down what the first person told you",
        why: "The same day, in their words, while you still remember them.",
        write: { lines: 3 } },
      { id: "m3-linkedin", lesson: "3.4", minutes: 20, do: "Fix your LinkedIn in one pass",
        why: "Headline, skills, About, then the top three bullets under each job.",
        answer: (c) => ticked(c.SH.linkedin), done: (c) => allTicked(c.SH.linkedin) },
      { id: "m3-warm", lesson: "3.6", minutes: 10, do: "Send two monthly updates",
        why: "Four sentences each: what you have done since you talked, and one question.",
        answer: (c) => { const n = people(c).filter((x) => ["spoke", "warm", "referred"].includes(x.stage)).length; return n ? `${n} in conversation` : null; },
        done: (c) => acted(c, "3.6") },
      { id: "m3-prompt", lesson: "3.8", minutes: 10, do: "Try one prompt from the kit",
        why: "Ask it to interview you before it writes. Your answers are the material.",
        done: (c) => did(c, "3.8") },
    ],
  },
  {
    n: 4, outcome: "A résumé a hiring manager can read, and one application sent",
    actions: [
      { id: "m4-test", lesson: "4.1", minutes: 5, do: "Run the seven-second test on page one",
        why: "Cover everything below the top third and hand it to someone outside healthcare.",
        write: { label: "What job did they think you were applying for?", lines: 1 } },
      { id: "m4-details", lesson: "4.1", minutes: 5, do: "Write three details only you could put on the page",
        why: "A number, a tool, and something you built. These are what a generic résumé cannot have.",
        write: { lines: 3, note: "4.1" } },
      { id: "m4-bullet", lesson: "4.2", minutes: 10, do: "Rebuild one bullet: how big, what you did, what changed",
        why: "Pull the verb from the posting and leave your number where it is.",
        answer: (c) => { const t = c.SH.translation; return t?.out ? [t.mine ? `Before: ${t.mine}` : "", `After: ${t.out}`].filter(Boolean) : null; } },
      { id: "m4-numbers", lesson: "4.3", minutes: 8, do: "Mine your numbers",
        why: "Caseload, evaluations a year, people you trained. Round down, and bracket anything unchecked.",
        answer: (c) => { const n = Object.entries((c.SH.numbers || {}) as Record<string, string>).filter(([, v]) => (v || "").trim()); return n.length ? n.slice(0, 8).map(([k, v]) => `${k}: ${v}`) : null; },
        next: "They go under your résumé in the Suite and into your interview answer." },
      { id: "m4-suite", lesson: "4.5", minutes: 15, do: "Build your résumé in the Suite",
        why: "Your résumé as it reads today, plus one real posting. Then make every line true.",
        done: (c) => did(c, "4.5") },
      { id: "m4-paragraph", lesson: "4.6", minutes: 15, do: "Write the one paragraph nobody else could send",
        why: "If it would fit a letter to another company unchanged, rewrite it.",
        write: { lines: 4 } },
      { id: "m4-apply", lesson: "4.7", minutes: 30, do: "Send one application within 48 hours of the posting",
        why: "Tailor to the requirement lines, spend ten minutes finding one person there, then log it.",
        answer: (c) => { const a = apps(c); return a.length ? a.slice(0, 6).map((x) => `${x.role ? x.role + ", " : ""}${x.company} (${APP_STATUS[x.status] || x.status})`) : null; },
        done: (c) => acted(c, "4.7") || apps(c).length > 0 },
    ],
  },
  {
    n: 5, outcome: "One piece of proof, and your runway",
    actions: [
      { id: "m5-make", lesson: "5.2", minutes: 180, time: "two 90-min sessions", do: "Make your one thing",
        why: "Built from work you have already done. Draft it badly the first time.",
        answer: (c) => { const a = c.SH.artifact; return a?.link ? `${PATHS[a.slug]?.label ? PATHS[a.slug].label + ": " : ""}${a.link}` : null; },
        next: "It answers “have you prepared for this?” in every interview." },
      { id: "m5-runway", lesson: "5.5", minutes: 10, do: "Work out your months of runway",
        why: "Savings against the gap: lower pay, coverage and the loan payment.",
        answer: (c) => { const r = c.SH.runway; if (!r) return null; const gap = r.expenses * (r.dip / 100) + r.cobra + r.loan; return `${money(r.savings)} saved against a gap of ${money(gap)} a month${gap > 0 ? `: about ${Math.floor(r.savings / gap)} months` : ""}`; } },
      { id: "m5-loans", lesson: "5.5", minutes: 20, do: "Look up your payment count, and check your employer",
        why: "Your federal loan account has the count. The official PSLF employer search has the rest.",
        write: { lines: 1, hint: "Payments made: ___ of 120 · Employer qualifies: yes / no" } },
    ],
  },
  {
    n: 6, outcome: "Your interview answers, and an offer checked",
    actions: [
      { id: "m6-fumble", lesson: "6.1", minutes: 10, do: "Answer the two questions you would fumble",
        why: "Two sentences each. Describe something that happened, with a number in it.",
        write: { lines: 4, note: "6.1" } },
      { id: "m6-bridge", lesson: "6.2", minutes: 10, do: "Build your bridge statement",
        why: "Where you are going, how you prepared, one accomplishment with a number.",
        answer: (c) => { const b = c.SH.bridge; return b?.prep || b?.win ? [b.prep ? `Preparation: ${b.prep}` : "", b.win ? `Proof: ${b.win}` : ""].filter(Boolean) : null; } },
      { id: "m6-aloud", lesson: "6.2", minutes: 5, do: "Say it out loud five times",
        why: "To a friend or your phone. By the fifth it sounds like you.",
        done: (c) => acted(c, "6.2") },
      { id: "m6-mock", lesson: "6.4", minutes: 15, do: "Run the mock interview, twice",
        why: "Answer out loud, then type what you said. The first run is meant to be rough.",
        done: (c) => acted(c, "6.4") },
      { id: "m6-number", lesson: "6.5", minutes: 5, do: "Decide your opening number and your floor",
        why: "Decide before the phone rings, and anchor on the range for your path.",
        write: { lines: 1, hint: "Opening: $______ · Floor: $______" } },
      { id: "m6-offer", lesson: "6.5", minutes: 5, do: "Run the offer through the eight checks",
        why: "An empty box is a question for a follow-up call.",
        answer: (c) => ticked(c.SH.offer), done: (c) => allTicked(c.SH.offer) || acted(c, "6.5") },
      { id: "m6-log", lesson: "6.6", minutes: 5, do: "Log every application, and read your four numbers",
        why: "Once you have twenty logged, the ratio shows which stage is broken.",
        answer: (c) => { const a = apps(c); if (!a.length) return null; const n = (s: string[]) => a.filter((x) => s.includes(x.status)).length; return `${a.length} sent · ${n(["screen", "interview", "offer"])} screens · ${n(["interview", "offer"])} interviews · ${n(["offer"])} offers`; },
        done: (c) => apps(c).length >= 20 },
    ],
  },
  {
    n: 7, outcome: "Your story, and the next rung",
    actions: [
      { id: "m7-story", lesson: "7.1", minutes: 15, do: "Tell your story",
        why: "Six questions and one honest number. Nothing goes on the site without your say-so.",
        done: (c) => acted(c, "7.1") },
      { id: "m7-win", lesson: "7.2", minutes: 3, do: "Name your visible win by day sixty",
        why: "Ask everyone what would make their month easier, then fix one small broken thing.",
        write: { lines: 2, note: "7.2" } },
      { id: "m7-answer", lesson: "7.3", minutes: 10, do: "Answer one message from someone starting out",
        why: "Yesterday in three sentences, one number, the timeline, and one next thing.",
        done: (c) => acted(c, "7.3") },
    ],
  },
];

/** What is in a write-in field right now. */
export function written(a: WbAction, c: Ctx): string {
  if (!a.write) return "";
  const v = a.write.note ? (c.SH.notes || {})[a.write.note] : (c.SH.wb || {})[a.id];
  return typeof v === "string" ? v : "";
}
export function answerOf(a: WbAction, c: Ctx): string[] {
  const v = a.answer ? a.answer(c) : null;
  return v == null ? [] : Array.isArray(v) ? v.filter(Boolean) : [v];
}
export function isDone(a: WbAction, c: Ctx): boolean {
  if (a.done) return a.done(c);
  return answerOf(a, c).length > 0 || written(a, c).trim().length > 0;
}
export const timeLabel = (a: WbAction) => a.time || `${a.minutes} min`;
/** "about 3 hours" / "about 40 minutes", for what is left. */
export function roughly(minutes: number): string {
  if (minutes < 60) return `about ${Math.max(5, Math.round(minutes / 5) * 5)} minutes`;
  const h = Math.round(minutes / 30) / 2;
  return `about ${h} ${h === 1 ? "hour" : "hours"}`;
}
