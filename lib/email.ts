import { Resend } from "resend";
import { STAGES, pathImage, type StageKey } from "@/lib/quiz";

let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    resend = new Resend(key);
  }
  return resend;
}

// Override with RESEND_FROM once a sending domain is verified in Resend.
// For pre-verification testing you can set it to "SLP Transitions <onboarding@resend.dev>"
// (Resend's sandbox sender — only delivers to the Resend account owner's email).
const FROM_ADDRESS =
  process.env.RESEND_FROM || "SLP Transitions <results@slptransitions.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.slptransitions.com";

interface FullResultsEmailInput {
  to: string;
  jobTitle: string;
  results: any;
}

function esc(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s: unknown): string {
  return esc(s).replace(/\n/g, "<br/>");
}

function renderResultsHTML(jobTitle: string, r: any): string {
  const bullets = (r.translatedBullets || [])
    .map(
      (b: any) => `
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border-left:3px solid #E5E7EB;font-size:13px;color:#6B7280;width:50%;vertical-align:top;">${esc(b.original)}</td>
          <td style="padding:8px 12px;background:#F0FAF3;border-left:3px solid #2D6A4F;font-size:13px;color:#1B1B1E;width:50%;vertical-align:top;font-weight:500;">${esc(b.translated)}</td>
        </tr>`
    )
    .join("");

  const skills = r.skillsSection
    ? Object.entries(r.skillsSection)
        .map(
          ([cat, s]: any) =>
            `<div style="margin-bottom:10px;"><div style="font-size:13px;font-weight:600;color:#2D6A4F;margin-bottom:4px;">${esc(cat)}</div><div style="font-size:13px;color:#1B1B1E;">${(s as string[]).map(esc).join(" · ")}</div></div>`
        )
        .join("")
    : "";

  const gaps = (r.gapAnalysis || [])
    .map(
      (g: any) => `
      <div style="padding:12px 14px;background:#FEF3C7;border-radius:8px;margin-bottom:10px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${esc(g.gap)}</div>
        ${(g.actionSteps || []).map((s: string) => `<div style="font-size:13px;color:#6B7280;padding-left:12px;">→ ${esc(s)}</div>`).join("")}
        ${g.timeframe ? `<div style="font-size:12px;color:#9CA3AF;margin-top:6px;">⏱ ${esc(g.timeframe)}</div>` : ""}
      </div>`
    )
    .join("");

  const artifacts = (r.proofArtifacts || [])
    .map(
      (a: any) => `
      <div style="padding:12px 14px;background:#F0FAF3;border-radius:8px;margin-bottom:10px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">${esc(a.artifact)}</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.6;">${esc(a.why)}</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:6px;">${a.timeEstimate ? `⏱ ${esc(a.timeEstimate)}` : ""}${a.timeEstimate && a.cost ? " &nbsp;·&nbsp; " : ""}${a.cost ? `💰 ${esc(a.cost)}` : ""}</div>
      </div>`
    )
    .join("");

  const knockouts = (r.knockoutAnswers || [])
    .map(
      (k: any) => `
      <div style="margin-bottom:12px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">&ldquo;${esc(k.question)}&rdquo;</div>
        <div style="font-size:13px;color:#1B1B1E;padding:10px 14px;background:#F0F9FF;border-left:3px solid #0369A1;border-radius:6px;line-height:1.6;">${esc(k.strategy)}</div>
      </div>`
    )
    .join("");

  const roadmap = (r.ninetyDayPlan || [])
    .map(
      (p: any) => `
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:700;color:#2D6A4F;letter-spacing:0.04em;text-transform:uppercase;">${esc(p.phase)}</div>
        <div style="font-size:14px;font-weight:600;margin:2px 0 4px;">${esc(p.focus)}</div>
        ${(p.actions || []).map((a: string) => `<div style="font-size:13px;color:#6B7280;padding:2px 0 2px 14px;line-height:1.6;">→ ${esc(a)}</div>`).join("")}
      </div>`
    )
    .join("");

  const interviews = (r.talkingPoints || [])
    .map(
      (t: any) => `
      <div style="margin-bottom:14px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;">Q: ${esc(t.question)}</div>
        <div style="font-size:13px;color:#1B1B1E;padding:10px 14px;background:#F0FAF3;border-left:3px solid #2D6A4F;border-radius:6px;">${esc(t.bridgeStatement)}</div>
      </div>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,'DM Sans',sans-serif;color:#1B1B1E;">
<div style="max-width:680px;margin:0 auto;padding:32px 20px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:20px;font-weight:700;color:#2D6A4F;font-family:Georgia,serif;">SLP Transitions</div>
    <div style="font-size:13px;color:#6B7280;">Career Pivot Suite</div>
  </div>

  <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;margin:0 0 8px;">Your Complete Translation: ${esc(jobTitle)}</h1>
  <p style="font-size:14px;color:#6B7280;margin:0 0 24px;">Everything below is yours to copy into your resume, cover letter, and LinkedIn.</p>

  ${
    r.elevatorPitch
      ? `<div style="background:#F0FAF3;border:1px solid #D8F3DC;border-radius:12px;padding:20px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:600;color:#2D6A4F;letter-spacing:0.04em;margin-bottom:6px;">YOUR 30-SECOND PITCH</div>
          <div style="font-size:15px;line-height:1.7;">${esc(r.elevatorPitch)}</div>
        </div>`
      : ""
  }

  ${
    r.linkedinHeadline
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:600;color:#2D6A4F;letter-spacing:0.04em;margin-bottom:4px;">LINKEDIN HEADLINE</div>
          <div style="font-size:15px;font-weight:500;">${esc(r.linkedinHeadline)}</div>
          ${
            r.linkedinAbout
              ? `<div style="border-top:1px solid #E5E7EB;margin-top:12px;padding-top:12px;">
                  <div style="font-size:11px;font-weight:600;color:#2D6A4F;letter-spacing:0.04em;margin-bottom:6px;">LINKEDIN ABOUT SECTION</div>
                  <div style="font-size:14px;line-height:1.7;">${nl2br(r.linkedinAbout)}</div>
                </div>`
              : ""
          }
        </div>`
      : ""
  }

  ${
    r.professionalSummary
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 10px;">Professional Summary</h2>
          <div style="font-size:14px;line-height:1.7;padding:12px 16px;background:#F0FAF3;border-left:3px solid #2D6A4F;border-radius:6px;">${esc(r.professionalSummary)}</div>
        </div>`
      : ""
  }

  ${
    bullets
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Translated Experience</h2>
          <p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">Original (left) → Rewritten for hiring managers (right)</p>
          <table cellpadding="0" cellspacing="6" style="width:100%;border-collapse:separate;">${bullets}</table>
        </div>`
      : ""
  }

  ${
    skills
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Skills — paste into your resume</h2><p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">Use this exact wording in your resume's Skills section — screening software and recruiters match on these terms.</p>
          ${skills}
        </div>`
      : ""
  }

  ${
    r.coverLetter
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 12px;">Tailored Cover Letter</h2>
          <div style="font-size:14px;line-height:1.75;padding:16px 20px;background:#FEFEFE;border:1px solid #E5E7EB;border-radius:8px;">${nl2br(r.coverLetter)}</div>
        </div>`
      : ""
  }

  ${
    gaps
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Gap Analysis</h2>
          <p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">Honest assessment + action plan.</p>
          ${gaps}
        </div>`
      : ""
  }

  ${
    artifacts
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Build Your Proof</h2>
          <p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">Career changers get hired on evidence, not claims.</p>
          ${artifacts}
        </div>`
      : ""
  }

  ${
    interviews
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 12px;">Interview Bridge Statements</h2>
          ${interviews}
        </div>`
      : ""
  }

  ${
    knockouts
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Application Screening Questions</h2>
          <p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">The form questions that silently filter career changers out — and how to answer them.</p>
          ${knockouts}
        </div>`
      : ""
  }

  ${
    roadmap
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 6px;">Your 90-Day Transition Plan</h2>
          <p style="font-size:12px;color:#9CA3AF;margin:0 0 12px;">Real transitions take months, not days — this is the honest sequence.</p>
          ${roadmap}
        </div>`
      : ""
  }

  <div style="text-align:center;padding:24px;background:#F0FAF3;border-radius:12px;margin-top:24px;">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px;">Translating for another role?</div>
    <a href="${APP_URL}" style="display:inline-block;padding:12px 28px;background:#2D6A4F;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Open SLP Transitions →</a>
  </div>

  <p style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:32px;">
    SLP Transitions • Your degree isn't a prison. Your skills compound.
  </p>
</div>
</body></html>`;
}

export async function sendQuizResultEmail(input: {
  to: string;
  name?: string;
  top: { label: string; slug?: string; roleOption?: string; icon?: string; range: string; timeline: string; why: string; entryDoor: string; firstMove: string; caveat: string };
  runnerUp?: { label: string; range: string; timeline: string } | null;
  stage?: StageKey | null;
}): Promise<void> {
  const { to, name, top, runnerUp, stage } = input;
  const hi = name ? `Hi ${esc(name.split(" ")[0])},` : "Hi,";
  const opener = stage ? STAGES[stage].opener : "";
  const card = top.slug ? `<img src="${APP_URL}${pathImage(top.slug)}" alt="${esc(top.label)}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border-radius:12px;border:1px solid #D8F3DC;margin:0 auto 16px;" />` : "";
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,'DM Sans',sans-serif;color:#1B1B1E;">
<div style="max-width:640px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:20px;font-weight:700;color:#2D6A4F;font-family:Georgia,serif;">SLP Transitions</div>
  </div>
  <p style="font-size:15px;line-height:1.7;">${hi}</p>
  <p style="font-size:15px;line-height:1.7;">Here's your quiz result, saved so you don't lose it.</p>
  ${opener ? `<p style="font-size:16px;line-height:1.7;color:#0B6B54;">${esc(opener)}</p>` : ""}
  ${card}

  <div style="background:#F0FAF3;border:1px solid #D8F3DC;border-radius:12px;padding:22px;margin:20px 0;">
    <div style="font-size:11px;font-weight:600;color:#2D6A4F;letter-spacing:0.05em;">YOUR DIRECTION</div>
    <div style="font-size:24px;font-weight:700;font-family:Georgia,serif;margin:6px 0 4px;">${esc(top.label)}</div>
    <div style="font-size:14px;color:#2D6A4F;font-weight:600;margin-bottom:12px;">${esc(top.range)} · typically ${esc(top.timeline)}</div>
    <div style="font-size:14px;line-height:1.75;">${esc(top.why)}</div>
  </div>

  <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:14px;">
    <h2 style="font-size:15px;margin:0 0 8px;">How people actually get in</h2>
    <div style="font-size:14px;color:#6B7280;line-height:1.7;">${esc(top.entryDoor)}</div>
    <div style="font-size:14px;line-height:1.65;background:#F0FAF3;border-left:3px solid #2D6A4F;border-radius:6px;padding:10px 14px;margin-top:12px;"><b>Your first move this week:</b> ${esc(top.firstMove)}</div>
    <div style="font-size:14px;line-height:1.65;background:#FEF3C7;border-radius:6px;padding:10px 14px;margin-top:8px;"><b>The honest caveat:</b> ${esc(top.caveat)}</div>
  </div>

  ${
    runnerUp
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px 20px;margin-bottom:14px;">
          <div style="font-size:11px;font-weight:600;color:#2D6A4F;letter-spacing:0.05em;">ALSO WORTH A LOOK</div>
          <div style="font-size:16px;font-weight:600;margin-top:4px;">${esc(runnerUp.label)}</div>
          <div style="font-size:13px;color:#6B7280;">${esc(runnerUp.range)} · ${esc(runnerUp.timeline)}</div>
        </div>`
      : ""
  }

  <div style="padding:22px;background:#F0FAF3;border:1px solid #D8F3DC;border-radius:12px;margin-top:20px;">
    <div style="font-size:17px;font-weight:700;margin-bottom:8px;">Want the version built on your actual resume?</div>
    <div style="font-size:14px;line-height:1.7;color:#1B1B1E;margin-bottom:14px;">
      This result came from eight questions. The <b>Pivot Report</b> reads your real resume and tells you which of these paths your specific experience already qualifies you for — your readiness profile, the stage you're actually in, your top three paths with entry doors, and a week-by-week 30-day plan. $9, once.
    </div>
    <div style="text-align:center;">
      <a href="${APP_URL}/quiz?path=${encodeURIComponent(top.slug || "")}" style="display:inline-block;padding:13px 30px;background:#2D6A4F;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Get my Pivot Report →</a>
    </div>
  </div>

  <p style="font-size:14px;line-height:1.7;margin-top:22px;">
    I'll also send you the occasional note with real SLP transition stories and what actually worked. If that's not useful, unsubscribe any time — no hard feelings.
  </p>
  <p style="font-size:14px;line-height:1.7;">— James</p>
  <p style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:28px;">
    SLP Transitions • Your degree isn't a prison. Your skills compound.
  </p>
</div>
</body></html>`;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your result: ${top.label}`,
    html,
  });
}

/**
 * Quiz buyers pay before uploading a resume — usually on a phone, nowhere near
 * the file. This is their way back: without it, "come back from your computer"
 * is a promise with no link attached.
 */
export async function sendResumeLinkEmail(input: {
  to: string;
  sessionId: string;
}): Promise<void> {
  const { to, sessionId } = input;
  const link = `${APP_URL}/report?session_id=${encodeURIComponent(sessionId)}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F5;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1F2937;background:#fff;">
  <p style="font-size:13px;color:#2D6A4F;font-weight:600;letter-spacing:0.04em;margin:0 0 6px;">✓ PAYMENT CONFIRMED</p>
  <h1 style="font-size:24px;line-height:1.3;margin:0 0 14px;">Your Pivot Report is ready to build</h1>
  <p style="font-size:15px;line-height:1.7;">
    Thanks for picking this up. One thing left: add your resume, and we'll build the report around your actual experience.
  </p>
  <p style="font-size:15px;line-height:1.7;">
    It takes about a minute, and it's much easier from a computer — so if you bought this on your phone, just open this link when you're back at your desk.
  </p>
  <p style="text-align:center;margin:26px 0;">
    <a href="${link}" style="display:inline-block;padding:14px 32px;background:#2D6A4F;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">Add my resume →</a>
  </p>
  <p style="font-size:13px;line-height:1.7;color:#6B7280;">
    This link is good for 7 days. If it expires or anything goes sideways, reply to this email with your receipt and I'll build it for you by hand.
  </p>
  <p style="font-size:14px;line-height:1.7;">— James</p>
  <p style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:28px;">
    SLP Transitions • Your degree isn't a prison. Your skills compound.
  </p>
</div>
</body></html>`;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Pivot Report — one step left",
    html,
  });
}

/**
 * Second nudge for a $9 buyer who paid but never uploaded a resume. Four of
 * the first six buyers stalled exactly here (2026-09-03 replay), and a single
 * link on purchase day was all they ever got. Sent once, 48h+ after payment,
 * by the stalled-reports cron.
 */
export async function sendReportReminderEmail(input: {
  to: string;
  sessionId: string;
}): Promise<void> {
  const { to, sessionId } = input;
  const link = `${APP_URL}/report?session_id=${encodeURIComponent(sessionId)}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F5;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1F2937;background:#fff;">
  <h1 style="font-size:22px;line-height:1.3;margin:0 0 14px;">Your Pivot Report is still waiting</h1>
  <p style="font-size:15px;line-height:1.7;">
    You picked up the $9 Pivot Report a couple of days ago and it never got built &mdash; it needs your resume first, and that step is easy to lose on a phone.
  </p>
  <p style="font-size:15px;line-height:1.7;">
    Nothing has expired. Open this from a computer, add your resume, and it takes about a minute:
  </p>
  <p style="text-align:center;margin:26px 0;">
    <a href="${link}" style="display:inline-block;padding:14px 32px;background:#2D6A4F;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">Finish my report &rarr;</a>
  </p>
  <p style="font-size:13px;line-height:1.7;color:#6B7280;">
    If anything goes sideways, reply to this email and I&rsquo;ll build it for you by hand. And if you&rsquo;ve changed your mind, reply and say so &mdash; the 30-day refund is real.
  </p>
  <p style="font-size:14px;line-height:1.7;">&mdash; James</p>
  <p style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:28px;">
    SLP Transitions &bull; Your degree isn&rsquo;t a prison. Your skills compound.
  </p>
</div>
</body></html>`;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Pivot Report is still waiting",
    html,
  });
}

/**
 * Personal follow-ups after a quiz result. Deliberately plain: no header art,
 * short paragraphs, from James, reply-to James, and grounded in the reader's
 * own result (path, range, first move) rather than a template. Sent by the
 * quiz-followups cron: day 2 nudges toward the report, day 6 asks one
 * question and pitches nothing. Every one carries a signed opt-out link.
 */
const REPLY_TO = "james@slptransitions.com";
const plainWrap = (paras: string[], unsub: string) =>
  `<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1F2937;">
${paras.map((t) => `<p style="margin:0 0 16px;">${t}</p>`).join("\n")}
<p style="margin:28px 0 0;font-size:12px;color:#9CA3AF;">You took the career quiz at slptransitions.com. <a href="${unsub}" style="color:#9CA3AF;">Stop these emails</a>.</p>
</div>`;

export async function sendQuizFollowupDay2(input: {
  to: string;
  name?: string;
  top: { slug: string; label: string; roleOption: string; range: string; timeline: string; firstMove: string; caveat: string };
  unsubUrl: string;
  stage?: string | null;
}): Promise<void> {
  const { to, name, top, unsubUrl, stage } = input;
  const first = (name || "").trim().split(/\s+/)[0] || "there";
  const link = `${APP_URL}/?from=quiz&goal=report&path=${encodeURIComponent(top.roleOption)}`;
  const site = "https://slptransitions.com";
  const a = (href: string, text: string) => `<a href="${href}" style="color:#0B6B54;">${text}</a>`;
  const opening = `Hi ${esc(first)},`;
  const intro = `James here &mdash; I run SLP Transitions. Your quiz came back <strong>${esc(top.label)}</strong> a couple of days ago, and two days is usually when a result either gets bookmarked or forgotten. So, one nudge.`;
  const context = `For context, that path runs ${esc(top.range)}, and the typical move takes ${esc(top.timeline)}. ${esc(top.caveat)}`;
  const report = `The quiz ranked the paths, but it never saw your resume. If you want the version built from what you&rsquo;ve actually done &mdash; what you already qualify for, and what to do first &mdash; that&rsquo;s the $9 Pivot Report: ${a(link, link)}`;
  const close = `Either way, reply and tell me where you are with it. I read every one of these.`;
  // The stage question decides what comes first. Stages 1-3 get no pitch:
  // a stage-2 reader greeted with a checkout link stops reading.
  let body: string[];
  switch (stage) {
    case "private":
      body = [opening, intro,
        `You said you haven&rsquo;t told anyone yet. That&rsquo;s fine. Most people who leave spend a while looking quietly first, and looking commits you to nothing. The one thing I&rsquo;d read this week is ${a(`${site}/youre-allowed-to-want-out/`, "the five stages of leaving")}: it names the belief that keeps people stuck at each one and the single small move out of it, and stage one is exactly where you are.`,
        `When you&rsquo;re ready for the practical part, your result is ${esc(top.label)}: ${esc(top.range)}, typically ${esc(top.timeline)}. It&rsquo;ll keep.`,
        close, `&mdash; James`];
      break;
    case "guilt":
      body = [opening, intro,
        `You said the guilt is the loud part right now. I&rsquo;m not going to argue you out of it in an email, but two things helped me: the degree doesn&rsquo;t go anywhere, every path on the site runs on it, and wanting out doesn&rsquo;t undo the good you did. If you want the longer version, ${a(`${site}/5-hidden-fears-stopping-slps-from-making-a-career-change-and-how-to-overcome-them/`, "this piece on the five fears")} names the sunk-cost trap directly.`,
        `The practical part will still be here when you want it: ${esc(top.label)} runs ${esc(top.range)}, and the typical move takes ${esc(top.timeline)}.`,
        close, `&mdash; James`];
      break;
    case "permission":
      body = [opening, intro,
        `You said you keep reading exit stories and wondering if it&rsquo;s really possible. It is, and not just for people with a coding side-hustle or a spouse with a big salary. ${a(`${site}/slp-to-software-engineer-jeannette-roberes/`, "Jeannette")} was a working SLP who taught herself. ${a(`${site}/slp-to-consultant-rachel-archambault/`, "Rachel")} built a consulting practice from one training she was already giving. ${a(`${site}/reinventing-yourself-mattie-murrey-tegels/`, "Mattie")} did it in her fifties.`,
        `Your own result, when you want it: ${esc(top.label)}, ${esc(top.range)}, typically ${esc(top.timeline)}. The first move is small: ${esc(top.firstMove)}`,
        close, `&mdash; James`];
      break;
    case "action":
      body = [opening, intro,
        `You said you&rsquo;re applying and not getting traction. Nine times out of ten that&rsquo;s the resume, not you: it still reads clinical, so it gets sorted into the wrong pile in about seven seconds. ${a(`${site}/slp-resume-non-clinical/`, "This is what actually gets interviews")}, and if you want yours translated line by line against a real posting, ${a(`${APP_URL}/`, "the Career Pivot Suite")} does that for $24, with a free preview first.`,
        context, close, `&mdash; James`];
      break;
    default:
      body = [opening, intro,
        `If I were you, the first thing I&rsquo;d do this week: ${esc(top.firstMove)}`,
        context, report, close, `&mdash; James`];
  }
  const html = plainWrap(body, unsubUrl);
  await getResend().emails.send({
    from: FROM_ADDRESS, to, replyTo: REPLY_TO,
    subject: `Your ${top.label} result, and the part I'd start with`,
    html,
  });
}

export async function sendQuizFollowupDay6(input: {
  to: string;
  name?: string;
  top: { label: string };
  unsubUrl: string;
}): Promise<void> {
  const { to, name, top, unsubUrl } = input;
  const first = (name || "").trim().split(/\s+/)[0] || "there";
  const html = plainWrap([
    `Hi ${esc(first)},`,
    `Six days ago your quiz said <strong>${esc(top.label)}</strong>. No pitch in this one. A question.`,
    `What&rsquo;s actually stopping you? Not &ldquo;I haven&rsquo;t had time.&rdquo; The real thing: the loans, the degree you&rsquo;d feel you were wasting, not knowing whether anyone would hire you, feeling like you&rsquo;d be quitting on the kids or the patients.`,
    `Reply with one sentence. I&rsquo;m collecting these to figure out what to build next, and I answer each one myself.`,
    `&mdash; James`,
  ], unsubUrl);
  await getResend().emails.send({
    from: FROM_ADDRESS, to, replyTo: REPLY_TO,
    subject: "Quick question",
    html,
  });
}

export async function sendReportEmail(input: {
  to: string;
  report: any;
  sessionId?: string;
}): Promise<void> {
  const { to, report: r, sessionId } = input;
  // Carry their resume forward so the $24 upsell is one paste, not a re-entry.
  const topRoleLabel = r?.topRoles?.[0]?.role || "";
  const continueParam = sessionId
    ? `/?continue=${encodeURIComponent(sessionId)}${topRoleLabel ? `&path=${encodeURIComponent(topRoleLabel)}` : ""}`
    : "";
  const sec = (title: string, body: string) =>
    `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;"><h2 style="font-size:16px;margin:0 0 10px;">${title}</h2>${body}</div>`;

  const roles = (r.topRoles || [])
    .map(
      (t: any) => `
      <div style="padding:14px 16px;background:#F0FAF3;border-radius:8px;margin-bottom:10px;">
        <div style="font-size:15px;font-weight:600;">${esc(t.role)}</div>
        <div style="font-size:13px;color:#1B1B1E;margin-top:4px;line-height:1.6;">${esc(t.whyYou)}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:6px;">💰 ${esc(t.salaryRange)} &nbsp;·&nbsp; ⏱ ${esc(t.timeline)}</div>
        <div style="font-size:13px;color:#6B7280;margin-top:6px;"><b>Entry path:</b> ${esc(t.entryPath)}</div>
        <div style="font-size:13px;color:#2D6A4F;margin-top:4px;"><b>First move:</b> ${esc(t.firstMove)}</div>
      </div>`
    )
    .join("");

  const weeks = (r.thirtyDayPlan || [])
    .map(
      (w: any) => `
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:700;color:#2D6A4F;text-transform:uppercase;">${esc(w.week)} — ${esc(w.theme)}</div>
        ${(w.actions || []).map((a: string) => `<div style="font-size:13px;color:#6B7280;padding:2px 0 2px 14px;line-height:1.6;">→ ${esc(a)}</div>`).join("")}
      </div>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,'DM Sans',sans-serif;color:#1B1B1E;">
<div style="max-width:680px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:20px;font-weight:700;color:#2D6A4F;font-family:Georgia,serif;">SLP Transitions</div>
    <div style="font-size:13px;color:#6B7280;">Your Pivot Report</div>
  </div>
  ${r.headline ? `<p style="font-size:16px;line-height:1.7;font-weight:500;">${esc(r.headline)}</p>` : ""}
  ${
    r.readinessProfile
      ? sec(
          `Your profile: ${esc(r.readinessProfile.profile)}`,
          `<div style="font-size:14px;line-height:1.7;">${esc(r.readinessProfile.meaning)}</div>
           <div style="font-size:13px;color:#92400E;background:#FEF3C7;border-radius:6px;padding:8px 12px;margin-top:10px;"><b>Watch out for:</b> ${esc(r.readinessProfile.watchOutFor)}</div>
           <div style="font-size:13px;color:#065F46;background:#D1FAE5;border-radius:6px;padding:8px 12px;margin-top:8px;"><b>Your underrated strength:</b> ${esc(r.readinessProfile.superpower)}</div>`
        )
      : ""
  }
  ${
    r.phase
      ? (() => {
          const arc = [
            ["Ground", "Get clear on what you actually want and what you already have."],
            ["Explore", "Research real roles and talk to people who've made the jump."],
            ["Test", "Run small, low-risk experiments to build proof and confidence."],
            ["Leap", "Apply, interview, and negotiate with materials that land."],
          ];
          const idx = arc.findIndex(([n]) => n.toLowerCase() === String(r.phase.name || "").toLowerCase());
          const steps = arc
            .map(([n, blurb], i) => {
              const cur = i === idx;
              return `<div style="padding:8px 12px;border-radius:6px;margin-bottom:5px;border:1px solid ${cur ? "#2D6A4F" : "#E5E7EB"};background:${cur ? "#F0FAF3" : "#fff"};opacity:${idx > -1 && i < idx ? "0.6" : "1"};">
                <span style="font-size:13px;font-weight:${cur ? 700 : 600};color:${cur ? "#2D6A4F" : "#1B1B1E"};">${i + 1}. ${esc(n)}${cur ? " ← you are here" : ""}</span>
                <div style="font-size:12px;color:#6B7280;margin-top:2px;">${esc(blurb)}</div>
              </div>`;
            })
            .join("");
          return sec(
            `Where you are: Stage ${Math.max(1, idx + 1)} of 4 — ${esc(r.phase.name)}`,
            `<div style="font-size:14px;line-height:1.7;">${esc(r.phase.diagnosis)}</div>
             <div style="font-size:13px;margin-top:8px;"><b>Focus now:</b> ${esc(r.phase.focusNow)}</div>
             <div style="font-size:13px;color:#6B7280;margin-top:4px;"><b>Not yet:</b> ${esc(r.phase.notYet)}</div>
             <div style="font-size:11px;font-weight:600;color:#6B7280;letter-spacing:0.04em;margin:14px 0 8px;">THE FOUR STAGES OF A TRANSITION</div>
             ${steps}`
          );
        })()
      : ""
  }
  ${roles ? sec("Your top 3 realistic paths", roles) : ""}
  ${weeks ? sec("Your 30-day starter plan", weeks) : ""}
  ${
    (r.outreach?.messages || []).length
      ? sec(
          "Your outreach scripts",
          `${r.outreach.why ? `<div style="font-size:14px;color:#6B7280;line-height:1.7;margin-bottom:12px;">${esc(r.outreach.why)}</div>` : ""}
           ${(r.outreach.whoToMessage || []).map((w: string) => `<div style="font-size:13px;color:#6B7280;padding:2px 0 2px 14px;line-height:1.6;">→ ${esc(w)}</div>`).join("")}
           ${(r.outreach.messages || [])
             .map(
               (m: any) => `<div style="margin-top:14px;">
                 <div style="font-size:13px;font-weight:600;margin-bottom:5px;">${esc(m.scenario)}</div>
                 <div style="font-size:14px;line-height:1.7;padding:12px 14px;background:#FEFEFE;border:1px solid #E5E7EB;border-radius:8px;">${nl2br(m.template)}</div>
               </div>`
             )
             .join("")}
           ${r.outreach.followUp ? `<div style="font-size:13px;color:#6B7280;line-height:1.6;margin-top:12px;"><b>Following up:</b> ${esc(r.outreach.followUp)}</div>` : ""}`
        )
      : ""
  }

  ${
    (r.honestTruths || []).length
      ? sec("The honest part", (r.honestTruths as string[]).map((h) => `<div style="font-size:14px;line-height:1.7;padding:6px 0;">• ${esc(h)}</div>`).join(""))
      : ""
  }
  ${r.closing ? `<p style="font-size:14px;line-height:1.75;font-style:italic;">${nl2br(r.closing)}</p>` : ""}
  <div style="padding:24px;background:#F0FAF3;border:1px solid #D8F3DC;border-radius:12px;margin-top:24px;">
    <div style="font-size:18px;font-weight:700;margin-bottom:8px;text-align:center;">Next: turn this into an application</div>
    <div style="font-size:14px;color:#1B1B1E;line-height:1.7;margin-bottom:14px;">
      When you find a posting for ${esc(topRoleLabel || "one of these roles")}, the <b>Career Pivot Suite</b> rewrites your actual resume for that specific job:
    </div>
    <div style="font-size:13px;color:#1B1B1E;line-height:1.9;margin-bottom:16px;">
      ✓ Every bullet translated into that employer's language<br/>
      ✓ A cover letter in your voice — it can match a writing sample<br/>
      ✓ Which of the job's requirements you already meet, and how to close the rest<br/>
      ✓ The screening questions that filter out career changers, answered<br/>
      ✓ LinkedIn headline + About section, and a 90-day plan<br/>
      ✓ Editable Word docs, and you can refine any section until it sounds like you
    </div>
    <div style="text-align:center;">
      <a href="${APP_URL}${continueParam}" style="display:inline-block;padding:14px 32px;background:#2D6A4F;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">Get the full package — $24 →</a>
      <div style="font-size:12px;color:#6B7280;margin-top:10px;">
        ${continueParam ? "Your resume is already saved — just add the job posting. " : ""}Free preview first. One-time payment, no subscription, 30-day refund.
      </div>
    </div>
  </div>
  <p style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:32px;">SLP Transitions • Your degree isn't a prison. Your skills compound.</p>
</div>
</body></html>`;

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Pivot Report is ready",
    html,
  });
}

export async function sendFullResultsEmail(input: FullResultsEmailInput): Promise<void> {
  const { to, jobTitle, results } = input;
  const html = renderResultsHTML(jobTitle, results);
  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your SLP → ${jobTitle} Translation Package`,
    html,
  });
}

/**
 * Operational alert to the owner. Fired from the Stripe webhook on every
 * completed checkout, so a purchase that fails to fulfil is noticed within
 * seconds instead of whenever someone next opens the Stripe dashboard.
 * Deliberately plain text — this is a pager, not a newsletter.
 */
export async function sendOpsAlert(input: {
  subject: string;
  lines: string[];
}): Promise<void> {
  const to = process.env.OPS_ALERT_EMAIL || "jamoberges@gmail.com";
  const body = input.lines.map((l) => esc(l)).join("<br/>");
  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: input.subject,
    html: `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;line-height:1.7;color:#1F2937">${body}</div>`,
  });
}
