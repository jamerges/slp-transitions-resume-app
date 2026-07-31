"use client";

import { useState, type ReactNode } from "react";
import { S, Card, CopyButton, CoverageTable } from "./ui";
import { getRelevantCompanies, getRelevantStories } from "@/lib/companies";
import { downloadResumeDocx, downloadCoverLetterDocx } from "./exportDocx";
import type { UserGoals } from "@/lib/prompts";

interface FullResultsProps {
  full: any;
  jobTitle: string;
  goals: UserGoals;
  writingSample?: string;
  sessionId?: string;
  onTranslateAnother?: () => void;
}

function RefineControl({
  sectionKey,
  sessionId,
  onRefined,
}: {
  sectionKey: string;
  sessionId: string;
  onRefined: (key: string, value: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      const resp = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, section: sectionKey, instruction: text }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Refine failed (${resp.status})`);
      onRefined(sectionKey, data.value);
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setText(""); }, 1200);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          padding: "4px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6,
          border: "1px solid var(--accent)", background: "var(--card)",
          color: "var(--accent)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}
      >
        ✎ Refine
      </button>
    );
  }
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", marginTop: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          placeholder='e.g., "warmer tone", "shorter", "emphasize my AAC experience"'
          style={{ ...S.input, fontSize: 13, padding: "8px 12px" }}
          disabled={busy}
        />
        <button onClick={submit} disabled={busy || !text.trim()} style={{ ...S.btn, padding: "8px 16px", fontSize: 13, opacity: busy || !text.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}>
          {done ? "✓ Done" : busy ? "Rewriting…" : "Rewrite"}
        </button>
        <button onClick={() => { setOpen(false); setErr(""); }} disabled={busy} style={{ ...S.btnOut, padding: "8px 12px", fontSize: 13 }}>✕</button>
      </div>
      {busy && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Rewriting with your request — usually 10-20 seconds…</div>}
      {err && <div style={{ fontSize: 12, color: "var(--err)", marginTop: 6 }}>{err}</div>}
    </div>
  );
}

export default function FullResults({
  full,
  jobTitle,
  goals,
  writingSample,
  sessionId,
  onTranslateAnother,
}: FullResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  const toggleSection = (key: string) =>
    setExpandedSections((p) => ({ ...p, [key]: !(p[key] ?? true) }));
  const onRefined = (key: string, value: any) =>
    setOverrides((p) => ({ ...p, [key]: value }));

  if (!full) return null;
  const merged = { ...full, ...overrides };
  const {
    requirementsCoverage,
    professionalSummary,
    translatedBullets,
    skillsSection,
    gapAnalysis,
    proofArtifacts,
    coverLetter,
    talkingPoints,
    linkedinHeadline,
    linkedinAbout,
    elevatorPitch,
    ninetyDayPlan,
    knockoutAnswers,
  } = merged;

  const refine = (key: string) =>
    sessionId ? <RefineControl sectionKey={key} sessionId={sessionId} onRefined={onRefined} /> : null;

  const companies = getRelevantCompanies({
    targetRoles: goals.targetRoles,
    industries: goals.targetIndustries,
    settings: goals.settings,
    jobTitle,
  });
  const stories = getRelevantStories({
    targetRoles: goals.targetRoles,
    jobTitle,
  });

  const Section = ({
    title,
    id,
    children,
    copyText,
    refineKey,
  }: {
    title: string;
    id: string;
    children: ReactNode;
    copyText?: string;
    refineKey?: string;
  }) => {
    const open = expandedSections[id] !== false;
    return (
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: 8 }} onClick={() => toggleSection(id)}>
          <h3 style={{ ...S.h3, margin: 0 }}>{title}</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {copyText && open && <CopyButton text={copyText} />}
            {refineKey && open && refine(refineKey)}
            <span style={{ fontSize: 18, color: "var(--muted)", transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
          </div>
        </div>
        {open && <div style={{ marginTop: 16 }}>{children}</div>}
      </Card>
    );
  };

  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ ...S.tag, background: "var(--accent)", color: "#fff" }}>Full Results</span>
        <h2 style={{ ...S.h2, marginTop: 12 }}>Your Complete Translation: {jobTitle}</h2>
        {writingSample && <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>✓ Cover letter calibrated to your voice</p>}
      </div>

      <Card style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Download as Word documents</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Editable .docx files — paste into your own resume format or send as-is.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ ...S.btnOut, fontSize: 13, padding: "8px 16px" }} onClick={() => downloadResumeDocx(merged, jobTitle)}>⬇ Resume content</button>
          <button style={{ ...S.btnOut, fontSize: 13, padding: "8px 16px" }} onClick={() => downloadCoverLetterDocx(merged, jobTitle)}>⬇ Cover letter</button>
        </div>
      </Card>

      {elevatorPitch && (
        <Card highlight>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>YOUR 30-SECOND PITCH</div>
              <div style={{ fontSize: 15, lineHeight: 1.7 }}>{elevatorPitch}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <CopyButton text={elevatorPitch} />
              {refine("elevatorPitch")}
            </div>
          </div>
        </Card>
      )}

      {linkedinHeadline && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 4 }}>LINKEDIN HEADLINE</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{linkedinHeadline}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <CopyButton text={linkedinHeadline} />
              {refine("linkedinHeadline")}
            </div>
          </div>
          {linkedinAbout && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>LINKEDIN ABOUT SECTION</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{linkedinAbout}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <CopyButton text={linkedinAbout} />
                  {refine("linkedinAbout")}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>Recruiters screen LinkedIn before every interview — paste both of these in before you start applying.</div>
            </div>
          )}
        </Card>
      )}

      {requirementsCoverage?.length > 0 && (
        <Section title="Requirements Coverage" id="coverage">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 8 }}>The job's top requirements checked against your resume — with a move for every gap.</p>
          <CoverageTable items={requirementsCoverage} />
        </Section>
      )}

      <Section title="Professional Summary" id="summary" copyText={professionalSummary} refineKey="professionalSummary">
        <div style={{ fontSize: 15, lineHeight: 1.7, padding: "12px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>{professionalSummary}</div>
      </Section>

      <Section title="Translated Experience" id="bullets" copyText={translatedBullets?.map((b: any) => `• ${b.translated}`).join("\n")} refineKey="translatedBullets">
        <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Every bullet rewritten for this role.</p>
        {translatedBullets?.map((b: any, i: number) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {(i === 0 || b.section !== translatedBullets[i - 1]?.section) && b.section && (
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: i > 0 ? 12 : 0 }}>{b.section}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 12px", background: "#F9FAFB", borderRadius: 6, borderLeft: "2px solid var(--border)", lineHeight: 1.6 }}>{b.original}</div>
              <div style={{ fontSize: 13, padding: "8px 12px", background: "var(--accent-bg-subtle)", borderRadius: 6, borderLeft: "2px solid var(--accent)", lineHeight: 1.6, fontWeight: 500 }}>{b.translated}</div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="ATS-Optimized Skills" id="skills" copyText={skillsSection ? Object.entries(skillsSection).map(([c, s]: any) => `${c}: ${(s as string[]).join(", ")}`).join("\n") : ""}>
        {skillsSection && Object.entries(skillsSection).map(([cat, skills]: any) => (
          <div key={cat} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{cat}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(skills as string[])?.map((s: string, i: number) => (
                <span key={i} style={{ fontSize: 13, padding: "4px 12px", background: "var(--accent-bg-subtle)", borderRadius: 16 }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Gap Analysis" id="gaps">
        <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Honest assessment + action plan.</p>
        {gapAnalysis?.map((g: any, i: number) => (
          <div key={i} style={{ padding: "14px 16px", background: g.priority === "high" ? "var(--warn-bg)" : g.priority === "medium" ? "#FEF9EF" : "#F0F9FF", borderRadius: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{g.gap}</div>
              {g.priority && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: g.priority === "high" ? "#FDE68A" : "#E0F2FE", color: g.priority === "high" ? "#92400E" : "#0369A1" }}>{g.priority}</span>}
            </div>
            {g.actionSteps?.map((s: string, j: number) => <div key={j} style={{ fontSize: 13, color: "var(--muted)", padding: "2px 0 2px 16px" }}>→ {s}</div>)}
            {g.timeframe && <div style={{ fontSize: 12, color: "var(--light)", marginTop: 6 }}>⏱ {g.timeframe}</div>}
          </div>
        ))}
      </Section>

      {proofArtifacts?.length > 0 && (
        <Section title="Build Your Proof" id="artifacts">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Career changers get hired on evidence, not claims. These artifacts prove you're serious about this field:</p>
          {proofArtifacts.map((a: any, i: number) => (
            <div key={i} style={{ padding: "14px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{a.artifact}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{a.why}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: "var(--light)" }}>
                {a.timeEstimate && <span>⏱ {a.timeEstimate}</span>}
                {a.cost && <span>💰 {a.cost}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      <Section title="Tailored Cover Letter" id="cover" copyText={coverLetter} refineKey="coverLetter">
        <div style={{ fontSize: 14, lineHeight: 1.75, padding: "16px 20px", background: "#FEFEFE", border: "1px solid var(--border)", borderRadius: 8, whiteSpace: "pre-wrap" }}>{coverLetter}</div>
      </Section>

      {knockoutAnswers?.length > 0 && (
        <Section title="Application Screening Questions" id="knockouts">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>The form questions that silently filter career changers out — and how to answer them for this job:</p>
          {knockoutAnswers.map((k: any, i: number) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>“{k.question}”</div>
              <div style={{ fontSize: 14, color: "var(--muted)", padding: "10px 14px", background: "#F0F9FF", borderRadius: 8, borderLeft: "3px solid #0369A1", lineHeight: 1.65 }}>{k.strategy}</div>
            </div>
          ))}
        </Section>
      )}

      <Section title="Interview Bridge Statements" id="interview" copyText={talkingPoints?.map((t: any) => `Q: ${t.question}\nA: ${t.bridgeStatement}`).join("\n\n")}>
        {talkingPoints?.map((tp: any, i: number) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Q: {tp.question}</div>
            <div style={{ fontSize: 14, color: "var(--muted)", padding: "10px 14px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)", lineHeight: 1.65 }}>{tp.bridgeStatement}</div>
          </div>
        ))}
      </Section>

      {ninetyDayPlan?.length > 0 && (
        <Section title="Your 90-Day Transition Plan" id="roadmap">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 14 }}>Real transitions take months, not days — this is the honest sequence. Referrals and proof beat mass applications.</p>
          <div style={{ position: "relative", paddingLeft: 22 }}>
            <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: "var(--accent-bg)" }} />
            {ninetyDayPlan.map((p: any, i: number) => (
              <div key={i} style={{ position: "relative", marginBottom: 18 }}>
                <div style={{ position: "absolute", left: -21, top: 4, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", border: "3px solid var(--accent-bg)" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{p.phase}</div>
                <div style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 6px" }}>{p.focus}</div>
                {p.actions?.map((a: string, j: number) => (
                  <div key={j} style={{ fontSize: 13, color: "var(--muted)", padding: "3px 0 3px 14px", lineHeight: 1.6, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0 }}>→</span>{a}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {companies.length > 0 && (
        <Section title="Companies Known to Hire Former SLPs" id="companies">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>From our curated database of 123 ed-tech and health-tech companies with a track record of hiring former clinicians, sorted by best match for your background. We don't track live vacancies — tap <strong>See open roles</strong> to jump to that company's careers page.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {companies.map((c, i) => {
              // We don't store per-company careers URLs (paths vary: /careers,
              // /jobs, Greenhouse, Lever…), so a "{company} careers" search is
              // the most reliable route to their actual jobs page — a LinkedIn
              // keyword search just lands on generic suggested jobs.
              const jobsUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${c.name}" careers jobs`)}`;
              return (
              <div key={i} style={{ padding: "14px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  {c._matchReasons?.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: "var(--accent)", color: "#fff", whiteSpace: "nowrap" }}>
                      {c._matchReasons[0]}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--accent)" }}>{c.categories?.join(" • ")}</div>
                {c.note && <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 2 }}>{c.note}</div>}
                {c.roles?.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--light)", marginTop: 4 }}>
                    Roles: {c.roles.slice(0, 4).join(", ")}{c.roles.length > 4 ? "..." : ""}
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                  <a href={jobsUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none", padding: "4px 10px", border: "1px solid var(--accent)", borderRadius: 6 }}>See open roles ↗</a>
                  <a href={`https://${c.url}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>{c.url} ↗</a>
                </div>
              </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, padding: "10px 14px", background: "#F9FAFB", borderRadius: 6 }}>
            💡 <strong>Pro tip:</strong> "See open roles" takes you to the company's careers page (top search result). If nothing fits today, follow them on LinkedIn — and reference your translated bullets above when you apply.
          </div>
        </Section>
      )}

      {stories.length > 0 && (
        <Section title="SLPs Who Made Similar Transitions" id="stories">
          {stories.map((s, i) => (
            <div key={i} style={{ padding: "12px 14px", background: i % 2 === 0 ? "var(--accent-bg-subtle)" : "#F9FAFB", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}: {s.from} → {s.to}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.setting}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", marginTop: 6 }}>"{s.quote}"</div>
            </div>
          ))}
        </Section>
      )}

      <div style={{ textAlign: "center", marginTop: 28, marginBottom: 40 }}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>Copy each section into your resume, cover letter, and LinkedIn.</p>
        {onTranslateAnother && (
          <button style={S.btnOut} onClick={onTranslateAnother}>Translate for another role →</button>
        )}
      </div>
    </div>
  );
}
