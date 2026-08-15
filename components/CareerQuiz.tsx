"use client";

import { useState } from "react";
import { S, Card, ProgressBar, focusB, blurB } from "./ui";
import { QUESTIONS, PATHS, scoreQuiz, type QuizAnswers, type QuizPath } from "@/lib/quiz";

export default function CareerQuiz({
  initialPath,
  embedded,
  showIntro,
}: {
  initialPath?: string;
  embedded?: boolean;
  showIntro?: boolean;
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
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  // Straight from the result to Stripe. Asking for a resume first was the
  // biggest drop in the funnel — people take this quiz on a phone, at peak
  // motivation, without their resume anywhere near them. The resume is
  // collected on /report after payment instead.
  const buyReport = async (top: QuizPath) => {
    if (buying) return;
    setBuying(true);
    setBuyError("");
    try {
      // Relative: the quiz is always served from app.slptransitions.com, even
      // inside the WordPress iframe, so this stays same-origin.
      const resp = await fetch("/api/report-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: "",
          jobTitle: "",
          jobDesc: "",
          email,
          goals: {
            targetRoles: [top.roleOption],
            targetIndustries: [],
            workPreferences: [],
            topSkills: "",
            whyLeaving: "",
            transitionStage: "",
          },
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.url) throw new Error(data.error || "Checkout failed");
      go(data.url);
    } catch (e: any) {
      setBuyError(e?.message || "Couldn't open checkout. Please try again.");
      setBuying(false);
    }
  };

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
          <div
            aria-hidden
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-bg) 0%, var(--accent-bg-subtle) 100%)",
              border: "2px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              margin: "18px auto 6px",
              boxShadow: "0 4px 14px rgba(45,106,79,0.18)",
            }}
          >
            {top.icon}
          </div>
          <h1 style={{ ...S.h1, fontSize: 30, marginTop: 10 }}>{top.label}</h1>
          <div style={{ fontSize: 15, color: "var(--accent)", fontWeight: 600 }}>
            {top.range} · typically {top.timeline}
          </div>
        </div>

        <Card highlight>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>{top.why}</p>
        </Card>

        {/* The action comes before the explanation. Readers arriving here are
            overwhelmingly stuck rather than uninformed — they know options
            exist and can't tell what to do first — so the one concrete step
            gets its own card instead of sitting below the entry-door prose. */}
        <Card>
          <h3 style={{ ...S.h3, marginBottom: 8 }}>Start here this week</h3>
          <div style={{ fontSize: 15, padding: "12px 14px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 6, lineHeight: 1.65 }}>
            {top.firstMove}
          </div>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 8 }}>How people actually get in</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", marginBottom: 14 }}>{top.entryDoor}</p>
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

        <Card style={{ border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>This is the general version.</h3>
            <p style={{ ...S.p, maxWidth: 470, margin: "0 auto 18px" }}>
              Everything above is what we'd tell any SLP who scored like you. Your{" "}
              <strong>Pivot Report</strong> is built from your actual resume — what
              you specifically already qualify for, and what to do about it.
            </p>
          </div>

          <div style={{ maxWidth: 470, margin: "0 auto 20px", textAlign: "left" }}>
            {[
              "Your 3 best-fit roles, chosen from your real experience — not a quiz score",
              "Which of your clinical work already reads as qualified, in their words",
              "Your readiness profile and the stage you're actually in",
              "A week-by-week 30-day plan sized for someone working full-time",
              "3 LinkedIn outreach scripts written in your voice, ready to send",
              "The honest caveats — timelines and tradeoffs for your situation",
            ].map((line) => (
              <div key={line} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9, fontSize: 14, lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          {buyError && (
            <div style={{ fontSize: 13, color: "var(--warn)", textAlign: "center", marginBottom: 10 }}>
              {buyError}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <button
              style={{ ...S.btn, padding: "15px 44px", fontSize: 17, opacity: buying ? 0.6 : 1 }}
              disabled={buying}
              onClick={() => buyReport(top)}
            >
              {buying ? "Opening checkout…" : "Get my Pivot Report — $9 →"}
            </button>
            <p style={{ fontSize: 12, color: "var(--light)", marginTop: 10, lineHeight: 1.6 }}>
              One-time payment, no subscription ever. 30-day refund if it doesn't help.
              <br />
              You'll add your resume right after checkout — no need to find it now.
            </p>
          </div>

          {/* The $24 suite rewrites an application against ONE posting, so it only
              helps someone who already has that posting in hand — which most quiz
              takers don't. Offering it as an equal button would dead-end them at
              the job-posting step. Kept as a labelled second door instead: it
              routes the minority who are further along, and the larger number
              sitting next to $9 does the anchoring either way. */}
          <div
            style={{
              borderTop: "1px solid var(--line, #E5E7EB)",
              marginTop: 22,
              paddingTop: 16,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 10px" }}>
              <strong style={{ color: "var(--fg, inherit)" }}>
                Already staring at a specific job posting?
              </strong>
              <br />
              The <strong>$24 Career Pivot Suite</strong> rewrites the whole
              application around it — every resume bullet, a cover letter in your
              voice, your LinkedIn, and the interview answers.
            </p>
            <a
              href={`/?from=quiz&path=${encodeURIComponent(top.roleOption)}`}
              style={{ ...S.btnOut, fontSize: 14, display: "inline-block", textDecoration: "none" }}
            >
              See the $24 Suite →
            </a>
          </div>
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
      {showIntro && idx === 0 && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ ...S.h1, fontSize: 30 }}>Which direction actually fits you?</h1>
          <p style={{ ...S.p, maxWidth: 520, margin: "0 auto" }}>
            Eight questions, about two minutes. Built from documented SLP transitions — so you'll get real
            salary ranges, real timelines, and the honest catch for whichever path comes up.
          </p>
        </div>
      )}
      <ProgressBar step={idx + 1} total={QUESTIONS.length} />
      <div style={{ ...S.tag, marginTop: 6, marginBottom: 2 }}>{q.section}</div>
      <h2 style={{ ...S.h2, fontSize: 25, marginBottom: q.help ? 8 : 20, marginTop: 8 }}>{q.prompt}</h2>
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
