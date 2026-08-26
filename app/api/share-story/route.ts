import { NextResponse } from "next/server";
import { sendStorySubmission } from "@/lib/email";
import { rateLimit } from "@/lib/stash";

/**
 * Story pitches from /share-your-story, emailed straight to James.
 *
 * This is the only unauthenticated write endpoint on the app that sends mail,
 * so it gets three cheap defences rather than a captcha: a honeypot field no
 * human sees, a minimum time-on-form, and a per-IP cap. A bot that beats all
 * three is welcome to send one email an hour.
 */

const LIMITS: Record<string, number> = {
  name: 120,
  email: 200,
  link: 300,
  before: 400,
  now: 400,
  howLong: 60,
  extra: 4000,
};

const clean = (v: unknown, field: string) =>
  typeof v === "string" ? v.trim().slice(0, LIMITS[field]) : "";

// Deliberately loose. Bouncing a real person over an unusual address costs
// more than accepting one that turns out to be junk.
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot: hidden in the form, so anything in it is automated. Report
  // success — telling a bot it failed just invites a retry with the field left
  // blank.
  if (clean(body.company_url, "link")) {
    return NextResponse.json({ ok: true });
  }

  // Nobody reads six questions and answers them in under three seconds.
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed < 3000) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, "name");
  const email = clean(body.email, "email");
  const before = clean(body.before, "before");
  const now = clean(body.now, "now");

  if (!name || !before || !now) {
    return NextResponse.json(
      { error: "Please fill in your name and both role questions." },
      { status: 400 }
    );
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right — I need it to reply." },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!(await rateLimit(`story:${ip}`, 3, 3600))) {
    return NextResponse.json(
      { error: "That's a few submissions in a row — try again in an hour." },
      { status: 429 }
    );
  }

  try {
    await sendStorySubmission({
      name,
      email,
      link: clean(body.link, "link"),
      before,
      now,
      howLong: clean(body.howLong, "howLong"),
      extra: clean(body.extra, "extra"),
    });
  } catch (e) {
    // The submitter typed all this out; do not lose it silently.
    console.error("share-story send failed", e);
    return NextResponse.json(
      {
        error:
          "Something went wrong sending that. Email jamoberges@gmail.com directly and it'll get through.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
