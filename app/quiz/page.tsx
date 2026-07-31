import { PageShell, S, Card } from "@/components/ui";
import Link from "next/link";

// Landing page for people arriving from the career quiz on slptransitions.com.
// Typeform redirects here on completion; ?path= carries their result so we can
// name it back to them, and it flows through to the app pre-selected.
const PATH_COPY: Record<string, { label: string; blurb: string }> = {
  "customer-success": {
    label: "Customer Success / Implementation",
    blurb:
      "This is the highest odds-to-effort path for most SLPs — at speech-tech and health-tech companies, your CCC is often the qualifying credential.",
  },
  "project-management": {
    label: "Project / Program Management",
    blurb:
      "The most-traveled road out. Your caseload already is concurrent project management — it just needs the right words.",
  },
  "data-analysis": {
    label: "Data Analysis",
    blurb:
      "You already collect and act on data every session. Healthcare organizations hire for exactly that instinct.",
  },
  "instructional-design": {
    label: "Instructional Design",
    blurb:
      "Therapy goals are learning objectives. This field hires on portfolio, not credentials — which works in your favor.",
  },
  "content-marketing": {
    label: "Content Strategy / Marketing",
    blurb:
      "Translating complex ideas for worried parents is the same muscle content marketing pays for.",
  },
  "ux-research": {
    label: "UX Research",
    blurb:
      "Your diagnostic interviewing is qualitative research. Be aware this field is competitive — healthtech is the realistic entry.",
  },
};

export default async function QuizLanding({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; result?: string }>;
}) {
  const params = await searchParams;
  const key = (params.path || params.result || "").toLowerCase();
  const match = PATH_COPY[key];

  return (
    <PageShell>
      <div style={{ ...S.wrap, textAlign: "center", padding: "40px 0 20px" }}>
        <span style={S.tag}>Quiz complete</span>
        {match ? (
          <>
            <h1 style={{ ...S.h1, fontSize: 32, marginTop: 16 }}>
              Your direction: {match.label}
            </h1>
            <p style={{ ...S.p, maxWidth: 520, margin: "0 auto 8px", fontSize: 16 }}>{match.blurb}</p>
          </>
        ) : (
          <h1 style={{ ...S.h1, fontSize: 32, marginTop: 16 }}>
            You have a direction.<br />Here's what to do with it.
          </h1>
        )}
        <p style={{ ...S.p, maxWidth: 520, margin: "16px auto 28px", fontSize: 16 }}>
          Knowing the direction is the easy part. The hard part is that hiring managers can't read a
          clinical resume — and most SLPs never get past that translation problem.
        </p>

        <Card highlight style={{ textAlign: "left" }}>
          <h3 style={{ ...S.h3, marginBottom: 10 }}>Two ways forward, both free to start:</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              1. Still weighing options?
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 8 }}>
              Paste your resume and we'll map your actual experience against the paths that fit —
              with real salary ranges and honest timelines.
            </p>
            <Link
              href="/"
              style={{ ...S.btnOut, display: "inline-block", textDecoration: "none", fontSize: 14 }}
            >
              Explore my paths →
            </Link>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              2. Already have a job posting in mind?
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 8 }}>
              Paste it with your resume and see instantly which of its requirements you already meet
              — and exactly how to word the rest.
            </p>
            <Link
              href={match ? `/?path=${encodeURIComponent(match.label)}` : "/"}
              style={{ ...S.btn, display: "inline-block", textDecoration: "none", fontSize: 15 }}
            >
              Translate my resume →
            </Link>
          </div>
        </Card>

        <p style={{ fontSize: 13, color: "var(--light)", marginTop: 16 }}>
          Free preview, no account needed. Full package $24 — one-time, no subscription.
        </p>
      </div>
    </PageShell>
  );
}
