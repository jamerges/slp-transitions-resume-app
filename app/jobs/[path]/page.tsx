import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, S } from "@/components/ui";
import { collectionLd, roleItems, JsonLd } from "@/lib/seo";
import {
  PATH_LIST,
  SITE,
  GENERATED_AT,
  formatUpdated,
  rolesFor,
  pathInfo,
  remoteCount,
  companyCount,
} from "@/lib/open-roles";

/**
 * One page per career path, built from the quiz's own sourced copy.
 *
 * /jobs is a hub that answers "what is open"; these answer "is this move worth
 * making" — what it pays, how long it takes, what disqualifies you — which is
 * the question people actually search. The salary bands and timelines trace to
 * content/research-facts.md through lib/quiz.ts; do not restate them here.
 *
 * Slugs match the quiz slugs exactly. Prettier URLs would mean a fourth place
 * where a path name lives, and CLAUDE.md already documents three.
 */
export function generateStaticParams() {
  return PATH_LIST.map((p) => ({ path: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const info = pathInfo(path);
  if (!info) return {};
  const url = `${SITE}/jobs/${path}`;
  const title = `${info.label} jobs for former SLPs`;
  // The salary band in the description is the part people are scanning for,
  // and it is the sentence answer engines lift. Counts stay out of the title
  // so it does not churn every Monday.
  const description = `What ${info.label} pays for speech-language pathologists leaving the clinic (${info.range}), how long the move typically takes (${info.timeline}), and the roles open right now.`;
  return {
    title: `${title} | SLP Transitions`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function PathPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const info = pathInfo(path);
  const meta = PATH_LIST.find((p) => p.slug === path);
  if (!info || !meta) notFound();

  const roles = rolesFor(path);
  const remote = remoteCount(roles);
  const url = `${SITE}/jobs/${path}`;

  const fact = (k: string, v: string) => (
    <div style={{ flex: "1 1 220px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 4,
        }}
      >
        {k}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{v}</div>
    </div>
  );

  const section = (heading: string, body: string) => (
    <>
      <h2 style={{ ...S.h2, fontSize: 20, marginTop: 26 }}>{heading}</h2>
      <p style={S.p}>{body}</p>
    </>
  );

  return (
    <PageShell>
      <JsonLd
        data={collectionLd({
          url,
          name: `${info.label} jobs for former SLPs`,
          description: `${roles.length} open ${info.label} roles at companies that hire speech-language pathologists. Typical range ${info.range}; typical timeline ${info.timeline}.`,
          modified: GENERATED_AT,
          items: roleItems(roles),
          breadcrumbs: [
            { name: "Open roles", url: `${SITE}/jobs` },
            { name: info.label, url },
          ],
        })}
      />

      <a
        href="/jobs"
        style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
      >
        &larr; All open roles
      </a>

      <h1 style={{ ...S.h1, marginTop: 14 }}>
        <span aria-hidden="true">{info.icon}</span> {info.label} jobs for former SLPs
      </h1>

      <p style={{ ...S.p, marginBottom: 18 }}>
        {roles.length === 0
          ? `No ${info.label} openings turned up in this week's scan, which happens — it is a smaller category and the boards move. Everything below still holds, and the list refreshes every Monday.`
          : `${roles.length} ${roles.length === 1 ? "opening" : "openings"} right now${
              remote ? `, ${remote} of them remote` : ""
            }, at ${companyCount(roles)} ${
              companyCount(roles) === 1 ? "company" : "companies"
            } that hire speech-language pathologists into non-clinical work.`}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          padding: "18px 20px",
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--card)",
          marginBottom: 6,
        }}
      >
        {fact("Typical range", info.range)}
        {fact("Typical timeline", info.timeline)}
      </div>
      <p style={{ fontSize: 12, color: "var(--light)", marginBottom: 28 }}>
        Ranges and timelines come from documented SLP transitions, not estimates.
      </p>

      {section("Why SLPs land here", info.why)}
      {section("Where people get in", info.entryDoor)}

      <div
        style={{
          border: "1px solid var(--warn)",
          background: "var(--warn-bg)",
          borderRadius: 10,
          padding: "14px 18px",
          margin: "6px 0 4px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--warn)" }}>
          Worth knowing
        </div>
        <p style={{ ...S.p, color: "var(--text)", marginBottom: 0, fontSize: 14.5 }}>
          {info.caveat}
        </p>
      </div>

      {section("Your first move this week", info.firstMove)}

      <h2 style={{ ...S.h2, fontSize: 20, marginTop: 34, marginBottom: 4 }}>
        Open {info.label} roles{roles.length ? ` (${roles.length})` : ""}
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
        Updated {formatUpdated()}. Each link goes straight to the company.
      </p>

      {roles.length === 0 ? (
        <p style={S.p}>
          Nothing open in this category this week.{" "}
          <a href="/companies" style={{ color: "var(--accent)" }}>
            The companies list
          </a>{" "}
          is the place to start instead &mdash; go to the careers page of the ones that
          fit and set an alert.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {roles.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: 8,
                padding: "11px 14px",
                border: "1px solid var(--border)",
                borderRadius: 9,
                background: "var(--card)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>{r.company}</span>
              <span style={{ fontSize: 14.5, flexGrow: 1, minWidth: 0 }}>{r.title}</span>
              {r.location && (
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.location}</span>
              )}
              {r.remote && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "var(--accent)",
                    background: "var(--accent-bg)",
                    borderRadius: 4,
                    padding: "2px 7px",
                  }}
                >
                  REMOTE
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 34,
          paddingTop: 22,
        }}
      >
        <p style={{ ...S.p, marginBottom: 10 }}>
          Not sure this is the right one of the nine?{" "}
          <a href="/quiz" style={{ color: "var(--accent)" }}>
            The two-minute quiz
          </a>{" "}
          weighs your experience and constraints against all of them.
        </p>
        <p style={{ ...S.p, fontSize: 13.5 }}>
          Ready to apply?{" "}
          <a
            href={`/?from=quiz&path=${encodeURIComponent(info.roleOption)}`}
            style={{ color: "var(--accent)" }}
          >
            Rewrite your resume for {info.label}
          </a>{" "}
          &mdash; it translates your clinical experience into the language these
          postings are written in.
        </p>
      </div>

      <p style={{ fontSize: 12, color: "var(--light)", marginTop: 22, lineHeight: 1.6 }}>
        How this list is built: every Monday we read the public job boards of the
        companies in our directory, keep the roles a former SLP could realistically
        land, and drop anything requiring a licence you don&rsquo;t hold. Postings close
        without warning &mdash; if a link is dead, the role is gone.
      </p>
    </PageShell>
  );
}
