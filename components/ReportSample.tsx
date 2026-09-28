// A real excerpt from a quiz-edition Pivot Report, shown beside the $9 offer so
// the buyer sees what they get instead of reading a list about it. Generated
// 2026-09-28 in the quality run from a TEST set of answers (guilt stage, almost
// no spare time, needs to match SLP pay), and labelled as such. Never swap in a
// buyer's report without their permission, and never edit it into something
// the generator didn't write.
import { PATHS } from "@/lib/quiz";

const p = PATHS["liaison-ur"];

export default function ReportSample() {
  return (
    <figure style={{ margin: "0 auto 20px", maxWidth: 470, textAlign: "left", border: "1px solid var(--border)", borderRadius: 12, background: "#fff", padding: "16px 18px" }}>
      <figcaption style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
        From a sample report · built from a test set of answers
      </figcaption>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, margin: "0 0 12px" }}>
        &ldquo;Your answers show someone who is deeply good at the one-on-one work, wants to stay close to clinical knowledge, needs income parity from day one, and has almost no spare hours right now, which means the right plan is narrow, low-lift, and fast.&rdquo;
      </p>
      <div style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>Start here this week</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          Go to Encompass Health&rsquo;s careers page and search &lsquo;liaison&rsquo; or &lsquo;utilization review.&rsquo; Read one posting all the way through and write down three phrases from it that already describe work you have done.
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>
        Top path: <strong style={{ color: "var(--text)" }}>{p.label}</strong> · {p.range} · typically {p.timeline}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>Yours is written from your own answers, with two more paths, a 30-day plan and three messages to send.</div>
    </figure>
  );
}
