"use client";

import { useMemo, useState } from "react";
import { S } from "./ui";

export interface Role {
  company: string;
  title: string;
  location: string;
  url: string;
  remote: boolean;
  path: string;
}

/**
 * US states both ways, because the feeds are inconsistent: Workday writes
 * "Carlsbad, CA, United States of America" while Greenhouse writes plain
 * "South Carolina". Someone searching either spelling should find both.
 */
const STATES: Record<string, string> = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar", california: "ca",
  colorado: "co", connecticut: "ct", delaware: "de", florida: "fl", georgia: "ga",
  hawaii: "hi", idaho: "id", illinois: "il", indiana: "in", iowa: "ia",
  kansas: "ks", kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
  massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
  missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv",
  "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm", "new york": "ny",
  "north carolina": "nc", "north dakota": "nd", ohio: "oh", oklahoma: "ok",
  oregon: "or", pennsylvania: "pa", "rhode island": "ri", "south carolina": "sc",
  "south dakota": "sd", tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
  virginia: "va", washington: "wa", "west virginia": "wv", wisconsin: "wi",
  wyoming: "wy", "district of columbia": "dc",
};
const ABBRS: Record<string, string> = Object.fromEntries(
  Object.entries(STATES).map(([name, ab]) => [ab, name])
);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Two-letter terms match whole words only. Plain substring matching is what
 * made a search for "CA" return jobs in Kansas — "clini(ca)l" contains it.
 * Anything longer stays substring so partial typing still narrows the list.
 */
function hit(hay: string, term: string): boolean {
  if (term.length > 2) return hay.includes(term);
  return new RegExp(`(^|[^a-z0-9])${esc(term)}([^a-z0-9]|$)`).test(hay);
}

/** A term plus the state spellings it implies, including partial typing. */
function variants(term: string): string[] {
  const out = new Set([term]);
  if (STATES[term]) out.add(STATES[term]);
  if (ABBRS[term]) out.add(ABBRS[term]);
  if (term.length >= 3) {
    for (const name of Object.keys(STATES)) {
      if (name.startsWith(term)) {
        out.add(name);
        out.add(STATES[name]);
      }
    }
  }
  return [...out];
}

/**
 * Public listing of currently-open roles, regenerated weekly.
 *
 * Filters are by career path, using the quiz's own labels, so someone who
 * took the quiz meets the same vocabulary here. Remote is a separate toggle
 * rather than a path, because "can I do this from home" cuts across all nine
 * and is the first thing most readers filter on.
 */
export default function OpenRoles({
  roles,
  paths,
}: {
  roles: Role[];
  paths: { slug: string; label: string }[];
}) {
  const [path, setPath] = useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [q, setQ] = useState("");

  const label = useMemo(
    () => Object.fromEntries(paths.map((p) => [p.slug, p.label])),
    [paths]
  );

  // Path label is in the haystack so "informatics" or "utilization" work —
  // that is the vocabulary the quiz result hands people.
  const indexed = useMemo(
    () =>
      roles.map((r) => ({
        r,
        hay: `${r.company} ${r.title} ${r.location} ${label[r.path] || ""}`.toLowerCase(),
      })),
    [roles, label]
  );

  const matchesQuery = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, " ");
    if (!needle) return null;
    // Multi-word state names survive as one term; everything else is AND-ed.
    const terms = STATES[needle] ? [needle] : needle.split(" ").filter(Boolean);
    if (!terms.length) return null;
    return (hay: string, remote: boolean) =>
      terms.every((t) => {
        if (t === "remote" && remote) return true;
        return variants(t).some((v) => hit(hay, v));
      });
  }, [q]);

  // Everything except the path filter, so the chip counts describe what
  // clicking a chip would actually show rather than the untouched list.
  const prePath = useMemo(
    () =>
      indexed.filter(
        ({ r, hay }) =>
          (!remoteOnly || r.remote) && (!matchesQuery || matchesQuery(hay, r.remote))
      ),
    [indexed, remoteOnly, matchesQuery]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const { r } of prePath) c[r.path] = (c[r.path] || 0) + 1;
    return c;
  }, [prePath]);

  const shown = useMemo(
    () => prePath.filter(({ r }) => !path || r.path === path).map(({ r }) => r),
    [prePath, path]
  );

  const grouped = useMemo(() => {
    const g: Record<string, Role[]> = {};
    for (const r of shown) (g[r.path] ||= []).push(r);
    return g;
  }, [shown]);

  const filtered = !!path || remoteOnly || !!q.trim();
  const clearAll = () => {
    setPath(null);
    setRemoteOnly(false);
    setQ("");
  };

  const chip = (active: boolean, dim = false): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : dim ? "var(--light)" : "var(--fg)",
    fontSize: 13.5,
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button style={chip(!path)} onClick={() => setPath(null)}>
          All {prePath.length}
        </button>
        {paths.map((p) => {
          const n = counts[p.slug] || 0;
          // A path with nothing in it right now stays visible but disabled,
          // so the row does not reshuffle under the cursor while typing.
          return (
            <button
              key={p.slug}
              style={{ ...chip(path === p.slug, n === 0), cursor: n ? "pointer" : "default" }}
              disabled={!n && path !== p.slug}
              onClick={() => setPath(path === p.slug ? null : p.slug)}
            >
              {p.label} {n}
            </button>
          );
        })}
        <button style={chip(remoteOnly)} onClick={() => setRemoteOnly(!remoteOnly)}>
          Remote only
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a company, title, or state…"
          style={{ ...S.input, paddingRight: 40 }}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 28,
              height: 28,
              border: "none",
              background: "transparent",
              color: "var(--muted)",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ minHeight: 22, marginBottom: 20 }}>
        {filtered && (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Showing {shown.length} of {roles.length}
            {" · "}
            <button
              onClick={clearAll}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                font: "inherit",
                color: "var(--accent)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear filters
            </button>
          </span>
        )}
      </div>

      {shown.length === 0 && (
        <p style={{ ...S.p, color: "var(--muted)" }}>
          Nothing matches that. Company names, job titles and states all work &mdash;
          try a state like <em>Texas</em>, or clear the filters to see all{" "}
          {roles.length}.
        </p>
      )}

      {paths
        .filter((p) => grouped[p.slug]?.length)
        .map((p) => (
          <section key={p.slug} style={{ marginBottom: 30 }}>
            <h2 style={{ ...S.h3, marginBottom: 10 }}>
              {p.label}{" "}
              <span style={{ color: "var(--light)", fontWeight: 400 }}>
                ({grouped[p.slug].length})
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[p.slug].map((r) => (
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
          </section>
        ))}
    </div>
  );
}
