"use client";

import { useState } from "react";
import { S, Card, ProgressBar, focusB, blurB } from "./ui";
import { QUESTIONS, PATHS, scoreQuiz, type QuizAnswers, type QuizPath } from "@/lib/quiz";

export default function CareerQuiz({ initialPath }: { initialPath?: string }) {
  // Traffic from the old Typeform arrives with ?path=slug and skips straight to a result.
  const preset = initialPath ? PATHS[initialPath] : undefined;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<{ top: QuizPath; runnerUp: QuizPath | null } | null>(
    preset ? { top: preset, runnerUp: null } : null
  );
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const q = QUESTIONS[idx];
  const selected = answers[q?.id] || [];

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
    else setResult(scoreQuiz(next));
  };

  const advance = () => {
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else setResult(scoreQuiz(answers));
  };

  const subscribe = () => {
    if (!email.includes("@")) return;
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSubscribed(true);
  };

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
            onClick={() => { window.location.href = `/?from=quiz&path=${encodeURIComponent(top.label)}`; }}
          >
            Get my personalized report →
          </button>
          <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>
            Starts with a free preview. No subscription, ever.
          </p>
        </Card>

        {!subscribed ? (
          <Card>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Not ready yet? Get the companies list.</div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
              100+ ed-tech and health-tech companies with a track record of hiring former clinicians, plus a
              weekly note with real transition stories. No spam, unsubscribe anytime.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                style={{ ...S.input, flex: 1, minWidth: 200 }}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") subscribe(); }}
                onFocus={focusB}
                onBlur={blurB}
              />
              <button style={{ ...S.btnOut, opacity: email.includes("@") ? 1 : 0.5 }} disabled={!email.includes("@")} onClick={subscribe}>
                Send it to me
              </button>
            </div>
          </Card>
        ) : (
          <Card><div style={{ fontSize: 14, color: "var(--accent)" }}>✓ On its way — check your inbox.</div></Card>
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

  return (
    <div style={S.wrap}>
      <ProgressBar step={idx + 1} total={QUESTIONS.length} />
      <h2 style={{ ...S.h2, marginBottom: q.help ? 6 : 18 }}>{q.prompt}</h2>
      {q.help && <p style={{ ...S.p, marginBottom: 18 }}>{q.help}</p>}

      <div style={{ marginBottom: 20 }}>
        {q.options.map((o) => {
          const sel = selected.includes(o.label);
          return (
            <div
              key={o.label}
              onClick={() => choose(o.label)}
              style={{
                padding: "14px 16px",
                border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                background: sel ? "var(--accent-bg-subtle)" : "var(--card)",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 10,
                fontSize: 15,
                lineHeight: 1.55,
                color: sel ? "var(--accent)" : "var(--text)",
                fontWeight: sel ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {q.multi && <span style={{ marginRight: 8 }}>{sel ? "☑" : "☐"}</span>}
              {o.label}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {idx > 0 && (
          <button style={S.btnOut} onClick={() => setIdx(idx - 1)}>← Back</button>
        )}
        {q.multi && (
          <button style={S.btn} onClick={advance}>
            {selected.length ? "Continue →" : "None of these yet →"}
          </button>
        )}
      </div>
      {!q.multi && (
        <p style={{ fontSize: 13, color: "var(--light)", marginTop: 4 }}>Pick the closest one — there's no wrong answer.</p>
      )}
    </div>
  );
}
