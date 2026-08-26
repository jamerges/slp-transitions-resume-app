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

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of roles) c[r.path] = (c[r.path] || 0) + 1;
    return c;
  }, [roles]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return roles.filter((r) => {
      if (path && r.path !== path) return false;
      if (remoteOnly && !r.remote) return false;
      if (needle && !`${r.company} ${r.title} ${r.location}`.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [roles, path, remoteOnly, q]);

  const grouped = useMemo(() => {
    const g: Record<string, Role[]> = {};
    for (const r of shown) (g[r.path] ||= []).push(r);
    return g;
  }, [shown]);

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : "var(--fg)",
    fontSize: 13.5,
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button style={chip(!path)} onClick={() => setPath(null)}>
          All {roles.length}
        </button>
        {paths
          .filter((p) => counts[p.slug])
          .map((p) => (
            <button
              key={p.slug}
              style={chip(path === p.slug)}
              onClick={() => setPath(path === p.slug ? null : p.slug)}
            >
              {p.label} {counts[p.slug]}
            </button>
          ))}
        <button style={chip(remoteOnly)} onClick={() => setRemoteOnly(!remoteOnly)}>
          Remote only
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a company, title, or state…"
        style={{ ...S.input, marginBottom: 22 }}
      />

      {shown.length === 0 && (
        <p style={{ ...S.p, color: "var(--muted)" }}>
          Nothing matches that. Try clearing the filters.
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
