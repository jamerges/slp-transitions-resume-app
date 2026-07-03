import { Resend } from "resend";

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
          <h2 style="font-size:16px;margin:0 0 12px;">ATS-Optimized Skills</h2>
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
    interviews
      ? `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:16px;">
          <h2 style="font-size:16px;margin:0 0 12px;">Interview Bridge Statements</h2>
          ${interviews}
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
