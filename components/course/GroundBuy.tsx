"use client";
import { useState } from "react";
import { PageShell, S, Card } from "@/components/ui";
import { track } from "@/lib/analytics";
import ProductMenu from "@/components/ProductMenu";
import { GROUND_NAME, GROUND_SUB, GROUND_PRICE } from "@/lib/course-tiers";

const LESSONS = [
  ["You're allowed to want out", "Which of the five reasons people stay is the one keeping you here."],
  ["Bad workplace, bad fit, or bad season?", "Only one of the three means leaving the field. Find out which one you have."],
  ["Why leaving isn't a wasted degree", "What the years and the debt are actually worth to you now."],
  ["What actually gave you energy", "The parts of the job you would keep, and the parts you would never do again."],
  ["What you can't afford to lose", "Your pay floor, and how far from clinical work you are willing to go."],
  ["What you keep when you leave", "The skills that come with you, named so you can say them out loud."],
  ["Tell one person", "Say it out loud to one person, and plan exactly what you will say."],
  ["Your why, in writing", "One sentence about where you are going, written down."],
];

/** The thing being bought, drawn rather than photographed: the eight lessons,
 *  the verdict they produce, and the workbook page beside them. Decorative. */
function ProductShot() {
  const sheet = (i: number): React.CSSProperties => ({
    width: 38, height: 30, borderRadius: 5, flexShrink: 0,
    background: i === 7 ? "var(--accent)" : "var(--card)",
    border: `1px solid ${i === 7 ? "var(--accent)" : "var(--border)"}`,
  });
  const line = (w: string | number, dark?: boolean): React.CSSProperties => ({ width: w, height: 5, borderRadius: 3, background: dark ? "var(--muted)" : "var(--border)" });
  return (
    <div aria-hidden style={{ background: "linear-gradient(160deg, var(--accent-bg-subtle) 0%, var(--card) 100%)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, marginBottom: 18, display: "flex", gap: 16, alignItems: "stretch" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Eight lessons</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} style={sheet(i)} />)}</div>
        <div style={{ background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 8, padding: "9px 11px" }}>
          <div style={{ ...line(64, true), marginBottom: 6 }} />
          <div style={{ ...line("100%"), marginBottom: 4 }} />
          <div style={line("58%")} />
        </div>
      </div>
      <div style={{ width: 92, flexShrink: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Workbook</div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 6, padding: 9, height: 118, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={line("70%", true)} />
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={line("100%")} />)}
        </div>
      </div>
    </div>
  );
}

export default function GroundBuy({ stage, path, canceled, badLink, alreadyHas, live }: { stage: string; path: string; canceled: boolean; badLink: boolean; alreadyHas: boolean; live: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [waited, setWaited] = useState(false);

  const waitlist = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    track("generate_lead", { placement: "ground_waitlist", stage: stage || "none" });
    try {
      const r = await fetch("/api/ground-waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save that.");
      setWaited(true);
    } catch (e: any) { setErr(e?.message || "Could not save that."); } finally { setBusy(false); }
  };
  const buy = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    track("begin_checkout", { currency: "USD", value: GROUND_PRICE, items: [{ item_id: "ground", item_name: GROUND_NAME, price: GROUND_PRICE, quantity: 1 }], placement: "ground_page", stage: stage || "none" });
    try {
      const r = await fetch("/api/ground-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, stage, path }) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Checkout failed");
      window.location.href = d.url;
    } catch (e: any) { setErr(e?.message || "Couldn't open checkout. Please try again."); setBusy(false); }
  };

  return (
    <PageShell>
      <div style={{ ...S.wrap, maxWidth: 620 }}>
        {badLink && <Card style={{ background: "var(--warn-bg)" }}><div style={{ fontSize: 14 }}>That access link didn&rsquo;t verify. Open the link from your access email again, or reply to it and I&rsquo;ll resend.</div></Card>}
        {canceled && <Card><div style={{ fontSize: 14, color: "var(--muted)" }}>Checkout closed. Nothing was charged.</div></Card>}
        {alreadyHas && <Card style={{ background: "var(--accent-bg-subtle)" }}><div style={{ fontSize: 14 }}><a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>Pick up where you left off →</a></div></Card>}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={S.tag}>Transition OS · Module 1</span>
          <h1 style={{ ...S.h1, fontSize: 38, margin: "12px 0 8px", lineHeight: 1.15 }}>{GROUND_NAME}</h1>
          <p style={{ ...S.p, fontSize: 17, maxWidth: 500, margin: "0 auto 22px" }}>{GROUND_SUB}</p>
        </div>

        <Card highlight>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            This is the deciding part, before the r&eacute;sum&eacute;s and the applications: whether it is the workplace, the fit or
            the season, what your degree is worth to you now, which parts of the job you would keep, and what you can&rsquo;t
            afford to lose. Leave with written clarity and set your &ldquo;why&rdquo; to ground you in your transition.
          </p>
        </Card>

        <Card>
          <ProductShot />
          <h3 style={{ ...S.h3, marginBottom: 4 }}>What ${GROUND_PRICE} buys</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 14px" }}>Eight lessons, about fifty minutes, and the workbook.</p>
          {LESSONS.map(([t, d], i) => (
            <div key={t} style={{ display: "flex", gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div><div style={{ fontSize: 15, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>{d}</div></div>
            </div>
          ))}
          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", margin: "18px 0 0" }}>
            Ready to find clarity?
          </p>
        </Card>

        <Card style={{ border: "1.5px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>${GROUND_PRICE}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>once, no subscription</div></div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 300, lineHeight: 1.55 }}>Comes off the full program when it launches, so you never pay for this twice. 30-day refund by replying to one email.</div>
          </div>
          {live ? (
            <>
              <div style={{ marginTop: 16 }}>
                <label style={S.label}>Email for your access link <span style={{ color: "var(--muted)", fontWeight: 400 }}>(you can also enter it at checkout)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={S.input} />
              </div>
              {err && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 10 }}>{err}</div>}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={buy} disabled={busy} style={{ ...S.btn, padding: "15px 40px", fontSize: 17, opacity: busy ? 0.7 : 1 }}>{busy ? "Opening checkout…" : `Start Module 1 — $${GROUND_PRICE} →`}</button>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>Your link arrives by email, and the lessons open here straight away. Your answers save in this browser.</p>
              </div>
            </>
          ) : waited ? (
            <div style={{ marginTop: 16, fontSize: 14.5, color: "var(--accent)", fontWeight: 600 }}>✓ You&rsquo;ll get the link the day it opens. Module 0 is free and open now.</div>
          ) : (
            <>
              <div style={{ marginTop: 16 }}>
                <label style={S.label}>This opens in a few days. Leave your email and you&rsquo;ll get the link the day it does.</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={S.input} onKeyDown={(e) => { if (e.key === "Enter") waitlist(); }} />
              </div>
              {err && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 10 }}>{err}</div>}
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button onClick={waitlist} disabled={busy} style={{ ...S.btn, padding: "13px 32px", fontSize: 15.5, opacity: busy ? 0.7 : 1 }}>{busy ? "Saving…" : "Tell me when it opens →"}</button>
              </div>
            </>
          )}
        </Card>

        <Card>
          <ProductMenu
            order={["report", "suite"]}
            heading="Not the one you need?"
            onPick={(k) => track("select_item", { item_list_id: "ground_page", item_list_name: "Ground page menu", items: [{ item_id: k, quantity: 1 }], placement: "ground_menu" })}
            hrefFor={(k) => (k === "report" ? "/quiz" : k === "suite" ? "/" : undefined)}
          />
        </Card>

      </div>
    </PageShell>
  );
}
