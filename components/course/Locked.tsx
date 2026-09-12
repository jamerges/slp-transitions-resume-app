"use client";
import { CourseShell, Panel, Btn, font } from "./ui";
import { useProgress } from "@/lib/course-progress";

/** What a visitor sees on a lesson they don't hold. Module 1 sells Ground;
 *  the rest point at the full program. */
export default function LockedLesson({ moduleN, moduleTitle, lessonTitle }: { moduleN: number; moduleTitle: string; lessonTitle: string }) {
  const { p, pct } = useProgress();
  const ground = moduleN <= 2;
  return (
    <CourseShell xp={p.xp} streak={p.streak.count} pct={pct}>
      <div style={{ maxWidth: 640, margin: "30px auto" }}>
        <Panel style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Module {moduleN} · {moduleTitle}</div>
          <h1 style={{ fontFamily: font.serif, fontSize: 28, margin: "8px 0 10px" }}>{lessonTitle}</h1>
          {ground ? (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>This lesson is in <strong>Before You Start Looking</strong>, Modules 1 and 2 of Transition OS: whether you&rsquo;re actually leaving, what you&rsquo;re protecting if you are, and which of the twenty paths fit what you just worked out. $24 once, and it comes off the full program later.</p>
              <Btn href="/course/ground">See what&rsquo;s in it →</Btn>
              <div style={{ marginTop: 14 }}><a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>The setup is free, start there →</a></div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>This module is in the full Transition OS program, which isn&rsquo;t open yet. Modules 1 and 2 are available now for $24, and what you pay comes off the full program.</p>
              <Btn href="/course/ground">See Modules 1 and 2 →</Btn>
              <div style={{ marginTop: 14 }}><a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>← Quest log</a></div>
            </>
          )}
        </Panel>
      </div>
    </CourseShell>
  );
}
