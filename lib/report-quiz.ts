import { PATHS, QUESTIONS, STAGES, STAGE_KEYS, type QuizSnapshot, type StageKey } from "./quiz";
import { STAGE_OPTIONS } from "./companies";

/**
 * The quiz edition of the $9 Pivot Report: built from the nine quiz answers
 * the moment payment clears, so nobody pays and then waits on a résumé.
 * (Six of the first eight buyers never uploaded one, and none of the six
 * September buyers ever received a report.) A résumé can be added afterwards
 * to rebuild it around their experience, once, free.
 */

// Quiz stage (how it feels) → intake stage (what they've done). A best guess
// the buyer can change on /report; "panic" has usually only read, not talked.
const QUIZ_TO_INTAKE_STAGE: Record<string, string> = {
  private: "thinking", guilt: "thinking", permission: "reading", panic: "reading", action: "applying",
};

export function intakeStageLabel(stageKey?: string | null): string {
  const id = stageKey ? QUIZ_TO_INTAKE_STAGE[stageKey] : "";
  return STAGE_OPTIONS.find((o) => o.id === id)?.label || "";
}

export function slugForRoleOption(roleOption?: string | null): string | null {
  if (!roleOption) return null;
  return Object.values(PATHS).find((p) => p.roleOption === roleOption)?.slug || null;
}

/** Accept only known question ids, option indexes, path slugs and stage keys. */
export function sanitizeQuizSnapshot(raw: any): QuizSnapshot | null {
  if (!raw || typeof raw !== "object" || typeof raw.top !== "string" || !PATHS[raw.top]) return null;
  const a: Record<string, number[]> = {};
  if (raw.a && typeof raw.a === "object") {
    for (const q of QUESTIONS) {
      const v = raw.a[q.id];
      if (!Array.isArray(v)) continue;
      const idx = v.filter((i: any) => Number.isInteger(i) && i >= 0 && i < q.options.length).slice(0, q.options.length);
      if (idx.length) a[q.id] = idx;
    }
  }
  return {
    a,
    top: raw.top,
    ru: typeof raw.ru === "string" && PATHS[raw.ru] && raw.ru !== raw.top ? raw.ru : null,
    st: typeof raw.st === "string" && (STAGE_KEYS as string[]).includes(raw.st) ? raw.st : null,
  };
}

/** The answers in the reader's own words, one line per question. */
export function quizAnswerLines(snap: QuizSnapshot): string[] {
  const lines: string[] = [];
  for (const q of QUESTIONS) {
    const idx = snap.a?.[q.id];
    if (!idx?.length) continue;
    const picked = idx.map((i) => q.options[i]?.label).filter(Boolean);
    if (picked.length) lines.push(`${q.prompt} → ${picked.join("; ")}`);
  }
  if (!snap.a?.stage?.length && snap.st && STAGES[snap.st as StageKey]) {
    lines.push(`Which of these sounds most like right now? → ${STAGES[snap.st as StageKey].label}`);
  }
  return lines;
}

const squash = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
function pathForRole(role: string) {
  const want = squash(role || "");
  const all = Object.values(PATHS);
  return all.find((p) => squash(p.label) === want || squash(p.roleOption) === want)
    || all.find((p) => want.startsWith(squash(p.label)) || want.startsWith(squash(p.roleOption)))
    || null;
}
function dashless(v: any): any {
  if (typeof v === "string") return v.replace(/\s*—\s*/g, ", ").replace(/, ,/g, ",");
  if (Array.isArray(v)) return v.map(dashless);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dashless(x)]));
  return v;
}

/**
 * Last pass over a generated report, both editions. The model is told all of
 * this and still drifts, so the code makes it true: no em dashes anywhere a
 * buyer reads (James's rule), and in the quiz edition every path carries its
 * documented range and timeline from PATHS, never the model's own figures.
 */
export function tidyReport(report: any, edition: "quiz" | "resume"): any {
  const r = dashless(report);
  if (edition === "quiz" && Array.isArray(r.topRoles)) {
    r.topRoles = r.topRoles.map((t: any) => {
      const p = pathForRole(t?.role);
      if (!p) return t;
      const tl = p.timeline.charAt(0).toUpperCase() + p.timeline.slice(1);
      return { ...t, role: p.label, salaryRange: p.range, timeline: tl };
    });
  }
  return r;
}
