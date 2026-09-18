"use client";
import { useState } from "react";
import { PageShell, S, Card } from "@/components/ui";
import { track } from "@/lib/analytics";
import ProductMenu from "@/components/ProductMenu";
import { GROUND_NAME, GROUND_SUB, GROUND_PRICE } from "@/lib/course-tiers";
import { STAGE_MAP, STAGE_ORDER } from "@/lib/stage-map";
import type { StageKey } from "@/lib/quiz";

const LESSONS = [
  ["You're allowed to want out", "Which of the five reasons people stay is the one keeping you here."],
  ["Why leaving isn't a wasted degree", "Your years in, your debt and your salary, run against the path you're weighing, so the tuition stops making the decision."],
  ["What actually gave you energy", "The parts of the job you would keep, and the parts you would never do again."],
  ["What you can't afford to lose", "Four dials, set where you are this month, and the three paths that come out of them."],
  ["What you keep when you leave", "The skills that come with you, named so you can say them out loud."],
  ["Tell one person", "Say it out loud to one person, and plan exactly what you will say."],
  ["Your why, in writing", "One sentence about where you are going, written down."],
];

/** A real page of the workbook, not a drawing of one. */
function WorkbookPage() {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
      <img
        src="/course/workbook-page.png"
        width={174}
        height={225}
        alt="A page of the workbook titled Why leaving isn't a wasted degree, with three prompts and lines to write on"
        style={{ width: 174, height: "auto", flexShrink: 0, border: "1px solid var(--border)", borderRadius: 4, boxShadow: "0 2px 10px rgba(27,27,30,0.08)" }}
      />
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>The workbook</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
          One page of it. You get the blank copy to print, and when you finish Module 1, your answers arrive by email with a filled-in copy to print too.
        </p>
      </div>
    </div>
  );
}

export default function GroundBuy({ stage, path, canceled, badLink, alreadyHas, live }: { stage: string; path: string; canceled: boolean; badLink: boolean; alreadyHas: boolean; live: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [waited, setWaited] = useState(false);
  // The quiz passes a stage in the URL. A cold visitor picks one below instead.
  const urlStage = stage && stage in STAGE_MAP ? (stage as StageKey) : null;
  const [picked, setPicked] = useState<StageKey | null>(null);
  const stageInfo = urlStage ? STAGE_MAP[urlStage] : picked ? STAGE_MAP[picked] : null;

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
          <p style={{ ...S.p, fontSize: 17, maxWidth: 500, margin: "0 auto 10px", color: "var(--text)" }}>{GROUND_SUB}</p>
          <p style={{ ...S.p, fontSize: 15, maxWidth: 460, margin: "0 auto 20px" }}>
            Seven short lessons you read and answer, about forty minutes, no r&eacute;sum&eacute; needed. You finish with your reasons in writing and your answers in your inbox.
          </p>
          {!alreadyHas && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/course" onClick={() => track("select_content", { content_type: "ground_free_start", stage: stage || "none" })} style={{ ...S.btn, display: "inline-block", textDecoration: "none", padding: "14px 30px", fontSize: 16 }}>Start free &rarr;</a>
                <a href="#buy" style={{ ...S.btnOut, display: "inline-block", textDecoration: "none", padding: "13px 24px", fontSize: 15 }}>
                  {live ? `Get Module 1 · $${GROUND_PRICE} →` : "Tell me when it opens →"}
                </a>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
                {live ? `Module 0 is free and needs no account. Module 1 is $${GROUND_PRICE} once, credited toward the full program later. 30-day refund.` : "Module 0 is free now. Module 1 opens in a few days."}
              </p>
            </div>
          )}
        </div>

        {!urlStage && (
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Sound familiar?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STAGE_ORDER.map((k) => {
                const on = picked === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { setPicked(k); track("select_content", { content_type: "ground_stage", stage: k }); }}
                    style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.35, textAlign: "left", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg-subtle)" : "var(--card)", color: on ? "var(--accent)" : "var(--text)", fontWeight: on ? 600 : 500 }}
                  >
                    &ldquo;{STAGE_MAP[k].belief}&rdquo;
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {stageInfo && (
          <Card style={{ background: "var(--accent-bg-subtle)", borderColor: "var(--accent-bg)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
              Where you said you are &middot; stage {stageInfo.n}, {stageInfo.name}
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>&ldquo;{stageInfo.belief}&rdquo;</p>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>Lesson 1 is the five stages and what keeps people at each one. The rest of Module 1 is built for this one.</p>
          </Card>
        )}

        <Card highlight>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            This is the deciding part, before the r&eacute;sum&eacute;s and the applications: whether it is the workplace, the fit or
            the season, what your degree is worth to you now, which parts of the job you would keep, and what you can&rsquo;t
            afford to lose. Leave with written clarity and set your &ldquo;why&rdquo; to ground you in your transition.
          </p>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 4 }}>Start with Module 0, free</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 12px" }}>
            Twenty minutes, no account, nothing to buy. Do it first. If it doesn&rsquo;t help you, don&rsquo;t buy Module 1.
          </p>
          <a href="/course" onClick={() => track("select_content", { content_type: "ground_free_module", stage: stage || "none" })} style={{ fontSize: 14.5, fontWeight: 600, color: "var(--accent)" }}>Start Module 0, free &rarr;</a>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "16px 0 0", paddingTop: 12, borderTop: "1px solid var(--border)", lineHeight: 1.6 }}>
            Written by James Berges, a former SLP who now works in marketing at a health-tech company.
          </p>
        </Card>

        <Card>
          <WorkbookPage />
          <h3 style={{ ...S.h3, marginBottom: 4 }}>What ${GROUND_PRICE} buys</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 14px" }}>Seven lessons, about forty minutes, and the workbook.</p>
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

        <div id="buy" />
        <Card style={{ border: "1.5px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>${GROUND_PRICE}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>once, no subscription</div></div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 300, lineHeight: 1.55 }}>Credited in full toward the full program when it launches, so you never pay for this twice. 30-day refund by replying to one email.</div>
          </div>
          {live ? (
            <>
              <div style={{ marginTop: 16 }}>
                <label style={S.label}>Email for your access link <span style={{ color: "var(--muted)", fontWeight: 400 }}>(you can also enter it at checkout)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={S.input} />
              </div>
              {err && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 10 }}>{err}</div>}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={buy} disabled={busy} style={{ ...S.btn, padding: "14px 30px", fontSize: 16, opacity: busy ? 0.7 : 1 }}>{busy ? "Opening checkout…" : `Get Module 1 · $${GROUND_PRICE} →`}</button>
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
