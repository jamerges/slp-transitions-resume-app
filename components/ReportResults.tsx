"use client";

import { S, Card } from "./ui";

// Every transition moves through the same four stages. Showing all of them —
// not just the one they're in — is what makes the diagnosis mean something.
const ARC = [
  { name: "Ground", blurb: "Get clear on what you actually want and what you already have." },
  { name: "Explore", blurb: "Research real roles and talk to people who've made the jump." },
  { name: "Test", blurb: "Run small, low-risk experiments to build proof and confidence." },
  { name: "Leap", blurb: "Apply, interview, and negotiate with materials that land." },
];

function TransitionArc({ current }: { current?: string }) {
  const idx = ARC.findIndex((p) => p.name.toLowerCase() === (current || "").toLowerCase());
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
        THE FOUR STAGES OF A TRANSITION
      </div>
      {ARC.map((p, i) => {
        const isCurrent = i === idx;
        const isPast = idx > -1 && i < idx;
        return (
          <div
            key={p.name}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 12px",
              borderRadius: 8,
              marginBottom: 6,
              background: isCurrent ? "var(--accent-bg-subtle)" : "transparent",
              border: isCurrent ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              opacity: isPast ? 0.55 : 1,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: isCurrent ? "var(--accent)" : isPast ? "var(--accent-bg)" : "var(--border)",
                color: isCurrent ? "#fff" : isPast ? "var(--accent)" : "var(--muted)",
              }}
            >
              {isPast ? "✓" : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? "var(--accent)" : "var(--text)" }}>
                {p.name}
                {isCurrent && <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 8 }}>← you are here</span>}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginTop: 2 }}>{p.blurb}</div>
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8, lineHeight: 1.6 }}>
        Most people try to skip ahead to Leap — polishing a resume before they know what they're aiming at. Working your actual stage is faster.
      </p>
    </div>
  );
}

export default function ReportResults({
  report: r,
  email,
  emailSent,
  sessionId,
}: {
  report: any;
  email?: string;
  emailSent?: boolean;
  sessionId?: string;
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
          <h3 style={{ ...S.h3, fontSize: 18, marginBottom: 8 }}>Stage {Math.max(1, ARC.findIndex((p) => p.name.toLowerCase() === (r.phase.name || "").toLowerCase()) + 1)} of 4: {r.phase.name}</h3>
          {r.phase.basedOn && (
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10, fontStyle: "italic" }}>
              Based on what you told us: {r.phase.basedOn}
            </div>
          )}
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{r.phase.diagnosis}</p>
          <div style={{ fontSize: 14, padding: "10px 14px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 6, marginBottom: 8 }}>
            <strong>Focus now:</strong> {r.phase.focusNow}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            <strong>Explicitly not yet:</strong> {r.phase.notYet}
          </div>
          <TransitionArc current={r.phase.name} />
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
          onClick={() => {
            // Carry their resume AND their top path forward, so they land on the
            // job-posting step rather than re-picking a target role.
            const top = r.topRoles?.[0]?.role || "";
            window.location.href = sessionId
              ? `/?continue=${encodeURIComponent(sessionId)}${top ? `&path=${encodeURIComponent(top)}` : ""}`
              : "/";
          }}
        >
          Translate my resume for a real job →
        </button>
        <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>
          {sessionId ? "Your resume carries over — just add the job posting. " : ""}Free preview first. No subscription, ever.
        </p>
      </Card>
    </div>
  );
}
