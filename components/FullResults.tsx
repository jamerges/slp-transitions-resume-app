"use client";

import { useState, type ReactNode } from "react";
import { S, Card, CopyButton } from "./ui";
import { getRelevantCompanies, getRelevantStories } from "@/lib/companies";
import type { UserGoals } from "@/lib/prompts";

interface FullResultsProps {
  full: any;
  jobTitle: string;
  goals: UserGoals;
  writingSample?: string;
  onTranslateAnother?: () => void;
}

export default function FullResults({
  full,
  jobTitle,
  goals,
  writingSample,
  onTranslateAnother,
}: FullResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setExpandedSections((p) => ({ ...p, [key]: !(p[key] ?? true) }));

  if (!full) return null;
  const {
    professionalSummary,
    translatedBullets,
    skillsSection,
    gapAnalysis,
    coverLetter,
    talkingPoints,
    linkedinHeadline,
    elevatorPitch,
  } = full;

  const companies = getRelevantCompanies({
    targetRoles: goals.targetRoles,
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
  }: {
    title: string;
    id: string;
    children: ReactNode;
    copyText?: string;
  }) => {
    const open = expandedSections[id] !== false;
    return (
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleSection(id)}>
          <h3 style={{ ...S.h3, margin: 0 }}>{title}</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {copyText && open && <CopyButton text={copyText} />}
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

      {elevatorPitch && (
        <Card highlight>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>YOUR 30-SECOND PITCH</div>
              <div style={{ fontSize: 15, lineHeight: 1.7 }}>{elevatorPitch}</div>
            </div>
            <CopyButton text={elevatorPitch} />
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
            <CopyButton text={linkedinHeadline} />
          </div>
        </Card>
      )}

      <Section title="Professional Summary" id="summary" copyText={professionalSummary}>
        <div style={{ fontSize: 15, lineHeight: 1.7, padding: "12px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>{professionalSummary}</div>
      </Section>

      <Section title="Translated Experience" id="bullets" copyText={translatedBullets?.map((b: any) => `• ${b.translated}`).join("\n")}>
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

      <Section title="Tailored Cover Letter" id="cover" copyText={coverLetter}>
        <div style={{ fontSize: 14, lineHeight: 1.75, padding: "16px 20px", background: "#FEFEFE", border: "1px solid var(--border)", borderRadius: 8, whiteSpace: "pre-wrap" }}>{coverLetter}</div>
      </Section>

      <Section title="Interview Bridge Statements" id="interview" copyText={talkingPoints?.map((t: any) => `Q: ${t.question}\nA: ${t.bridgeStatement}`).join("\n\n")}>
        {talkingPoints?.map((tp: any, i: number) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Q: {tp.question}</div>
            <div style={{ fontSize: 14, color: "var(--muted)", padding: "10px 14px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)", lineHeight: 1.65 }}>{tp.bridgeStatement}</div>
          </div>
        ))}
      </Section>

      {companies.length > 0 && (
        <Section title="Companies Known to Hire Former SLPs" id="companies">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>From our curated database of 123 ed-tech and health-tech companies with a track record of hiring former clinicians, sorted by best match for your background. We don't track live vacancies — tap <strong>See open roles</strong> on any company to run a live job search for {jobTitle}-type openings there.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {companies.map((c, i) => {
              const jobsUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${c.name} ${jobTitle}`)}`;
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
            💡 <strong>Pro tip:</strong> "See open roles" runs a live LinkedIn Jobs search for that company. If nothing's posted today, check back or follow the company — and reference your translated bullets above when you apply.
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
