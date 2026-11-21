"use client";
// Renders a lesson's JSON content (content/course/LESSON_SPEC.md). Built to be
// skimmed: a TL;DR card first, numbered section headings, stat tiles, and a
// takeaways card at the end. Body text stays short and well spaced.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PATHS } from "@/lib/quiz";
import { pathImage } from "@/lib/quiz";
import { wordCount, type Block, type LessonContent } from "@/lib/course-content";
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

export function Takeaways({ items, title = "Take with you", first = false }: { items: string[]; title?: string; first?: boolean }) {
  return (
    <Panel tone="soft" style={first ? { marginBottom: 24 } : { marginTop: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>{title}</div>
      {items.map((t, i) => (
        <div key={i} className="tos-rise" style={{ animationDelay: `${i * 70}ms`, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.55, marginBottom: 8 }}>
          <span aria-hidden style={{ color: "var(--accent)", fontWeight: 700, marginTop: 1 }}>✓</span><span><Inline text={t} /></span>
        </div>
      ))}
    </Panel>
  );
}

// How a lesson opens (2026-11-21, James: "less walls of text"). Every lesson
// opens in its short view, video or not: the TL;DR, the key points, then each
// section as its heading plus whatever in it can be done, copied or looked at.
// A section's prose sits behind "Read this part", and "Full lesson" opens it
// all. Before this only a lesson with a video opened short, and a section with
// nothing but prose lost its heading too, so the outline had holes in it.
const WORKING = new Set(["tool", "ask", "script", "bypath", "steps", "numbers", "example", "paths", "compare", "flow", "cards", "check"]);
const stays = (b: Block) => WORKING.has(b.type) || (b.type === "callout" && b.tone === "warm");

interface Section { head: Extract<Block, { type: "h" }> | null; blocks: Block[] }
function toSections(blocks: Block[]): Section[] {
  const out: Section[] = [{ head: null, blocks: [] }];
  for (const b of blocks) {
    if (b.type === "h") out.push({ head: b, blocks: [] });
    else out[out.length - 1].blocks.push(b);
  }
  return out.filter((s) => s.head || s.blocks.length);
}
/** The first sentence of a section's opening paragraph: its point, shown closed. */
function teaserOf(sec: Section): string {
  const first = sec.blocks.find((b) => b.type === "p") as Extract<Block, { type: "p" }> | undefined;
  if (!first) return "";
  const m = first.text.match(/^(.+?[.!?])(?=\s|$)/);
  return m ? m[1] : first.text;
}
const proseWords = (sec: Section) => sec.blocks.filter((b) => !stays(b)).reduce((n, b) => n + JSON.stringify(b).split(/\s+/).length, 0);

const VIEW_KEY = "tos:lesson-view:v2";
type View = "short" | "full";

/** Every lesson opens short. A reader who picks the full lesson keeps getting it. */
function useLessonView(): [View, (v: View) => void] {
  const [view, setView] = useState<View>("short");
  useEffect(() => {
    try { const v = localStorage.getItem(VIEW_KEY); if (v === "short" || v === "full") setView(v); } catch { /* private mode */ }
  }, []);
  const pick = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ } };
  return [view, pick];
}

const linkBtn = { background: "none", border: "none", padding: 0, fontFamily: font.sans, fontSize: 14, fontWeight: 600, color: "var(--accent)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 } as const;

export function Blocks({ content, pathSlug, tools, recap }: { content: LessonContent; pathSlug?: string; tools: Record<string, any>; hasVideo?: boolean; recap?: { point: string; href: string; title: string } | null }) {
  const [view, setView] = useLessonView();
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const secs = toSections(content.blocks);
  const readMin = Math.max(1, Math.round(wordCount(content) / 200));
  let h = 0;
  const tab = (v: View, label: string) => (
    <button type="button" aria-pressed={view === v} onClick={() => setView(v)}
      style={{ padding: "8px 14px", fontSize: 13.5, fontWeight: 600, fontFamily: font.sans, cursor: "pointer", border: "none", borderRadius: 999,
        background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#fff" : "var(--muted)" }}>{label}</button>
  );
  const render = (b: Block, key: string, n: number) => <BlockView key={key} b={b} n={n} pathSlug={pathSlug} tools={tools} lessonId={content.id} />;
  return (
    <div>
      {/* The last lesson's first point, so each lesson starts by recalling the one before it. */}
      {recap && (
        <a href={recap.href} style={{ display: "block", textDecoration: "none", color: "inherit", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px", padding: "9px 12px", border: "1px dashed var(--border)", borderRadius: 10 }}>
          <span style={{ fontWeight: 700, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 11 }}>From the last lesson</span>
          <span style={{ display: "block", color: "var(--text)" }}><Inline text={recap.point} /></span>
        </a>
      )}
      <Tldr text={content.tldr} />
      <div role="group" aria-label="How much of the lesson to show" style={{ display: "inline-flex", gap: 2, padding: 3, margin: "-8px 0 22px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999 }}>
        {tab("short", "Short version")}
        {tab("full", `Full lesson · ${readMin} min read`)}
      </div>
      {view === "short" && <Takeaways items={content.takeaways} title="The key points" first />}
      {secs.map((sec, i) => {
        const n = sec.head ? ++h : h;
        const hasProse = sec.blocks.some((b) => !stays(b));
        const expanded = view === "full" || !!open[i] || !hasProse;
        const teaser = !expanded ? teaserOf(sec) : "";
        const mins = Math.max(1, Math.round(proseWords(sec) / 200));
        return (
          <section key={`${view}-${i}`} style={sec.head ? { borderTop: i > 0 ? "1px solid var(--border)" : "none", marginTop: i > 0 ? 26 : 0 } : undefined}>
            {sec.head && render(sec.head, `h-${i}`, n)}
            {expanded
              ? sec.blocks.map((b, j) => render(b, `b-${i}-${j}`, n))
              : (
                <>
                  {teaser && <P><Inline text={teaser} /></P>}
                  {sec.blocks.filter(stays).map((b, j) => render(b, `s-${i}-${j}`, n))}
                </>
              )}
            {view === "short" && hasProse && (
              <button type="button" aria-expanded={!!open[i]} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} style={{ ...linkBtn, margin: "0 0 6px" }}>
                {open[i] ? "Show less" : sec.head ? `Read this part · ${mins} min` : `Read the introduction · ${mins} min`}
              </button>
            )}
          </section>
        );
      })}
      {view === "full" && <Takeaways items={content.takeaways} />}
      {view === "short" && (
        <div style={{ marginTop: 22 }}>
          <button type="button" onClick={() => { setView("full"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={linkBtn}>
            Read the full lesson ({readMin} min)
          </button>
        </div>
      )}
    </div>
  );
}

function BlockView({ b, n, pathSlug, tools, lessonId }: { b: Block; n: number; pathSlug?: string; tools: Record<string, any>; lessonId: string }) {
  switch (b.type) {
    case "p": return <P><Inline text={b.text} /></P>;
    case "h": return (
      <h2 style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: font.serif, fontSize: 24, fontWeight: 400, lineHeight: 1.25, margin: "30px 0 12px" }}>
        <span aria-hidden style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-bg-subtle)", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.04em" }}>{String(n).padStart(2, "0")}</span>
        <span><Inline text={b.text} /></span>
      </h2>
    );
    case "list": return (
      <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", maxWidth: "68ch" }}>
        {b.items.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 15.5, lineHeight: 1.6, marginBottom: 7 }}>
            <span aria-hidden style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", marginTop: 9 }} />
            <span><Inline text={t} /></span>
          </li>
        ))}
      </ul>
    );
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
            <div style={{ fontFamily: font.serif, fontSize: 24, fontWeight: 400, color: "var(--accent)", lineHeight: 1.1 }}>{it.value}</div>
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
    case "bypath": return <ByPath title={b.title} note={b.note} items={b.items} pathSlug={pathSlug} />;
    case "ask": return <Ask id={lessonId} prompt={b.prompt} lines={b.lines || 3} shared={tools.shared} setShared={tools.setShared} />;
    case "tool": return <div style={{ margin: "4px 0 24px" }}><Tool name={b.name} pathSlug={pathSlug} shared={tools.shared} setShared={tools.setShared} finish={tools.finish} done={tools.done} synced={tools.synced} /></div>;
    case "compare": return <Compare title={b.title} left={b.left} right={b.right} />;
    case "flow": return <Flow title={b.title} items={b.items} />;
    case "cards": return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, margin: "4px 0 20px" }}>
        {b.items.map((c, i) => (
          <div key={i} className="tos-rise" style={{ animationDelay: `${i * 70}ms`, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 400, lineHeight: 1.25, marginBottom: 6 }}><Inline text={c.title} /></div>
            <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--muted)" }}><Inline text={c.text} /></div>
          </div>
        ))}
      </div>
    );
    case "check": return <Check items={b.items} />;
    default: return null;
  }
}

const blockLabel = { fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 8 };

/** Two columns set against each other. The right-hand one is the one to do. */
function Compare({ title, left, right }: { title?: string; left: { label: string; items: string[] }; right: { label: string; items: string[] } }) {
  const col = (side: { label: string; items: string[] }, good: boolean) => (
    <div style={{ padding: "14px 16px", background: good ? "var(--accent-bg-subtle)" : "var(--card)", borderRight: good ? "none" : "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: good ? "var(--accent)" : "#92400E", marginBottom: 8 }}>{side.label}</div>
      {side.items.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 9, fontSize: 14.5, lineHeight: 1.55, marginBottom: 7, color: good ? "var(--text)" : "var(--muted)" }}>
          <span aria-hidden style={{ flexShrink: 0, fontWeight: 700, color: good ? "var(--accent)" : "#B45309" }}>{good ? "✓" : "✕"}</span>
          <span><Inline text={t} /></span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ margin: "4px 0 20px", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      {title && <div style={{ ...blockLabel, padding: "8px 14px", margin: 0, background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>{title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="tos-two-col">{col(left, false)}{col(right, true)}</div>
    </div>
  );
}

/** A sequence with arrows: across on a wide screen, down on a phone (course.css). */
function Flow({ title, items }: { title?: string; items: { label: string; note?: string }[] }) {
  return (
    <div style={{ margin: "4px 0 20px" }}>
      {title && <div style={blockLabel}>{title}</div>}
      <ol className="tos-flow" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((it, i) => (
          <li key={i} className="tos-rise" style={{ animationDelay: `${i * 90}ms` }}>
            <span className="tos-flow-n" aria-hidden>{i + 1}</span>
            <span style={{ display: "block", fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}><Inline text={it.label} /></span>
            {it.note && <span style={{ display: "block", fontSize: 13, lineHeight: 1.45, color: "var(--muted)", marginTop: 3 }}><Inline text={it.note} /></span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** One or two situations to decide. Answering is the point, so the reason shows
 *  either way and nothing is scored or saved. */
function Check({ items }: { items: { q: string; options: string[]; answer: number; why: string }[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  return (
    <div style={{ margin: "8px 0 24px", border: "1px solid var(--border)", borderRadius: 14, background: "var(--card)", padding: "16px 18px" }}>
      <div style={{ ...blockLabel, color: "var(--accent)" }}>Try it</div>
      {items.map((q, qi) => {
        const mine = picked[qi];
        const answered = mine !== undefined;
        return (
          <div key={qi} style={{ marginTop: qi ? 18 : 0 }}>
            <div style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 600, marginBottom: 10 }}><Inline text={q.q} /></div>
            <div style={{ display: "grid", gap: 8 }}>
              {q.options.map((o, oi) => {
                const right = oi === q.answer;
                const chosen = mine === oi;
                const tone = !answered ? "var(--border)" : right ? "var(--accent)" : chosen ? "#B45309" : "var(--border)";
                return (
                  <button key={oi} type="button" disabled={answered} aria-pressed={chosen} onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", borderRadius: 12, fontFamily: font.sans, fontSize: 15, lineHeight: 1.5, color: "var(--text)",
                      cursor: answered ? "default" : "pointer", border: `1.5px solid ${tone}`, background: answered && right ? "var(--accent-bg-subtle)" : "var(--bg)" }}>
                    <span aria-hidden style={{ flexShrink: 0, width: 20, fontWeight: 700, color: answered && right ? "var(--accent)" : answered && chosen ? "#B45309" : "var(--muted)" }}>{answered && right ? "✓" : answered && chosen ? "✕" : String.fromCharCode(65 + oi)}</span>
                    <span><Inline text={o} /></span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div role="status" style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "var(--accent-bg-subtle)" }}>
                <strong>{mine === q.answer ? "Yes." : "Closer: the tick."}</strong> <Inline text={q.why} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** One written answer. It saves as you type and prints in the workbook under this
 *  lesson, so a reading lesson still ends with something on paper. */
function Ask({ id, prompt, lines, shared, setShared }: { id: string; prompt: string; lines: number; shared: Record<string, any>; setShared: (k: string, v: any) => void }) {
  const saved: string = (shared.notes || {})[id] || "";
  const [text, setText] = useState(saved);
  const [state, setState] = useState<"idle" | "saved">("idle");
  const latest = useRef({ shared, setShared });
  latest.current = { shared, setShared };
  // The store hydrates after first paint: take its value once it arrives.
  const hydrated = useRef(false);
  useEffect(() => { if (!hydrated.current && saved) { hydrated.current = true; setText(saved); } }, [saved]);
  useEffect(() => {
    if (text === saved) return;
    const t = setTimeout(() => {
      const cur = latest.current;
      cur.setShared("notes", { ...(cur.shared.notes || {}), [id]: text });
      hydrated.current = true;
      setState("saved");
    }, 700);
    return () => clearTimeout(t);
  }, [text, saved, id]);
  const fieldId = `ask-${id}`;
  return (
    <div style={{ margin: "8px 0 24px", border: "1.5px solid var(--accent)", borderRadius: 14, background: "var(--card)", padding: "16px 18px" }}>
      <label htmlFor={fieldId} style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Write it down</label>
      <div style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 600, marginBottom: 10 }}>{prompt}</div>
      <textarea id={fieldId} value={text} onChange={(e) => { setText(e.target.value); setState("idle"); }} rows={lines}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontFamily: font.sans, fontSize: 15.5, lineHeight: 1.55, resize: "vertical", background: "var(--bg)" }} />
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>
        {state === "saved" || (saved && text === saved) ? <>Saved. It prints in <a href="/course/workbook" style={{ color: "var(--accent)", fontWeight: 600 }}>your workbook</a>.</> : "It saves as you type and prints in your workbook."}
      </div>
    </div>
  );
}

/** A script with a version per path. The reader's path (from 0.2 or the dials) opens first; the chips switch. */
function ByPath({ title, note, items, pathSlug }: { title?: string; note?: string; items: Record<string, string>; pathSlug?: string }) {
  const slugs = Object.keys(items).filter((s) => PATHS[s]);
  const [slug, setSlug] = useState<string>(pathSlug && items[pathSlug] ? pathSlug : slugs[0]);
  if (!slugs.length) return null;
  return (
    <div style={{ margin: "4px 0 20px" }}>
      {note && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{note}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {slugs.map((s) => <button key={s} type="button" onClick={() => setSlug(s)} style={{ padding: "6px 10px", borderRadius: 999, border: `1.5px solid ${s === slug ? "var(--accent)" : "var(--border)"}`, background: s === slug ? "var(--accent-bg-subtle)" : "var(--card)", fontSize: 12.5, cursor: "pointer", fontFamily: font.sans, fontWeight: s === slug ? 600 : 400 }}>{PATHS[s].icon} {PATHS[s].label}</button>)}
      </div>
      <Script key={slug} title={title ? `${title} · ${PATHS[slug].label}` : PATHS[slug].label} text={items[slug]} />
    </div>
  );
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
