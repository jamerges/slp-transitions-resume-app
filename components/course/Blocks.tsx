"use client";
// Renders a lesson's JSON content (content/course/LESSON_SPEC.md). Built to be
// skimmed: a TL;DR card first, numbered section headings, stat tiles, and a
// takeaways card at the end. Body text stays short and well spaced.
import { useState, type ReactNode } from "react";
import { PATHS } from "@/lib/quiz";
import { pathImage } from "@/lib/quiz";
import type { Block, LessonContent } from "@/lib/course-content";
import { Panel, font } from "./ui";
import { Tool } from "./tools";

/** Markdown-lite: **bold**, *italic*, nothing else. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return <>{parts.map((s, i) => s.startsWith("**") ? <strong key={i}>{s.slice(2, -2)}</strong> : s.startsWith("*") ? <em key={i}>{s.slice(1, -1)}</em> : <span key={i}>{s}</span>)}</>;
}

const P = ({ children }: { children: ReactNode }) => <p style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 16px", color: "var(--text)", maxWidth: "68ch" }}>{children}</p>;

export function Tldr({ text }: { text: string }) {
  return (
    <div className="tos-rise" style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--accent-bg-subtle)", border: "1px solid var(--accent-bg)", borderRadius: 14, padding: "16px 18px", marginBottom: 26 }}>
      <span aria-hidden style={{ fontSize: 20, lineHeight: 1, color: "var(--accent)", marginTop: 2 }}>✦</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>In one breath</div>
        <div style={{ fontSize: 16, lineHeight: 1.6 }}><Inline text={text} /></div>
      </div>
    </div>
  );
}

export function Takeaways({ items }: { items: string[] }) {
  return (
    <Panel tone="soft" style={{ marginTop: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>Take with you</div>
      {items.map((t, i) => (
        <div key={i} className="tos-rise" style={{ animationDelay: `${i * 70}ms`, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.55, marginBottom: 8 }}>
          <span aria-hidden style={{ color: "var(--accent)", fontWeight: 700, marginTop: 1 }}>✓</span><span><Inline text={t} /></span>
        </div>
      ))}
    </Panel>
  );
}

export function Blocks({ content, pathSlug, tools }: { content: LessonContent; pathSlug?: string; tools: Record<string, any> }) {
  let h = 0;
  return (
    <div>
      <Tldr text={content.tldr} />
      {content.blocks.map((b, i) => <BlockView key={i} b={b} n={b.type === "h" ? ++h : h} pathSlug={pathSlug} tools={tools} />)}
      <Takeaways items={content.takeaways} />
    </div>
  );
}

function BlockView({ b, n, pathSlug, tools }: { b: Block; n: number; pathSlug?: string; tools: Record<string, any> }) {
  switch (b.type) {
    case "p": return <P><Inline text={b.text} /></P>;
    case "h": return (
      <h2 style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: font.serif, fontSize: 24, fontWeight: 700, lineHeight: 1.25, margin: "30px 0 12px" }}>
        <span aria-hidden style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-bg-subtle)", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.04em" }}>{String(n).padStart(2, "0")}</span>
        <span><Inline text={b.text} /></span>
      </h2>
    );
    case "list": return <ul style={{ margin: "0 0 16px", paddingLeft: 22, maxWidth: "68ch" }}>{b.items.map((t, i) => <li key={i} style={{ fontSize: 15.5, lineHeight: 1.6, marginBottom: 6 }}><Inline text={t} /></li>)}</ul>;
    case "steps": return (
      <ol style={{ margin: "0 0 18px", padding: 0, listStyle: "none", maxWidth: "68ch" }}>
        {b.items.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 15.5, lineHeight: 1.6 }}>
            <span aria-hidden style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
            <span><Inline text={t} /></span>
          </li>
        ))}
      </ol>
    );
    case "numbers": return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(4, b.items.length)}, 1fr)`, gap: 10, margin: "4px 0 20px" }} className="tos-two-col">
        {b.items.map((it, i) => (
          <div key={i} className="tos-rise" style={{ animationDelay: `${i * 80}ms`, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 14px 12px" }}>
            <div style={{ fontFamily: font.serif, fontSize: 24, fontWeight: 700, color: "var(--accent)", lineHeight: 1.1 }}>{it.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>{it.label}</div>
          </div>
        ))}
      </div>
    );
    case "quote": return (
      <blockquote style={{ margin: "4px 0 18px", padding: "12px 16px", borderLeft: "3px solid var(--accent)", background: "var(--accent-bg-subtle)", borderRadius: "0 12px 12px 0", fontSize: 15.5, lineHeight: 1.6, maxWidth: "68ch" }}>
        <span style={{ fontStyle: "italic" }}>&ldquo;{b.text}&rdquo;</span>{b.from && <span style={{ fontSize: 12.5, color: "var(--muted)" }}> &middot; {b.from}</span>}
      </blockquote>
    );
    case "callout": return (
      <Panel tone={b.tone === "warm" ? "warm" : "soft"} style={{ margin: "4px 0 20px", padding: "16px 18px" }}>
        {b.title && <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: b.tone === "warm" ? "#92400E" : "var(--accent)", marginBottom: 6 }}>{b.title}</div>}
        <div style={{ fontSize: 15.5, lineHeight: 1.6 }}><Inline text={b.text} /></div>
      </Panel>
    );
    case "example": return (
      <div style={{ margin: "4px 0 20px", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {b.title && <div style={{ padding: "8px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>{b.title}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="tos-two-col">
          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: "0.06em", marginBottom: 6 }}>BEFORE</div><div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)" }}>{b.before}</div></div>
          <div style={{ padding: "14px 16px", background: "var(--accent-bg-subtle)" }}><div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", marginBottom: 6 }}>AFTER</div><div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{b.after}</div></div>
        </div>
      </div>
    );
    case "script": return <Script title={b.title} text={b.text} />;
    case "story": return (
      <a href={b.href} target="_blank" rel="noreferrer" className="tos-card-hover" style={{ display: "block", textDecoration: "none", color: "inherit", margin: "4px 0 20px", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", background: "var(--card)" }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.was} <span aria-hidden>→</span> {b.now}</div>
        <div style={{ fontWeight: 700, margin: "2px 0 6px" }}>{b.name}</div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6 }}><Inline text={b.text} /></div>
        {b.href && <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 8 }}>Read the story ↗</div>}
      </a>
    );
    case "paths": { const p = pathSlug ? PATHS[pathSlug] : undefined; return (
      <div style={{ margin: "4px 0 20px" }}>
        {b.note && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{b.note}</div>}
        {p ? (
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, alignItems: "center", border: "1.5px solid var(--accent)", borderRadius: 14, padding: 12, background: "var(--accent-bg-subtle)" }} className="tos-two-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pathImage(p.slug)} alt="" style={{ width: "100%", borderRadius: 10, display: "block" }} />
            <div><div style={{ fontWeight: 700, fontSize: 16 }}>{p.icon} {p.label}</div><div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, margin: "2px 0 6px" }}>{p.range} · typically {p.timeline}</div><div style={{ fontSize: 14, lineHeight: 1.55 }}>{p.entryDoor}</div></div>
          </div>
        ) : <Panel style={{ padding: 14, fontSize: 14, color: "var(--muted)" }}>Pick a path in your starting line or in lesson 1.4 and this block shows it here. Until then, everything on this page applies to any title.</Panel>}
      </div>
    ); }
    case "tool": return <div style={{ margin: "4px 0 24px" }}><Tool name={b.name} pathSlug={pathSlug} shared={tools.shared} setShared={tools.setShared} finish={tools.finish} done={tools.done} /></div>;
    default: return null;
  }
}

export function Script({ title, text }: { title?: string; text: string }) {
  const [c, setC] = useState(false);
  return (
    <div style={{ margin: "4px 0 20px", border: "1px solid var(--border)", borderRadius: 14, background: "var(--card)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>{title || "Copy and adapt"}</span>
        <button type="button" onClick={() => { navigator.clipboard?.writeText(text).then(() => { setC(true); setTimeout(() => setC(false), 1600); }); }} style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", background: "none", border: "1px solid var(--accent-bg)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: font.sans }}>{c ? "Copied ✓" : "Copy"}</button>
      </div>
      <pre style={{ margin: 0, padding: "14px 16px", whiteSpace: "pre-wrap", fontFamily: font.sans, fontSize: 14.5, lineHeight: 1.65 }}>{text}</pre>
    </div>
  );
}
