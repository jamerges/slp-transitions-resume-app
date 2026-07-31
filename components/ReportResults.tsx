"use client";

import { S, Card } from "./ui";

export default function ReportResults({
  report: r,
  email,
  emailSent,
}: {
  report: any;
  email?: string;
  emailSent?: boolean;
}) {
  if (!r) return null;
  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ ...S.tag, background: "var(--accent)", color: "#fff" }}>Your Pivot Report</span>
        {emailSent && email && (
          <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 8 }}>
            ✓ A copy is in your inbox ({email})
          </p>
        )}
      </div>

      {r.headline && (
        <p style={{ fontSize: 17, lineHeight: 1.7, fontWeight: 500, textAlign: "center", maxWidth: 560, margin: "0 auto 24px" }}>
          {r.headline}
        </p>
      )}

      {r.readinessProfile && (
        <Card highlight>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 4 }}>YOUR PROFILE</div>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>{r.readinessProfile.profile}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{r.readinessProfile.meaning}</p>
          <div style={{ fontSize: 13, background: "var(--warn-bg)", borderRadius: 8, padding: "10px 14px", marginBottom: 8, lineHeight: 1.6 }}>
            <strong>Watch out for:</strong> {r.readinessProfile.watchOutFor}
          </div>
          <div style={{ fontSize: 13, background: "#D1FAE5", borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
            <strong>Your underrated strength:</strong> {r.readinessProfile.superpower}
          </div>
        </Card>
      )}

      {r.phase && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 4 }}>WHERE YOU ARE</div>
          <h3 style={{ ...S.h3, fontSize: 18, marginBottom: 8 }}>The {r.phase.name} phase</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{r.phase.diagnosis}</p>
          <div style={{ fontSize: 14, padding: "10px 14px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 6, marginBottom: 8 }}>
            <strong>Focus now:</strong> {r.phase.focusNow}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            <strong>Explicitly not yet:</strong> {r.phase.notYet}
          </div>
        </Card>
      )}

      {r.topRoles?.length > 0 && (
        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Your top 3 realistic paths</h3>
          {r.topRoles.map((t: any, i: number) => (
            <div key={i} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{i + 1}. {t.role}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>💰 {t.salaryRange} · ⏱ {t.timeline}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginBottom: 8 }}>{t.whyYou}</p>
              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}><strong>Entry path:</strong> {t.entryPath}</div>
              <div style={{ fontSize: 13, color: "var(--accent)", lineHeight: 1.6 }}><strong>First move this week:</strong> {t.firstMove}</div>
            </div>
          ))}
        </Card>
      )}

      {r.thirtyDayPlan?.length > 0 && (
        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Your 30-day starter plan</h3>
          {r.thirtyDayPlan.map((w: any, i: number) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{w.week} — {w.theme}</div>
              {w.actions?.map((a: string, j: number) => (
                <div key={j} style={{ fontSize: 13, color: "var(--muted)", padding: "3px 0 3px 14px", lineHeight: 1.6 }}>→ {a}</div>
              ))}
            </div>
          ))}
        </Card>
      )}

      {r.honestTruths?.length > 0 && (
        <Card>
          <h3 style={{ ...S.h3, marginBottom: 10 }}>The honest part</h3>
          {r.honestTruths.map((h: string, i: number) => (
            <div key={i} style={{ fontSize: 14, padding: "10px 14px", background: "var(--warn-bg)", borderRadius: 8, marginBottom: 8, lineHeight: 1.65 }}>{h}</div>
          ))}
        </Card>
      )}

      {r.closing && (
        <p style={{ fontSize: 14, lineHeight: 1.75, fontStyle: "italic", color: "var(--muted)", padding: "0 8px", marginBottom: 24 }}>{r.closing}</p>
      )}

      <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
        <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>Ready to go after one of these?</h3>
        <p style={{ ...S.p, maxWidth: 440, margin: "0 auto 16px" }}>
          When you find a real job posting, the Career Pivot Suite translates your entire resume for it — every bullet, cover letter, LinkedIn profile, interview prep, and a 90-day plan. $24, once.
        </p>
        <button
          style={{ ...S.btn, padding: "14px 40px", fontSize: 16 }}
          onClick={() => { window.location.href = "/"; }}
        >
          Translate my resume for a real job →
        </button>
        <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>Free preview first. No subscription, ever.</p>
      </Card>
    </div>
  );
}
