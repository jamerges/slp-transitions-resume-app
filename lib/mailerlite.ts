// MailerLite subscriber sync. Kept in one place so the group/field names can't
// drift between the quiz route and the two finalize routes.
//
// IMPORTANT: MailerLite silently ignores `fields` keys that don't exist on the
// account. The quiz wrote `quiz_result` for months against a field that was
// never created, so every taker's path was dropped. The fields below exist
// (created 2026-08-01); adding a new one here means creating it in MailerLite
// too, or it will fail the same silent way.

const API = "https://connect.mailerlite.com/api";

/** Per-quiz-path groups, so a sequence can target one path's takers. */
export const QUIZ_PATH_GROUPS: Record<string, string> = {
  "Customer Success / Implementation": "194651287211476747",
  "Project / Program Management": "194651287961207874",
  "Healthcare Data / Analytics": "194651288674239817",
  "Clinical Liaison / Utilization Review": "194651289392514526",
  "Clinical Informatics / EHR": "194651290097157641",
  "Instructional Design / Learning": "194651290808092182",
  "Content / Marketing": "194651291552581188",
  "Clinical Educator / Trainer": "194651292277147519",
};

export const CUSTOMER_GROUPS = {
  report: "194651292982838675",  // $9 Pivot Report
  suite: "194651293732570803",   // $24 Career Pivot Suite
} as const;

export async function upsertSubscriber(input: {
  email: string;
  name?: string;
  groups?: string[];
  fields?: Record<string, string>;
}): Promise<boolean> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey || !input.email) return false;

  const groups = (input.groups || []).filter(Boolean);
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.fields || {})) {
    if (v) fields[k] = v;
  }
  if (input.name) fields.name = input.name;

  try {
    const resp = await fetch(`${API}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email: input.email, groups, fields }),
    });
    if (!resp.ok) {
      console.error("[mailerlite]", resp.status, (await resp.text()).slice(0, 240));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mailerlite] failed", e);
    return false;
  }
}
