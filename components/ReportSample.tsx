// Part of a real quiz-edition Pivot Report, shown beside the offer so the buyer
// sees what they get instead of reading a list about it: the opening read, the
// first move, the top path with its entry route, and the first week of the
// plan. The words come from lib/report-sample.ts untouched (a report generated
// from a TEST set of answers, and labelled as such). The first excerpt, from
// 2026-09-28, showed the opening and the first move only.
import { REPORT_SAMPLE as R } from "@/lib/report-sample";

const label = { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--accent)" };

export default function ReportSample() {
  const path = R.topRoles[0];
  const [week1, ...later] = R.thirtyDayPlan;
  return (
    <figure id="report-sample" style={{ margin: "0 auto 20px", maxWidth: 470, textAlign: "left", border: "1px solid var(--border)", borderRadius: 18, background: "#fff", padding: "18px 20px", scrollMarginTop: 16 }}>
      <figcaption style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
        From a sample report · built from a test set of answers
      </figcaption>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, margin: "0 0 14px" }}>&ldquo;{R.headline}&rdquo;</p>

      <div style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12, marginBottom: 14 }}>
        <div style={label}>Start here this week</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{path.firstMove}</div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>1. {path.role}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "2px 0 8px" }}>{path.salaryRange} · {path.timeline}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}><strong>Entry path:</strong> {path.entryPath}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={label}>{week1.week} · {week1.theme}</div>
        {week1.actions.map((a) => (
          <div key={a} style={{ fontSize: 13.5, lineHeight: 1.6, padding: "4px 0 0 14px", color: "var(--text)" }}>→ {a}</div>
        ))}
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
          Then {later.map((w) => `${w.week}: ${w.theme}`).join(" · ")}
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        Yours is written from your own answers, with two more paths, the other three weeks and three messages to send.
      </div>
    </figure>
  );
}
