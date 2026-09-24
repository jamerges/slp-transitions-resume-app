"use client";

import { useEffect, useRef, useState } from "react";
import { S, Card } from "./ui";
import { track } from "@/lib/analytics";
import {
  SETTINGS, YEARS, SEARCH_LENGTH, HOW_FOUND, WORK_SETUP, PAY_VS, CREDIT, PROMPTS,
} from "@/lib/story";

/**
 * "Share your story" intake for SLPs who landed a non-clinical job. Long by
 * nature, so it saves to this browser as they type (not the photo or file) and
 * every question except name, email, new title and consent is optional.
 */

const DRAFT_KEY = "slp:story:draft:v1";

type Draft = {
  firstName: string; lastName: string; email: string; credit: string; linkedin: string;
  settings: string[]; years: string; jobTitle: string; company: string; nameCompany: boolean;
  started: string; setup: string; searchLength: string; applications: string; interviews: string;
  howFound: string; pay: string; payRange: string; payPublic: boolean;
  bullets: { before: string; after: string }[]; answers: Record<string, string>;
  followUp: boolean; consent: boolean;
};

const EMPTY: Draft = {
  firstName: "", lastName: "", email: "", credit: "Full name", linkedin: "",
  settings: [], years: "", jobTitle: "", company: "", nameCompany: true,
  started: "", setup: "", searchLength: "", applications: "", interviews: "",
  howFound: "", pay: "", payRange: "", payPublic: false,
  bullets: [{ before: "", after: "" }, { before: "", after: "" }], answers: {},
  followUp: false, consent: false,
};

/** Resize to 800px on the long side and re-encode as JPEG, so a phone photo fits the request. */
async function shrinkPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => {
      const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url;
    });
    const scale = Math.min(1, 800 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Choice({ options, value, onPick, multi }: { options: readonly string[]; value: string | string[]; onPick: (v: string) => void; multi?: boolean }) {
  return (
    <div role={multi ? "group" : "radiogroup"} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const sel = Array.isArray(value) ? value.includes(o) : value === o;
        return (
          <button
            key={o}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={sel}
            onClick={() => onPick(o)}
            style={{
              padding: "8px 13px", borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer",
              border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
              background: sel ? "var(--accent-bg-subtle)" : "var(--card)",
              color: sel ? "var(--accent)" : "var(--text)", fontWeight: sel ? 600 : 400,
            }}
          >
            {sel && multi ? "✓ " : ""}{o}
          </button>
        );
      })}
    </div>
  );
}

const Section = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <Card>
    <h2 style={{ ...S.h3, fontSize: 19, marginBottom: note ? 2 : 14 }}>{title}</h2>
    {note && <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>{note}</p>}
    {children}
  </Card>
);

const Field = ({ id, label, hint, children }: { id?: string; label: string; hint?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <label htmlFor={id} style={{ ...S.label, marginBottom: hint ? 2 : 6 }}>{label}</label>
    {hint && <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>{hint}</div>}
    {children}
  </div>
);

export default function StoryForm() {
  const [d, setD] = useState<Draft>(EMPTY);
  const [photo, setPhoto] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [honey, setHoney] = useState("");
  const openedAt = useRef(Date.now());
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setD({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* private mode */ }
    loaded.current = true;
    track("view_item", { item_id: "share_story", placement: "story_form" });
  }, []);
  useEffect(() => {
    if (!loaded.current || status === "sent") return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* ignore */ }
  }, [d, status]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const ans = (id: string, v: string) => setD((p) => ({ ...p, answers: { ...p.answers, [id]: v } }));
  const toggle = (k: "settings", v: string) => setD((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const prompt = (id: string) => {
    const p = PROMPTS.find((x) => x.id === id)!;
    return (
      <Field id={`story-${id}`} label={p.label} hint={p.hint}>
        <textarea id={`story-${id}`} style={{ ...S.textarea, minHeight: 96 }} value={d.answers[id] || ""} onChange={(e) => ans(id, e.target.value)} />
      </Field>
    );
  };

  async function submit() {
    const missing = [
      !d.jobTitle.trim() ? "your new job title" : "",
      !d.firstName.trim() ? "your first name" : "",
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()) ? "your email" : "",
    ].filter(Boolean);
    const add = missing.length ? `Add ${missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}` : missing[0]}` : "";
    const tick = d.consent ? "" : "tick the box that says we can turn this into an article";
    if (add || tick) {
      const msg = [add, tick].filter(Boolean).join(", and ");
      setError(`${msg.charAt(0).toUpperCase()}${msg.slice(1)}.`);
      return;
    }
    setError(""); setStatus("sending");
    try {
      const body = new FormData();
      body.append("story", JSON.stringify({ ...d, photo, website: honey, openedAt: openedAt.current }));
      if (resume) body.append("resume", resume);
      const resp = await fetch("/api/story", { method: "POST", body });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || "Something went wrong. Try once more.");
      track("generate_lead", { placement: "story_form" });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Try once more.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ ...S.wrap, textAlign: "center", padding: "56px 0" }}>
        <span style={S.tag}>✓ Sent</span>
        <h1 style={{ ...S.h1, fontSize: 30, marginTop: 14 }}>Thank you. It&rsquo;s with James now.</h1>
        <p style={{ ...S.p, maxWidth: 460, margin: "0 auto" }}>
          He&rsquo;ll email you the draft before anything goes live. Congratulations on the new job.
        </p>
      </div>
    );
  }

  const input = (id: string, k: keyof Draft, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={id} style={S.input} value={d[k] as string} onChange={(e) => set(k, e.target.value as any)} {...props} />
  );

  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", margin: "8px 0 22px" }}>
        <span style={S.tag}>Share your story</span>
        <h1 style={{ ...S.h1, fontSize: 30, marginTop: 14 }}>You made the move. Tell the SLP who&rsquo;s still where you were how you did it.</h1>
        <p style={{ ...S.p, maxWidth: 540, margin: "0 auto" }}>
          About 15 minutes. Answer what you like and skip what you don&rsquo;t. James edits your answers into an
          article on slptransitions.com and sends you the draft before anything goes live.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>Your answers save in this browser as you type, so you can come back to it.</p>
      </div>

      <Section title="Where you started">
        <Field label="Where did you work as an SLP?" hint="Pick all that apply.">
          <Choice multi options={SETTINGS} value={d.settings} onPick={(v) => toggle("settings", v)} />
        </Field>
        <Field label="How long were you an SLP?">
          <Choice options={YEARS} value={d.years} onPick={(v) => set("years", d.years === v ? "" : v)} />
        </Field>
        {prompt("why")}
      </Section>

      <Section title="Where you are now">
        <Field id="story-title" label="Your new job title">{input("story-title", "jobTitle", { placeholder: "e.g. Implementation Specialist" })}</Field>
        <Field id="story-company" label="Company" hint="Optional.">
          {input("story-company", "company")}
          {d.company.trim() && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, marginTop: 8 }}>
              <input type="checkbox" checked={d.nameCompany} onChange={(e) => set("nameCompany", e.target.checked)} /> OK to name the company in the article
            </label>
          )}
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 16px" }}>
          <Field id="story-started" label="When did you start?">{input("story-started", "started", { type: "month" })}</Field>
          <Field label="Where do you work?"><Choice options={WORK_SETUP} value={d.setup} onPick={(v) => set("setup", d.setup === v ? "" : v)} /></Field>
        </div>
        {prompt("week")}
      </Section>

      <Section title="How you got there">
        <Field label="From your first serious search to the offer, how long did it take?">
          <Choice options={SEARCH_LENGTH} value={d.searchLength} onPick={(v) => set("searchLength", d.searchLength === v ? "" : v)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 16px" }}>
          <Field id="story-apps" label="Roughly how many applications?" hint="A guess is fine.">{input("story-apps", "applications", { inputMode: "numeric", placeholder: "e.g. 40" })}</Field>
          <Field id="story-ints" label="How many interviews?">{input("story-ints", "interviews", { inputMode: "numeric", placeholder: "e.g. 5" })}</Field>
        </div>
        <Field label="How did this job come to you?">
          <Choice options={HOW_FOUND} value={d.howFound} onPick={(v) => set("howFound", d.howFound === v ? "" : v)} />
        </Field>
        {prompt("howStory")}
        {prompt("training")}
      </Section>

      <Section title="Your résumé" note="Optional, and the part other SLPs ask about most.">
        {prompt("resume")}
        <div style={{ fontSize: 14, fontWeight: 600, margin: "4px 0 8px" }}>One bullet, before and after</div>
        {d.bullets.map((b, i) => (
          <div key={i} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: "3px solid var(--accent-bg)" }}>
            <label htmlFor={`story-b${i}`} style={{ fontSize: 12.5, color: "var(--muted)" }}>From your clinical résumé</label>
            <textarea id={`story-b${i}`} style={{ ...S.textarea, minHeight: 56, marginBottom: 6 }} value={b.before}
              onChange={(e) => set("bullets", d.bullets.map((x, j) => (j === i ? { ...x, before: e.target.value } : x)))} />
            <label htmlFor={`story-a${i}`} style={{ fontSize: 12.5, color: "var(--muted)" }}>The same work, on your new résumé</label>
            <textarea id={`story-a${i}`} style={{ ...S.textarea, minHeight: 56 }} value={b.after}
              onChange={(e) => set("bullets", d.bullets.map((x, j) => (j === i ? { ...x, after: e.target.value } : x)))} />
          </div>
        ))}
        <Field id="story-resume" label="Upload your résumé" hint="PDF or Word, under 3MB. Never published. It shows James the translation you made.">
          <input id="story-resume" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setResume(e.target.files?.[0] || null)} style={{ fontSize: 14 }} />
        </Field>
      </Section>

      <Section title="Looking back">
        {prompt("skills")}
        {prompt("harder")}
        <Field label="How does your pay compare to your clinical pay?" hint="Optional. Private unless you tick the box.">
          <Choice options={PAY_VS} value={d.pay} onPick={(v) => set("pay", d.pay === v ? "" : v)} />
          {d.pay && d.pay !== "Prefer not to say" && (
            <div style={{ marginTop: 10 }}>
              <input aria-label="Pay range" style={S.input} placeholder="If you're comfortable, a range, e.g. $85–95k" value={d.payRange} onChange={(e) => set("payRange", e.target.value)} />
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, marginTop: 8 }}>
                <input type="checkbox" checked={d.payPublic} onChange={(e) => set("payPublic", e.target.checked)} /> OK to include this in the article
              </label>
            </div>
          )}
        </Field>
        {prompt("advice")}
        {prompt("extra")}
      </Section>

      <Section title="About you">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 16px" }}>
          <Field id="story-first" label="First name">{input("story-first", "firstName", { autoComplete: "given-name" })}</Field>
          <Field id="story-last" label="Last name" hint="Optional.">{input("story-last", "lastName", { autoComplete: "family-name" })}</Field>
        </div>
        <Field id="story-email" label="Email" hint="Only so James can send you the draft. Never published.">
          {input("story-email", "email", { type: "email", autoComplete: "email", inputMode: "email" })}
        </Field>
        <Field label="How should the article credit you?">
          <Choice options={CREDIT} value={d.credit} onPick={(v) => set("credit", v)} />
        </Field>
        {d.credit === "Full name" && (
          <Field id="story-li" label="LinkedIn profile" hint="Optional. Linked from the article.">
            {input("story-li", "linkedin", { type: "url", placeholder: "https://www.linkedin.com/in/…" })}
          </Field>
        )}
        {d.credit !== "Anonymous" && (
          <Field id="story-photo" label="A photo of you" hint="Optional. A real headshot. Skip it and the article runs without one.">
            <input id="story-photo" type="file" accept="image/*" style={{ fontSize: 14 }}
              onChange={async (e) => { const f = e.target.files?.[0]; setPhoto(f ? await shrinkPhoto(f).catch(() => "") : ""); }} />
            {photo && <img src={photo} alt="" width={72} height={72} style={{ display: "block", marginTop: 8, width: 72, height: 72, objectFit: "cover", borderRadius: "50%" }} />}
          </Field>
        )}
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5, marginBottom: 10 }}>
          <input type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} style={{ marginTop: 3 }} />
          <span>You can edit my answers into an article on slptransitions.com. I&rsquo;ll see the draft before it&rsquo;s published.</span>
        </label>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5 }}>
          <input type="checkbox" checked={d.followUp} onChange={(e) => set("followUp", e.target.checked)} style={{ marginTop: 3 }} />
          <span>I&rsquo;m open to a short follow-up call.</span>
        </label>
        {/* Honeypot: hidden from people, filled by bots. */}
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={honey} onChange={(e) => setHoney(e.target.value)} name="website"
          style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
      </Section>

      <div style={{ textAlign: "center", margin: "8px 0 40px" }}>
        {error && <div role="alert" style={{ fontSize: 14, color: "var(--err)", marginBottom: 10 }}>{error}</div>}
        <button style={{ ...S.btn, padding: "15px 40px", fontSize: 16, opacity: status === "sending" ? 0.6 : 1 }} disabled={status === "sending"} onClick={submit}>
          {status === "sending" ? "Sending…" : "Send my story →"}
        </button>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>
          Your email, your résumé and anything you keep private never appear in the article.
        </p>
      </div>
    </div>
  );
}
