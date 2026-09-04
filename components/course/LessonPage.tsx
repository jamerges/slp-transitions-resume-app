"use client";
import { useCallback, useState } from "react";
import { lessonById, moduleOf, nextLesson, SOURCES, TYPE_LABEL, MODULES, type Lesson } from "@/lib/course";
import { useProgress } from "@/lib/course-progress";
import { CourseShell, UnlockToast, Btn, Panel, font } from "./ui";
import * as L from "./lessons";

const COMPONENTS: Record<string, any> = {
  Welcome: L.Welcome, StartingLine: L.StartingLine, ThreeLies: L.ThreeLies, FiveStages: L.FiveStages,
  DecisionTree: L.DecisionTree, SunkCost: L.SunkCost, Dials: L.Dials, Identity: L.Identity, TellOne: L.TellOne, Checkpoint1: L.Checkpoint1,
};
const TYPE_ICON: Record<Lesson["type"], string> = { video: "▶", explainer: "✦", interactive: "⌘", action: "⚡", checkpoint: "◎" };

export default function LessonPage({ id }: { id: string }) {
  const lesson = lessonById(id)!;
  const mod = moduleOf(lesson);
  const next = nextLesson(id);
  const { p, ready, pct, complete, saveAnswer } = useProgress();
  const [toast, setToast] = useState<{ xp: number; badges: any[] } | null>(null);
  const done = p.completed.includes(id);
  const idx = mod.lessons.findIndex((l) => l.id === id);

  const finish = useCallback((opts?: { action?: boolean }) => {
    const u = complete(id, opts);
    if (u.xp || u.badges.length) setToast({ xp: u.xp, badges: u.badges });
  }, [complete, id]);

  const Comp = lesson.component ? COMPONENTS[lesson.component] : null;

  return (
    <CourseShell xp={p.xp} streak={p.streak.count} pct={pct}>
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
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>{lesson.summary}</p>

          {ready && Comp ? (
            <Comp answer={p.answers[id]} save={(v: any) => saveAnswer(id, v)} finish={finish} done={done} all={p.answers} />
          ) : ready ? (
            <Panel tone="warm">This lesson is outlined and written after the sample is approved.</Panel>
          ) : null}

          {lesson.action && lesson.type !== "action" && lesson.type !== "interactive" && (
            <Panel tone="soft" style={{ marginTop: 18 }}><b>{lesson.action.label}.</b> {lesson.action.prompt}</Panel>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, gap: 12, flexWrap: "wrap" }}>
            <Btn href="/course" outline>← Quest log</Btn>
            {next && <Btn href={`/course/${moduleOf(next).slug}/${next.id}`} outline={!done}>{done ? `Next: ${next.title} →` : `Skip to ${next.id} →`}</Btn>}
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
          {lesson.sources && lesson.sources.length > 0 && (
            <Panel style={{ background: "transparent", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Where this comes from</div>
              {lesson.sources.map((k) => { const s = SOURCES[k]; return (
                <div key={k} style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 8 }}>
                  {s.href ? <a href={s.href} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>{s.label}</a> : s.label}{s.note ? <span> — {s.note}</span> : null}
                </div>); })}
            </Panel>
          )}
        </aside>
      </div>
    </CourseShell>
  );
}
