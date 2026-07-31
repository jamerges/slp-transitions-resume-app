"use client";

import { useEffect, useRef, useState } from "react";
import { S, Card } from "@/components/ui";
import ReportResults from "@/components/ReportResults";

type FetchState =
  | { status: "loading"; message: string }
  | { status: "ready"; data: any }
  | { status: "error"; reason: string };

const LOADING_MSGS = [
  "Payment confirmed. Reading your story...",
  "Mapping your experience to realistic paths...",
  "Building your 30-day starter plan...",
  "Still working — a thorough report takes a little longer. Hang tight...",
];

export default function ReportFlow({ sessionId }: { sessionId?: string }) {
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
      try {
        const resp = await fetch("/api/report-finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await resp.json();
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
      } catch {
        setState({
          status: "error",
          reason:
            "Something went wrong displaying your report. Refresh this page to retry — your payment is confirmed.",
        });
      }
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
        <h2 style={{ ...S.h2, marginBottom: 12 }}>Building your Pivot Report…</h2>
        <p style={{ ...S.p, maxWidth: 440, margin: "0 auto" }}>{state.message}</p>
        <p style={{ fontSize: 12, color: "var(--light)", marginTop: 16 }}>
          Usually 30–60 seconds. Please don't close this window.
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
