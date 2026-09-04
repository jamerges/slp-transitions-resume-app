"use client";
// Interactive tools mounted from lesson JSON via {"type":"tool","name":"..."}.
// Each tool saves into the lesson's answer slot (or a shared slot) through
// the same progress store as everything else.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PATHS } from "@/lib/quiz";
import { pathImage } from "@/lib/quiz";
import { ROLES, rolesFor, formatUpdated } from "@/lib/open-roles";
import { COMPANIES_DB } from "@/lib/companies";
import { Btn, Panel, Slider, font } from "./ui";
import { Script } from "./Blocks";

export interface ToolProps { name: string; pathSlug?: string; shared: Record<string, any>; setShared: (key: string, v: any) => void; finish?: (o?: { action?: boolean }) => void; done?: boolean }

const H = ({ children }: { children: ReactNode }) => <h3 style={{ fontFamily: font.serif, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{children}</h3>;
const Muted = ({ children }: { children: ReactNode }) => <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 12px" }}>{children}</p>;
const input: React.CSSProperties = { width: "100%", padding: "9px 12px", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, background: "var(--card)" };
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const rangeLo = (s: string) => Number((s.replace(/,/g, "").match(/\d+/g) || ["0"])[0]);
const rangeMid = (s: string) => { const m = s.replace(/,/g, "").match(/\d+/g)?.map(Number) || []; return m.length >= 2 ? (m[0] + m[1]) / 2 : m[0] || 0; };

export function Tool(props: ToolProps) {
  switch (props.name) {
    case "path-map": return <PathMap />;
    case "pivot-report": return <PivotReport {...props} />;
    case "path-deep-dive": return <PathDeepDive {...props} />;
    case "contact-tracker": return <ContactTracker {...props} />;
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
    default: return <Panel tone="warm">Tool &ldquo;{props.name}&rdquo; is not built yet.</Panel>;
  }
}

/* ------------------------------ path map (2.1) ------------------------------ */
const TIERS: { title: string; blurb: string; slugs: string[] }[] = [
  { title: "Out in weeks", blurb: "Your license is the credential. Postings you already qualify for are live today.", slugs: ["liaison-ur", "clinical-educator", "leadership", "research-coordinator"] },
  { title: "Six to twelve months", blurb: "Some vocabulary and one proof piece, then applications.", slugs: ["customer-success", "sales-bd", "content-marketing", "instructional-design"] },
  { title: "Twelve to twenty-four months", blurb: "Real upskilling. Higher ceilings, longer runway.", slugs: ["project-management", "data-analysis", "informatics"] },
];
export function PathMap() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      {TIERS.map((t, ti) => (
        <div key={t.title} className="tos-rise" style={{ animationDelay: `${ti * 120}ms`, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: font.serif, fontSize: 19, fontWeight: 700 }}>{t.title}</span><span style={{ fontSize: 13, color: "var(--muted)" }}>{t.blurb}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
            {t.slugs.map((s) => { const p = PATHS[s]; const on = open === s; return (
              <button key={s} type="button" onClick={() => setOpen(on ? null : s)} className="tos-card-hover" style={{ textAlign: "left", background: on ? "var(--accent-bg-subtle)" : "var(--card)", border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, borderRadius: 12, padding: 12, cursor: "pointer", fontFamily: font.sans }}>
                <div style={{ fontSize: 22 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>{p.range}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>typically {p.timeline}</div>
                {on && <div className="tos-fade" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8, color: "var(--text)" }}><b>The catch:</b> {p.caveat}</div>}
              </button>); })}
          </div>
        </div>
      ))}
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
  const candidates: string[] = pathSlug ? [pathSlug, ...(shared["1.5"]?.top || []).filter((s: string) => s !== pathSlug)].slice(0, 2) : (shared["1.5"]?.top || []).slice(0, 2);
  const [slug, setSlug] = useState<string>(candidates[0] || "customer-success");
  const p = PATHS[slug];
  const roles = rolesFor(slug).slice(0, 8);
  const companies = COMPANIES_DB.filter((c) => c.roles.some((r) => r.toLowerCase().includes(p.roleOption.split(" /")[0].toLowerCase().split(" ")[0]))).slice(0, 8);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {(candidates.length ? candidates : Object.keys(PATHS)).map((s) => <button key={s} type="button" onClick={() => setSlug(s)} style={{ padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${s === slug ? "var(--accent)" : "var(--border)"}`, background: s === slug ? "var(--accent-bg-subtle)" : "var(--card)", color: s === slug ? "var(--accent)" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font.sans }}>{PATHS[s].icon} {PATHS[s].label}</button>)}
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
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Companies that have hired for this</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{(companies.length ? companies : COMPANIES_DB.slice(0, 8)).map((c) => <a key={c.name} href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", textDecoration: "none", color: "var(--text)" }}>{c.name}</a>)}</div>
            <a href="/companies" style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--accent)" }}>All 120 companies ↗</a>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- contact tracker (2.9/4.7) -------------------------- */
interface Contact { name: string; role: string; where: string; sent: string; replied: boolean; next: string }
function ContactTracker({ shared, setShared, finish, done }: ToolProps) {
  const rows: Contact[] = shared.contacts || [];
  const [draft, setDraft] = useState<Contact>({ name: "", role: "", where: "", sent: new Date().toISOString().slice(0, 10), replied: false, next: "" });
  const save = (next: Contact[]) => setShared("contacts", next);
  const sentCount = rows.filter((r) => r.sent).length;
  return (
    <Panel>
      <H>People you&rsquo;ve reached out to</H>
      <Muted>Three messages is the action for this lesson. About one in four gets no answer at all, so three sent is usually two conversations. That is the point.</Muted>
      {rows.length > 0 && (
        <div style={{ overflowX: "auto", marginBottom: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12 }}><th style={{ padding: "6px 8px" }}>Who</th><th style={{ padding: "6px 8px" }}>Role · where</th><th style={{ padding: "6px 8px" }}>Sent</th><th style={{ padding: "6px 8px" }}>Replied</th><th style={{ padding: "6px 8px" }}>Next</th><th /></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px" }}><b>{r.name}</b></td><td style={{ padding: "8px" }}>{r.role}{r.where ? ` · ${r.where}` : ""}</td><td style={{ padding: "8px" }}>{r.sent}</td>
                <td style={{ padding: "8px" }}><input type="checkbox" checked={r.replied} onChange={(e) => { const n = [...rows]; n[i] = { ...r, replied: e.target.checked }; save(n); }} /></td>
                <td style={{ padding: "8px" }}><input value={r.next} onChange={(e) => { const n = [...rows]; n[i] = { ...r, next: e.target.value }; save(n); }} placeholder="follow up on…" style={{ ...input, padding: "5px 8px", fontSize: 13 }} /></td>
                <td style={{ padding: "8px" }}><button type="button" onClick={() => save(rows.filter((_, k) => k !== i))} style={{ background: "none", border: "none", color: "var(--light)", cursor: "pointer" }}>×</button></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", gap: 8, alignItems: "end" }} className="tos-two-col">
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Name</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Their role</label><input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} style={input} placeholder="CSM at Presence" /></div>
        <div><label style={{ fontSize: 12, fontWeight: 600 }}>Where you found them</label><input value={draft.where} onChange={(e) => setDraft({ ...draft, where: e.target.value })} style={input} placeholder="LinkedIn" /></div>
        <Btn onClick={() => { if (!draft.name.trim()) return; save([...rows, draft]); setDraft({ ...draft, name: "", role: "", where: "" }); }}>Add</Btn>
      </div>
      {finish && (
        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => finish({ action: true })} disabled={sentCount < 3 || done}>{done ? "Logged ✓" : `I sent ${Math.min(3, sentCount)} of 3`}</Btn>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{sentCount >= 3 ? "Three sent. Log it and the badge is yours." : `${3 - sentCount} more to go.`}</span>
        </div>
      )}
    </Panel>
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
  ["People you trained or supervised", "CFs, students, teachers, aides"],
  ["Meetings you led in a typical month", "IEPs, care conferences, family meetings"],
  ["Systems you helped roll out or change", "EMR, scheduling, a new protocol"],
  ["Sites or buildings you covered", ""],
  ["Evaluations you completed in a year", ""],
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
      <div style={{ marginTop: 10, fontSize: 13, color: filled ? "var(--accent)" : "var(--muted)", fontWeight: 600 }}>{filled} of {MINES.length} filled. Every one becomes a bullet.</div>
    </Panel>
  );
}

/* ------------------------------ suite link (3.5) ------------------------------ */
function SuiteLink({ pathSlug, shared }: ToolProps) {
  const p = pathSlug ? PATHS[pathSlug] : undefined;
  return (
    <Panel tone="soft">
      <H>Build it in the Suite</H>
      <Muted>The Career Pivot Suite is included. Paste your résumé and one real posting; it translates every bullet, writes the cover letter and the LinkedIn sections, and lets you refine any of six sections until it sounds like you.</Muted>
      {shared.translation?.out && <div style={{ fontSize: 13.5, marginBottom: 10, padding: "8px 12px", background: "var(--card)", borderRadius: 8, border: "1px solid var(--accent-bg)" }}><b>Your saved pair:</b> {shared.translation.out}</div>}
      <Btn href={`/?from=course${p ? `&path=${encodeURIComponent(p.roleOption)}` : ""}`}>Open the Suite →</Btn>
    </Panel>
  );
}

/* ------------------------------- checklists ------------------------------- */
const LINKEDIN = [
  "Headline names the target role, not the clinical one (\"Customer Success · former SLP\", not \"CCC-SLP\")",
  "About section opens with your pull sentence from the Module 1 checkpoint",
  "Each clinical job has three translated bullets with a number in each",
  "Skills list contains the words from three real postings for your path",
  "Photo is recent and the banner isn't a stock image of a speech bubble",
  "Open-to-work is set to recruiters only, with the target titles typed in",
  "You've sent one connection request to someone who made this move",
];
const OFFER = [
  "The base sits inside the documented range for the path (or you know why it doesn't)",
  "Variable pay, if any, is written down: target, how it's measured, when it pays",
  "PTO, remote days and start date were asked about, not assumed",
  "Health coverage start date is known, and the gap (if any) is covered",
  "The loan plan is unchanged, or you know how the payment moves",
  "You asked for time to decide and got at least two business days",
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
  "instructional-design": { what: "One training you've already delivered, rebuilt as a ten-minute Rise or Storyline module with a short process note.", time: "6–8 hours", proves: "You can design learning, not just deliver it.", where: "Public link; this is sample one of three." },
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
        Monthly gap about <b>{money(monthlyGap)}</b>. That&rsquo;s <b>{months > 60 ? "more than five years" : `${months.toFixed(1)} months`}</b> of runway against a {v.months}-month move. {months >= v.months ? "The bridge holds." : "The bridge is short; the fixes are a smaller dip, a shorter bridge, or a fast-exit path first."}
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
