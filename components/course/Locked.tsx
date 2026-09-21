"use client";
import { CourseShell, Panel, Btn, font } from "./ui";
import { useProgress } from "@/lib/course-progress";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { GROUND_NAME, GROUND_PRICE, KIT_LESSONS } from "@/lib/course-tiers";

/** The upsell where it belongs: on the first locked lesson, one click to
 *  Stripe, no detour back to the sales page. Email is collected at checkout. */
function GroundCheckout() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const buy = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    track("begin_checkout", { currency: "USD", value: GROUND_PRICE, items: [{ item_id: "ground", item_name: GROUND_NAME, price: GROUND_PRICE, quantity: 1 }], placement: "locked_lesson" });
    try {
      const r = await fetch("/api/ground-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Checkout failed");
      window.location.href = d.url;
    } catch (e: any) { setErr(e?.message || "Couldn't open checkout. Please try again."); setBusy(false); }
  };
  return (
    <>
      <button type="button" onClick={buy} disabled={busy} style={{ padding: "13px 28px", fontSize: 15.5, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
        {busy ? "Opening checkout…" : `Get Module 1 · $${GROUND_PRICE} →`}
      </button>
      {err && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 10 }}>{err}</div>}
    </>
  );
}

/** What a visitor sees on a lesson they don't hold. Module 1 sells Ground;
 *  the rest point at the full program. */
export default function LockedLesson({ moduleN, moduleTitle, lessonTitle, lessonId, owns }: { moduleN: number; moduleTitle: string; lessonTitle: string; lessonId?: string; owns?: "free" | "ground" | "os" | null }) {
  const { p, pct } = useProgress();
  // In the kit: Module 1, or one of the five people and r\u00e9sum\u00e9 lessons. A kit owner never sees this branch.
  const ground = (moduleN === 1 || (!!lessonId && KIT_LESSONS.includes(lessonId))) && owns !== "ground";
  return (
    <CourseShell xp={p.xp} pct={pct}>
      <div style={{ maxWidth: 640, margin: "30px auto" }}>
        <Panel style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Module {moduleN} · {moduleTitle}</div>
          <h1 style={{ fontFamily: font.serif, fontSize: 28, margin: "8px 0 10px" }}>{lessonTitle}</h1>
          {ground ? (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 6px" }}>This lesson is in <strong>{GROUND_NAME}</strong>, the first month in one kit: your reasons in writing, the people who already made the move, and the r&eacute;sum&eacute; pass, with the workbook.</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 18px" }}>${GROUND_PRICE} once, credited toward the full program later. 30-day refund by replying to one email.</p>
              <GroundCheckout />
              <div style={{ marginTop: 14 }}><a href="/course/ground" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>See what&rsquo;s in it &rarr;</a></div>
              <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--muted)" }}>Already bought it? <a href="/course/find" style={{ color: "var(--accent)", fontWeight: 600 }}>Get your link sent again</a></div>
            </>
          ) : (
            <>
              {owns === "ground" ? (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>
                    This one is in the rest of the program, which isn&rsquo;t open yet. You already have the Getting Started kit, and what you
                    paid is credited toward the full program when it opens. I&rsquo;ll email you the day it does.
                  </p>
                  <Btn href="/course">← Back to your lessons</Btn>
                  <div style={{ marginTop: 14 }}><a href="/course/workbook" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>Your workbook, with your answers →</a></div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: "0 0 18px" }}>This module is in the full Transition OS program, which isn&rsquo;t open yet. Module 1 is open now for ${GROUND_PRICE}, and what you pay is credited toward the full program.</p>
                  <Btn href="/course/ground">See Module 1 →</Btn>
                  <div style={{ marginTop: 14 }}><a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>← Your lessons</a></div>
                </>
              )}
            </>
          )}
        </Panel>
      </div>
    </CourseShell>
  );
}
