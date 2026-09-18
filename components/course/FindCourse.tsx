"use client";
// There are no accounts. A buyer's link is their login, so a new device or a
// cleared browser means "send me the link again". This asks for the address
// they bought with and always answers the same way, so nobody can use it to
// check whether an address has bought.
import { useState } from "react";
import { Btn, Panel, font } from "./ui";
import { SUPPORT_EMAIL } from "@/lib/contact";

export default function FindCourse() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const send = async () => {
    if (!email.trim()) return;
    setState("busy");
    try {
      const r = await fetch("/api/course/find-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      setState(r.ok ? "sent" : "error");
    } catch { setState("error"); }
  };
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 16px 80px" }}>
      <a href="/course" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>&larr; Transition OS</a>
      <h1 style={{ fontFamily: font.serif, fontSize: 30, fontWeight: 700, margin: "12px 0 8px" }}>Find your course link</h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 20px" }}>There is no password. The link in your purchase email is your login, and it opens your lessons, your answers and your people list on any device. Lost the email? Enter the address you bought with and it comes again.</p>
      <Panel>
        {state === "sent" ? (
          <div style={{ fontSize: 15, lineHeight: 1.65 }}>
            <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>&#10003; Sent, if there is a purchase under that address.</div>
            Give it a minute and check spam. It comes from send.slptransitions.com. If nothing arrives and you are sure you bought with this address, write to {SUPPORT_EMAIL} from it and I will sort it by hand.
          </div>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>The email you bought with</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="you@email.com" autoComplete="email" style={{ width: "100%", padding: "11px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, background: "var(--card)", marginBottom: 12 }} />
            {state === "error" && <div style={{ fontSize: 13, color: "#92400E", marginBottom: 10 }}>That didn&rsquo;t send. Try again in a minute, or write to {SUPPORT_EMAIL}.</div>}
            <Btn onClick={send} disabled={state === "busy" || !email.trim()}>{state === "busy" ? "Sending…" : "Send my link"}</Btn>
          </>
        )}
      </Panel>
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 18 }}>Haven&rsquo;t bought anything? Module 0 is free and needs no link: <a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>start there</a>.</p>
    </div>
  );
}
