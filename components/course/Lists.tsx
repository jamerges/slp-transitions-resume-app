"use client";
// One home for the two lists a buyer keeps for months: the people they are
// talking to and the applications they have sent. The same tools the lessons
// mount (3.3, 3.6, 4.7), reading the same saved slots, so nothing lives twice.
import { useCallback } from "react";
import { useProgress } from "@/lib/course-progress";
import { CourseShell, font } from "./ui";
import { Tool } from "./tools";

export default function Lists() {
  const { p, ready, pct, saveAnswer, synced } = useProgress();
  const answers = p.answers as Record<string, any>;
  const pathSlug: string | undefined = answers["0.2"]?.path || answers["1.5"]?.top?.[0];
  const shared = { ...answers, ...(answers.__shared || {}) };
  const setShared = useCallback((key: string, v: any) => {
    saveAnswer("__shared", { ...(answers.__shared || {}), [key]: v });
  }, [answers, saveAnswer]);
  return (
    <CourseShell xp={p.xp} pct={pct} note={synced ? "Saved to your purchase, on any device." : undefined}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 0 40px" }}>
        <a href="/course" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>&larr; All lessons</a>
        <h1 style={{ fontFamily: font.serif, fontSize: 32, fontWeight: 700, margin: "10px 0 6px" }}>Your people and applications</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch", margin: "0 0 22px" }}>The two lists that run the search. Lessons 3.3, 3.6 and 4.7 write to the same ones, so log things wherever you are and they show up here.</p>
        {ready && (
          <>
            <div style={{ marginBottom: 28 }}><Tool name="contact-tracker-warm" pathSlug={pathSlug} shared={shared} setShared={setShared} synced={synced} /></div>
            <div><Tool name="application-tracker" pathSlug={pathSlug} shared={shared} setShared={setShared} synced={synced} /></div>
          </>
        )}
      </div>
    </CourseShell>
  );
}
