"use client";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { S } from "@/components/ui";
import { BADGES, type BadgeId } from "@/lib/course";

export const font = { serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', -apple-system, sans-serif" };

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { const m = window.matchMedia("(prefers-reduced-motion: reduce)"); setR(m.matches); const f = () => setR(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return r;
}

/** Counts up to `value` so XP feels earned rather than assigned. */
export function CountUp({ value, ms = 700 }: { value: number; ms?: number }) {
  const [v, setV] = useState(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) { setV(value); return; }
    const from = v, to = value, t0 = performance.now();
    if (from === to) return;
    let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{v}</>;
}

export function Ring({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${pct}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.2,1)" }} />
      <text x="50%" y="53%" dominantBaseline="middle" textAnchor="middle" fontSize={size < 50 ? 11 : 14} fontWeight={700} fill="var(--accent)" fontFamily={font.sans}>{pct}%</text>
    </svg>
  );
}

export function Pill({ children, tone = "accent", style }: { children: ReactNode; tone?: "accent" | "warm" | "muted"; style?: CSSProperties }) {
  const bg = tone === "accent" ? "var(--accent-bg-subtle)" : tone === "warm" ? "var(--warn-bg)" : "#F3F4F6";
  const color = tone === "accent" ? "var(--accent)" : tone === "warm" ? "#92400E" : "var(--muted)";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: bg, color, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>;
}

export function CourseShell({ children, xp, streak, pct, right }: { children: ReactNode; xp: number; streak: number; pct: number; right?: ReactNode }) {
  return (
    <div style={{ ...S.root, padding: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <a href="/course" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="" width={30} height={30} style={{ display: "block" }} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>Transition OS</div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>SLP Transitions · 90-day program</div>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Pill><span aria-hidden>✦</span> <CountUp value={xp} /> XP</Pill>
            <Pill tone={streak > 0 ? "warm" : "muted"}><span aria-hidden>🔥</span> {streak} day{streak === 1 ? "" : "s"}</Pill>
            <Ring pct={pct} size={40} />
            {right}
          </div>
        </div>
      </div>
      <div style={{ background: "var(--warn-bg)", color: "#92400E", fontSize: 12, textAlign: "center", padding: "6px 12px" }}>
        Prototype build for review. Progress is saved in this browser only. Modules 2 to 6 are outlined and unlock after approval.
      </div>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px 60px" }}>{children}</div>
    </div>
  );
}

/** Slides in when XP lands; a badge gets the bigger treatment. */
export function UnlockToast({ xp, badges, onDone }: { xp: number; badges: BadgeId[]; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, badges.length ? 5200 : 2600); return () => clearTimeout(t); }, [badges.length, onDone]);
  const defs = badges.map((b) => BADGES.find((d) => d.id === b)!).filter(Boolean);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 90 }}>
      <div className="tos-pop" style={{ pointerEvents: "auto", background: "var(--card)", border: "1px solid var(--accent-bg)", borderRadius: 16, padding: defs.length ? "22px 26px" : "12px 18px", boxShadow: "0 16px 48px rgba(10,61,49,0.18)", textAlign: "center", position: "relative", overflow: "hidden", minWidth: 260 }}>
        {defs.length > 0 && (
          <div className="tos-confetti" aria-hidden style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ left: `${(i * 53) % 100}%`, background: ["#2D6A4F", "#40916C", "#D8F3DC", "#DC6803", "#FEF3C7"][i % 5], animationDelay: `${(i % 6) * 90}ms` }} />
            ))}
          </div>
        )}
        {defs.map((d) => (
          <div key={d.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 40, lineHeight: 1 }}>{d.icon}</div>
            <div style={{ fontFamily: font.serif, fontSize: 20, fontWeight: 700, marginTop: 6 }}>{d.label}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, maxWidth: 300 }}>{d.blurb}</div>
          </div>
        ))}
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>+{xp} XP</div>
      </div>
    </div>
  );
}

export function Btn({ children, onClick, outline, disabled, style, href }: { children: ReactNode; onClick?: () => void; outline?: boolean; disabled?: boolean; style?: CSSProperties; href?: string }) {
  const base: CSSProperties = { ...(outline ? S.btnOut : S.btn), opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", textDecoration: "none", display: "inline-block", ...style };
  if (href && !disabled) return <a href={href} className={outline ? undefined : "tos-btn"} style={base}>{children}</a>;
  return <button type="button" className={outline ? undefined : "tos-btn"} onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

export function Panel({ children, style, tone = "card" }: { children: ReactNode; style?: CSSProperties; tone?: "card" | "soft" | "warm" }) {
  const bg = tone === "soft" ? "var(--accent-bg-subtle)" : tone === "warm" ? "var(--warn-bg)" : "var(--card)";
  const border = tone === "soft" ? "var(--accent-bg)" : tone === "warm" ? "#FDE68A" : "var(--border)";
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

export function Slider({ label, left, right, value, onChange, format }: { label: string; left: string; right: string; value: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        {format && <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{format(value)}</span>}
      </div>
      <input className="tos-range" type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 4 }}><span>{left}</span><span>{right}</span></div>
    </div>
  );
}
