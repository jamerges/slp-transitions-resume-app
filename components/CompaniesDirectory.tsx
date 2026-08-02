"use client";

import { useMemo, useState } from "react";
import { V, S } from "@/components/ui";
import type { Company } from "@/lib/companies";

/**
 * The companies list, rendered from COMPANIES_DB.
 *
 * Replaces the old Airtable share link, which held a stale copy of the same
 * rows. One source of truth: edit lib/companies.ts and this updates.
 *
 * Deliberately does NOT filter or badge by role. The `roles` field records
 * functions each company was observed hiring for at some point — it is not
 * live openings data, and surfacing it as a filter implied a job board we
 * don't have. If we ever ingest live postings, it can come back.
 */

// The raw data carries 11 category values, most with 1-4 companies. Collapsed
// to the four that are actually decision-relevant for an SLP, plus Other.
const OTHER = "Other";
const GROUPS: { key: string; label: string; match: (c: Company) => boolean }[] = [
  { key: "SLP-Adjacent", label: "Speech & AAC", match: (c) => c.categories.includes("SLP-Adjacent") },
  { key: "HealthTech",   label: "Health tech",  match: (c) => c.categories.includes("HealthTech") },
  { key: "EdTech",       label: "Ed tech",      match: (c) => c.categories.includes("EdTech") },
  { key: "Tech",         label: "Tech",         match: (c) => c.categories.includes("Tech") },
  {
    key: OTHER,
    label: "Everything else",
    match: (c) => !["SLP-Adjacent", "HealthTech", "EdTech", "Tech"].some((k) => c.categories.includes(k)),
  },
];

function Chip({
  active, onClick, children, count,
}: { active: boolean; onClick: () => void; children: React.ReactNode; count: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px", fontSize: 14, fontWeight: active ? 600 : 500,
        borderRadius: 999, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent)" : "var(--card)",
        color: active ? "#fff" : "var(--text)",
        transition: "all .15s", whiteSpace: "nowrap",
      }}
    >
      {children}
      <span style={{ opacity: active ? 0.75 : 0.5, marginLeft: 7, fontVariantNumeric: "tabular-nums" }}>
        {count}
      </span>
    </button>
  );
}

export default function CompaniesDirectory({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const g = GROUPS.find((x) => x.key === group);
    return companies
      .filter((c) => (!g || g.match(c)))
      .filter((c) =>
        !needle ||
        c.name.toLowerCase().includes(needle) ||
        c.note.toLowerCase().includes(needle) ||
        c.categories.join(" ").toLowerCase().includes(needle)
      )
      .sort((a, b) => {
        // Speech & AAC first — most relevant to this audience.
        const sa = a.categories.includes("SLP-Adjacent") ? 0 : 1;
        const sb = b.categories.includes("SLP-Adjacent") ? 0 : 1;
        return sa - sb || a.name.localeCompare(b.name);
      });
  }, [companies, q, group]);

  const filtered = Boolean(q.trim() || group);

  return (
    <div style={{ ...V, fontFamily: "'DM Sans', sans-serif", color: "var(--text)" } as React.CSSProperties}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${companies.length} companies — try “AAC”, “aphasia”, “autism”…`}
        aria-label="Search companies"
        style={{ ...S.input, fontSize: 16, padding: "13px 16px", marginBottom: 22 }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {GROUPS.map((g) => {
          const n = companies.filter(g.match).length;
          if (!n) return null;
          return (
            <Chip
              key={g.key}
              active={group === g.key}
              count={n}
              onClick={() => setGroup(group === g.key ? null : g.key)}
            >
              {g.label}
            </Chip>
          );
        })}
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, margin: "26px 0 14px", flexWrap: "wrap",
      }}>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>{results.length}</strong>
          {results.length === 1 ? " company" : " companies"}
          {filtered ? " match" : ""}
        </p>
        {filtered && (
          <button
            onClick={() => { setQ(""); setGroup(null); }}
            style={{ ...S.btnOut, padding: "6px 14px", fontSize: 13 }}
          >
            Clear
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p style={{ ...S.p, padding: "36px 0", textAlign: "center" }}>
          Nothing matches that. Try a different word, or clear the filter.
        </p>
      ) : (
        <div style={{
          display: "grid", gap: 14,
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        }}>
          {results.map((c) => <Card key={c.name + c.url} c={c} />)}
        </div>
      )}
    </div>
  );
}

function Card({ c }: { c: Company }) {
  const slp = c.categories.includes("SLP-Adjacent");
  const href = c.url.startsWith("http") ? c.url : `https://${c.url}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block", textDecoration: "none", color: "inherit",
        background: "var(--card)", borderRadius: 12, padding: "18px 18px 16px",
        border: `1px solid ${slp ? "var(--accent-light)" : "var(--border)"}`,
        boxShadow: slp ? "0 0 0 3px var(--accent-bg-subtle)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <h3 style={{ fontSize: 16.5, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{c.name}</h3>
        {slp && <span style={{ ...S.tag, flexShrink: 0 }}>Speech</span>}
      </div>

      <p style={{
        fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: "8px 0 0",
        display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {c.note.replace(/\s+/g, " ").trim()}
      </p>
    </a>
  );
}
