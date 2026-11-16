"use client";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/course-progress";
import { PageShell, S } from "@/components/ui";
import { MODULES, MODULE_ACCENT, lessonById, moduleOf } from "@/lib/course";
import { canOpenLesson, type CourseProduct } from "@/lib/course-tiers";
import { WORKBOOK, answerOf, isDone, written, timeLabel, roughly, type Ctx, type WbAction } from "./workbook-model";

/**
 * Your workbook. Until 2026-11-15 this was labels over blank lines; now it is a
 * list of small actions (components/course/workbook-model.ts), each with a tick
 * box, a time, one line on why, and the answer you gave or a short place to
 * write one. The tick boxes follow what you did in the lessons. Fields that no
 * lesson saves are typed here and saved with everything else.
 *
 * `blank` renders the same pages with nothing filled in, which is what the
 * blank PDFs are printed from. `printPreview` shows the print layout on screen.
 */
const serif = "'Playfair Display', Georgia, serif";
const EMPTY: Ctx = { A: {}, SH: {}, completed: [], actions: [] };

// One set of print rules, applied when printing and (for checking layout) under .wb-as-print.
const printRules = (scope: string) => `
  ${scope} .no-print { display: none !important; }
  ${scope} .wb-screen { display: none !important; }
  ${scope} .wb-print { display: block !important; }
  ${scope} .wb-sheet { box-shadow: none !important; border: none !important; padding: 0 !important; background: transparent !important; }
  ${scope} .wb-module { break-before: page; page-break-before: always; padding-top: 0 !important; border-top: none !important; }
  ${scope} .wb-card { break-inside: avoid; page-break-inside: avoid; }
`;
const CSS = `
  .wb-print { display: none; }
  @media print {
    header, footer, nav, .slp-head, .slp-foot { display: none !important; }
    body { background: #fff !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    ${printRules("")}
  }
  ${printRules(".wb-as-print")}
  @page { size: Letter; margin: 0.6in; }
`;

function Lines({ n }: { n: number }) {
  return <>{Array.from({ length: n }).map((_, i) => <div key={i} style={{ borderBottom: "1px solid #B9B7A4", height: 28 }} />)}</>;
}

/** A field of the workbook's own: types on screen, prints as text or as lines to write on. */
function WriteIn({ a, value, blank, onSave }: { a: WbAction; value: string; blank: boolean; onSave: (text: string) => void }) {
  const w = a.write!;
  const [text, setText] = useState(value);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(value); }, [value]);
  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onSave(text), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  const id = `wb-${a.id}`;
  return (
    <div style={{ marginTop: 10 }}>
      {w.label && <label htmlFor={id} style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{w.label}</label>}
      {!blank && (
        <textarea id={id} className="wb-screen" aria-label={w.label ? undefined : a.do} value={text} rows={w.lines} placeholder={w.hint || "Write it here. It saves as you type."}
          onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "inherit", fontSize: 15, lineHeight: 1.5, resize: "vertical", background: "var(--bg)", display: "block" }} />
      )}
      <div className={blank ? undefined : "wb-print"}>
        {!blank && text.trim()
          ? <div style={{ fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{text}</div>
          : <>{w.hint && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{w.hint}</div>}<Lines n={w.lines} /></>}
      </div>
    </div>
  );
}

function Card({ a, c, blank, onSave, href }: { a: WbAction; c: Ctx; blank: boolean; onSave: (a: WbAction, text: string) => void; href: string | null }) {
  const done = isDone(a, c);
  const lines = answerOf(a, c);
  return (
    <div className="wb-card" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", marginBottom: 10, background: "var(--card)", border: `1px solid ${done ? "var(--accent-bg)" : "var(--border)"}`, borderRadius: 12 }}>
      <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, marginTop: 1, borderRadius: 6, border: `2px solid ${done ? "var(--accent)" : "#8E9488"}`, background: done ? "var(--accent)" : "#fff", color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: "18px", textAlign: "center" }}>{done ? "✓" : ""}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, flex: "1 1 150px" }}>
            <span style={{ position: "absolute", left: -9999 }}>{done ? "Done: " : "To do: "}</span>{a.do}
          </div>
          <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--muted)", background: "var(--accent-bg-subtle)", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>{timeLabel(a)}</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--muted)", marginTop: 3 }}>{a.why}</div>
        {lines.length > 0 && (
          <div style={{ marginTop: 9, padding: "8px 12px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 6 }}>
            {lines.map((t, i) => <div key={i} style={{ fontSize: 14.5, lineHeight: 1.55, wordBreak: "break-word" }}>{t}</div>)}
          </div>
        )}
        {a.write && <WriteIn a={a} value={written(a, c)} blank={blank} onSave={(t) => onSave(a, t)} />}
        {/* A blank copy gets a line wherever the lesson would have saved an answer. */}
        {!a.write && blank && a.answer && !a.done && <div style={{ marginTop: 6 }}><Lines n={1} /></div>}
        {(a.next || href) && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline", marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
            {href && !done && <a className="no-print" href={href} style={{ color: "var(--accent)", fontWeight: 600 }}>Open lesson {a.lesson} {"→"}</a>}
            {a.next && <span>Used later: {a.next}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyWorkbook({ product, blank = false, printPreview = false }: { product?: CourseProduct; blank?: boolean; printPreview?: boolean }) {
  const { p, ready, saveAnswer } = useProgress();
  // Fields save into the same shared slot the lesson tools use. A ref holds the
  // newest copy so two fields saving close together don't overwrite each other.
  const sharedRef = useRef<Record<string, any>>({});
  useEffect(() => { sharedRef.current = (p.answers as any).__shared || {}; }, [p.answers]);
  const onSave = (a: WbAction, text: string) => {
    const key = a.write?.note ? "notes" : "wb";
    const slot = a.write?.note || a.id;
    sharedRef.current = { ...sharedRef.current, [key]: { ...(sharedRef.current[key] || {}), [slot]: text } };
    saveAnswer("__shared", sharedRef.current);
  };

  if (!ready) return <PageShell><div style={{ ...S.wrap, padding: 40 }}>Loading your answers{"…"}</div></PageShell>;

  const A = p.answers as Record<string, any>;
  const c: Ctx = blank ? EMPTY : { A, SH: A.__shared || {}, completed: p.completed, actions: p.actions };
  const access = product ? { product } : null;
  // The edition: every action whose lesson this reader can open.
  const mods = WORKBOOK.map((m) => ({ ...m, actions: m.actions.filter((a) => canOpenLesson(a.lesson, m.n, access)) })).filter((m) => m.actions.length);
  const all = mods.flatMap((m) => m.actions);
  const doneN = all.filter((a) => isDone(a, c)).length;
  const left = all.filter((a) => !isDone(a, c));
  const minutesLeft = left.reduce((n, a) => n + a.minutes, 0);
  const hrefOf = (a: WbAction) => { const l = lessonById(a.lesson); return l ? `/course/${moduleOf(l).slug}/${l.id}` : null; };
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <PageShell>
      <style>{CSS}</style>
      <div className={printPreview ? "wb-as-print" : undefined} style={{ ...S.wrap, maxWidth: 720 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "8px 0 14px" }}>
          <a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>{"←"} Your lessons</a>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!blank && product !== "free" && <a href="/api/course/workbook?f=pdf" style={{ ...S.btnOut, padding: "10px 16px", fontSize: 14, textDecoration: "none" }}>Blank copy (PDF)</a>}
            <button type="button" onClick={() => window.print()} style={{ ...S.btn, padding: "10px 18px", fontSize: 14 }}>Print or save as PDF</button>
          </div>
        </div>

        <div className="wb-sheet" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 20px" }}>
          {/* Cover */}
          <div style={{ background: "var(--accent)", color: "#fff", padding: "22px 24px", borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--accent-light)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent-bg)" }}>Transition OS</div>
              {!blank && <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--accent-bg)" }}>{today}</div>}
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, margin: "18px 0 0", letterSpacing: "-0.02em" }}>Your workbook</h1>
            <p style={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.45, color: "var(--accent-bg)", margin: "10px 0 0" }}>
              {all.length} small actions. Each one has a time on it and a box to tick.
            </p>
          </div>

          {/* Where you are */}
          {!blank ? (
            <div style={{ margin: "18px 0 6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700 }}>{doneN} of {all.length} done</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)" }}>{left.length ? `${roughly(minutesLeft)} of actions left` : "Every action is ticked."}</div>
              </div>
              <div style={{ height: 8, background: "var(--accent-bg-subtle)", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: `${all.length ? (doneN / all.length) * 100 : 0}%`, background: "var(--accent)" }} />
              </div>
            </div>
          ) : (
            <div style={{ margin: "18px 0 6px", fontSize: 14.5, lineHeight: 1.6 }}>
              <strong>How to use it.</strong> Do one action at a time, in order. Write the answer in the space under it and tick the box. Print it again at weeks 6 and 12 and see what changed.
            </div>
          )}

          {/* The stops: one chip per module, linking down the page */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 4px" }}>
            {mods.map((m) => { const d = m.actions.filter((a) => isDone(a, c)).length, acc = MODULE_ACCENT[m.n]; const mod = MODULES.find((x) => x.n === m.n)!; return (
              <a key={m.n} href={`#wb-m${m.n}`} style={{ flex: "1 1 76px", textDecoration: "none", color: acc.ink, background: acc.tint, border: `1px solid ${acc.edge}`, borderRadius: 10, padding: "7px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{m.n} {"·"} {mod.title}</div>
                <div style={{ fontSize: 12, marginTop: 1 }}>{blank ? `${m.actions.length} actions` : `${d} of ${m.actions.length}`}</div>
              </a>
            ); })}
          </div>

          {/* Do next: the first three boxes still empty */}
          {!blank && left.length > 0 && (
            <div className="no-print" style={{ margin: "16px 0 4px", padding: "14px 16px", border: "1.5px solid var(--accent)", borderRadius: 12, background: "var(--accent-bg-subtle)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Do next</div>
              {left.slice(0, 3).map((a) => (
                <a key={a.id} href={hrefOf(a) || "#"} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid var(--accent-bg)", textDecoration: "none", color: "var(--text)" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{a.do}</span>
                  <span style={{ flexShrink: 0, fontSize: 12.5, color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap" }}>{timeLabel(a)} {"→"}</span>
                </a>
              ))}
            </div>
          )}

          {/* One page per module */}
          {mods.map((m) => { const mod = MODULES.find((x) => x.n === m.n)!, acc = MODULE_ACCENT[m.n]; const d = m.actions.filter((a) => isDone(a, c)).length; const mins = m.actions.reduce((n, a) => n + a.minutes, 0); return (
            <section key={m.n} id={`wb-m${m.n}`} className="wb-module" style={{ paddingTop: 22, marginTop: 22, borderTop: "1px solid var(--border)" }}>
              <div style={{ height: 4, width: 70, borderRadius: 2, background: acc.edge, marginBottom: 10 }} aria-hidden />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: acc.ink }}>Module {m.n} {"·"} {mod.title} {"·"} {mod.week}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{blank ? `${m.actions.length} actions · ${roughly(mins)}` : `${d} of ${m.actions.length} done`}</div>
              </div>
              <h2 style={{ fontFamily: serif, fontSize: 23, fontWeight: 700, lineHeight: 1.25, margin: "4px 0 14px" }}>{m.outcome}</h2>
              {m.actions.map((a) => <Card key={a.id} a={a} c={c} blank={blank} onSave={onSave} href={blank ? null : hrefOf(a)} />)}
            </section>
          ); })}

          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 14 }}>
            {product === "ground"
              ? "This is the workbook for your kit. The full program adds the actions for the rest of the ninety days."
              : "Print this again at weeks 6 and 12, so one bad Tuesday does not decide it."}
          </div>
        </div>
        <div className="no-print" style={{ height: 30 }} />
      </div>
    </PageShell>
  );
}
