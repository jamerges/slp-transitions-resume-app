"use client";

import { useEffect, useRef, useState } from "react";
import { S, focusB, blurB } from "./ui";

const TOOK = [
  "Under 3 months",
  "3–6 months",
  "6–12 months",
  "1–2 years",
  "More than 2 years",
  "Still in progress",
];

/**
 * Six questions, because the point is to open a conversation rather than to
 * collect a case study. Name, email and the two role questions are what James
 * needs to decide whether someone fits the interview roster; the rest is
 * optional and most people fill it in anyway.
 */
export default function StoryForm() {
  const mounted = useRef(Date.now());
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({
    name: "",
    email: "",
    link: "",
    before: "",
    now: "",
    howLong: "",
    extra: "",
    company_url: "", // honeypot
  });

  // A refresh after submitting shouldn't re-post; nothing here needs to persist.
  useEffect(() => {
    mounted.current = Date.now();
  }, []);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/share-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, elapsed: Date.now() - mounted.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          border: "1px solid var(--accent)",
          background: "var(--accent-bg-subtle)",
          borderRadius: 10,
          padding: "22px 24px",
        }}
      >
        <h2 style={{ ...S.h2, fontSize: 20, marginBottom: 8 }}>Got it — thank you.</h2>
        <p style={{ ...S.p, marginBottom: 0 }}>
          That went straight to James&rsquo;s inbox and he reads every one. If your story
          fits an upcoming piece he&rsquo;ll reply directly, usually within a week or two.
          In the meantime,{" "}
          <a href="/quiz" style={{ color: "var(--accent)" }}>
            the career quiz
          </a>{" "}
          and{" "}
          <a href="/jobs" style={{ color: "var(--accent)" }}>
            this week&rsquo;s open roles
          </a>{" "}
          are the two most useful things on the site.
        </p>
      </div>
    );
  }

  const field = (
    label: string,
    key: keyof typeof f,
    opts: { placeholder?: string; required?: boolean; hint?: string; type?: string } = {}
  ) => (
    <div style={{ marginBottom: 18 }}>
      <label style={S.label}>
        {label}
        {!opts.required && (
          <span style={{ color: "var(--light)", fontWeight: 400 }}> (optional)</span>
        )}
      </label>
      {opts.hint && (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 6px" }}>{opts.hint}</p>
      )}
      <input
        type={opts.type || "text"}
        value={f[key]}
        onChange={set(key)}
        onFocus={focusB}
        onBlur={blurB}
        placeholder={opts.placeholder}
        required={opts.required}
        style={S.input}
      />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      {field("Your name", "name", { required: true, placeholder: "First and last" })}
      {field("Email", "email", {
        required: true,
        type: "email",
        placeholder: "you@example.com",
        hint: "Only used to reply to you.",
      })}
      {field("What did you do as an SLP?", "before", {
        required: true,
        placeholder: "e.g. Schools, 7 years, mostly early intervention",
        hint: "Setting and roughly how long.",
      })}
      {field("What do you do now?", "now", {
        required: true,
        placeholder: "e.g. Implementation Manager at a health-tech company",
        hint: "Role and industry. If you're mid-transition, say where you're heading.",
      })}

      <div style={{ marginBottom: 18 }}>
        <label style={S.label}>
          How long did the move take?
          <span style={{ color: "var(--light)", fontWeight: 400 }}> (optional)</span>
        </label>
        <select value={f.howLong} onChange={set("howLong")} style={S.input}>
          <option value="">Pick one…</option>
          {TOOK.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {field("LinkedIn or website", "link", { placeholder: "https://" })}

      <div style={{ marginBottom: 22 }}>
        <label style={S.label}>
          Anything else?
          <span style={{ color: "var(--light)", fontWeight: 400 }}> (optional)</span>
        </label>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 6px" }}>
          The hardest part, or the thing you wish someone had told you. A couple of
          sentences is plenty.
        </p>
        <textarea
          value={f.extra}
          onChange={set("extra")}
          onFocus={focusB}
          onBlur={blurB}
          style={{ ...S.textarea, minHeight: 120 }}
        />
      </div>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it in
          because it looks like a normal field in the markup. */}
      <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="company_url">Company URL</label>
        <input
          id="company_url"
          name="company_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={f.company_url}
          onChange={set("company_url")}
        />
      </div>

      {err && (
        <p style={{ color: "var(--err)", fontSize: 14, marginBottom: 14 }} role="alert">
          {err}
        </p>
      )}

      <button type="submit" disabled={busy} style={{ ...S.btn, opacity: busy ? 0.6 : 1 }}>
        {busy ? "Sending…" : "Send my story"}
      </button>
      <p style={{ fontSize: 12.5, color: "var(--light)", marginTop: 12 }}>
        This goes to James directly. Nothing is published without asking you first,
        and you&rsquo;re not signing up for anything.
      </p>
    </form>
  );
}
