"use client";

import { useEffect, useRef, useState } from "react";
import { S, Card } from "@/components/ui";
import ReportResults from "@/components/ReportResults";
import { STAGE_OPTIONS } from "@/lib/companies";
import { SUPPORT_EMAIL } from "@/lib/contact";

type FetchState =
  | { status: "loading"; message: string }
  | { status: "intake"; email: string; targetRole: string }
  | { status: "ready"; data: any }
  | { status: "error"; reason: string };

const LOADING_MSGS = [
  "Payment confirmed. Reading your story...",
  "Mapping your experience to realistic paths...",
  "Building your 30-day starter plan...",
  "Still working. A thorough report takes a little longer, so hang tight...",
];

async function parseFile(file: File): Promise<{ text: string; error?: string }> {
  const form = new FormData();
  form.append("file", file);
  try {
    const resp = await fetch("/api/parse-resume", { method: "POST", body: form });
    const data = await resp.json();
    if (!resp.ok) return { text: "", error: data.error || "Could not read that file." };
    return { text: data.text || "" };
  } catch {
    return { text: "", error: "Could not read that file. Try pasting the text instead." };
  }
}

export default function ReportFlow({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<FetchState>({
    status: "loading",
    message: LOADING_MSGS[0],
  });
  const startedRef = useRef(false);

  // Intake form state (quiz buyers, who pay before uploading anything).
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [stage, setStage] = useState("");
  const [whyLeaving, setWhyLeaving] = useState("");
  const [intakeError, setIntakeError] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // True when the stage came pre-picked from the buyer's quiz answer.
  const [stageFromQuiz, setStageFromQuiz] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setState((s) =>
        s.status === "loading"
          ? {
              status: "loading",
              message:
                LOADING_MSGS[
                  Math.min(LOADING_MSGS.indexOf(s.message) + 1, LOADING_MSGS.length - 1)
                ],
            }
          : s
      );
    }, 6000);
    return () => clearInterval(i);
  }, []);

  async function finalize() {
    const resp = await fetch("/api/report-finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await resp.json();
    if (resp.ok && data.needsIntake) {
      const known = STAGE_OPTIONS.find((o) => o.label === data.transitionStage);
      if (known) {
        setStage((cur) => cur || known.label);
        setStageFromQuiz(true);
      }
      setState({ status: "intake", email: data.email || "", targetRole: data.targetRole || "" });
      return;
    }
    if (resp.ok && data.report) {
      setState({ status: "ready", data });
      return;
    }
    setState({
      status: "error",
      reason:
        data?.error ||
        "Something went wrong generating your report. Your payment is confirmed, so refresh this page to try again.",
    });
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!sessionId) {
      setState({
        status: "error",
        reason:
          `Missing session_id. If you completed payment, please email ${SUPPORT_EMAIL} with your receipt.`,
      });
      return;
    }

    finalize().catch(() =>
      setState({
        status: "error",
        reason:
          "Something went wrong displaying your report. Your payment is confirmed, so refresh this page to try again.",
      })
    );
  }, [sessionId]);

  async function handleFile(file: File) {
    setParsing(true);
    setFileError("");
    const { text, error } = await parseFile(file);
    setParsing(false);
    if (error) {
      setFileError(error);
      return;
    }
    setFileName(file.name);
    setResumeText(text);
  }

  async function submitIntake() {
    if (submitting) return;
    const missing = [
      resumeText.trim().length < 50 ? "your résumé or LinkedIn text" : "",
      !stage ? "where you are so far" : "",
    ].filter(Boolean);
    if (missing.length) {
      setIntakeError(`Add ${missing.join(" and ")}, then build it.`);
      return;
    }
    setSubmitting(true);
    setIntakeError("");
    try {
      const resp = await fetch("/api/report-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, resumeText, transitionStage: stage, whyLeaving }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setIntakeError(data.error || "Could not save your résumé. Please try again.");
        setSubmitting(false);
        return;
      }
      setState({ status: "loading", message: LOADING_MSGS[0] });
      await finalize();
    } catch {
      setIntakeError("Could not save your résumé. Please try again.");
    }
    setSubmitting(false);
  }

  if (state.status === "loading") {
    return (
      <div style={{ ...S.wrap, textAlign: "center", padding: "80px 0" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            margin: "0 auto 24px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ ...S.h2, marginBottom: 12 }}>Building your Pivot Report…</h2>
        <p style={{ ...S.p, maxWidth: 440, margin: "0 auto" }}>{state.message}</p>
        <p style={{ fontSize: 12, color: "var(--light)", marginTop: 16 }}>
          Usually 30–60 seconds. Please don't close this window.
        </p>
      </div>
    );
  }

  if (state.status === "intake") {
    const tooShort = resumeText.trim().length > 0 && resumeText.trim().length < 50;
    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={S.tag}>✓ Payment confirmed</span>
          <h1 style={{ ...S.h1, fontSize: 28, marginTop: 12 }}>
            You&rsquo;re in. Now let&rsquo;s make it yours.
          </h1>
          <p style={{ ...S.p, maxWidth: 480, margin: "8px auto 0" }}>
            Add your résumé and the report reads your actual experience rather than a quiz score.
            {state.targetRole ? ` We'll build it around ${state.targetRole}.` : ""}
          </p>
        </div>

        {/* Six of the first eight buyers stalled right here, most of them on a
            phone with no résumé file. The LinkedIn Experience section is on
            every phone and is enough to build from, so offer that first and
            the emailed link second. */}
        <Card style={{ background: "var(--accent-bg-subtle)", borderColor: "var(--accent)" }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.65 }}>
            <strong>On your phone, with no résumé file?</strong>{" "}Open your LinkedIn profile, copy the
            Experience section and paste it below. That&rsquo;s enough to build it now.
            <div style={{ marginTop: 6, color: "var(--muted)" }}>
              Rather do it from a computer? We emailed you this page{state.email ? ` at ${state.email}` : ""}, and the link works for 7 days.
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 20, marginBottom: 22 }}>
          <label htmlFor="intake-resume" style={{ ...S.label, fontSize: 15, marginBottom: 2 }}>Your résumé</label>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
            A file, or the text of your résumé or LinkedIn Experience section.
          </div>
          <label
            style={{
              display: "block",
              border: "1.5px dashed var(--border)",
              borderRadius: 8,
              padding: "18px 14px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 10,
              background: "var(--card)",
              fontSize: 14,
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {parsing
              ? "Reading your file…"
              : fileName
                ? `✓ ${fileName} · choose another`
                : "Upload a PDF or Word file"}
          </label>
          {fileError && (
            <div role="alert" style={{ fontSize: 12.5, color: "var(--err)", marginBottom: 8 }}>{fileError}</div>
          )}
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>
            Or paste the text:
          </div>
          <textarea
            id="intake-resume"
            style={{ ...S.textarea, minHeight: 140 }}
            placeholder="Paste here. No file? A few sentences about your last job work too: where you worked, what you did and anything you ran or built."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setFileName("");
              if (intakeError) setIntakeError("");
            }}
          />
          {tooShort && (
            <div style={{ fontSize: 12.5, color: "var(--warn)", marginTop: 6 }}>
              Add a little more: a few sentences about where you worked and what you did.
            </div>
          )}
        </div>

        <div role="radiogroup" aria-labelledby="intake-stage-label" style={{ marginBottom: 22 }}>
          <div id="intake-stage-label" style={{ ...S.label, fontSize: 15, marginBottom: stageFromQuiz ? 2 : 6 }}>Where are you in this so far?</div>
          {stageFromQuiz && (
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
              Picked from your quiz answer. Change it if it&rsquo;s off.
            </div>
          )}
          {STAGE_OPTIONS.map((s) => {
            const sel = stage === s.label;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={sel}
                key={s.id}
                onClick={() => { setStage(s.label); if (intakeError) setIntakeError(""); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                  padding: "12px 14px",
                  border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                  background: sel ? "var(--accent-bg-subtle)" : "var(--card)",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: sel ? "var(--accent)" : "var(--text)",
                  fontWeight: sel ? 600 : 400,
                }}
              >
                {sel && "✓ "}
                {s.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="intake-why" style={S.label}>
            Why are you transitioning?{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
          </label>
          <textarea
            id="intake-why"
            style={{ ...S.textarea, minHeight: 60 }}
            placeholder="Be honest. It never appears in the report and only shapes the advice."
            value={whyLeaving}
            onChange={(e) => setWhyLeaving(e.target.value)}
          />
        </div>

        {intakeError && (
          <div role="alert" style={{ fontSize: 14, color: "var(--err)", marginBottom: 10, textAlign: "center" }}>
            {intakeError}
          </div>
        )}
        <button
          style={{ ...S.btn, width: "100%", padding: "15px", fontSize: 16, opacity: submitting ? 0.6 : 1 }}
          disabled={submitting}
          onClick={submitIntake}
        >
          {submitting ? "Building…" : "Build my Pivot Report →"}
        </button>
        <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center", marginTop: 8, marginBottom: 32 }}>
          Takes 30–60 seconds. We&rsquo;ll also email you a copy.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={S.wrap}>
        <Card>
          <h2 style={{ ...S.h2, marginBottom: 8 }}>Hmm, something's off</h2>
          <p style={{ ...S.p }}>{state.reason}</p>
        </Card>
      </div>
    );
  }

  return (
    <ReportResults
      report={state.data.report}
      email={state.data.email}
      emailSent={state.data.emailSent}
      sessionId={sessionId}
    />
  );
}
