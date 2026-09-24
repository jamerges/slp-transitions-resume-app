import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isReadableProse } from "@/lib/anthropic";
import { rateLimit } from "@/lib/stash";
import { sendStorySubmission, sendStoryThanks, sendOpsAlert } from "@/lib/email";
import {
  CREDIT, PROMPTS, saveStory, loadStory, listStoryIds, storySig, type StorySubmission,
} from "@/lib/story";

export const runtime = "nodejs";
export const maxDuration = 30;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";
const MAX_RESUME = 3 * 1024 * 1024;
const MAX_PHOTO_CHARS = 400_000; // a data URL; the browser resizes to 800px first
const clip = (v: unknown, n = 4000) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const list = (v: unknown, n = 20) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, n).map((x: string) => x.slice(0, 80)) : []);

async function resumeText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const buf = Buffer.from(await file.arrayBuffer());
  let text = "";
  try {
    if (ext === "txt" || ext === "md") text = buf.toString("utf-8");
    else if (ext === "pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text: pages } = await extractText(pdf, { mergePages: true });
      text = Array.isArray(pages) ? pages.join("\n") : String(pages || "");
    } else if (ext === "docx") {
      const mammoth = (await import("mammoth")).default;
      text = (await mammoth.extractRawText({ buffer: buf })).value || "";
    }
  } catch { /* unreadable: the attachment still reaches James */ }
  text = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return isReadableProse(text) ? text.slice(0, 20000) : "";
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    if (!(await rateLimit(`story:${ip}`, 5, 3600))) {
      return NextResponse.json({ error: "That's a lot of stories in an hour. Try again later, or reply to any of our emails." }, { status: 429 });
    }
    const form = await req.formData();
    const raw = JSON.parse(String(form.get("story") || "{}"));

    // Bots fill hidden fields and submit in seconds; people don't.
    if (clip(raw.website) || (typeof raw.openedAt === "number" && Date.now() - raw.openedAt < 20_000)) {
      return NextResponse.json({ ok: true });
    }

    const email = clip(raw.email, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Add an email address so James can send you the draft." }, { status: 400 });
    if (!clip(raw.firstName, 80)) return NextResponse.json({ error: "Add your first name." }, { status: 400 });
    if (!clip(raw.jobTitle, 120)) return NextResponse.json({ error: "Add your new job title." }, { status: 400 });
    if (raw.consent !== true) return NextResponse.json({ error: "Tick the box that says we can turn this into an article." }, { status: 400 });

    const answers: Record<string, string> = {};
    for (const p of PROMPTS) answers[p.id] = clip(raw.answers?.[p.id]);

    const photo = typeof raw.photo === "string" && raw.photo.startsWith("data:image/jpeg;base64,") && raw.photo.length <= MAX_PHOTO_CHARS ? raw.photo : undefined;

    const file = form.get("resume");
    let resume: File | null = null;
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_RESUME) return NextResponse.json({ error: "That résumé file is over 3MB. Try a PDF, or leave it off." }, { status: 400 });
      resume = file;
    }

    const story: StorySubmission = {
      id: randomUUID().slice(0, 8),
      submittedAt: Date.now(),
      firstName: clip(raw.firstName, 80),
      lastName: clip(raw.lastName, 80),
      email,
      credit: (CREDIT as readonly string[]).includes(raw.credit) ? raw.credit : "First name only",
      linkedin: clip(raw.linkedin, 300),
      settings: list(raw.settings),
      years: clip(raw.years, 40),
      jobTitle: clip(raw.jobTitle, 120),
      company: clip(raw.company, 120),
      nameCompany: raw.nameCompany !== false,
      started: clip(raw.started, 20),
      setup: clip(raw.setup, 20),
      searchLength: clip(raw.searchLength, 40),
      applications: clip(raw.applications, 20),
      interviews: clip(raw.interviews, 20),
      howFound: clip(raw.howFound, 80),
      pay: clip(raw.pay, 40),
      payRange: clip(raw.payRange, 60),
      payPublic: raw.payPublic === true,
      bullets: (Array.isArray(raw.bullets) ? raw.bullets : []).slice(0, 3).map((b: any) => ({ before: clip(b?.before, 600), after: clip(b?.after, 600) })),
      answers,
      followUp: raw.followUp === true,
      consent: true,
      photo,
      resumeText: resume ? await resumeText(resume) : undefined,
      resumeFileName: resume ? resume.name.slice(0, 120) : undefined,
    };

    const stored = await saveStory(story);
    const privateUrl = `${APP_URL}/api/story?id=${story.id}&k=${storySig(story.id)}`;
    const attachments: { filename: string; content: Buffer }[] = [];
    if (resume) attachments.push({ filename: resume.name, content: Buffer.from(await resume.arrayBuffer()) });
    if (photo) attachments.push({ filename: `${story.firstName.toLowerCase().replace(/[^a-z]/g, "") || "photo"}-${story.id}.jpg`, content: Buffer.from(photo.split(",")[1], "base64") });

    try {
      await sendStorySubmission({ story, privateUrl, attachments });
    } catch (e) {
      console.error("[/api/story] submission email failed", e);
      // The story is stored; make sure James still hears about it.
      await sendOpsAlert({ subject: `Story submission (email failed): ${story.firstName}`, lines: [`id ${story.id}`, privateUrl] }).catch(() => {});
    }
    sendStoryThanks({ to: email, firstName: story.firstName }).catch((e) => console.error("[/api/story] thanks email failed", e));

    return NextResponse.json({ ok: true, stored });
  } catch (err: any) {
    console.error("[/api/story]", err);
    return NextResponse.json({ error: "Something went wrong sending your story. Nothing was lost on your side, so try once more." }, { status: 500 });
  }
}

/** James's private link from the email: the submission as JSON. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const k = url.searchParams.get("k") || "";
  const auth = req.headers.get("authorization") || "";
  const owner = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!id && owner) return NextResponse.json({ ids: await listStoryIds() });
  if (!id || (!owner && k !== storySig(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const story = await loadStory(id);
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(story, { headers: { "Cache-Control": "no-store" } });
}
