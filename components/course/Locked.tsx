"use client";
import { CourseShell, Panel, Btn, font } from "./ui";
import { useProgress } from "@/lib/course-progress";

/** What a visitor sees on a lesson they don't hold. Module 1 sells Ground;
 *  the rest point at the full program. */
export default function LockedLesson({ moduleN, moduleTitle, lessonTitle, owns }: { moduleN: number; moduleTitle: string; lessonTitle: string; owns?: "ground" | "os" | null }) {
  const { p, pct } = useProgress();
  const ground = moduleN === 1 && owns !== "ground";
  return (
    <CourseShell xp={p.xp} streak={p.streak.count} pct={pct}>
      <div style={{ maxWidth: 640, margin: "30px auto" }}>
        <Panel style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Module {moduleN} · {moduleTitle}</div>
          <h1 style={{ fontFamily: font.serif, fontSize: 28, margin: "8px 0 10px" }}>{lessonTitle}</h1>
          {ground ? (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>This lesson is in <strong>Before You Start Looking</strong>, Module 1 of Transition OS plus the companion workbook: whether you&rsquo;re actually leaving, and what you&rsquo;re protecting if you are. $19 once, and it comes off the full program later.</p>
              <Btn href="/course/ground">See what&rsquo;s in it →</Btn>
              <div style={{ marginTop: 14 }}><a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>The setup is free, start there →</a></div>
            </>
          ) : (
            <>
              {owns === "ground" ? (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>
                    This one is in the rest of the program, which isn&rsquo;t open yet. You already have Module 1, and what you
                    paid comes off the full program when it opens. I&rsquo;ll email you the day it does.
                  </p>
                  <Btn href="/course">← Back to your quest log</Btn>
                  <div style={{ marginTop: 14 }}><a href="/course/workbook" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>Your workbook, with your answers →</a></div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>This module is in the full Transition OS program, which isn&rsquo;t open yet. Module 1 is available now for $19, and what you pay comes off the full program.</p>
                  <Btn href="/course/ground">See Module 1 →</Btn>
                  <div style={{ marginTop: 14 }}><a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>← Quest log</a></div>
                </>
              )}
            </>
          )}
        </Panel>
      </div>
    </CourseShell>
  );
}
