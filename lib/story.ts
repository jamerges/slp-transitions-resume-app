import { Redis } from "@upstash/redis";
import { createHmac } from "crypto";

/**
 * "Share your story": the intake form for SLPs who landed a non-clinical job.
 * One list of questions feeds the form, the email James reads, and the JSON
 * the article is drafted from, so the three never disagree.
 *
 * Nothing here publishes anything. A submission is stored, emailed to the ops
 * inbox with a private link, and becomes a WordPress draft only when James
 * says so. The transitioner sees the draft before it goes live.
 */

export const SETTINGS = [
  "Schools", "Early intervention", "Outpatient peds", "Outpatient adult", "Hospital (acute)",
  "Inpatient rehab", "SNF / long-term care", "Home health", "Private practice", "Telepractice", "University clinic",
];
export const YEARS = ["Under 2 years", "2–5 years", "6–10 years", "11–20 years", "More than 20 years"];
export const SEARCH_LENGTH = ["Under 3 months", "3–6 months", "6–12 months", "12–18 months", "More than 18 months"];
export const HOW_FOUND = [
  "Someone I knew referred me", "An informational chat turned into a job", "I applied cold",
  "A recruiter reached out", "Internal move at my employer", "Something else",
];
export const WORK_SETUP = ["Remote", "Hybrid", "On-site"];
export const PAY_VS = ["More than my clinical pay", "About the same", "Less, on purpose", "Prefer not to say"];
export const CREDIT = ["Full name", "First name only", "Anonymous"] as const;

/** Free-text prompts, in the order the form shows them. `section` groups them. */
export const PROMPTS: { id: string; section: string; label: string; hint: string; rows?: number }[] = [
  { id: "why", section: "start", label: "What made you start looking?", hint: "The moment, if there was one: a caseload number, a meeting, a Sunday night." },
  { id: "week", section: "now", label: "What does a normal week look like now?", hint: "What you actually do Monday to Friday, in plain words." },
  { id: "howStory", section: "how", label: "How did this job come to you?", hint: "Who you talked to, what you sent, what finally worked." },
  { id: "training", section: "how", label: "Did you have to take any additional education? What did that look like?", hint: "A course, a certificate, a degree, or none at all. What it cost in time and money, and whether you'd do it again." },
  { id: "resume", section: "resume", label: "What did you change on your résumé?", hint: "Words you dropped, numbers you added, what you led with." },
  { id: "skills", section: "back", label: "Which clinical skills turned out to matter most?", hint: "The ones your new team noticed first." },
  { id: "harder", section: "back", label: "What was harder, or different, than you expected?", hint: "The part nobody warned you about." },
  { id: "advice", section: "back", label: "What would you tell an SLP sitting where you used to sit?", hint: "One thing. The one you wish someone had told you." },
  { id: "extra", section: "back", label: "Anything else you want in the story?", hint: "Optional." },
];

export interface StorySubmission {
  id: string;
  submittedAt: number;
  firstName: string;
  lastName: string;
  email: string;
  credit: (typeof CREDIT)[number];
  linkedin: string;
  settings: string[];
  years: string;
  jobTitle: string;
  company: string;
  nameCompany: boolean;
  started: string;
  setup: string;
  searchLength: string;
  applications: string;
  interviews: string;
  howFound: string;
  pay: string;
  payRange: string;
  payPublic: boolean;
  bullets: { before: string; after: string }[];
  answers: Record<string, string>;
  followUp: boolean;
  consent: boolean;
  /** JPEG data URL, resized in the browser to 800px. Stored so a draft can use it. */
  photo?: string;
  /** Résumé text parsed server-side; the original file goes to the email only. */
  resumeText?: string;
  resumeFileName?: string;
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

/** No expiry: a story may wait weeks for James to get to it. */
export async function saveStory(s: StorySubmission): Promise<boolean> {
  const r = getRedis(); if (!r) return false;
  await r.set(`story:${s.id}`, JSON.stringify(s));
  await r.zadd("story:index", { score: s.submittedAt, member: s.id });
  return true;
}

export async function loadStory(id: string): Promise<StorySubmission | null> {
  const r = getRedis(); if (!r) return null;
  const v = await r.get<string | object>(`story:${id}`);
  if (!v) return null;
  try { return (typeof v === "string" ? JSON.parse(v) : v) as StorySubmission; } catch { return null; }
}

export async function listStoryIds(limit = 50): Promise<string[]> {
  const r = getRedis(); if (!r) return [];
  return (await r.zrange("story:index", 0, limit - 1, { rev: true })) as string[];
}

/** The private link in James's email: unguessable, no login, read-only. */
export function storySig(id: string): string {
  return createHmac("sha256", process.env.CRON_SECRET || "dev-only").update(`story:${id}`).digest("hex").slice(0, 32);
}

/** How the transitioner asked to be named in print. */
export function creditName(s: Pick<StorySubmission, "credit" | "firstName" | "lastName">): string {
  if (s.credit === "Anonymous") return "An SLP who made the move";
  if (s.credit === "First name only") return s.firstName;
  return [s.firstName, s.lastName].filter(Boolean).join(" ");
}
