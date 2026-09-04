"use client";
import { MODULES, BADGES, LESSONS, moduleOf, type Lesson } from "@/lib/course";
import { PATHS } from "@/lib/quiz";
import { useProgress } from "@/lib/course-progress";
import { CourseShell, Btn, Panel, font, Ring } from "./ui";
import { STAGE_META, StageRoad } from "./scenes";

const daysUntil = (iso?: string) => iso ? Math.max(0, Math.round((Date.parse(iso) - Date.now()) / 86_400_000)) : null;

export default function Dashboard() {
  const { p, ready, pct, reset } = useProgress();
  const A = p.answers as Record<string, any>;
  const start = A["0.2"] || {};
  const stageKey = A["1.1"]?.stage || start.stage;
  const stage = STAGE_META.find((s) => s.key === stageKey);
  const path = start.path ? PATHS[start.path] : undefined;
  const topDials: string[] = A["1.4"]?.top || [];
  const verdict = A["1.2"]?.verdict;
  const next: Lesson | undefined = LESSONS.find((l) => moduleOf(l).built && !p.completed.includes(l.id));
  const days = daysUntil(start.date);

  return (
    <CourseShell xp={p.xp} streak={p.streak.count} pct={pct}>
      {/* ---------------- hero: the map ---------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 22, alignItems: "stretch" }} className="tos-two-col">
        <Panel style={{ background: "linear-gradient(160deg, #0A3D31 0%, #0B6B54 100%)", color: "#fff", border: "none", padding: "clamp(20px, 4vw, 32px)" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>Your 90-day map</div>
          <h1 style={{ fontFamily: font.serif, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, lineHeight: 1.12, margin: "6px 0 10px" }}>
            {!ready ? "" : !p.startedAt ? "Start here. It takes about as long as one progress note." : days !== null ? `${days} days to your target date.` : "Your map is set."}
          </h1>
          <div style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.92, maxWidth: 560 }}>
            {stage ? <>{stage.n === 1 ? "You don't have to tell anyone yet. Looking is allowed." : stage.n === 2 ? "Wanting out doesn't undo the good you did, and it doesn't waste the degree." : stage.n === 3 ? "It is possible. The stories are in Module 1, lesson 5." : stage.n === 4 ? "Start with one path, not all twenty." : "Skip the reading. Your résumé is the bottleneck, and that's fixable this week."}</>
                   : "Tell it where you are, what you can't afford to lose, and when you want to be out. Everything after that bends around those three."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {stage && <Tag>Stage {stage.n}: {stage.name}</Tag>}
            {verdict && <Tag>Verdict: {verdict === "fit" ? "bad fit" : verdict === "workplace" ? "bad workplace" : "bad season"}</Tag>}
            {path && <Tag>{path.icon} {path.label}</Tag>}
            {!path && topDials.length > 0 && <Tag>{PATHS[topDials[0]]?.icon} {PATHS[topDials[0]]?.label} (from your dials)</Tag>}
          </div>
          {stage && <div style={{ marginTop: 18, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px" }}><StageRoad active={stage.n} compact /></div>}
        </Panel>

        <Panel tone="soft" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>Next up</div>
            {next ? (
              <>
                <div style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 700, margin: "6px 0 4px", lineHeight: 1.2 }}>{next.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Module {next.module} · {next.minutes} min · {next.type}</div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: "10px 0 14px" }}>{next.summary}</p>
              </>
            ) : <div style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 700, margin: "6px 0 14px" }}>That&rsquo;s Modules 0 and 1. Explore is next, once James signs off on this sample.</div>}
          </div>
          {next && <Btn href={`/course/${moduleOf(next).slug}/${next.id}`} style={{ width: "100%", textAlign: "center" }}>{p.startedAt ? "Continue →" : "Start →"}</Btn>}
        </Panel>
      </div>

      {/* ---------------- quest log + rail ---------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 22, marginTop: 22 }} className="tos-two-col">
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontFamily: font.serif, fontSize: 24, fontWeight: 700, margin: 0 }}>Quest log</h2>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{p.completed.length} of {LESSONS.length} lessons · {LESSONS.reduce((s, l) => s + l.minutes, 0)} min total</span>
          </div>
          {MODULES.map((m, mi) => {
            const done = m.lessons.filter((l) => p.completed.includes(l.id)).length;
            const mpct = Math.round((done / m.lessons.length) * 100);
            const current = next && next.module === m.n;
            const locked = !m.built;
            return (
              <div key={m.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, marginBottom: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={current ? "tos-pulse" : undefined} style={{ width: 34, height: 34, borderRadius: "50%", background: mpct === 100 ? "var(--accent)" : current ? "var(--card)" : "var(--bg)", border: `2px solid ${mpct === 100 || current ? "var(--accent)" : "var(--border)"}`, color: mpct === 100 ? "#fff" : current ? "var(--accent)" : "var(--light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{mpct === 100 ? "✓" : m.n}</div>
                  {mi < MODULES.length - 1 && <div style={{ width: 2, flex: 1, background: mpct === 100 ? "var(--accent)" : "var(--border)", margin: "4px 0", minHeight: 24 }} />}
                </div>
                <Panel style={{ padding: 16, marginBottom: 10, opacity: locked ? 0.72 : 1, borderColor: current ? "var(--accent)" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: locked ? "var(--light)" : "var(--accent)" }}>{m.phase} · {m.week}</div>
                      <div style={{ fontFamily: font.serif, fontSize: 20, fontWeight: 700, margin: "2px 0" }}>{m.title}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{m.tagline}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {locked ? <span style={{ fontSize: 12, color: "var(--light)", background: "#F3F4F6", padding: "4px 10px", borderRadius: 999 }}>🔒 Unlocks after Checkpoint {m.n - 1}</span> : <Ring pct={mpct} size={44} />}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {m.lessons.map((l) => { const d = p.completed.includes(l.id); const isNext = next?.id === l.id; return (
                      <a key={l.id} href={locked ? undefined : `/course/${m.slug}/${l.id}`} title={l.title}
                        style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, textDecoration: "none", border: `1px solid ${d ? "var(--accent)" : isNext ? "var(--accent)" : "var(--border)"}`, background: d ? "var(--accent)" : isNext ? "var(--accent-bg-subtle)" : "var(--card)", color: d ? "#fff" : isNext ? "var(--accent)" : locked ? "var(--light)" : "var(--text)", fontWeight: d || isNext ? 600 : 400, cursor: locked ? "default" : "pointer" }}>
                        {d ? "✓ " : isNext ? "● " : ""}{l.id} {l.title.length > 30 ? l.title.slice(0, 28) + "…" : l.title}
                      </a>); })}
                  </div>
                </Panel>
              </div>
            );
          })}
        </div>

        <aside>
          <Panel style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Badges · {p.badges.length} of {BADGES.length}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {BADGES.map((b) => { const on = p.badges.includes(b.id); return (
                <div key={b.id} title={`${b.label}: ${b.blurb}`} style={{ aspectRatio: "1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: on ? "var(--accent-bg-subtle)" : "#F3F4F6", border: `1px solid ${on ? "var(--accent-bg)" : "var(--border)"}`, filter: on ? "none" : "grayscale(1)", opacity: on ? 1 : 0.45 }} className={on ? "tos-pop" : undefined}>{b.icon}</div>); })}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>Badges are for things you did, never for things you watched.</div>
          </Panel>
          <Panel style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Streak</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontFamily: font.serif, fontSize: 34, fontWeight: 700 }}>{p.streak.count}</span><span style={{ color: "var(--muted)", fontSize: 14 }}>day{p.streak.count === 1 ? "" : "s"} with an action</span></div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 4 }}>One missed day is forgiven. Two resets it. Actions count; watching doesn&rsquo;t.</div>
          </Panel>
          <Panel style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Included with the program</div>
            {[["📄", "Module workbooks (Word)", "/course/module-1-workbook.docx"], ["🃏", "20 path cards with sourced ranges", "https://slptransitions.com/alternative-careers-speech-pathologists-slps/"], ["🏢", "120 companies that hire former SLPs", "/companies"], ["📬", "This week's open roles by path", "/jobs"], ["🧰", "Career Pivot Suite ($24, included)", "/"], ["🧾", "Pivot Report ($9, included)", "/quiz"]].map(([i, t, h]) => (
              <a key={t} href={h} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text)", textDecoration: "none", padding: "6px 0", lineHeight: 1.4 }}><span aria-hidden>{i}</span>{t}</a>
            ))}
          </Panel>
          <button type="button" onClick={() => { if (confirm("Reset this browser's progress?")) reset(); }} style={{ background: "none", border: "none", color: "var(--light)", fontSize: 12, cursor: "pointer", fontFamily: font.sans, padding: 0 }}>Reset prototype progress</button>
        </aside>
      </div>
    </CourseShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)" }}>{children}</span>;
}
