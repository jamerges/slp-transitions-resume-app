"use client";
// Interactive tools mounted from lesson JSON via {"type":"tool","name":"..."}.
// Each tool saves into the lesson's answer slot (or a shared slot) through
// the same progress store as everything else.
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { PATHS } from "@/lib/quiz";
import { ENERGY_PATHS } from "@/lib/course";
import { pathImage } from "@/lib/quiz";
import { ROLES, rolesFor, formatUpdated } from "@/lib/open-roles";
import { COMPANIES_DB, COMPANY_COUNT } from "@/lib/companies";
import { Btn, Panel, Slider, font } from "./ui";
import { Script } from "./Blocks";

export interface ToolProps { name: string; pathSlug?: string; shared: Record<string, any>; setShared: (key: string, v: any) => void; finish?: (o?: { action?: boolean }) => void; done?: boolean; /** true = saved to the purchase and shown on any device; false = this browser only */ synced?: boolean | null }

const H = ({ children }: { children: ReactNode }) => <h3 style={{ fontFamily: font.serif, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{children}</h3>;
const Muted = ({ children }: { children: ReactNode }) => <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 12px" }}>{children}</p>;
const input: React.CSSProperties = { width: "100%", padding: "9px 12px", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, background: "var(--card)" };
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const rangeLo = (s: string) => Number((s.replace(/,/g, "").match(/\d+/g) || ["0"])[0]);
const rangeHi = (s: string) => { const m = (s.replace(/,/g, "").match(/\d+/g) || ["0"]).map(Number); return m[m.length - 1] || 0; };
const rangeMid = (s: string) => { const m = s.replace(/,/g, "").match(/\d+/g)?.map(Number) || []; return m.length >= 2 ? (m[0] + m[1]) / 2 : m[0] || 0; };

export function Tool(props: ToolProps) {
  switch (props.name) {
    case "path-map": return <PathMap {...props} />;
    case "pivot-report": return <PivotReport {...props} />;
    case "path-deep-dive": return <PathDeepDive {...props} />;
    case "contact-tracker": return <ContactTracker {...props} />;
    case "contact-tracker-warm": return <ContactTracker {...props} goal="warm" />;
    case "prompt-kit": return <PromptKit {...props} />;
    case "translation-pairs": return <TranslationPairs {...props} />;
    case "number-mining": return <NumberMining {...props} />;
    case "suite-link": return <SuiteLink {...props} />;
    case "linkedin-checklist": return <Checklist {...props} slot="linkedin" items={LINKEDIN} title="LinkedIn, one pass" />;
    case "application-tracker": return <ApplicationTracker {...props} />;
    case "artifact-menu": return <ArtifactMenu {...props} />;
    case "runway-calculator": return <Runway {...props} />;
    case "bridge-builder": return <BridgeBuilder {...props} />;
    case "screening-questions": return <ScreeningQuestions />;
    case "mock-interview": return <MockInterview {...props} />;
    case "offer-checklist": return <Checklist {...props} slot="offer" items={OFFER} title="Before you say yes" />;
    case "time-budget": return <TimeBudget {...props} />;
    case "questions-asked": return <Report {...props} kind="questions" />;
    case "landed": return <Report {...props} kind="landed" />;
    default: return <Panel tone="warm">Tool &ldquo;{props.name}&rdquo; is not built yet.</Panel>;
  }
}

/* ------------------------------ path map (2.1) ------------------------------ */
const TIERS: { title: string; blurb: string; slugs: string[] }[] = [
  { title: "Out in weeks", blurb: "Your license is the credential. Postings you already qualify for are live today.", slugs: ["liaison-ur", "clinical-educator", "leadership", "research-coordinator"] },
  { title: "Six to twelve months", blurb: "Some vocabulary and one proof piece, then applications.", slugs: ["customer-success", "sales-bd", "content-marketing", "instructional-design"] },
  { title: "Twelve to twenty-four months", blurb: "Real upskilling. Higher ceilings, longer runway.", slugs: ["project-management", "data-analysis", "informatics"] },
];
/** The twenty paths, read against what Module 1 already knows about you.
 *  The public article can list these; it cannot tell you that three of them
 *  sit under the pay floor you set in lesson 0.2, or that two line up with the
 *  tasks you marked as energising. That difference is the product. */
export function PathMap({ shared }: ToolProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [onlyFits, setOnlyFits] = useState(false);

  const dialTop: string[] = shared["1.5"]?.top || [];
  const energy: Record<string, "up" | "down" | undefined> = shared["1.4"]?.energy || {};
  const floorIdx: number = shared["0.2"]?.floor ?? -1;
  const hasModule1 = dialTop.length > 0 || Object.keys(energy).length > 0;

  // Tasks marked "gave energy" point at paths (the mapping lives in the audit).
  const energyHits = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [task, v] of Object.entries(energy)) {
      if (v !== "up") continue;
      for (const slug of ENERGY_PATHS[task] || []) c[slug] = (c[slug] || 0) + 1;
    }
    return c;
  }, [energy]);

  // "Must match my SLP pay from day one" is floor 0. The SLP median is $97,870,
  // so a band whose top sits under that cannot clear the floor they set. A
  // dollar floor from lesson 0.2 (expenses plus tax) is checked the same way.
  const floorDollars: number = shared["0.2"]?.floorDollars || 0;
  const underFloor = (slug: string) => (floorIdx === 0 && rangeHi(PATHS[slug].range) < 97870) || (floorDollars > 0 && rangeHi(PATHS[slug].range) < floorDollars);

  const fits = (slug: string) => dialTop.includes(slug) || (energyHits[slug] || 0) >= 2;
  const shortlist = Object.keys(PATHS).filter((s) => fits(s) && !underFloor(s));

  return (
    <div>
      {hasModule1 && (
        <Panel tone="soft" style={{ marginBottom: 16 }}>
          <H>Read against your Module 1 answers</H>
          {shortlist.length > 0 ? (
            <>
              <Muted>
                {shortlist.length === 1 ? "One path lines up" : `${shortlist.length} paths line up`} with the dials you set and the tasks you marked as energising.
                Everything else stays on the map, because the point of this lesson is to see the whole thing once.
              </Muted>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {shortlist.map((s) => (
                  <span key={s} style={{ fontSize: 13, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: "var(--card)", border: "1.5px solid var(--accent)", color: "var(--accent)" }}>
                    {PATHS[s].icon} {PATHS[s].label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Muted>Your dials and what you marked as energising do not agree yet, which is common and not a problem. Read the whole map first, then come back to lesson 1.5 and move the dials to where you actually are this month.</Muted>
          )}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer", color: "var(--text)" }}>
            <input type="checkbox" checked={onlyFits} onChange={(e) => setOnlyFits(e.target.checked)} />
            Show only these
          </label>
        </Panel>
      )}

      {TIERS.map((t, ti) => {
        const slugs = t.slugs.filter((s) => !onlyFits || fits(s));
        if (!slugs.length) return null;
        return (
        <div key={t.title} className="tos-rise" style={{ animationDelay: `${ti * 120}ms`, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: font.serif, fontSize: 19, fontWeight: 700 }}>{t.title}</span><span style={{ fontSize: 13, color: "var(--muted)" }}>{t.blurb}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
            {slugs.map((s) => { const p = PATHS[s]; const on = open === s; const fit = fits(s); const low = underFloor(s); return (
              <button key={s} type="button" onClick={() => setOpen(on ? null : s)} className="tos-card-hover" style={{ textAlign: "left", background: on ? "var(--accent-bg-subtle)" : "var(--card)", border: `1.5px solid ${on ? "var(--accent)" : fit ? "var(--accent-bg)" : "var(--border)"}`, borderRadius: 12, padding: 12, cursor: "pointer", fontFamily: font.sans, opacity: low ? 0.72 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 22 }}>{p.icon}</div>
                  {fit && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--accent)", background: "var(--accent-bg)", padding: "3px 7px", borderRadius: 999 }}>Fits you</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>{p.range}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>typically {p.timeline}</div>
                {low && <div style={{ fontSize: 11.5, color: "#92400E", marginTop: 5, lineHeight: 1.4 }}>Below the income floor you set</div>}
                {fit && (energyHits[s] || 0) >= 2 && <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 5, lineHeight: 1.4 }}>{energyHits[s]} of the tasks you marked as energising point here</div>}
                {fit && (energyHits[s] || 0) < 2 && dialTop.includes(s) && <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 5, lineHeight: 1.4 }}>One of your top three on the dials</div>}
                {on && <div className="tos-fade" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8, color: "var(--text)" }}><b>The catch:</b> {p.caveat}</div>}
              </button>); })}
          </div>
        </div>
      ); })}
      <Muted>Tap a card for the catch. Ranges are the documented bands from the research file; timelines are what documented transitions took.</Muted>
    </div>
  );
}

/* ---------------------------- pivot report (2.6) ---------------------------- */
function PivotReport({ pathSlug }: ToolProps) {
  const p = pathSlug ? PATHS[pathSlug] : undefined;
  const href = `/?from=quiz&goal=report${p ? `&path=${encodeURIComponent(p.roleOption)}` : ""}`;
  return (
    <Panel tone="soft">
      <H>Your Pivot Report</H>
      <Muted>Included with the program. It reads your actual résumé and tells you which paths your experience already qualifies you for, the stage you&rsquo;re in, and a 30-day plan. About four minutes.</Muted>
      <Btn href={href}>Build my Pivot Report →</Btn>
      {p && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>It starts from {p.label}, your current path. Change it any time.</div>}
    </Panel>
  );
}

/* --------------------------- path deep-dive (2.7) --------------------------- */
function PathDeepDive({ pathSlug, shared }: ToolProps) {
  const suggested: string[] = pathSlug ? [pathSlug, ...(shared["1.5"]?.top || []).filter((s: string) => s !== pathSlug)].slice(0, 2) : (shared["1.5"]?.top || []).slice(0, 2);
  // Every path stays openable: people try several on before Module 4 narrows to one.
  const [all, setAll] = useState(false);
  const candidates: string[] = all ? Object.keys(PATHS) : (suggested.length ? suggested : Object.keys(PATHS).slice(0, 2));
  const [slug, setSlug] = useState<string>(suggested[0] || "customer-success");
  const p = PATHS[slug];
  const roles = rolesFor(slug).slice(0, 8);
  const companies = COMPANIES_DB.filter((c) => c.roles.some((r) => r.toLowerCase().includes(p.roleOption.split(" /")[0].toLowerCase().split(" ")[0]))).slice(0, 8);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {candidates.map((s) => <button key={s} type="button" onClick={() => setSlug(s)} style={{ padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${s === slug ? "var(--accent)" : "var(--border)"}`, background: s === slug ? "var(--accent-bg-subtle)" : "var(--card)", color: s === slug ? "var(--accent)" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font.sans }}>{PATHS[s].icon} {PATHS[s].label}</button>)}
        {!all && <button type="button" onClick={() => setAll(true)} style={{ padding: "7px 12px", borderRadius: 999, border: "1.5px dashed var(--border)", background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font.sans }}>Try another path</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="tos-two-col">
        <Panel>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pathImage(slug)} alt="" style={{ width: "100%", borderRadius: 10, display: "block", marginBottom: 10 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6 }}><b>Door in:</b> {p.entryDoor}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8 }}><b>First move:</b> {p.firstMove}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 8, padding: "8px 12px", background: "var(--warn-bg)", borderRadius: 8 }}><b>The catch:</b> {p.caveat}</div>
        </Panel>
        <div>
          <Panel style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Open this week · updated {formatUpdated()}</div>
            {roles.length ? roles.map((r) => <a key={r.url} href={r.url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 13.5, lineHeight: 1.45, padding: "6px 0", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "var(--text)" }}><b>{r.company}</b> · {r.title}<span style={{ color: "var(--muted)" }}> · {r.remote ? "Remote" : r.location}</span></a>) : <div style={{ fontSize: 13.5, color: "var(--muted)" }}>Nothing matched this week. The full board is at /jobs.</div>}
            <a href={`/jobs/${slug}`} style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--accent)" }}>All {slug} openings ↗</a>
          </Panel>
          <Panel>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Companies that have listed roles like this</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{(companies.length ? companies : COMPANIES_DB.slice(0, 8)).map((c) => <a key={c.name} href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", textDecoration: "none", color: "var(--text)" }}>{c.name}</a>)}</div>
            <a href="/companies" style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--accent)" }}>All {COMPANY_COUNT} companies ↗</a>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- contact tracker (2.9/4.7) -------------------------- */
/* ---------------- your people: the networking CRM (3.1, 3.3, 3.5, 3.6, 3.7) ---------------- */
type Source = "cohort" | "rep" | "left" | "alumni" | "warm" | "cold" | "event" | "recruiter";
type Stage = "to" | "sent" | "replied" | "spoke" | "warm" | "referred" | "closed";
interface Contact {
  // The first version's fields, kept so nothing anyone saved is lost.
  name: string; role: string; where: string; sent: string; replied: boolean; next: string;
  company?: string; source?: Source; stage?: Stage; link?: string;
  last?: string; due?: string; learned?: string; suggested?: string;
  log?: { d: string; what: string }[];
}
const SOURCES: Record<Source, string> = { warm: "Someone I know", cohort: "Grad cohort", left: "An SLP who left", rep: "A rep who sells into my building", alumni: "Alumni search", cold: "Cold, found them", event: "Met at an event", recruiter: "Recruiter" };
const STAGES: Record<Stage, string> = { to: "To message", sent: "Messaged", replied: "Replied", spoke: "Spoke", warm: "Warm", referred: "Referred me", closed: "Closed" };
/** What logging a touch does: the stage it sets and when the next one is due. */
const TOUCHES: { key: string; label: string; stage: Stage; days: number | null }[] = [
  { key: "sent", label: "Sent the first message", stage: "sent", days: 8 },
  { key: "follow", label: "Sent the one follow-up", stage: "sent", days: null },
  { key: "replied", label: "They replied", stage: "replied", days: 2 },
  { key: "spoke", label: "We spoke", stage: "spoke", days: 14 },
  { key: "update", label: "Sent an update", stage: "warm", days: 30 },
  { key: "referred", label: "They referred me", stage: "referred", days: 30 },
  { key: "closed", label: "Let it rest", stage: "closed", days: null },
];
const NEXT_BY_STAGE: Record<Stage, string> = { to: "Send the first message", sent: "Follow up once, then let it rest", replied: "Book the fifteen minutes", spoke: "Tell them you did the thing you said you would", warm: "One four-sentence update", referred: "Tell them how it went", closed: "" };
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const stageOf = (r: Contact): Stage => r.stage || (r.replied ? "replied" : r.sent ? "sent" : "to");
const dueOf = (r: Contact): string => r.due !== undefined ? r.due : (!r.stage && r.sent && !r.replied ? addDays(r.sent, 8) : "");
const IN_CONVERSATION: Stage[] = ["replied", "spoke", "warm", "referred"];
const WARM: Stage[] = ["spoke", "warm", "referred"];

/** The 3.2 and 3.6 scripts with this person's details filled in. [setting] stays yours to fill. */
function fillTemplate(kind: "first" | "follow" | "thanks" | "update", r: Contact, title: string) {
  const name = r.name.replace(/^EXAMPLE:\s*/, "").split(" ")[0] || "[Name]";
  const role = r.role || "[target title]";
  const t = title || role;
  switch (kind) {
    case "first": return `Hi ${name}, I'm an SLP in [setting] and I'm looking at ${t} roles. I found you because you made the same move${r.company ? ` (${r.role || "your role"} at ${r.company})` : ""}, and I'd rather ask you than read another article about it.\n\nWould you be up for 15 minutes in the next couple of weeks? I mostly want to know how you got the first one and what you'd do differently. No job ask, I promise.\n\nEither way, thank you for putting your path somewhere someone like me could find it.\n\n[Your name]`;
    case "follow": return `Hi ${name}, floating this back up in case it got buried.\n\nStill would love 15 minutes on how you got into ${t}. If a call is too much, I'd happily take two sentences by message instead: what surprised you most in your first three months?\n\nThank you either way. [Your name]`;
    case "thanks": return `${name}, thank you for the time. The thing I'm taking away is [one specific sentence they said, in their words].\n\nI'm going to [the one concrete thing you'll do because of it] in the next two weeks, and I'll let you know how it lands.${r.suggested ? ` If ${r.suggested} would be open to the same 15 minutes, I'd be grateful for an introduction whenever it's convenient.` : ""}\n\nThank you again. [Your name]`;
    case "update": return `Hi ${name}, quick update since we talked. I [built the thing / finished the certificate / had a first interview at X]. Still aiming at ${t}, and [the thing they told you] turned out to be right.\n\nNo ask, just wanted you to know it landed. [Your name]`;
  }
}

const CSV_HEAD = ["Name", "Their role", "Company", "Path", "Where I found them", "How I know them", "Date messaged", "Replied?", "Call booked", "What I learned", "Who they suggested next", "Last touch", "Next touch", "Status", "Notes"];
function toCsv(rows: Contact[], path: string) {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [r.name, r.role, r.company || "", path, r.where, r.source ? SOURCES[r.source] : "", r.sent, IN_CONVERSATION.includes(stageOf(r)) ? "Yes" : "No", "", r.learned || "", r.suggested || "", r.last || r.sent, dueOf(r), STAGES[stageOf(r)], r.link || ""].map(q).join(","));
  return [CSV_HEAD.join(","), ...lines].join("\n");
}

const sel: React.CSSProperties = { ...input, padding: "5px 8px", fontSize: 13 };
const small: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--accent)", background: "none", border: "1px solid var(--accent-bg)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: font.sans };

/**
 * One list for everyone the reader is talking to, shared across Module 3.
 * `goal` decides what the lesson's button asks for: three messages sent (3.3)
 * or two conversations warm (3.6). Everything saves as it changes.
 */
function ContactTracker({ shared, setShared, finish, done, pathSlug, synced, goal = "three" }: ToolProps & { goal?: "three" | "warm" }) {
  const rows: Contact[] = shared.contacts || [];
  const title = pathSlug ? PATHS[pathSlug].label.split(" / ")[0] : "";
  const weekGoal: number = Number(shared.contactGoal) || 3;
  const [draft, setDraft] = useState<Contact>({ name: "", role: "", where: "", sent: "", replied: false, next: "", company: "", source: "cold", stage: "to", link: "" });
  const [open, setOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState<string>("");
  const save = (next: Contact[]) => setShared("contacts", next);
  const patch = (i: number, u: Partial<Contact>) => { const n = [...rows]; n[i] = { ...rows[i], ...u }; save(n); };
  const t = today();
  const weekAgo = addDays(t, -7);
  const sentThisWeek = rows.filter((r) => (r.log || []).some((l) => l.what === "sent" && l.d >= weekAgo) || (!r.log && r.sent >= weekAgo)).length;
  const sentCount = rows.filter((r) => stageOf(r) !== "to").length;
  const warmCount = rows.filter((r) => WARM.includes(stageOf(r))).length;
  const dueRows = rows.map((r, i) => ({ r, i })).filter(({ r }) => { const d = dueOf(r); return d && d <= t && stageOf(r) !== "closed"; });
  const logTouch = (i: number, key: string) => {
    const touch = TOUCHES.find((x) => x.key === key); if (!touch) return;
    const r = rows[i];
    patch(i, { stage: touch.stage, last: t, due: touch.days === null ? "" : addDays(t, touch.days), sent: key === "sent" && !r.sent ? t : r.sent, replied: r.replied || IN_CONVERSATION.includes(touch.stage), log: [...(r.log || []), { d: t, what: key }] });
  };
  const copy = (kind: "first" | "follow" | "thanks" | "update", r: Contact) => {
    navigator.clipboard?.writeText(fillTemplate(kind, r, title)).then(() => { setCopied(`${r.name}:${kind}`); setTimeout(() => setCopied(""), 1500); });
  };
  const exportCsv = () => {
    const blob = new Blob([toCsv(rows, title)], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transition-os-people.csv"; a.click(); URL.revokeObjectURL(a.href);
  };
  const ready = goal === "three" ? sentCount >= 3 : warmCount >= 2;
  return (
    <Panel>
      <H>Your people</H>
      <Muted>{goal === "three" ? "Three messages is the action for this lesson. About one in four gets no answer at all, so three sent is usually two conversations." : "Everyone you are talking to, in one place. Log what happened and it tells you who is due and what the next touch is."}</Muted>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }} className="tos-two-col">
        {[["Due now", dueRows.length], ["Sent this week", `${sentThisWeek} of ${weekGoal}`], ["In conversation", rows.filter((r) => IN_CONVERSATION.includes(stageOf(r))).length], ["Referred you", rows.filter((r) => stageOf(r) === "referred").length]].map(([l, n]) => (
          <div key={String(l)} style={{ background: "var(--bg)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{l}</div></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--muted)", marginBottom: 12, flexWrap: "wrap" }}>
        <span>Messages a week you are aiming for:</span>
        <input type="number" min={1} max={20} value={weekGoal} onChange={(e) => setShared("contactGoal", Number(e.target.value) || 1)} style={{ ...sel, width: 60 }} />
        <span>Two while you are building, five once you are applying.</span>
      </div>
      {dueRows.length > 0 && (
        <Panel tone="soft" style={{ marginBottom: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Due</div>
          {dueRows.map(({ r, i }) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "6px 0", borderTop: "1px solid var(--border)", fontSize: 14 }}>
              <b>{r.name}</b><span style={{ color: "var(--muted)" }}>{NEXT_BY_STAGE[stageOf(r)]}</span>
              <select value="" onChange={(e) => e.target.value && logTouch(i, e.target.value)} style={{ ...sel, width: "auto", marginLeft: "auto" }}><option value="">Log what happened…</option>{TOUCHES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
            </div>
          ))}
        </Panel>
      )}
      {rows.length > 0 && (
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}><th style={{ padding: "6px 8px" }}>Who</th><th style={{ padding: "6px 8px" }}>Source</th><th style={{ padding: "6px 8px" }}>Stage</th><th style={{ padding: "6px 8px" }}>Next touch</th><th style={{ padding: "6px 8px" }}>Log</th><th /></tr></thead>
            <tbody>{rows.map((r, i) => (
              <Fragment key={i}>
                <tr style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}><button type="button" onClick={() => setOpen(open === i ? null : i)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: font.sans, fontSize: 13.5, color: "var(--text)" }}><b>{r.name}</b>{open === i ? " ▾" : " ▸"}<div style={{ fontSize: 12, color: "var(--muted)" }}>{r.role}{r.company ? ` · ${r.company}` : r.where ? ` · ${r.where}` : ""}</div></button></td>
                  <td style={{ padding: "8px" }}><select value={r.source || ""} onChange={(e) => patch(i, { source: e.target.value as Source })} style={sel}><option value="">…</option>{(Object.keys(SOURCES) as Source[]).map((k) => <option key={k} value={k}>{SOURCES[k]}</option>)}</select></td>
                  <td style={{ padding: "8px" }}><select value={stageOf(r)} onChange={(e) => patch(i, { stage: e.target.value as Stage })} style={sel}>{(Object.keys(STAGES) as Stage[]).map((k) => <option key={k} value={k}>{STAGES[k]}</option>)}</select></td>
                  <td style={{ padding: "8px" }}><input type="date" value={dueOf(r)} onChange={(e) => patch(i, { due: e.target.value })} style={sel} /></td>
                  <td style={{ padding: "8px" }}><select value="" onChange={(e) => e.target.value && logTouch(i, e.target.value)} style={sel}><option value="">Log…</option>{TOUCHES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></td>
                  <td style={{ padding: "8px" }}><button type="button" onClick={() => save(rows.filter((_, k) => k !== i))} style={{ background: "none", border: "none", color: "var(--light)", cursor: "pointer" }} aria-label="Remove">×</button></td>
                </tr>
                {open === i && (
                  <tr><td colSpan={6} style={{ padding: "4px 8px 12px", background: "var(--bg)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }} className="tos-two-col">
                      <div><label style={{ fontSize: 12, fontWeight: 600 }}>What I learned</label><textarea value={r.learned || ""} onChange={(e) => patch(i, { learned: e.target.value })} rows={3} placeholder="Their words, not yours. The credential their employer required, the part of clinical work that transferred." style={{ ...input, resize: "vertical" }} /></div>
                      <div><label style={{ fontSize: 12, fontWeight: 600 }}>Who they suggested next</label><input value={r.suggested || ""} onChange={(e) => patch(i, { suggested: e.target.value })} placeholder="A name, and where" style={input} />
                        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginTop: 8 }}>Profile link</label><input value={r.link || ""} onChange={(e) => patch(i, { link: e.target.value })} placeholder="linkedin.com/in/…" style={input} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 12.5 }}>
                      <span style={{ color: "var(--muted)" }}>Copy, with their name in it:</span>
                      {([["first", "First message"], ["follow", "Follow-up"], ["thanks", "Thank-you"], ["update", "Monthly update"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => copy(k, r)} style={small}>{copied === `${r.name}:${k}` ? "Copied ✓" : l}</button>)}
                    </div>
                    {(r.log || []).length > 0 && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{(r.log || []).map((l, k) => <span key={k}>{l.d} {TOUCHES.find((x) => x.key === l.what)?.label.toLowerCase()}{k < (r.log || []).length - 1 ? " · " : ""}</span>)}</div>}
                  </td></tr>
                )}
              </Fragment>
            ))}</tbody>
          </table>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, alignItems: "end" }}>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Name</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Their role</label><input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} style={input} placeholder="Implementation specialist" /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Company</label><input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} style={input} placeholder="Presence" /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>How I know them</label><select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as Source })} style={input}>{(Object.keys(SOURCES) as Source[]).map((k) => <option key={k} value={k}>{SOURCES[k]}</option>)}</select></div>
        <Btn onClick={() => { if (!draft.name.trim()) return; save([...rows, { ...draft, where: draft.source ? SOURCES[draft.source] : "", stage: "to", due: t }]); setDraft({ ...draft, name: "", role: "", company: "", link: "" }); }}>Add</Btn>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {finish && <Btn onClick={() => finish({ action: true })} disabled={!ready || done}>{done ? "Logged ✓" : goal === "three" ? `I sent ${Math.min(3, sentCount)} of 3` : `${Math.min(2, warmCount)} of 2 conversations warm`}</Btn>}
        {finish && <span style={{ fontSize: 13, color: "var(--muted)" }}>{goal === "three" ? (ready ? "Three sent. Log it and the badge is yours." : `${3 - sentCount} more to go. Log “Sent the first message” on each.`) : (ready ? "Two warm. Keep the monthly update going." : "Warm means you have spoken and sent at least one update.")}</span>}
        {rows.length > 0 && <button type="button" onClick={exportCsv} style={{ ...small, marginLeft: "auto" }}>Download as a sheet (CSV)</button>}
      </div>
      {synced !== null && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{synced ? "Saved to your purchase, so this list is here on any device you open the course on." : "Saved in this browser."}</div>}
    </Panel>
  );
}

/* ------------------ prompt kit: what to hand the model (3.8) ------------------ */
/**
 * Prompts for ChatGPT or Claude, filled with the reader's own details, each
 * with a copy button. The model does the research, the first draft and the
 * rehearsal; the reader keeps the specifics and the send (lesson 4.4's rule).
 */
function PromptKit({ shared, setShared, pathSlug }: ToolProps) {
  const title = pathSlug ? PATHS[pathSlug].label.split(" / ")[0] : "[target title]";
  const [company, setCompany] = useState<string>(shared.promptKit?.company || "");
  const [person, setPerson] = useState<string>(shared.promptKit?.person || "");
  const numbers: string = shared.numbers && Object.values(shared.numbers).some(Boolean) ? numbersAsText(shared.numbers) : "[three bullets from your résumé, each with a number in it]";
  const co = company.trim() || "[company]";
  const who = person.trim() || "[their name and title]";
  const rules = "Write the way a person talks. No greeting like \"I hope this finds you well\", no \"leverage\", \"passionate\", \"spearheaded\" or \"cutting-edge\", no adjective where a number could go, nothing in threes, no em dashes. Keep every specific detail I gave you and invent none.";
  const prompts: { title: string; when: string; text: string }[] = [
    { title: "Research a person before you message them", when: "Ten minutes before the first message. Paste their profile text, not a screenshot.", text: `I'm an SLP moving into ${title} roles. Below is the LinkedIn profile of ${who}, who made a similar move. Read it and give me:\n1. Three specific things I could reference that show I actually read it (a job change, a post, a project), each in one line.\n2. One question only they could answer, about how they got the first role.\n3. Which of my experiences below maps most closely to what they do now, and in what words they would describe it.\n\nMy experience:\n${numbers}\n\nProfile:\n[paste here]` },
    { title: "Research a company in ten minutes", when: "Before messaging anyone there, and before any interview.", text: `I'm an SLP looking at ${title} roles at ${co}. Below is text from their site and a job posting. Tell me, in plain sentences:\n1. What they sell and who pays for it.\n2. What a clinician would notice about the product that a non-clinician would not.\n3. Three questions I could ask an employee that show I understand the business, none of which Google could answer.\n4. Which line of the posting is the real requirement and which is decoration.\nMark anything you are inferring rather than reading. I will verify names and claims myself.\n\n[paste their About page, careers page and the posting]` },
    { title: "Draft a first message, the interview-me way", when: "After the research. The draft is a starting point; the send is yours.", text: `I want to send a first message to ${who}${company.trim() ? ` at ${co}` : ""} asking for fifteen minutes about how they moved into ${title}. Before you draft anything, ask me five questions about why I'm writing to this person specifically and what I actually want to know. Wait for my answers. Then write the message under 90 words, no job ask, easy to decline, using my answers and nothing else. ${rules}` },
    { title: "Rehearse the fifteen minutes", when: "The night before a call. Talk out loud; type what you'd say.", text: `Role-play with me. You are ${who}, a ${title} at ${co} who used to be a clinician. I'm an SLP and I have asked you for fifteen minutes about how you got the first role. Play it realistically: you are busy, friendly, and you will get bored if I ask anything I could have Googled. Interrupt me when I do. Start by saying hello and asking what I'm hoping to get out of the call. At the end, tell me the two things I did that made you want to help and the one that made you want to end the call.` },
    { title: "Turn call notes into next steps", when: "Within an hour of hanging up, before the notes go cold.", text: `Below are my rough notes from a fifteen-minute call with ${who}, who works in ${title}. Give me:\n1. The three facts I learned, in their words where I wrote them down.\n2. The person or company they named that I should follow up with.\n3. The one thing I said I would do, as a task with a date two weeks out.\n4. A thank-you message under 60 words that quotes one specific thing they said. ${rules}\n\nNotes:\n[paste here]` },
    { title: "Translate a posting into a checklist", when: "Before you apply, and before the hiring-manager note in 3.7.", text: `Here is a job posting for a ${title} role at ${co}, and here are numbers from my clinical work. Make a two-column list: each requirement in the posting, and which of my experiences answers it, using the posting's own words. Then list the requirements I do not meet and, for each, the cheapest honest way to close it before an interview (a named course, a small project, a conversation). Do not soften a gap and do not invent experience I did not give you.\n\nMy numbers:\n${numbers}\n\nPosting:\n[paste here]` },
    { title: "Find the rooms, then verify them", when: "Once, when you pick a path. Check every name before you rely on it.", text: `List the conferences, LinkedIn groups, Slack or Discord communities and newsletters where people who do ${title} work in health-tech and ed-tech actually gather. For each, say whether it is for practitioners or for job-seekers, and whether a clinician moving in would be welcome. Give me the official name so I can search it; I know you sometimes invent these, so I will verify each one.` },
    { title: "Rewrite the monthly update", when: "When the four sentences will not come.", text: `I'm sending a short update to ${who}, who gave me fifteen minutes about ${title} work a month ago. Since then: [what you did]. They told me: [the thing they said]. Write four sentences: what I did, that I'm still aiming at ${title}, that their advice turned out to be right, and that there is no ask. ${rules}` },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }} className="tos-two-col">
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>The company, if there is one</label><input value={company} onChange={(e) => { setCompany(e.target.value); }} onBlur={() => setShared("promptKit", { company, person })} placeholder="Lingraphica" style={input} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>The person, if there is one</label><input value={person} onChange={(e) => { setPerson(e.target.value); }} onBlur={() => setShared("promptKit", { company, person })} placeholder="Dana R., Implementation Specialist" style={input} /></div>
      </div>
      <Muted>Filled in with your path{shared.numbers ? " and the numbers you mined in 4.3" : ""}. Paste one into ChatGPT or Claude, in a personal account, never a work one.</Muted>
      {prompts.map((pr) => (
        <div key={pr.title} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 4px" }}>{pr.when}</div>
          <Script title={pr.title} text={pr.text} />
        </div>
      ))}
    </div>
  );
}

/* --------------------------- translation pairs (3.2) -------------------------- */
const PAIRS: [string, string][] = [
  ["Managed a caseload of 62 students with IEPs", "Managed a portfolio of 62 concurrent client accounts, each with individual goals, timelines and quarterly reviews"],
  ["Ran IEP meetings with teachers, admin and parents", "Led cross-functional stakeholder meetings to align on goals, timelines and responsibilities"],
  ["Wrote daily therapy notes and progress reports", "Maintained audit-ready project documentation and quarterly outcome reports"],
  ["Helped roll out the new EMR", "Supported a system rollout: trained 14 colleagues, built templates, tracked adoption"],
  ["Convinced a skeptical parent to try a treatment plan", "Handled objections and secured buy-in from resistant stakeholders"],
  ["Explained a diagnosis to a family in plain language", "Translated technical findings into plain-language guidance for non-expert users"],
  ["Tracked session data and adjusted goals", "Analyzed outcome data and made data-driven decisions on a rolling basis"],
  ["Supervised CFs and grad students", "Designed onboarding and mentored new hires through their first year"],
];
function TranslationPairs({ shared, setShared }: ToolProps) {
  const [mine, setMine] = useState<string>(shared.translation?.mine || "");
  const [out, setOut] = useState<string>(shared.translation?.out || "");
  return (
    <div>
      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        {PAIRS.map(([a, b], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: i ? "1px solid var(--border)" : "none" }} className="tos-two-col">
            <div style={{ padding: "10px 14px", fontSize: 14, color: "var(--muted)", borderRight: "1px solid var(--border)" }}>{a}</div>
            <div style={{ padding: "10px 14px", fontSize: 14, background: "var(--accent-bg-subtle)" }}>{b}</div>
          </div>
        ))}
      </div>
      <Panel>
        <H>Now one of yours</H>
        <Muted>Paste one bullet from your résumé exactly as it reads today. Rewrite it on the right using the pattern above: keep the number, swap the nouns, name the outcome.</Muted>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="tos-two-col">
          <textarea value={mine} onChange={(e) => setMine(e.target.value)} rows={3} placeholder="Managed a caseload of…" style={{ ...input, resize: "vertical" }} />
          <textarea value={out} onChange={(e) => setOut(e.target.value)} rows={3} placeholder="Managed a portfolio of…" style={{ ...input, resize: "vertical", background: "var(--accent-bg-subtle)" }} />
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
          <Btn onClick={() => setShared("translation", { mine, out })} disabled={!out.trim()}>Save this pair</Btn>
          {shared.translation?.out && <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>✓ Saved. It goes into the Suite in lesson 3.5.</span>}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------- number mining (3.3) ---------------------------- */
const MINES = [
  ["Caseload size (largest you carried)", "students / clients"],
  ["Sites or buildings you covered", ""],
  ["Evaluations you completed in a year", ""],
  ["Plans you wrote in a year", "IEPs, care plans, treatment plans"],
  ["Meetings you led in a typical month", "IEPs, care conferences, family meetings"],
  ["Families you trained on a home program", "a year, or a caseload's worth"],
  ["Staff you trained on a protocol or device", "AAC, dysphagia precautions, an EMR"],
  ["People you supervised", "CFs, grad students, aides"],
  ["Systems you helped roll out or change", "EMR, scheduling, a new protocol"],
  ["Productivity target you held, and for how long", "e.g. 85% for two years"],
  ["Authorizations, appeals or denials you handled", "a month or a year"],
  ["Discharges or transitions you planned in a month", ""],
  ["Programs, protocols or materials you built that others used", "name them"],
  ["In-services or trainings you delivered", "a year"],
  ["Committees, audits or leadership you were part of", ""],
  ["Documentation hours per week (unpaid ones count)", ""],
  ["One outcome you moved, with a before and after", "e.g. dismissal rate, wait time, goal attainment"],
];
function NumberMining({ shared, setShared }: ToolProps) {
  const v: Record<string, string> = shared.numbers || {};
  const set = (k: string, val: string) => setShared("numbers", { ...v, [k]: val });
  const filled = MINES.filter(([k]) => (v[k] || "").trim()).length;
  return (
    <Panel>
      <H>Numbers you already have</H>
      <Muted>Companies want numbers. You have more than you think; most of them were never written down because nobody asked. Fill what you can. Estimates are fine, and you can write [62] on the résumé if you need to confirm it later.</Muted>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="tos-two-col">
        {MINES.map(([k, hint]) => (
          <div key={k}><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>{k}</label><input value={v[k] || ""} onChange={(e) => set(k, e.target.value)} placeholder={hint} style={input} /></div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: filled ? "var(--accent)" : "var(--muted)", fontWeight: 600 }}>{filled} of {MINES.length} filled. Every one becomes a bullet, and the Suite reads them when you open it from here.</div>
    </Panel>
  );
}

/** The numbers from 4.3 as one block of text the Suite can drop into the résumé step. */
export function numbersAsText(numbers: Record<string, string> | undefined): string {
  if (!numbers) return "";
  const lines = MINES.map(([k]) => [k, (numbers[k] || "").trim()]).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`);
  return lines.length ? `Numbers from my clinical work:\n${lines.join("\n")}` : "";
}

/* ------------------------------ suite link (3.5) ------------------------------ */
function SuiteLink({ pathSlug, shared }: ToolProps) {
  const p = pathSlug ? PATHS[pathSlug] : undefined;
  return (
    <Panel tone="soft">
      <H>Build it in the Suite</H>
      <Muted>The Career Pivot Suite is included. Paste your résumé and one real posting; it translates every bullet, writes the cover letter and the LinkedIn sections, and lets you refine any of six sections until it sounds like you.</Muted>
      {shared.translation?.out && <div style={{ fontSize: 13.5, marginBottom: 10, padding: "8px 12px", background: "var(--card)", borderRadius: 8, border: "1px solid var(--accent-bg)" }}><b>Your saved pair:</b> {shared.translation.out}</div>}
      {shared.numbers && Object.values(shared.numbers as Record<string, string>).some((v) => (v || "").trim()) && (
        <div style={{ fontSize: 13.5, marginBottom: 10, color: "var(--accent)", fontWeight: 600 }}>Your numbers from lesson 4.3 come with you. The Suite offers to add them under your résumé.</div>
      )}
      <Btn href={`/?from=course${p ? `&path=${encodeURIComponent(p.roleOption)}` : ""}`}>Open the Suite →</Btn>
    </Panel>
  );
}

/* ------------------------------ time budget (2.0) ------------------------------ */
function TimeBudget({ shared, setShared }: ToolProps) {
  const v = shared.time || { hours: 6 };
  const hours: number = Number(v.hours) || 0;
  const proof = Math.round(hours * 0.6 * 2) / 2, people = Math.round(hours * 0.3 * 2) / 2, read = Math.max(0, Math.round((hours - proof - people) * 2) / 2);
  return (
    <Panel>
      <H>Hours this week</H>
      <Muted>Be honest rather than ambitious. Six real hours beat fifteen imagined ones, and you can raise it later.</Muted>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <input type="range" min={1} max={20} step={1} value={hours} onChange={(e) => setShared("time", { ...v, hours: Number(e.target.value) })} style={{ flex: 1, minWidth: 180 }} />
        <div style={{ fontFamily: font.serif, fontSize: 26, fontWeight: 700, minWidth: 90 }}>{hours} hrs</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }} className="tos-two-col">
        {[["Proof", proof, "a portfolio piece, a course, a project at work"], ["People", people, "messages, calls, the closed groups"], ["Reading", read, "articles, this course, the subreddit"]].map(([k, n, hint]) => (
          <div key={String(k)} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)" }}>{k as string}</div>
            <div style={{ fontFamily: font.serif, fontSize: 24, fontWeight: 700, margin: "2px 0" }}>{n as number} hrs</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>{hint as string}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>Saved. Your workbook keeps the split.</div>
    </Panel>
  );
}

/* --------------------- reports back to the program (6.4, 7.1) --------------------- */
const LANDED_BANDS = ["Under $50,000", "$50,000 to $69,999", "$70,000 to $89,999", "$90,000 to $109,999", "$110,000 or more", "Prefer not to say"];
/**
 * Two small forms that send something back to James: the questions an SLP was
 * actually asked in an interview, and where they landed. Both go to the ops
 * inbox through a buyer-only route; nothing is published without asking.
 */
function Report({ shared, setShared, kind }: ToolProps & { kind: "questions" | "landed" }) {
  const key = kind === "questions" ? "report_questions" : "report_landed";
  const v = shared[key] || {};
  const [sending, setSending] = useState(false);
  const [state, setState] = useState<"idle" | "sent" | "error">(v.sent ? "sent" : "idle");
  const set = (k: string, val: string) => setShared(key, { ...v, [k]: val });
  const ready = kind === "questions" ? (v.questions || "").trim().length > 20 : !!(v.title || "").trim() && !!v.start;
  const send = async () => {
    setSending(true);
    try {
      const r = await fetch("/api/course/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, payload: v }) });
      if (!r.ok) throw new Error("failed");
      setShared(key, { ...v, sent: true }); setState("sent");
    } catch { setState("error"); } finally { setSending(false); }
  };
  if (kind === "questions") return (
    <Panel>
      <H>What did they actually ask you?</H>
      <Muted>After an interview, while it is fresh: the questions, as close to their words as you can. It goes to James, gets grouped by path, and becomes the question bank the next SLP prepares from. No names, no company unless you want to include it.</Muted>
      <input value={v.role || ""} onChange={(e) => set("role", e.target.value)} placeholder="The role you interviewed for" style={{ ...input, marginBottom: 8 }} />
      <textarea value={v.questions || ""} onChange={(e) => set("questions", e.target.value)} rows={6} placeholder={"One question per line.\nWhy are you leaving clinical work?\nTell me about a time you had to deliver bad news to a customer."} style={{ ...input, resize: "vertical" }} />
      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {state === "sent" ? <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>&#10003; Sent. Thank you. The next person prepares from this.</span>
          : <Btn onClick={send} disabled={!ready || sending}>{sending ? "Sending…" : "Send the questions"}</Btn>}
        {state === "error" && <span style={{ fontSize: 13, color: "var(--muted)" }}>That didn&rsquo;t send. Your text is saved here; try again in a minute.</span>}
      </div>
    </Panel>
  );
  return (
    <Panel>
      <H>Where you landed</H>
      <Muted>Four answers. They become the numbers the next SLP reads before deciding, published only as bands and never with a name.</Muted>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="tos-two-col">
        <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>Title now</label><input value={v.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Implementation Specialist" style={input} /></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>Path</label><input value={v.path || ""} onChange={(e) => set("path", e.target.value)} placeholder="Customer success" style={input} /></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>Starting salary band</label>
          <select value={v.start || ""} onChange={(e) => set("start", e.target.value)} style={input}><option value="">Choose</option>{LANDED_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
        <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>Band now, if it changed</label>
          <select value={v.now || ""} onChange={(e) => set("now", e.target.value)} style={input}><option value="">Same, or too soon to say</option>{LANDED_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {state === "sent" ? <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>&#10003; Sent. Thank you. That row is proof for someone at stage three.</span>
          : <Btn onClick={send} disabled={!ready || sending}>{sending ? "Sending…" : "Send where I landed"}</Btn>}
        {state === "error" && <span style={{ fontSize: 13, color: "var(--muted)" }}>That didn&rsquo;t send. Your answers are saved here; try again in a minute.</span>}
      </div>
    </Panel>
  );
}

/* ------------------------------- checklists ------------------------------- */
const LINKEDIN = [
  "\"Share profile updates with your network\" is off, before you edit anything",
  "Headline names the target role, not the clinical one (\"Customer Success · former SLP\", not \"CCC-SLP\")",
  "About section opens with your pull sentence from the Module 1 checkpoint",
  "Each clinical job has three translated bullets with a number in each",
  "Skills list contains the words from three real postings for your path",
  "Photo is recent and the banner isn't a stock image of a speech bubble",
  "Open-to-work is set to recruiters only, with the target titles typed in",
  "The URL is linkedin.com/in/yourname, so it fits on a résumé",
  "Your résumé is not uploaded as Featured media (your phone number and address would be public)",
  "You follow five companies from your list and one group for the field",
  "You've sent one connection request to someone who made this move",
];
const OFFER = [
  "The base sits inside the documented range for the path (or you know why it doesn't)",
  "Variable pay, if any, is written down: target, how it's measured, when it pays",
  "PTO, remote days and start date were asked about, not assumed",
  "Health coverage start date is known, and the gap (if any) is covered",
  "The loan plan is unchanged, or you know how the payment moves",
  "You asked for time to decide and got at least two business days",
  "You know what vests when (retirement match, pension) and what leaving on your date forfeits, from your own plan documents, not from memory",
  "You said the counter out loud once, to a person, before saying it to them",
];
function Checklist({ shared, setShared, slot, items, title }: ToolProps & { slot: string; items: string[]; title: string }) {
  const v: boolean[] = shared[slot] || items.map(() => false);
  const doneN = v.filter(Boolean).length;
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><H>{title}</H><span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{doneN}/{items.length}</span></div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}><div style={{ height: "100%", width: `${(doneN / items.length) * 100}%`, background: "var(--accent)", transition: "width 300ms" }} /></div>
      {items.map((t, i) => (
        <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: i ? "1px solid var(--border)" : "none", fontSize: 14.5, lineHeight: 1.5, cursor: "pointer", color: v[i] ? "var(--muted)" : "var(--text)", textDecoration: v[i] ? "line-through" : "none" }}>
          <input type="checkbox" checked={!!v[i]} onChange={(e) => { const n = [...v]; n[i] = e.target.checked; setShared(slot, n); }} style={{ marginTop: 4 }} />{t}
        </label>
      ))}
    </Panel>
  );
}

/* -------------------------- application tracker (3.8/5.6) ------------------------ */
interface App { company: string; role: string; posted: string; sent: string; status: "sent" | "screen" | "interview" | "offer" | "no" }
function ApplicationTracker({ shared, setShared, finish, done }: ToolProps) {
  const rows: App[] = shared.apps || [];
  const [d, setD] = useState<App>({ company: "", role: "", posted: "", sent: new Date().toISOString().slice(0, 10), status: "sent" });
  const save = (n: App[]) => setShared("apps", n);
  const counts = { sent: rows.length, screen: rows.filter((r) => ["screen", "interview", "offer"].includes(r.status)).length, interview: rows.filter((r) => ["interview", "offer"].includes(r.status)).length, offer: rows.filter((r) => r.status === "offer").length };
  return (
    <Panel>
      <H>Applications</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {[["Sent", counts.sent], ["Screens", counts.screen], ["Interviews", counts.interview], ["Offers", counts.offer]].map(([l, n]) => <div key={String(l)} style={{ background: "var(--bg)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><div style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{n}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{l}</div></div>)}
      </div>
      <Muted>The documented ratio is roughly 113 tailored applications to 7 interviews to 1 offer. Tracking turns silence into a number you can plan around.</Muted>
      {rows.length > 0 && <div style={{ overflowX: "auto", marginBottom: 10 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12 }}><th style={{ padding: "6px 8px" }}>Company · role</th><th style={{ padding: "6px 8px" }}>Posted</th><th style={{ padding: "6px 8px" }}>Sent</th><th style={{ padding: "6px 8px" }}>Status</th><th /></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
          <td style={{ padding: 8 }}><b>{r.company}</b> · {r.role}</td><td style={{ padding: 8 }}>{r.posted || "?"}</td><td style={{ padding: 8 }}>{r.sent}</td>
          <td style={{ padding: 8 }}><select value={r.status} onChange={(e) => { const n = [...rows]; n[i] = { ...r, status: e.target.value as App["status"] }; save(n); }} style={{ ...input, padding: "4px 8px", fontSize: 13 }}><option value="sent">Sent</option><option value="screen">Screen</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="no">No</option></select></td>
          <td style={{ padding: 8 }}><button type="button" onClick={() => save(rows.filter((_, k) => k !== i))} style={{ background: "none", border: "none", color: "var(--light)", cursor: "pointer" }}>×</button></td>
        </tr>)}</tbody></table></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }} className="tos-two-col">
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Company</label><input value={d.company} onChange={(e) => setD({ ...d, company: e.target.value })} style={input} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Role</label><input value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} style={input} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Posting date</label><input type="date" value={d.posted} onChange={(e) => setD({ ...d, posted: e.target.value })} style={input} /></div>
        <Btn onClick={() => { if (!d.company.trim()) return; save([...rows, d]); setD({ ...d, company: "", role: "", posted: "" }); }}>Add</Btn>
      </div>
      {finish && <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}><Btn onClick={() => finish({ action: true })} disabled={rows.length < 1 || done}>{done ? "Logged ✓" : "I sent one properly"}</Btn><span style={{ fontSize: 13, color: "var(--muted)" }}>Tailored to the posting, inside 48 hours of it going up.</span></div>}
    </Panel>
  );
}

/* ----------------------------- artifact menu (4.2) ----------------------------- */
const ARTIFACTS: Record<string, { what: string; time: string; proves: string; where: string }> = {
  "customer-success": { what: "A one-page onboarding plan for a clinic adopting a product you know (an AAC device, a telepractice platform): first 30 days, the three risks, the check-in cadence.", time: "3–4 hours", proves: "You think in retention and adoption, not sessions.", where: "PDF on LinkedIn; link in your About." },
  "project-management": { what: "A project charter and timeline for something you actually ran: the caseload system, the screening day, the EMR rollout. Scope, stakeholders, risks, what slipped.", time: "3 hours", proves: "You've managed scope and people, with the vocabulary to show it.", where: "Google Doc, linked from the résumé." },
  "data-analysis": { what: "One month of your own progress-monitoring data rebuilt in a spreadsheet with a pivot table and one chart, plus three sentences on what it says.", time: "2–3 hours", proves: "You can turn messy clinical data into a decision.", where: "Google Sheet + a screenshot on LinkedIn." },
  "liaison-ur": { what: "A one-page admissions criteria cheat-sheet for one diagnosis group you know cold, written for a referral coordinator.", time: "2 hours", proves: "You can apply clinical judgment to coverage criteria fast.", where: "Bring it to the interview." },
  "research-coordinator": { what: "A recruitment and consent workflow for a small study, drawn as a flowchart with the timing and the failure points.", time: "2 hours", proves: "You understand protocol, compliance and follow-up.", where: "PDF attached to the application." },
  "informatics": { what: "A one-page write-up of the documentation-workflow problem you fixed or watched fail: before, after, who had to be convinced.", time: "2 hours", proves: "You see systems, not just screens.", where: "Your interview story, and a LinkedIn post." },
  "instructional-design": { what: "One training you've already delivered, rebuilt as a ten-minute Rise or Storyline module with a short process note.", time: "6–8 hours", proves: "You can design learning, not just deliver it.", where: "Public link, as sample one of three." },
  "content-marketing": { what: "One published piece explaining a clinical thing to a non-clinical audience: a LinkedIn article or a guest post.", time: "3–4 hours", proves: "You can write for a reader who isn't a clinician.", where: "LinkedIn or Medium, linked from the résumé." },
  "clinical-educator": { what: "A ten-minute recorded training on a device or protocol you know, aimed at a new clinician, with a one-page handout.", time: "3 hours", proves: "You can teach clinicians to use a product.", where: "Unlisted video link on the résumé." },
  "sales-bd": { what: "A one-page competitive comparison of two devices you've prescribed, written for a purchasing committee.", time: "2–3 hours", proves: "You can talk shop with the buyer and think about the sale.", where: "Bring it to the interview." },
  "leadership": { what: "A staffing and coverage plan for your department for one difficult month, with the trade-offs named.", time: "2–3 hours", proves: "You already run the parts of the department nobody bills for.", where: "Share with your director as a conversation starter." },
};
function ArtifactMenu({ pathSlug, shared, setShared, finish, done }: ToolProps) {
  const [slug, setSlug] = useState<string>(pathSlug || shared["1.5"]?.top?.[0] || "customer-success");
  const a = ARTIFACTS[slug];
  const [link, setLink] = useState<string>(shared.artifact?.link || "");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{Object.keys(ARTIFACTS).map((s) => <button key={s} type="button" onClick={() => setSlug(s)} style={{ padding: "6px 10px", borderRadius: 999, border: `1.5px solid ${s === slug ? "var(--accent)" : "var(--border)"}`, background: s === slug ? "var(--accent-bg-subtle)" : "var(--card)", fontSize: 12.5, cursor: "pointer", fontFamily: font.sans, fontWeight: s === slug ? 600 : 400 }}>{PATHS[s].icon} {PATHS[s].label}</button>)}</div>
      <Panel tone="soft">
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>The brief · {PATHS[slug].label}</div>
        <div style={{ fontSize: 16, lineHeight: 1.6, margin: "6px 0 10px" }}>{a.what}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 13.5 }} className="tos-two-col">
          <div><b>Time:</b> {a.time}</div><div><b>Proves:</b> {a.proves}</div><div><b>Where it lives:</b> {a.where}</div>
        </div>
      </Panel>
      {finish && (
        <Panel style={{ marginTop: 12 }}>
          <H>When it exists</H>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Paste the link (or 'on my desk' if it's a document)" style={{ ...input, flex: "1 1 260px" }} />
            <Btn onClick={() => { setShared("artifact", { slug, link }); finish({ action: true }); }} disabled={!link.trim() || done}>{done ? "Made ✓" : "I made it"}</Btn>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ------------------------------ runway (4.5) ------------------------------ */
function Runway({ shared, setShared }: ToolProps) {
  const v = shared.runway || { savings: 8000, expenses: 3800, dip: 25, cobra: 700, loan: 300, months: 6 };
  const set = (k: string, val: number) => setShared("runway", { ...v, [k]: val });
  const monthlyGap = v.expenses * (v.dip / 100) + v.cobra + v.loan;
  const months = monthlyGap > 0 ? v.savings / monthlyGap : 99;
  const num = (k: string, label: string, hint?: string) => (
    <div><label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 3 }}>{label}</label><input type="number" value={v[k]} onChange={(e) => set(k, Number(e.target.value) || 0)} style={input} />{hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{hint}</div>}</div>
  );
  return (
    <Panel>
      <H>The bridge budget</H>
      <Muted>How many months you can run a reduced income while you make the move. Monthly gap = the pay you give up + the coverage you pay for + any change in the loan payment.</Muted>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="tos-two-col">
        {num("savings", "Savings you'd use ($)")}
        {num("expenses", "Monthly take-home now ($)")}
        {num("dip", "Pay dip during the bridge (%)", "0 if you keep full-time")}
        {num("cobra", "Coverage you'd pay for, per month ($)", "COBRA or marketplace; 0 if covered")}
        {num("loan", "Change in loan payment, per month ($)", "0 if unchanged; negative if it drops")}
        {num("months", "Months you expect the move to take", "documented: 6 to 15")}
      </div>
      <div className="tos-rise" style={{ marginTop: 14, padding: 14, background: months >= v.months ? "var(--accent-bg-subtle)" : "var(--warn-bg)", borderRadius: 12, fontSize: 15 }}>
        Monthly gap about <b>{money(monthlyGap)}</b>. That&rsquo;s <b>{months > 60 ? "more than five years" : `${months.toFixed(1)} months`}</b> of runway against a {v.months}-month move. {months >= v.months ? "The bridge holds." : "The bridge is short. The fixes are a smaller dip, a shorter bridge, or a fast-exit path first."}
      </div>
    </Panel>
  );
}

/* ---------------------------- bridge builder (5.2) ---------------------------- */
function BridgeBuilder({ shared, setShared, pathSlug }: ToolProps) {
  const pull = shared["1.8"]?.why || "";
  const p = pathSlug ? PATHS[pathSlug] : undefined;
  const nums: Record<string, string> = shared.numbers || {};
  const [prep, setPrep] = useState<string>(shared.bridge?.prep || "");
  const [win, setWin] = useState<string>(shared.bridge?.win || "");
  const text = `${pull || "[Your pull sentence from the Module 1 checkpoint]"} ${prep ? `To get ready, ${prep}.` : "[One sentence of preparation: the artifact, the conversations, the course.]"} ${win ? `The clearest example from my clinical work: ${win}.` : "[One accomplishment with its number, mapped onto the role's first-90-days problem.]"}${p ? ` That's why ${p.label.toLowerCase()} is where I'm heading.` : ""}`;
  return (
    <div>
      <Panel style={{ marginBottom: 12 }}>
        <H>Three parts, sixty seconds</H>
        <Muted>Pull, preparation, proof. The pull comes from your checkpoint sentence. Fill the other two and the statement writes itself; then say it aloud until it stops sounding rehearsed.</Muted>
        <div style={{ fontSize: 13.5, marginBottom: 8, padding: "8px 12px", background: "var(--bg)", borderRadius: 8 }}><b>Pull:</b> {pull || <span style={{ color: "var(--muted)" }}>set it in lesson 1.8</span>}</div>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Preparation (what you've done to get ready)</label>
        <input value={prep} onChange={(e) => setPrep(e.target.value)} placeholder="I rebuilt a training as a Rise module and talked to three people doing the job" style={{ ...input, marginBottom: 10 }} />
        <label style={{ fontSize: 13, fontWeight: 600 }}>Proof (one accomplishment with a number)</label>
        <input value={win} onChange={(e) => setWin(e.target.value)} placeholder={nums["Caseload size (largest you carried)"] ? `I ran a portfolio of ${nums["Caseload size (largest you carried)"]} concurrent clients and…` : "I ran a portfolio of 62 concurrent clients and cut the wait for evaluations by…"} style={input} />
        <div style={{ marginTop: 10 }}><Btn onClick={() => setShared("bridge", { prep, win })}>Save</Btn></div>
      </Panel>
      <Script title="Your bridge statement" text={text} />
    </div>
  );
}

/* --------------------------- screening questions (5.3) -------------------------- */
const SCREENS: { q: string; good: string; avoid: string }[] = [
  { q: "Why are you leaving clinical work?", good: "One sentence of pull (where you're going), one of evidence you've prepared. Nothing about burnout, caseloads or paperwork.", avoid: "Any sentence that starts with what you're escaping. They hear a retention risk." },
  { q: "You don't have experience in this role. Why should we consider you?", good: "Map two accomplishments onto the role's first-90-days problems, with numbers. \"I've been doing customer success my whole career; I called it family care. Sixty-two accounts, quarterly reviews, 90% retention.\"", avoid: "Listing soft skills. \"Communication\" is not an answer." },
  { q: "What do you know about our product / company?", good: "One specific thing you found by using it or talking to a customer, and one question it raised.", avoid: "Reciting the About page." },
  { q: "Where do you see yourself in three years?", good: "Inside this function, with a bigger scope, still using the clinical lens. Name the next title honestly.", avoid: "\"Back in clinical\" jokes, or a title from a different department." },
  { q: "What's your salary expectation?", good: "The documented range for the path, anchored at the middle, with a line about total compensation. See lesson 5.5.", avoid: "Naming your clinical salary first." },
  { q: "Tell me about a time you handled a difficult stakeholder.", good: "A parent or administrator story, told with the business nouns: the objection, what you changed, the outcome.", avoid: "A story where the resolution is that you were right." },
];
function ScreeningQuestions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      {SCREENS.map((s, i) => (
        <div key={i} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: open === i ? "var(--accent-bg-subtle)" : "var(--card)", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: font.sans, display: "flex", justifyContent: "space-between" }}><span>{s.q}</span><span style={{ color: "var(--muted)" }}>{open === i ? "–" : "+"}</span></button>
          {open === i && <div className="tos-fade" style={{ padding: "0 14px 14px", background: "var(--accent-bg-subtle)", fontSize: 14, lineHeight: 1.6 }}><div style={{ marginBottom: 6 }}><b style={{ color: "var(--accent)" }}>A good answer has:</b> {s.good}</div><div><b style={{ color: "#92400E" }}>Avoid:</b> {s.avoid}</div></div>}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- mock interview (5.4) ----------------------------- */
interface Turn { role: "coach" | "you"; text: string }
function MockInterview({ pathSlug, shared, finish, done }: ToolProps) {
  const p = pathSlug ? PATHS[pathSlug] : PATHS[shared["1.5"]?.top?.[0] || "customer-success"];
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const send = async (answer?: string) => {
    setBusy(true); setErr("");
    const next = answer ? [...turns, { role: "you" as const, text: answer }] : turns;
    setTurns(next); setDraft("");
    try {
      const r = await fetch("/api/course/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: p.slug, pull: shared["1.8"]?.why || "", turns: next.slice(-8) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "The coach is busy. Try again in a minute.");
      setTurns([...next, { role: "coach", text: d.text }]);
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  };
  const answered = turns.filter((t) => t.role === "you").length;
  return (
    <Panel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}><H>Mock interview · {p.icon} {p.label}</H><span style={{ fontSize: 12.5, color: "var(--muted)" }}>{answered} answered</span></div>
      <Muted>Five questions a hiring manager for this path actually asks. Answer in your own words, out loud if you can, then type what you said. After each answer the coach tells you what landed, what read as push, and what number was missing.</Muted>
      <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 2px", marginBottom: 10 }}>
        {turns.map((t, i) => (
          <div key={i} className="tos-rise" style={{ alignSelf: t.role === "you" ? "flex-end" : "flex-start", maxWidth: "88%", padding: "10px 14px", borderRadius: 14, background: t.role === "you" ? "var(--accent)" : "var(--bg)", color: t.role === "you" ? "#fff" : "var(--text)", fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{t.text}</div>
        ))}
        {busy && <div style={{ fontSize: 13, color: "var(--muted)" }}>Coach is thinking…</div>}
      </div>
      {err && <div style={{ fontSize: 13, color: "#92400E", marginBottom: 8 }}>{err}</div>}
      {turns.length === 0 ? <Btn onClick={() => send()} disabled={busy}>Start the interview</Btn> : (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Type what you said…" style={{ ...input, resize: "vertical", flex: 1 }} />
          <Btn onClick={() => draft.trim() && send(draft.trim())} disabled={busy || !draft.trim()}>Send</Btn>
        </div>
      )}
      {finish && answered >= 5 && !done && <div style={{ marginTop: 12 }}><Btn onClick={() => finish({ action: true })}>Five answered. Log it</Btn></div>}
      {done && <div style={{ marginTop: 12, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>✓ Logged. Run it again any time; it never gets worse.</div>}
    </Panel>
  );
}
