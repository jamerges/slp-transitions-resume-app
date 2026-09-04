"use client";
// The animated-explainer engine. A lesson is a list of scenes; each scene is a
// React render plus a caption and a duration. It autoplays like a video,
// scrubs like a slideshow, and reads as a static page under reduced motion.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { font, useReducedMotion } from "./ui";

export interface Scene { id: string; ms: number; caption: string; render: () => ReactNode }

export function Explainer({ scenes, onFinished, title }: { scenes: Scene[]; onFinished?: () => void; title: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<number | null>(null);
  const total = scenes.length;

  useEffect(() => {
    if (!playing || reduced) return;
    timer.current = window.setTimeout(() => {
      if (i < total - 1) setI(i + 1); else { setPlaying(false); setDone(true); onFinished?.(); }
    }, scenes[i].ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [i, playing, reduced, scenes, total, onFinished]);

  useEffect(() => { if (reduced && i === total - 1 && !done) { setDone(true); onFinished?.(); } }, [reduced, i, total, done, onFinished]);

  const go = (n: number) => { setI(Math.max(0, Math.min(total - 1, n))); if (n >= total - 1 && !done) { setDone(true); onFinished?.(); } };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--card)", boxShadow: "0 6px 24px rgba(10,61,49,0.08)" }}>
      <div style={{ position: "relative", aspectRatio: "16 / 9", background: "linear-gradient(160deg, #FAFAF9 0%, #F0FAF3 100%)", overflow: "hidden" }}>
        <div key={scenes[i].id} style={{ position: "absolute", inset: 0, padding: "clamp(14px, 4vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {scenes[i].render()}
        </div>
        {!playing && !done && i === 0 && !reduced && (
          <button type="button" onClick={() => setPlaying(true)} aria-label="Play" style={{ position: "absolute", inset: 0, background: "rgba(27,27,30,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="tos-pulse" style={{ width: 76, height: 76, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, paddingLeft: 6 }}>▶</span>
          </button>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(0,0,0,0.06)" }}>
          <div style={{ height: "100%", width: `${((i + 1) / total) * 100}%`, background: "var(--accent)", transition: "width 400ms ease" }} />
        </div>
      </div>
      <div key={"cap" + scenes[i].id} className="tos-caption" style={{ padding: "14px 18px 6px", fontSize: 15, lineHeight: 1.55, minHeight: 58, fontFamily: font.sans }}>
        {scenes[i].caption}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 14px", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Ctl onClick={() => go(i - 1)} disabled={i === 0} label="Previous">‹</Ctl>
          {!reduced && (
            <Ctl onClick={() => { if (done && i === total - 1) { setI(0); setDone(false); setPlaying(true); } else setPlaying(!playing); }} label={playing ? "Pause" : "Play"} primary>
              {playing ? "❚❚" : done && i === total - 1 ? "↻" : "▶"}
            </Ctl>
          )}
          <Ctl onClick={() => go(i + 1)} disabled={i === total - 1} label="Next">›</Ctl>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} aria-label={`${title}: scene ${i + 1} of ${total}`}>
          {scenes.map((s, k) => (
            <button key={s.id} type="button" onClick={() => go(k)} aria-label={`Scene ${k + 1}`} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, border: "none", background: k <= i ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "width 200ms ease", padding: 0 }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{i + 1} / {total}</span>
      </div>
    </div>
  );
}

function Ctl({ children, onClick, disabled, label, primary }: { children: ReactNode; onClick: () => void; disabled?: boolean; label: string; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      style={{ width: primary ? 44 : 36, height: primary ? 44 : 36, borderRadius: "50%", border: primary ? "none" : "1px solid var(--border)", background: primary ? "var(--accent)" : "var(--card)", color: primary ? "#fff" : "var(--text)", fontSize: primary ? 15 : 20, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
      {children}
    </button>
  );
}

/* ----------------------------- scene helpers ----------------------------- */
export const Big = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <div className="tos-rise" style={{ animationDelay: `${delay}ms`, fontFamily: font.serif, fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--text)", maxWidth: "22ch" }}>{children}</div>
);
export const Sub = ({ children, delay = 200 }: { children: ReactNode; delay?: number }) => (
  <div className="tos-rise" style={{ animationDelay: `${delay}ms`, fontSize: "clamp(14px, 2vw, 18px)", color: "var(--muted)", marginTop: 12, maxWidth: "48ch", lineHeight: 1.5 }}>{children}</div>
);
export const Kicker = ({ children }: { children: ReactNode }) => (
  <div className="tos-fade" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>{children}</div>
);
export const Strike = ({ children, delay = 400 }: { children: ReactNode; delay?: number }) => (
  <span className="tos-strike" style={{ ["--d" as string]: `${delay}ms`, display: "inline-block" }}>{children}</span>
);
