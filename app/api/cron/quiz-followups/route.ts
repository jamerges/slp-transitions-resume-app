import { NextResponse } from "next/server";
import { PATHS } from "@/lib/quiz";
import { completionsBetween, isCustomer, isUnsubscribed, unsubUrl } from "@/lib/quiz-log";
import { claimOnce } from "@/lib/stash";
import { sendQuizFollowupDay2, sendQuizFollowupDay6, sendOpsAlert } from "@/lib/email";

/**
 * Daily. Two personal follow-ups after a quiz result: day 2 (the first move,
 * plus the report) and day 6 (one question, no pitch). Each sends at most
 * once per address via claimOnce, skips buyers and anyone who opted out, and
 * only considers completions we recorded ourselves. Gated on CRON_SECRET.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const DAY = 86_400_000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const sent = { day2: [] as string[], day6: [] as string[] };
  const skipped = { customer: 0, unsubscribed: 0, already: 0, unknownPath: 0 };

  const windows: Array<[keyof typeof sent, number, number]> = [
    ["day2", now - 3 * DAY, now - 2 * DAY],
    ["day6", now - 7 * DAY, now - 6 * DAY],
  ];

  for (const [stage, from, to] of windows) {
    for (const c of await completionsBetween(from, to)) {
      const top = PATHS[c.slug];
      if (!top) { skipped.unknownPath++; continue; }
      if (await isUnsubscribed(c.email)) { skipped.unsubscribed++; continue; }
      if (await isCustomer(c.email)) { skipped.customer++; continue; }
      if (!(await claimOnce(`fu:${stage}:${c.email}`))) { skipped.already++; continue; }
      const u = unsubUrl(c.email);
      if (stage === "day2") await sendQuizFollowupDay2({ to: c.email, name: c.name, top, unsubUrl: u });
      else await sendQuizFollowupDay6({ to: c.email, name: c.name, top, unsubUrl: u });
      sent[stage].push(c.email);
    }
  }

  const total = sent.day2.length + sent.day6.length;
  if (total) {
    await sendOpsAlert({
      subject: `Quiz follow-ups sent: ${sent.day2.length} day-2, ${sent.day6.length} day-6`,
      lines: [...sent.day2.map((e) => `day2: ${e}`), ...sent.day6.map((e) => `day6: ${e}`)],
    }).catch(() => {});
  }
  return NextResponse.json({ sent, skipped });
}
