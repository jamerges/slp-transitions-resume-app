"use client";

import { useState } from "react";
import { S, Card, ProgressBar, focusB, blurB } from "./ui";
import { QUESTIONS, PATHS, scoreQuiz, type QuizAnswers, type QuizPath } from "@/lib/quiz";

export default function CareerQuiz({
  initialPath,
  embedded,
}: {
  initialPath?: string;
  embedded?: boolean;
}) {
  // Inside the WordPress iframe, links must break out to the top window.
  const go = (url: string) => {
    const abs = url.startsWith("http")
      ? url
      : `https://app.slptransitions.com${url}`;
    if (embedded) window.open(abs, "_blank", "noopener");
    else window.location.href = url;
  };
  // Traffic from the old Typeform arrives with ?path=slug and skips straight to a result.
  const preset = initialPath ? PATHS[initialPath] : undefined;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<{ top: QuizPath; runnerUp: QuizPath | null } | null>(
    preset ? { top: preset, runnerUp: null } : null
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState<{ top: QuizPath; runnerUp: QuizPath | null } | null>(null);
  const [sending, setSending] = useState(false);
  const [emailed, setEmailed] = useState(false);

  const q = QUESTIONS[idx];
  const selected = answers[q?.id] || [];

  const finish = (final: QuizAnswers) => setPending(scoreQuiz(final));

  const choose = (label: string) => {
    if (q.multi) {
      setAnswers((p) => {
        const cur = p[q.id] || [];
        return { ...p, [q.id]: cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label] };
      });
      return;
    }
    const next = { ...answers, [q.id]: [label] };
    setAnswers(next);
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else finish(next);
  };

  const advance = () => {
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else finish(answers);
  };

  const revealResult = async () => {
    if (!pending || !email.includes("@") || sending) return;
    setSending(true);
    try {
      const resp = await fetch("/api/quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          topSlug: pending.top.slug,
          runnerUpSlug: pending.runnerUp?.slug || null,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      setEmailed(!!data.emailed);
    } catch {
      // Never hold the result hostage to a delivery problem.
    } finally {
      setSending(false);
      setResult(pending);
    }
  };

  // Result is ready but held behind name + email. This is the list-building
  // step — without it the quiz gives away its value and builds no audience.
  if (pending && !result) {
    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={S.tag}>Answers in</span>
          <h2 style={{ ...S.h2, marginTop: 14 }}>Your result is ready.</h2>
          <p style={{ ...S.p, maxWidth: 470, margin: "0 auto 4px" }}>
            Tell us where to send it and we'll show it to you right here — plus you'll get our database of
            <strong> 100+ ed-tech and health-tech companies</strong> that hire former clinicians.
          </p>
        </div>
        <Card>
          <label style={S.label}>First name</label>
          <input
            style={{ ...S.input, marginBottom: 14 }}
            placeholder="Jane"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") revealResult(); }}
            onFocus={focusB}
            onBlur={blurB}
          />
          <label style={S.label}>Email</label>
          <input
            style={{ ...S.input, marginBottom: 6 }}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") revealResult(); }}
            onFocus={focusB}
            onBlur={blurB}
          />
          <p style={{ fontSize: 12, color: "var(--light)", marginBottom: 16, lineHeight: 1.6 }}>
            Plus the occasional note with real SLP transition stories. Unsubscribe any time — we don't share
            your address with anyone.
          </p>
          <button
            style={{ ...S.btn, width: "100%", padding: "14px", fontSize: 16, opacity: email.includes("@") && !sending ? 1 : 0.5 }}
            disabled={!email.includes("@") || sending}
            onClick={revealResult}
          >
            {sending ? "Sending…" : "Show me my result →"}
          </button>
        </Card>
      </div>
    );
  }

  if (result) {
    const { top, runnerUp } = result;
    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={S.tag}>Your result</span>
          <h1 style={{ ...S.h1, fontSize: 30, marginTop: 14 }}>{top.label}</h1>
          <div style={{ fontSize: 15, color: "var(--accent)", fontWeight: 600 }}>
            {top.range} · typically {top.timeline}
          </div>
        </div>

        <Card highlight>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>{top.why}</p>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 8 }}>How people actually get in</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", marginBottom: 14 }}>{top.entryDoor}</p>
          <div style={{ fontSize: 14, padding: "12px 14px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 6, marginBottom: 12, lineHeight: 1.6 }}>
            <strong>Your first move this week:</strong> {top.firstMove}
          </div>
          <div style={{ fontSize: 14, padding: "12px 14px", background: "var(--warn-bg)", borderRadius: 6, lineHeight: 1.6 }}>
            <strong>The honest caveat:</strong> {top.caveat}
          </div>
        </Card>

        {runnerUp && (
          <Card>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>ALSO WORTH A LOOK</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{runnerUp.label}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{runnerUp.range} · {runnerUp.timeline}</div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginTop: 8, marginBottom: 0 }}>{runnerUp.why}</p>
          </Card>
        )}

        <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>This is the general version.</h3>
          <p style={{ ...S.p, maxWidth: 460, margin: "0 auto 16px" }}>
            Your <strong>Pivot Report</strong> reads your actual resume and tells you which of these paths your
            specific experience already qualifies you for — with your readiness profile, the stage you're in,
            and a week-by-week 30-day plan. $9, once.
          </p>
          <button
            style={{ ...S.btn, padding: "14px 40px", fontSize: 16 }}
            onClick={() => go(`/?from=quiz&path=${encodeURIComponent(top.roleOption)}`)}
          >
            Get my personalized report →
          </button>
          <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>
            Starts with a free preview. No subscription, ever.
          </p>
        </Card>

        {emailed && (
          <Card>
            <div style={{ fontSize: 14, color: "var(--accent)" }}>
              ✓ A copy is on its way to {email} — check your inbox (and spam, just in case).
            </div>
          </Card>
        )}

        <div style={{ textAlign: "center", marginTop: 12, marginBottom: 32 }}>
          <button
            style={{ ...S.btnOut, fontSize: 13 }}
            onClick={() => { setResult(null); setIdx(0); setAnswers({}); }}
          >
            ← Retake the quiz
          </button>
        </div>
      </div>
    );
  }

  const isLast = idx === QUESTIONS.length - 1;

  return (
    <div style={{ ...S.wrap, maxWidth: 620 }}>
      <ProgressBar step={idx + 1} total={QUESTIONS.length} />
      <h2 style={{ ...S.h2, fontSize: 25, marginBottom: q.help ? 8 : 20, marginTop: 4 }}>{q.prompt}</h2>
      {q.help && <p style={{ ...S.p, marginBottom: 20, fontSize: 14 }}>{q.help}</p>}

      <div style={{ marginBottom: 18 }}>
        {q.options.map((o) => {
          const sel = selected.includes(o.label);
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => choose(o.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                padding: "13px 15px",
                border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                background: sel ? "var(--accent-bg-subtle)" : "var(--card)",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 8,
                fontSize: 15,
                lineHeight: 1.45,
                color: sel ? "var(--accent)" : "var(--text)",
                fontWeight: sel ? 600 : 400,
                boxShadow: sel ? "0 1px 3px rgba(45,106,79,0.12)" : "0 1px 2px rgba(0,0,0,0.03)",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = "var(--accent-light)"; }}
              onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: q.multi ? 5 : "50%",
                  border: `1.5px solid ${sel ? "var(--accent)" : "#CBD5E1"}`,
                  background: sel ? "var(--accent)" : "#fff",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {sel ? "✓" : ""}
              </span>
              <span style={{ flex: 1 }}>{o.label}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-select needs an explicit way forward; single-select advances on tap. */}
      {q.multi ? (
        <>
          <button
            style={{ ...S.btn, width: "100%", padding: "15px", fontSize: 16 }}
            onClick={advance}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent-light)")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent)")}
          >
            {selected.length
              ? `Continue with ${selected.length} selected →`
              : isLast
              ? "See my result →"
              : "None of these yet — continue →"}
          </button>
          <p style={{ fontSize: 13, color: "var(--light)", textAlign: "center", marginTop: 10 }}>
            Select as many as apply, then continue.
          </p>
        </>
      ) : (
        <p style={{ fontSize: 13, color: "var(--light)", textAlign: "center", marginTop: 2 }}>
          {isLast ? "Pick one to see your result." : "Pick the closest one — there's no wrong answer."}
        </p>
      )}

      {idx > 0 && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}
            onClick={() => setIdx(idx - 1)}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
