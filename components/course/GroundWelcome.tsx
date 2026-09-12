"use client";
import { useEffect, useState } from "react";
import { PageShell, S, Card } from "@/components/ui";

/** After Stripe. Finalize issues access, sets the cookie on this browser, and
 *  emails the link for every other one. Then straight into the quest log. */
export default function GroundWelcome({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (!sessionId) { setState("error"); setMsg("No purchase found in this link."); return; }
    (async () => {
      try {
        const r = await fetch("/api/ground-finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not finish your purchase");
        setEmail(d.email || "");
        setState("done");
        setTimeout(() => { window.location.href = "/course?unlocked=1"; }, 1600);
      } catch (e: any) { setState("error"); setMsg(e?.message || "Something went wrong."); }
    })();
  }, [sessionId]);
  return (
    <PageShell>
      <div style={{ ...S.wrap, maxWidth: 560, textAlign: "center", paddingTop: 30 }}>
        <Card>
          {state === "working" && (<><h1 style={{ ...S.h2, marginBottom: 8 }}>Payment received.</h1><p style={S.p}>Setting up your access…</p></>)}
          {state === "done" && (<>
            <h1 style={{ ...S.h2, marginBottom: 8 }}>You&rsquo;re in.</h1>
            <p style={S.p}>Module 1 is open in this browser now{email ? `, and the access link is on its way to ${email}` : ""}. That link is your login on any other device, so keep the email.</p>
            <a href="/course?unlocked=1" style={{ ...S.btn, display: "inline-block", textDecoration: "none" }}>Open the quest log →</a>
          </>)}
          {state === "error" && (<>
            <h1 style={{ ...S.h2, marginBottom: 8 }}>One second.</h1>
            <p style={S.p}>{msg}</p>
            <p style={{ ...S.p, fontSize: 13 }}>If you paid and this keeps happening, forward your Stripe receipt to james@slptransitions.com and I&rsquo;ll send the link by hand.</p>
          </>)}
        </Card>
      </div>
    </PageShell>
  );
}
