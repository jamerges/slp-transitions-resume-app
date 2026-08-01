"use client";

import { useEffect, useRef, useState } from "react";
import { S, Card } from "@/components/ui";
import ReportResults from "@/components/ReportResults";
import { STAGE_OPTIONS } from "@/lib/companies";

type FetchState =
  | { status: "loading"; message: string }
  | { status: "intake"; email: string; targetRole: string }
  | { status: "ready"; data: any }
  | { status: "error"; reason: string };

const LOADING_MSGS = [
  "Payment confirmed. Reading your story...",
  "Mapping your experience to realistic paths...",
  "Building your 30-day starter plan...",
  "Still working — a thorough report takes a little longer. Hang tight...",
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
  const [submitting, setSubmitting] = useState(false);

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
        "Something went wrong generating your report. Refresh this page to retry — your payment is confirmed.",
    });
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!sessionId) {
      setState({
        status: "error",
        reason:
          "Missing session_id. If you completed payment, please email hello@slptransitions.com with your receipt.",
      });
      return;
    }

    finalize().catch(() =>
      setState({
        status: "error",
        reason:
          "Something went wrong displaying your report. Refresh this page to retry — your payment is confirmed.",
      })
    );
  }, [sessionId]);

  async function handleFile(file: File) {
    setParsing(true);
    setIntakeError("");
    const { text, error } = await parseFile(file);
    setParsing(false);
    if (error) {
      setIntakeError(error);
      return;
    }
    setFileName(file.name);
    setResumeText(text);
  }

  async function submitIntake() {
    if (resumeText.trim().length < 50 || !stage || submitting) return;
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
        setIntakeError(data.error || "Could not save your resume. Please try again.");
        setSubmitting(false);
        return;
      }
      setState({ status: "loading", message: LOADING_MSGS[0] });
      await finalize();
    } catch {
      setIntakeError("Could not save your resume. Please try again.");
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
    const ready = resumeText.trim().length >= 50 && !!stage;
    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={S.tag}>✓ Payment confirmed</span>
          <h1 style={{ ...S.h1, fontSize: 28, marginTop: 12 }}>
            You're in. Now let's make it yours.
          </h1>
          <p style={{ ...S.p, maxWidth: 480, margin: "8px auto 0" }}>
            Add your resume and answer one question — that's what turns this from a
            general guide into a report about <em>your</em> experience.
            {state.targetRole ? ` We'll build it around ${state.targetRole}.` : ""}
          </p>
        </div>

        {/* No resume handy right now? The purchase is already safe — say so
            plainly so nobody feels trapped on a phone without their file. */}
        <Card style={{ background: "var(--accent-bg-subtle)", borderColor: "var(--accent)" }}>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <strong>Don't have your resume handy?</strong> No rush — your purchase is
            saved for 7 days. Bookmark this page or find the link in your receipt
            email{state.email ? ` (sent to ${state.email})` : ""}, and come back from
            your computer whenever it's convenient.
          </div>
        </Card>

        {intakeError && (
          <Card style={{ background: "var(--warn-bg)", borderColor: "var(--warn)" }}>
            <div style={{ fontSize: 14 }}>{intakeError}</div>
          </Card>
        )}

        <div style={{ marginTop: 20, marginBottom: 22 }}>
          <label style={{ ...S.label, fontSize: 15 }}>Your resume</label>
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
                ? `✓ ${fileName} — click to replace`
                : "Upload a PDF, Word doc, or text file"}
          </label>
          <div style={{ fontSize: 12, color: "var(--light)", marginBottom: 6 }}>
            Or paste the text directly:
          </div>
          <textarea
            style={{ ...S.textarea, minHeight: 140 }}
            placeholder="Paste your resume here…"
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setFileName("");
            }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ ...S.label, fontSize: 15 }}>Where are you in this so far?</label>
          {STAGE_OPTIONS.map((s) => {
            const sel = stage === s.label;
            return (
              <div
                key={s.id}
                onClick={() => setStage(s.label)}
                style={{
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
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>
            Why are you transitioning?{" "}
            <span style={{ fontWeight: 400, color: "var(--light)" }}>(optional)</span>
          </label>
          <textarea
            style={{ ...S.textarea, minHeight: 60 }}
            placeholder="Be honest — this never appears anywhere, it just shapes the advice."
            value={whyLeaving}
            onChange={(e) => setWhyLeaving(e.target.value)}
          />
        </div>

        <button
          style={{ ...S.btn, width: "100%", padding: "15px", fontSize: 16, opacity: ready && !submitting ? 1 : 0.5 }}
          disabled={!ready || submitting}
          onClick={submitIntake}
        >
          {submitting ? "Building…" : "Build my Pivot Report →"}
        </button>
        <p style={{ fontSize: 12, color: "var(--light)", textAlign: "center", marginTop: 8, marginBottom: 32 }}>
          Takes 30–60 seconds. We'll also email you a copy.
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
