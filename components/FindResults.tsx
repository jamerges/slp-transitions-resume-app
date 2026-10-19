"use client";
// The Suite and the Pivot Report have no accounts: the results page link is the
// way back in. This asks for the address they bought with and always answers
// the same way, so nobody can use it to check whether an address has bought.
import { useState } from "react";
import { PageShell } from "./ui";
import { Btn, Panel, font } from "./course/ui";
import { SUPPORT_EMAIL } from "@/lib/contact";

export default function FindResults() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const send = async () => {
    if (!email.trim()) return;
    setState("busy");
    try {
      const r = await fetch("/api/results/find-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      setState(r.ok ? "sent" : "error");
    } catch { setState("error"); }
  };
  return (
    <PageShell>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 0 80px" }}>
        <h1 style={{ fontFamily: font.serif, fontSize: 30, fontWeight: 700, margin: "0 0 8px" }}>Find your results</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 20px" }}>There&rsquo;s no login. Your Career Pivot Suite package or Pivot Report lives at a link, and that link was in your purchase email. Enter the address you bought with and we&rsquo;ll send the links again.</p>
        <Panel>
          {state === "sent" ? (
            <div style={{ fontSize: 15, lineHeight: 1.65 }}>
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>&#10003; Sent, if there is a purchase under that address.</div>
              Give it a minute and check spam. It comes from send.slptransitions.com. Packages bought before October 6, 2026 are in the email you got at the time. If nothing arrives, write to {SUPPORT_EMAIL} from the address you bought with.
            </div>
          ) : (
            <>
              <label htmlFor="find-email" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>The email you bought with</label>
              <input id="find-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="you@email.com" autoComplete="email" style={{ width: "100%", padding: "11px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, background: "var(--card)", marginBottom: 12 }} />
              {state === "error" && <div style={{ fontSize: 13, color: "#92400E", marginBottom: 10 }}>That didn&rsquo;t send. Try again in a minute, or write to {SUPPORT_EMAIL}.</div>}
              <Btn onClick={send} disabled={state === "busy" || !email.trim()}>{state === "busy" ? "Sending…" : "Send my links"}</Btn>
            </>
          )}
        </Panel>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 18 }}>Bought the Getting Started kit or the course? <a href="/course/find" style={{ color: "var(--accent)", fontWeight: 600 }}>Find your course link here</a>.</p>
      </div>
    </PageShell>
  );
}
