"use client";
import { useState } from "react";
import { PageShell, S, Card } from "@/components/ui";
import { track } from "@/lib/analytics";
import ProductMenu from "@/components/ProductMenu";
import { GROUND_NAME, GROUND_SUB, GROUND_PRICE, GROUND_LIST_PRICE, KIT } from "@/lib/course-tiers";
import { SALE } from "@/lib/pricing";
import { STAGE_MAP, STAGE_ORDER } from "@/lib/stage-map";
import type { StageKey } from "@/lib/quiz";

/** The eight stops, with the ones this kit opens filled. Free is Module 0; the kit is 1 and parts of 3 and 4. */
const STOPS: { n: number; label: string; state: "free" | "kit" | "part" | "later" }[] = [
  { n: 0, label: "Start", state: "free" },
  { n: 1, label: "Ground", state: "kit" },
  { n: 2, label: "Explore", state: "later" },
  { n: 3, label: "Connect", state: "part" },
  { n: 4, label: "Translate", state: "part" },
  { n: 5, label: "Test", state: "later" },
  { n: 6, label: "Leap", state: "later" },
  { n: 7, label: "After", state: "later" },
];
function KitMap() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, margin: "14px 0 6px" }}>
      {STOPS.map((s) => {
        const on = s.state !== "later";
        return (
          <div key={s.n} style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <div style={{ width: 30, height: 30, margin: "0 auto 4px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: s.state === "free" || s.state === "kit" ? "var(--accent)" : s.state === "part" ? "var(--accent-bg)" : "var(--bg)", color: s.state === "free" || s.state === "kit" ? "#fff" : on ? "var(--accent)" : "var(--light)", border: `2px solid ${on ? "var(--accent)" : "var(--border)"}` }}>{s.n}</div>
            <div style={{ fontSize: 11, color: on ? "var(--text)" : "var(--light)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

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
          One page of it. You get the blank copy to print, two more sheets for the people and the r&eacute;sum&eacute;, and when you finish your reasons your answers arrive by email with a filled-in copy.
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
  const buyLabel = live ? `Get the kit · $${GROUND_PRICE} →` : "Tell me when it opens →";

  return (
    <PageShell>
      <div style={{ ...S.wrap, maxWidth: 620 }}>
        {badLink && <Card style={{ background: "var(--warn-bg)" }}><div style={{ fontSize: 14 }}>That access link didn&rsquo;t verify. Open the link from your access email again, or reply to it and I&rsquo;ll resend.</div></Card>}
        {canceled && <Card><div style={{ fontSize: 14, color: "var(--muted)" }}>Checkout closed. Nothing was charged.</div></Card>}
        {alreadyHas && <Card style={{ background: "var(--accent-bg-subtle)" }}><div style={{ fontSize: 14 }}><a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>Pick up where you left off →</a></div></Card>}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={S.tag}>Transition OS &middot; the first month</span>
          <h1 style={{ ...S.h1, fontSize: 38, margin: "12px 0 8px", lineHeight: 1.15 }}>{GROUND_NAME}</h1>
          <p style={{ ...S.p, fontSize: 17, maxWidth: 520, margin: "0 auto 10px", color: "var(--text)" }}>{GROUND_SUB}</p>
          <p style={{ ...S.p, fontSize: 15, maxWidth: 480, margin: "0 auto 20px" }}>
            {`${KIT.lessons} short lessons you read and answer, the workbook, and the message templates with your details filled in. No résumé needed to start.`}
          </p>
          {!alreadyHas && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/course" onClick={() => track("select_content", { content_type: "ground_free_start", stage: stage || "none" })} style={{ ...S.btn, display: "inline-block", textDecoration: "none", padding: "14px 30px", fontSize: 16 }}>Start free &rarr;</a>
                <a href="#buy" style={{ ...S.btnOut, display: "inline-block", textDecoration: "none", padding: "13px 24px", fontSize: 15 }}>{buyLabel}</a>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
                {live ? `Module 0 is free and needs no account. The kit is $${GROUND_PRICE} once${GROUND_PRICE < GROUND_LIST_PRICE ? `, ${SALE.note}` : ""}, credited toward the full program later. 30-day refund.` : "Module 0 is free now. The kit opens in a few days."}
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
                    style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.35, textAlign: "left", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg-subtle)" : "var(--card)", color: "var(--text)" }}
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
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>The first lesson is the five stages and what keeps people at each one. The kit is built for this one.</p>
          </Card>
        )}

        <Card highlight>
          <h3 style={{ ...S.h3, marginBottom: 6 }}>Most SLPs start at the r&eacute;sum&eacute;. That is why fifty applications turn into two screens.</h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: "0 0 8px" }}>
            A r&eacute;sum&eacute; is a flyer for one company, and if you have not named the company, the path, or the number the job has to clear, the flyer says &ldquo;orchestrated client workflows&rdquo; and nobody can picture a day of your life. The order that works is the order below: know your number and your reasons, find the people who already made the move, then translate the r&eacute;sum&eacute; for a posting you can name.
          </p>
          <KitMap />
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>Filled stops are free or in this kit. Stops 3 and 4 open the first three and the two r&eacute;sum&eacute; lessons; the rest is the full program, later.</p>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 10 }}>The four questions everyone asks, with numbers</h3>
          {[
            ["What is out there, and what does it pay?", "Twenty documented paths with sourced salary ranges, and a two-minute quiz that ranks them for you. Clinical liaison, for one, runs $84k to $135k in the documented range, and it needs the licence you already hold."],
            ["How long does it take?", "Six to fifteen months is typical in the documented transitions. One that we can trace in full took 113 tailored applications, 7 interviews and 1 offer over eleven months. The kit is built for that pace, not a weekend."],
            ["Will I earn less?", "It depends on the path, and you should know your own floor before anyone else's average. Lesson 0.2 gives you the number your next job has to clear, free. Where a path sits below most SLP salaries, the course says so and calls it a bridge."],
            ["Where do I even find the people?", "Referrals decide most documented transitions, and applications without one are what fails. Expect a fifth to a quarter of your first messages to go unanswered. The kit gives you the who-first list, the message that gets answered, and three sent on the first night."],
          ].map(([q, a]) => (
            <div key={q} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{q}</div>
              <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginTop: 3 }}>{a}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 4 }}>Start with Module 0, free</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)", margin: "0 0 12px" }}>
            Twenty minutes, no account, nothing to buy: your real hourly rate, the number your next job has to clear, a date, and whether it&rsquo;s the workplace, the work, or the season. Do it first. If it doesn&rsquo;t help you, don&rsquo;t buy the kit.
          </p>
          <a href="/course" onClick={() => track("select_content", { content_type: "ground_free_module", stage: stage || "none" })} style={{ fontSize: 14.5, fontWeight: 600, color: "var(--accent)" }}>Start Module 0, free &rarr;</a>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "16px 0 0", paddingTop: 12, borderTop: "1px solid var(--border)", lineHeight: 1.6 }}>
            Written by James Berges, a former SLP who now works in marketing at a health-tech company.
          </p>
        </Card>

        <Card>
          <WorkbookPage />
          <h3 style={{ ...S.h3, marginBottom: 4 }}>What ${GROUND_PRICE} buys</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 14px" }}>{`${KIT.lessons} lessons across the first month, in three parts, plus the workbook and two printable sheets.`}</p>
          {KIT.parts.map((part, i) => (
            <div key={part.title} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 700 }}>{part.title} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}>&middot; {part.where}</span></div>
                  <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 2 }}>{part.gets}</div>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                    {part.lessons.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: "12px 0 0", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            Plus: the workbook that fills in with your answers, a printable translation pass and a who-to-talk-to-first sheet, your people list that remembers who is due, and your answers emailed to you when the reasons are done.
          </p>
        </Card>

        <div id="buy" />
        <div style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 10px" }}>Already bought it? <a href="/course/find" style={{ color: "var(--accent)", fontWeight: 600 }}>Get your link sent again &rarr;</a></div>
        <Card style={{ border: "1.5px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>${GROUND_PRICE}{GROUND_PRICE < GROUND_LIST_PRICE && <s style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)", marginLeft: 8 }}>${GROUND_LIST_PRICE}</s>}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>{GROUND_PRICE < GROUND_LIST_PRICE ? `${SALE.note}, once, no subscription` : "once, no subscription"}</div></div>
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
                <button onClick={buy} disabled={busy} style={{ ...S.btn, padding: "14px 30px", fontSize: 16, opacity: busy ? 0.7 : 1 }}>{busy ? "Opening checkout…" : buyLabel}</button>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>Your link arrives by email and is your login on any device. The lessons open here straight away.</p>
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
