"use client";

import { useEffect, useRef, useState } from "react";
import { S, Card } from "@/components/ui";
import FullResults from "@/components/FullResults";

type FetchState =
  | { status: "loading"; message: string }
  | { status: "ready"; data: any }
  | { status: "fallback"; email?: string; reason: string }
  | { status: "error"; reason: string };

const LOADING_MSGS = [
  "Payment confirmed. Generating your full package...",
  "Rewriting every bullet for hiring managers...",
  "Drafting your cover letter and interview prep...",
  "Building your gap analysis and LinkedIn headline...",
  "Still working — thorough results take a little longer. Hang tight...",
];

export default function SuccessFlow({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<FetchState>({
    status: "loading",
    message: LOADING_MSGS[0],
  });
  const startedRef = useRef(false);

  useEffect(() => {
    const i = setInterval(() => {
      setState((s) =>
        s.status === "loading"
          ? {
              status: "loading",
              // Advance through the messages, then hold on the final honest
              // "still working" line — never loop back or claim near-completion.
              message:
                LOADING_MSGS[
                  Math.min(
                    LOADING_MSGS.indexOf(s.message) + 1,
                    LOADING_MSGS.length - 1
                  )
                ],
            }
          : s
      );
    }, 6000);
    return () => clearInterval(i);
  }, []);

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

    (async () => {
      // Generation is long (~2 min); a gateway hiccup shouldn't strand a paying
      // customer, so retry twice before falling back. finalize caches the result
      // in Redis, so retries are cheap once generation has completed server-side.
      const attempt = () =>
        fetch("/api/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      let lastError = "";
      for (let i = 0; i < 3; i++) {
        try {
          const resp = await attempt();
          const data = await resp.json().catch(() => ({}));
          if (resp.ok && data.results) {
            setState({ status: "ready", data });
            return;
          }
          lastError = data?.error || `Server responded ${resp.status}`;
          // 402/410 are terminal (unpaid / expired inputs) — don't retry those.
          if (resp.status === 402 || resp.status === 410) break;
        } catch {
          lastError = "Network interruption while generating.";
        }
        if (i < 2) await new Promise((r) => setTimeout(r, 4000));
      }
      setState({
        status: "fallback",
        reason:
          lastError ||
          "We're still working on your full results. Refresh this page in a minute — your payment is confirmed and nothing is lost.",
      });
    })();
  }, [sessionId]);

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
        <h2 style={{ ...S.h2, marginBottom: 12 }}>Building your full results…</h2>
        <p style={{ ...S.p, maxWidth: 440, margin: "0 auto" }}>{state.message}</p>
        <p style={{ fontSize: 12, color: "var(--light)", marginTop: 16 }}>
          This usually takes 30–60 seconds. Please don't close this window.
        </p>
      </div>
    );
  }

  if (state.status === "fallback") {
    return (
      <div style={S.wrap}>
        <Card highlight>
          <h2 style={{ ...S.h2, marginBottom: 8 }}>✅ Payment confirmed — one more step</h2>
          <p style={{ ...S.p, marginBottom: 14 }}>
            Generation took longer than expected. Your purchase and inputs are saved —
            hit the button below and it will pick up where it left off.
          </p>
          <button
            style={{ ...S.btn, padding: "13px 32px", fontSize: 15, marginBottom: 14 }}
            onClick={() => window.location.reload()}
          >
            Retry now →
          </button>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 0 }}>
            Still stuck after a couple of tries? Email{" "}
            <a
              href="mailto:hello@slptransitions.com"
              style={{ color: "var(--accent)" }}
            >
              hello@slptransitions.com
            </a>{" "}
            with your Stripe receipt and we'll generate it manually{state.email ? ` and send it to ${state.email}` : ""}.
          </p>
        </Card>
        <details style={{ marginTop: 12, fontSize: 12, color: "var(--light)" }}>
          <summary style={{ cursor: "pointer" }}>Technical details</summary>
          <div style={{ marginTop: 6 }}>{state.reason}</div>
        </details>
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

  // status === "ready"
  const { results, inputs } = state.data;
  return (
    <FullResults
      full={results}
      jobTitle={inputs.jobTitle}
      goals={inputs.goals}
      writingSample={inputs.writingSample}
      sessionId={sessionId}
      onTranslateAnother={() => {
        // Carry their resume forward so a second role costs them one paste, not a full re-entry.
        window.location.href = sessionId ? `/?continue=${encodeURIComponent(sessionId)}` : "/";
      }}
    />
  );
}
