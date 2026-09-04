"use client";
import { useCallback, useEffect, useState } from "react";
import { lessonById, moduleOf, nextLesson, prevLesson, SOURCES, TYPE_LABEL, type Lesson } from "@/lib/course";
import { contentFor } from "@/lib/course-content";
import { useProgress } from "@/lib/course-progress";
import { CourseShell, UnlockToast, Btn, Panel, font } from "./ui";
import { Blocks } from "./Blocks";
import * as L from "./lessons";

// Modules 0 and 1 are hand-built React lessons (the calculators and the
// animated explainers). Modules 2 onward are authored as JSON and rendered by
// <Blocks>. Both paths get the same chrome, progress and navigation.
const COMPONENTS: Record<string, any> = {
  Welcome: L.Welcome, StartingLine: L.StartingLine, ThreeLies: L.ThreeLies, FiveStages: L.FiveStages,
  DecisionTree: L.DecisionTree, SunkCost: L.SunkCost, Dials: L.Dials, Identity: L.Identity, TellOne: L.TellOne, Checkpoint1: L.Checkpoint1,
};
const TYPE_ICON: Record<Lesson["type"], string> = { video: "▶", explainer: "✦", interactive: "⌘", action: "⚡", checkpoint: "◎" };

/** Thin bar at the top of the viewport showing how far down the lesson you are. */
function ReadingBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 40, background: "transparent" }}><div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", transition: "width 90ms linear" }} /></div>;
}

export default function LessonPage({ id }: { id: string }) {
  const lesson = lessonById(id)!;
  const mod = moduleOf(lesson);
  const next = nextLesson(id);
  const prev = prevLesson(id);
  const content = contentFor(id);
  const { p, ready, pct, complete, saveAnswer } = useProgress();
  const [toast, setToast] = useState<{ xp: number; badges: any[] } | null>(null);
  const done = p.completed.includes(id);
  const idx = mod.lessons.findIndex((l) => l.id === id);
  const answers = p.answers as Record<string, any>;
  const pathSlug: string | undefined = answers["0.2"]?.path || answers["1.4"]?.top?.[0];

  const finish = useCallback((opts?: { action?: boolean }) => {
    const u = complete(id, opts);
    if (u.xp || u.badges.length) setToast({ xp: u.xp, badges: u.badges });
  }, [complete, id]);

  // Tools write into a shared slot so a tracker started in one lesson is the
  // same tracker in another.
  const shared = { ...answers, ...(answers.__shared || {}) };
  const setShared = useCallback((key: string, v: any) => {
    saveAnswer("__shared", { ...(answers.__shared || {}), [key]: v });
  }, [answers, saveAnswer]);

  const Comp = lesson.component ? COMPONENTS[lesson.component] : null;
  const action = content?.action || lesson.action;

  return (
    <CourseShell xp={p.xp} streak={p.streak.count} pct={pct}>
      <ReadingBar />
      {toast && <UnlockToast xp={toast.xp} badges={toast.badges} onDone={() => setToast(null)} />}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 28 }} className="tos-two-col">
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
            <a href="/course" style={{ color: "var(--muted)" }}>Quest log</a> › Module {mod.n}: {mod.title} › Lesson {idx + 1} of {mod.lessons.length}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", background: "var(--accent-bg-subtle)", padding: "3px 10px", borderRadius: 4 }}>{TYPE_ICON[lesson.type]} {TYPE_LABEL[lesson.type]}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{lesson.minutes} min</span>
            {done && <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>✓ Completed</span>}
          </div>
          <h1 style={{ fontFamily: font.serif, fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", margin: "0 0 8px" }}>{lesson.title}</h1>
          {/* Authored lessons open with their own TL;DR card, so the summary
              would just repeat it. */}
          {!content && <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>{lesson.summary}</p>}
          {content && <div style={{ height: 10 }} />}

          {/* Authored prose renders straight away; only the parts that depend on
              saved progress wait for the store to hydrate. */}
          {content ? (
            <>
              <Blocks content={content} pathSlug={pathSlug} tools={{ shared, setShared, finish, done }} />
              {ready && action && <ActionCard action={action} done={done} onDo={() => finish({ action: true })} />}
              {ready && !action && !done && <div style={{ marginTop: 24 }}><Btn onClick={() => finish()}>Mark as done</Btn></div>}
              {ready && !action && done && <div style={{ marginTop: 24, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>✓ Done. It stays ticked.</div>}
            </>
          ) : !ready ? null : Comp ? (
            <Comp answer={answers[id]} save={(v: any) => saveAnswer(id, v)} finish={finish} done={done} all={answers} />
          ) : (
            <Panel tone="warm">This lesson is outlined. The content lands with the next release.</Panel>
          )}

          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {prev ? <Btn href={`/course/${moduleOf(prev).slug}/${prev.id}`} outline>← Previous lesson</Btn> : <Btn href="/course" outline>← Quest log</Btn>}
              {next ? <Btn href={`/course/${moduleOf(next).slug}/${next.id}`}>Next lesson →</Btn> : <Btn href="/course">Back to the quest log →</Btn>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
              <span>{prev ? `${prev.id} ${prev.title}` : ""}</span>
              <span>{next ? `${next.id} ${next.title} · ${next.minutes} min` : ""}</span>
            </div>
          </div>
        </div>

        <aside>
          <Panel style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Module {mod.n} · {mod.title}</div>
            {mod.lessons.map((l) => { const d = p.completed.includes(l.id), cur = l.id === id; return (
              <a key={l.id} href={`/course/${mod.slug}/${l.id}`} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "7px 8px", borderRadius: 8, textDecoration: "none", color: cur ? "var(--accent)" : "var(--text)", background: cur ? "var(--accent-bg-subtle)" : "transparent", fontSize: 13, fontWeight: cur ? 700 : 500 }}>
                <span style={{ width: 18, textAlign: "center", color: d ? "var(--accent)" : "var(--light)" }}>{d ? "✓" : cur ? "●" : "○"}</span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{l.title}<span style={{ color: "var(--light)", fontWeight: 400 }}> · {l.minutes}m</span></span>
              </a>); })}
          </Panel>
          {lesson.resources && lesson.resources.length > 0 && (
            <Panel style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Resources</div>
              {lesson.resources.map((r) => (
                <a key={r.label} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--accent)", textDecoration: "none", padding: "6px 0", lineHeight: 1.4 }}>
                  <span aria-hidden>{r.kind === "worksheet" ? "📄" : r.kind === "sheet" ? "📊" : r.kind === "tool" ? "🧰" : "↗"}</span>{r.label}
                </a>
              ))}
            </Panel>
          )}
          {(() => { const keys = content?.sources || lesson.sources || []; return keys.length > 0 && (
            <Panel style={{ background: "transparent", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Where this comes from</div>
              {keys.map((k) => { const s = SOURCES[k]; if (!s) return null; return (
                <div key={k} style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 8 }}>
                  {s.href ? <a href={s.href} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>{s.label}</a> : s.label}{s.note ? <span>. {s.note}</span> : null}
                </div>); })}
            </Panel>
          ); })()}
        </aside>
      </div>
    </CourseShell>
  );
}

function ActionCard({ action, done, onDo }: { action: { label: string; prompt: string; done: string }; done: boolean; onDo: () => void }) {
  return (
    <div className="tos-rise" style={{ marginTop: 26, border: `2px solid ${done ? "var(--accent-bg)" : "var(--accent)"}`, borderRadius: 16, overflow: "hidden", background: "var(--card)" }}>
      <div style={{ padding: "10px 18px", background: done ? "var(--accent-bg-subtle)" : "var(--accent)", color: done ? "var(--accent)" : "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {done ? "✓ Done" : "⚡ Your move this week"}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 0 14px" }}>{done ? action.done : action.prompt}</p>
        {!done && <Btn onClick={onDo}>{action.label}</Btn>}
      </div>
    </div>
  );
}
