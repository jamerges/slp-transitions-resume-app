import { PageShell, S } from "@/components/ui";
import OpenRoles, { type Role } from "@/components/OpenRoles";
import snapshot from "@/lib/open-roles.json";

export const metadata = {
  title: "Open non-clinical roles for SLPs | SLP Transitions",
  description:
    "Currently-open roles at companies that hire speech-language pathologists into non-clinical work — customer success, clinical informatics, instructional design, utilization review and more. Updated weekly.",
};

// Unlike /companies (which points at the WP lead-magnet page), this is
// genuinely new content worth ranking on its own, so it stays indexable.

export default function JobsPage() {
  const { roles, paths, generated } = snapshot as {
    roles: Role[];
    paths: { slug: string; label: string }[];
    generated: string;
  };
  const remote = roles.filter((r) => r.remote).length;
  const updated = new Date(generated + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <PageShell wide>
      <h1 style={S.h1}>Open roles worth a look</h1>
      <p style={{ ...S.p, marginBottom: 8 }}>
        {roles.length} openings pulled this week from the job boards of companies that
        hire former SLPs, {remote} of them remote. Grouped by the same career paths
        the quiz uses.
      </p>
      <p style={{ ...S.p, fontSize: 13, color: "var(--muted)", marginBottom: 26 }}>
        Updated {updated}. Postings close without warning, so if a link is dead the
        role is gone &mdash; check the company&rsquo;s careers page for what replaced it.
      </p>

      <OpenRoles roles={roles} paths={paths} />

      <p style={{ ...S.p, fontSize: 13, color: "var(--muted)", marginTop: 34 }}>
        Not sure which of these fits you? The{" "}
        <a href="/quiz" style={{ color: "var(--accent)" }}>
          two-minute quiz
        </a>{" "}
        matches you against nine documented paths, with real salary ranges and
        honest timelines.
      </p>
    </PageShell>
  );
}
