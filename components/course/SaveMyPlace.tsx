"use client";
// The end of the free module. Module 0 lives in one browser until the reader
// asks for a way back; this gets them the same signed-link login a buyer has,
// with their starting line in the email so the address is worth giving. Once
// a link exists (any access cookie), it says so and asks for nothing.
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/course-progress";
import { track } from "@/lib/analytics";
import { Btn, Panel, font } from "./ui";

const money = (n: unknown) => (typeof n === "number" && n > 0 ? "$" + Math.round(n).toLocaleString("en-US") : "");

export default function SaveMyPlace({ compact = false }: { compact?: boolean }) {
  const { p } = useProgress();
  const [state, setState] = useState<"checking" | "form" | "busy" | "sent" | "linked" | "error">("checking");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/course/progress", { cache: "no-store" }).then((r) => setState(r.status === 200 ? "linked" : "form")).catch(() => setState("form"));
  }, []);
  const a = p.answers as Record<string, any>;
  const floor = money(a["0.2"]?.floorDollars);
  const date = a["0.2"]?.date || "";
  const verdict = a["0.3"]?.verdict || "";
  const send = async () => {
    if (!email.trim()) return;
    setState("busy"); setErr("");
    try {
      const r = await fetch("/api/course/free-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), summary: { floor, date, verdict } }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || "That didn't send."); setState("form"); return; }
      track("generate_lead", { placement: "course_free_link" });
      setState("sent");
      // The cookie is on this browser now; a reload lets the progress store
      // notice and push what is here to the link.
      setTimeout(() => window.location.reload(), 1200);
    } catch { setErr("That didn't send. Try again in a minute."); setState("form"); }
  };
  if (state === "checking") return null;
  if (state === "linked") {
    if (compact) return null;
    return <Panel tone="soft" style={{ marginTop: 16, padding: "14px 16px", fontSize: 14, lineHeight: 1.6 }}>Your place is saved to your link. Open it on any device and your starting line, your verdict and everything after are there.</Panel>;
  }
  return (
    <Panel tone="soft" style={{ marginTop: compact ? 0 : 16, marginBottom: compact ? 14 : 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Save your place</div>
      <div style={{ fontFamily: font.serif, fontSize: compact ? 18 : 20, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>Email me my starting line and a link back to it</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 10px", color: "var(--text)" }}>
        Right now this lives in this browser only. The email carries {floor ? <>your number, <b>{floor}</b>,</> : "your number"}{date ? <> your date, <b>{date}</b>,</> : ""}{verdict ? <> your verdict, <b>{verdict}</b>,</> : ""} and a link that opens all of it on any device. No password, nothing else sent unless you ask.
      </p>
      {state === "sent" ? (
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>&#10003; Sent. Check your inbox; this page will refresh with your place saved.</div>
      ) : (
        <>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="you@email.com" autoComplete="email" style={{ width: "100%", padding: "10px 12px", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, background: "var(--card)", marginBottom: 8 }} />
          {err && <div style={{ fontSize: 13, color: "#92400E", marginBottom: 8 }}>{err}</div>}
          <Btn onClick={send} disabled={state === "busy" || !email.trim()} style={{ width: "100%", textAlign: "center" }}>{state === "busy" ? "Sending…" : "Send me my link"}</Btn>
        </>
      )}
    </Panel>
  );
}
