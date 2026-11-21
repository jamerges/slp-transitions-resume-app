// Style tokens shared by server and client components. This file has no
// "use client" on purpose: a server page that imports S from components/ui
// (a client module) gets a client reference instead of the object, and every
// S.h1 on it silently rendered as the browser default. Server pages import
// from here; client components can use either.
import type { CSSProperties } from "react";

export const V: Record<string, string> = {
  "--accent": "#004820",
  "--accent-light": "#266341",
  "--accent-bg": "#DCE1D2",
  "--accent-bg-subtle": "#E5E7D9",
  "--text": "#1B1B1E",
  "--muted": "#5B6157",
  "--light": "#5B6157",
  "--bg": "#F8F7F0",
  "--card": "#FFFFFF",
  "--border": "#DAD8C6",
  "--warn": "#DC6803",
  "--warn-bg": "#FEF3C7",
  "--err": "#DC2626",
  "--err-bg": "#FEE2E2",
};

// The site's two typefaces. Fraunces is set light (300) for headlines with one
// phrase in italics, the same as slptransitions.com since 2026-11-20. FONTS_HREF
// loads the weight range, so a stray 600 still gets a real cut and not a faux bold.
export const SERIF = "'Fraunces', Georgia, serif";
export const FONTS_HREF = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&display=swap";
// The saturated panel the homepage uses for its one loud surface per screen.
export const FOREST_PANEL: CSSProperties = {
  background: "radial-gradient(900px 420px at 100% -10%, rgba(214,232,170,.32), transparent 60%), radial-gradient(700px 380px at 0% 110%, rgba(57,140,96,.5), transparent 60%), linear-gradient(140deg, #002F15 0%, #004820 52%, #145C39 100%)",
  color: "#fff",
  borderRadius: 28,
};

export const S = {
  root: { ...V, fontFamily: "'DM Sans', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh", padding: "0 16px" } as CSSProperties,
  wrap: { maxWidth: 680, margin: "0 auto" } as CSSProperties,
  h1: { fontFamily: SERIF, fontSize: 38, fontWeight: 300, lineHeight: 1.12, letterSpacing: "-0.015em", marginBottom: 14 } as CSSProperties,
  h2: { fontFamily: SERIF, fontSize: 25, fontWeight: 400, lineHeight: 1.22, letterSpacing: "-0.01em", marginBottom: 8 } as CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginBottom: 6 } as CSSProperties,
  p: { fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 20 } as CSSProperties,
  label: { display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 } as CSSProperties,
  input: { width: "100%", padding: "10px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 10, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" } as CSSProperties,
  textarea: { width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", minHeight: 120, lineHeight: 1.6, boxSizing: "border-box" } as CSSProperties,
  btn: { padding: "13px 28px", fontSize: 15, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 999, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" } as CSSProperties,
  btnOut: { padding: "10px 24px", fontSize: 14, fontWeight: 500, background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)", borderRadius: 999, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" } as CSSProperties,
  tag: { display: "inline-block", padding: "4px 11px", fontSize: 11, fontWeight: 600, borderRadius: 999, background: "var(--accent-bg)", color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" as const } as CSSProperties,
};
