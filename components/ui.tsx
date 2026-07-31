"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export const V: Record<string, string> = {
  "--accent": "#2D6A4F",
  "--accent-light": "#40916C",
  "--accent-bg": "#D8F3DC",
  "--accent-bg-subtle": "#F0FAF3",
  "--text": "#1B1B1E",
  "--muted": "#6B7280",
  "--light": "#9CA3AF",
  "--bg": "#FAFAF9",
  "--card": "#FFFFFF",
  "--border": "#E5E7EB",
  "--warn": "#DC6803",
  "--warn-bg": "#FEF3C7",
  "--err": "#DC2626",
  "--err-bg": "#FEE2E2",
};

export const S = {
  root: { ...V, fontFamily: "'DM Sans', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh", padding: "0 16px" } as CSSProperties,
  wrap: { maxWidth: 680, margin: "0 auto" } as CSSProperties,
  h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12 } as CSSProperties,
  h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 } as CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginBottom: 6 } as CSSProperties,
  p: { fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 20 } as CSSProperties,
  label: { display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 } as CSSProperties,
  input: { width: "100%", padding: "10px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" } as CSSProperties,
  textarea: { width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", minHeight: 120, lineHeight: 1.6, boxSizing: "border-box" } as CSSProperties,
  btn: { padding: "12px 28px", fontSize: 15, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" } as CSSProperties,
  btnOut: { padding: "10px 24px", fontSize: 14, fontWeight: 500, background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" } as CSSProperties,
  tag: { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 600, borderRadius: 4, background: "var(--accent-bg)", color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" as const } as CSSProperties,
};

export const focusB = (e: any) => (e.target.style.borderColor = "var(--accent)");
export const blurB = (e: any) => (e.target.style.borderColor = "var(--border)");

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        padding: "4px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6,
        border: "1px solid var(--border)", background: copied ? "var(--accent-bg)" : "var(--card)",
        color: copied ? "var(--accent)" : "var(--muted)", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export function Card({
  children,
  style = {},
  highlight = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight ? "var(--accent-bg-subtle)" : "var(--card)",
        border: `1px solid ${highlight ? "var(--accent-bg)" : "var(--border)"}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block", padding: "7px 16px", fontSize: 13,
        fontWeight: selected ? 600 : 400, borderRadius: 20,
        border: selected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
        background: selected ? "var(--accent-bg-subtle)" : "var(--card)",
        color: selected ? "var(--accent)" : "var(--muted)",
        cursor: "pointer", margin: "0 6px 8px 0", userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ width: "100%", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--muted)" }}>
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

const COVERAGE_STYLES: Record<string, { icon: string; bg: string; color: string; label: string }> = {
  covered: { icon: "✓", bg: "#D1FAE5", color: "#065F46", label: "Covered" },
  partial: { icon: "◐", bg: "#FEF3C7", color: "#92400E", label: "Partial" },
  missing: { icon: "○", bg: "#FEE2E2", color: "#991B1B", label: "Gap" },
};

export function CoverageTable({ items }: { items: Array<{ requirement: string; status: string; evidence?: string; action?: string }> }) {
  if (!items?.length) return null;
  return (
    <div>
      {items.map((r, i) => {
        const st = COVERAGE_STYLES[r.status] || COVERAGE_STYLES.partial;
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: st.bg, color: st.color, whiteSpace: "nowrap", flexShrink: 0, marginTop: 1 }}>
              {st.icon} {st.label}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{r.requirement}</div>
              {r.evidence && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{r.evidence}</div>}
              {r.action && r.status !== "covered" && (
                <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 4, lineHeight: 1.5 }}>→ {r.action}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mirrors the main-site nav so the tool reads as part of slptransitions.com
// rather than a detached app. Keep in sync if the site menu changes.
const SITE = "https://slptransitions.com";
const NAV = [
  { label: "Articles", href: `${SITE}/` },
  { label: "Career Quiz", href: "/quiz" },
  { label: "Companies List", href: `${SITE}/ed-health-tech-jobs/` },
  { label: "About", href: `${SITE}/about/` },
  { label: "Contact", href: `${SITE}/contact-us/` },
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <div style={{ ...S.wrap, padding: "32px 0 20px", borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href={SITE} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="" width={34} height={34} style={{ display: "block" }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--accent)", lineHeight: 1.15 }}>SLP Transitions</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Career Pivot Suite</div>
            </div>
          </a>
          <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {children}

      <div style={{ ...S.wrap, padding: "28px 0", borderTop: "1px solid var(--border)", marginTop: 32, textAlign: "center" }}>
        <nav style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
          {NAV.map((n) => (
            <a key={n.label} href={n.href} style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
              {n.label}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="" width={18} height={18} style={{ display: "block" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", fontFamily: "'Playfair Display', Georgia, serif" }}>SLP Transitions</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--light)", margin: 0 }}>
          Your degree isn't a prison. Your skills compound.
        </p>
      </div>
    </div>
  );
}
