import type { Metadata } from "next";
import { PageShell, S } from "@/components/ui";
import OpenRoles from "@/components/OpenRoles";
import { collectionLd, JsonLd } from "@/lib/seo";
import {
  ROLES,
  PATH_LIST,
  SITE,
  GENERATED_AT,
  formatUpdated,
  snapshotAgeDays,
  remoteCount,
  companyCount,
} from "@/lib/open-roles";

const URL = `${SITE}/jobs`;

export const metadata: Metadata = {
  title: "Open non-clinical roles for SLPs | SLP Transitions",
  description:
    "Currently-open roles at companies that hire speech-language pathologists into non-clinical work — customer success, clinical informatics, instructional design, utilization review and more. Updated weekly.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Open non-clinical roles for SLPs",
    description:
      "Openings this week at companies that hire speech-language pathologists into non-clinical work, grouped by career path.",
    url: URL,
    type: "website",
  },
};

// Unlike /companies (which points at the WP lead-magnet page), this is
// genuinely new content worth ranking on its own, so it stays indexable.

export default function JobsPage() {
  const remote = remoteCount();
  const updated = formatUpdated();
  const stale = snapshotAgeDays() > 10;

  const counts: Record<string, number> = {};
  for (const r of ROLES) counts[r.path] = (counts[r.path] || 0) + 1;
  const biggest = PATH_LIST.filter((p) => counts[p.slug]).sort(
    (a, b) => counts[b.slug] - counts[a.slug]
  )[0];

  return (
    <PageShell wide>
      <JsonLd
        data={collectionLd({
          url: URL,
          name: "Open non-clinical roles for SLPs",
          description: `${ROLES.length} openings at ${companyCount()} companies that hire speech-language pathologists into non-clinical work, grouped by ${PATH_LIST.length} career paths.`,
          modified: GENERATED_AT,
          // The hub points at the path pages rather than the individual
          // roles; each of those carries its own ItemList of openings.
          items: PATH_LIST.map((p) => ({
            name: `${p.label} jobs for former SLPs`,
            url: `${SITE}/jobs/${p.slug}`,
          })),
        })}
      />

      <h1 style={S.h1}>Open roles worth a look</h1>
      <p style={{ ...S.p, marginBottom: 8 }}>
        {ROLES.length} openings pulled this week from the job boards of companies that
        hire former SLPs, {remote} of them remote. Grouped by the same career paths
        the quiz uses.
      </p>

      {/* A plain, quotable statement of what the week's data shows. Nobody else
          publishes these numbers for this audience, and it gives both readers
          and answer engines something to take away from a page of links. */}
      {biggest && (
        <p style={{ ...S.p, marginBottom: 8 }}>
          This week: {counts[biggest.slug]} of the {ROLES.length} openings are{" "}
          <a href={`/jobs/${biggest.slug}`} style={{ color: "var(--accent)" }}>
            {biggest.label}
          </a>{" "}
          roles, the largest category, and {remote} can be done from home. They sit
          across {companyCount()} companies.
        </p>
      )}

      <p style={{ ...S.p, fontSize: 13, color: "var(--muted)", marginBottom: 26 }}>
        Updated {updated}. Postings close without warning, so if a link is dead the
        role is gone &mdash; check the company&rsquo;s careers page for what replaced it.
        {stale && (
          <>
            {" "}
            <strong style={{ color: "var(--warn)" }}>
              This snapshot is more than a week overdue for a refresh, so expect more
              dead links than usual.
            </strong>
          </>
        )}
      </p>

      <OpenRoles roles={ROLES} paths={PATH_LIST} />

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 34, paddingTop: 22 }}>
        <h2 style={{ ...S.h2, fontSize: 20 }}>What each path pays, and how long it takes</h2>
        <p style={{ ...S.p, marginBottom: 14 }}>
          Every path has its own page with a sourced salary range, an honest timeline,
          the way most people get in, and the thing that disqualifies people who skip
          it.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {PATH_LIST.map((p) => (
            <a
              key={p.slug}
              href={`/jobs/${p.slug}`}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 13.5,
                textDecoration: "none",
                color: "var(--text)",
              }}
            >
              {p.label}
            </a>
          ))}
        </div>

        <p style={{ ...S.p, fontSize: 13 }}>
          Not sure which of these fits you? The{" "}
          <a href="/quiz" style={{ color: "var(--accent)" }}>
            two-minute quiz
          </a>{" "}
          matches you against {PATH_LIST.length} documented paths, with real salary ranges and
          honest timelines.
        </p>

        <p style={{ fontSize: 12, color: "var(--light)", lineHeight: 1.6 }}>
          How this list is built: every Monday we read the public job boards of the
          companies in our directory, keep the roles a former SLP could realistically
          land, and drop anything requiring a licence you don&rsquo;t hold. Nobody pays
          to appear here.
        </p>
      </div>
    </PageShell>
  );
}
