"use client";

import { useMemo, useState } from "react";
import { V, S } from "@/components/ui";
import type { Company } from "@/lib/companies";

/**
 * The companies list, rendered from COMPANIES_DB.
 *
 * This replaces the old Airtable share link, which held a stale copy of the
 * same rows. One source of truth: edit lib/companies.ts and this updates.
 *
 * Design brief was "easiest to visually digest". For ~135 rows that means
 * search + faceted filters over a card grid, with counts on every facet so
 * you can see where the depth is before you click.
 */

// Roles as they appear in the data, ordered by how often SLPs actually land
// them rather than alphabetically — the top of this list is the useful part.
const ROLE_ORDER = [
  "Customer Success", "Operations", "Content", "Marketing", "Product",
  "Project Management", "Clinical", "Research", "Sales", "Design",
  "Data", "Engineering", "Recruiting/HR", "Coaching", "Consulting",
  "Teaching", "Community", "Telehealth",
];

const CAT_ORDER = [
  "SLP-Adjacent", "HealthTech", "EdTech", "Tech", "Coaching",
  "Recruiting", "Nonprofit", "e-commerce", "digital media",
  "healthcare marketing agency", "wellness",
];

const CAT_LABEL: Record<string, string> = {
  "SLP-Adjacent": "Speech & AAC",
  "healthcare marketing agency": "Healthcare marketing",
  "digital media": "Digital media",
  "e-commerce": "E-commerce",
  "wellness": "Wellness",
  "Recruiting": "Recruiting & jobs",
};

const sortBy = (order: string[]) => (a: string, b: string) => {
  const ia = order.indexOf(a), ib = order.indexOf(b);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
};

function Chip({
  active, onClick, children, count,
}: { active: boolean; onClick: () => void; children: React.ReactNode; count: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", fontSize: 13.5, fontWeight: active ? 600 : 500,
        borderRadius: 999, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent)" : "var(--card)",
        color: active ? "#fff" : "var(--text)",
        transition: "all .15s", whiteSpace: "nowrap",
      }}
    >
      {children}
      <span style={{ opacity: active ? 0.75 : 0.5, marginLeft: 6, fontVariantNumeric: "tabular-nums" }}>
        {count}
      </span>
    </button>
  );
}

export default function CompaniesDirectory({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);

  const allRoles = useMemo(
    () => [...new Set(companies.flatMap((c) => c.roles))].sort(sortBy(ROLE_ORDER)),
    [companies]
  );
  const allCats = useMemo(
    () => [...new Set(companies.flatMap((c) => c.categories))].sort(sortBy(CAT_ORDER)),
    [companies]
  );

  // Counts reflect the *other* active filter, so a facet never shows a number
  // that would give you zero results when you click it.
  const countFor = (kind: "role" | "cat", value: string) =>
    companies.filter((c) =>
      kind === "role"
        ? c.roles.includes(value) && (!cat || c.categories.includes(cat))
        : c.categories.includes(value) && (!role || c.roles.includes(role))
    ).length;

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return companies
      .filter((c) => (!role || c.roles.includes(role)))
      .filter((c) => (!cat || c.categories.includes(cat)))
      .filter((c) =>
        !needle ||
        c.name.toLowerCase().includes(needle) ||
        c.note.toLowerCase().includes(needle) ||
        c.roles.join(" ").toLowerCase().includes(needle) ||
        c.categories.join(" ").toLowerCase().includes(needle)
      )
      .sort((a, b) => {
        // Speech & AAC companies first — most relevant to this audience.
        const sa = a.categories.includes("SLP-Adjacent") ? 0 : 1;
        const sb = b.categories.includes("SLP-Adjacent") ? 0 : 1;
        return sa - sb || a.name.localeCompare(b.name);
      });
  }, [companies, q, role, cat]);

  const filtered = Boolean(q.trim() || role || cat);

  return (
    <div style={{ ...V, fontFamily: "'DM Sans', sans-serif", color: "var(--text)" } as React.CSSProperties}>
      {/* search */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${companies.length} companies — try “AAC”, “remote”, “aphasia”…`}
        aria-label="Search companies"
        style={{ ...S.input, fontSize: 16, padding: "13px 16px", marginBottom: 22 }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      <FacetRow label="What you'd do">
        {allRoles.map((r) => {
          const n = countFor("role", r);
          if (!n && role !== r) return null;
          return (
            <Chip key={r} active={role === r} count={n} onClick={() => setRole(role === r ? null : r)}>
              {r}
            </Chip>
          );
        })}
      </FacetRow>

      <FacetRow label="Kind of company">
        {allCats.map((c) => {
          const n = countFor("cat", c);
          if (!n && cat !== c) return null;
          return (
            <Chip key={c} active={cat === c} count={n} onClick={() => setCat(cat === c ? null : c)}>
              {CAT_LABEL[c] ?? c}
            </Chip>
          );
        })}
      </FacetRow>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, margin: "26px 0 14px", flexWrap: "wrap",
      }}>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>{results.length}</strong>
          {results.length === 1 ? " company" : " companies"}
          {filtered ? " match your filters" : ""}
        </p>
        {filtered && (
          <button
            onClick={() => { setQ(""); setRole(null); setCat(null); }}
            style={{ ...S.btnOut, padding: "6px 14px", fontSize: 13 }}
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p style={{ ...S.p, padding: "36px 0", textAlign: "center" }}>
          Nothing matches that combination. Try clearing a filter.
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

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "var(--light)", margin: "0 0 9px",
      }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
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
        fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: "8px 0 12px",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {c.note.replace(/\s+/g, " ").trim()}
      </p>

      {c.roles.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {c.roles.slice(0, 4).map((r) => (
            <span key={r} style={{
              fontSize: 11.5, padding: "2px 8px", borderRadius: 4,
              background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)",
            }}>
              {r}
            </span>
          ))}
          {c.roles.length > 4 && (
            <span style={{ fontSize: 11.5, padding: "2px 4px", color: "var(--light)" }}>
              +{c.roles.length - 4}
            </span>
          )}
        </div>
      )}
    </a>
  );
}
