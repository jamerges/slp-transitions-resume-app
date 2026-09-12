"use client";
import { useState } from "react";
import { PageShell, S, Card } from "@/components/ui";
import { track } from "@/lib/analytics";
import { GROUND_NAME, GROUND_SUB } from "@/lib/course-tiers";

const M1 = [
  ["You're allowed to want out", "The five stages, and the belief that keeps people at each one."],
  ["Bad workplace, bad fit, or bad season?", "Six questions and a verdict. Only one of the three means leaving the field."],
  ["The sunk-cost audit", "The years and the money, as numbers, and the sentence underneath them."],
  ["What actually gave you energy", "Fifteen tasks from your last month, marked gave or took."],
  ["What you can't afford to lose", "Pay floor, distance from clinical, people-time, tools. Four dials."],
  ["What you keep when you leave", "The part of the work that goes with you into any job."],
  ["Tell one person", "The smallest possible disclosure."],
  ["Checkpoint", "Pushes, pulls, and one sentence about where you're going."],
];
const M2 = [
  ["The map: twenty paths by timeline", "Sorted by how long they take, not how interesting they sound."],
  ["Four jobs your licence already qualifies you for", "Liaison, utilization review, clinical educator, case management."],
  ["Where SLPs actually land", "The four clusters that produce most documented outcomes."],
  ["Careers that take 12 months or more", "Informatics, instructional design, UX, software, conversation design."],
  ["Epic, MSL and UX research: what they really require", "Three claims that cost SLPs money, and the real route behind each."],
  ["Try paths against your résumé", "As many as you like, not one and done."],
  ["Compare paths side by side", "Live postings and the companies that hire former SLPs."],
];

/** The thing being bought, drawn rather than photographed: the week as a row of
 *  lesson cards ending in the verdict and the sentence, then the map with two
 *  cards marked as fits. Decorative; the lists below carry the real content. */
function ProductShot() {
  const card = (w: number, tone?: "accent" | "fit"): React.CSSProperties => ({
    width: w, height: 34, borderRadius: 6, flexShrink: 0,
    background: tone === "accent" ? "var(--accent)" : tone === "fit" ? "var(--accent-bg)" : "var(--card)",
    border: `1px solid ${tone ? "var(--accent)" : "var(--border)"}`,
  });
  const line = (w: string | number, dark?: boolean): React.CSSProperties => ({
    width: w, height: 5, borderRadius: 3, background: dark ? "var(--muted)" : "var(--border)",
  });
  return (
    <div aria-hidden style={{ background: "linear-gradient(160deg, var(--accent-bg-subtle) 0%, var(--card) 100%)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Module 1 · the decision</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflow: "hidden" }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={card(i === 6 ? 54 : 40, i === 6 ? "accent" : undefined)} />)}
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 8, padding: "9px 11px", marginBottom: 16 }}>
        <div style={{ ...line(70, true), marginBottom: 6 }} />
        <div style={{ ...line("100%"), marginBottom: 4 }} />
        <div style={line("62%")} />
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Module 2 · the twenty paths, filtered</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <div key={i} style={{ ...card(0, i === 1 || i === 6 ? "fit" : undefined), width: "100%", height: 30 }} />)}
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
    track("begin_checkout", { currency: "USD", value: 24, items: [{ item_id: "ground", item_name: "$24 Before You Start Looking", price: 24, quantity: 1 }], placement: "ground_page", stage: stage || "none" });
    try {
      const r = await fetch("/api/ground-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, stage, path }) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Checkout failed");
      window.location.href = d.url;
    } catch (e: any) { setErr(e?.message || "Couldn't open checkout. Please try again."); setBusy(false); }
  };

  const List = ({ items, from }: { items: string[][]; from: number }) => (
    <>{items.map(([t, d], i) => (
      <div key={t} style={{ display: "flex", gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{from + i}</div>
        <div><div style={{ fontSize: 15, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>{d}</div></div>
      </div>
    ))}</>
  );

  return (
    <PageShell>
      <div style={{ ...S.wrap, maxWidth: 620 }}>
        {badLink && <Card style={{ background: "var(--warn-bg)" }}><div style={{ fontSize: 14 }}>That access link didn&rsquo;t verify. Open the link from your access email again, or reply to it and I&rsquo;ll resend.</div></Card>}
        {canceled && <Card><div style={{ fontSize: 14, color: "var(--muted)" }}>Checkout closed. Nothing was charged.</div></Card>}
        {alreadyHas && <Card style={{ background: "var(--accent-bg-subtle)" }}><div style={{ fontSize: 14 }}>This browser already has access. <a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>Open the quest log →</a></div></Card>}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={S.tag}>Transition OS · Modules 1 and 2</span>
          <h1 style={{ ...S.h1, fontSize: 38, margin: "12px 0 8px", lineHeight: 1.15 }}>{GROUND_NAME}</h1>
          <p style={{ ...S.p, fontSize: 17, maxWidth: 530, margin: "0 auto 22px" }}>{GROUND_SUB}</p>
        </div>

        <Card highlight>
          <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            Most SLPs looking at this can&rsquo;t yet say what they&rsquo;re looking for. Some aren&rsquo;t sure they want to leave at all;
            others are certain and have no idea where to start. Both are the same problem, and it gets solved the same way:
            work out which of three problems you actually have, what the work has to give you, and which of the twenty documented
            paths fit that. You finish able to name the thing you&rsquo;re looking for, which is what every next step needs.
          </p>
        </Card>

        <Card>
          <ProductShot />
          <h3 style={{ ...S.h3, marginBottom: 4 }}>What $24 buys</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 16px" }}>Fifteen lessons, eight tools, about an hour and three quarters. The fifteen-minute setup before it is free.</p>

          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>Module 1 · Ground · the decision</div>
          <List items={M1} from={1} />

          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", margin: "18px 0 4px" }}>Module 2 · Explore · where you&rsquo;d go</div>
          <List items={M2} from={9} />

          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: "16px 0 0" }}>
            Read and do, no video. Eight of the fifteen are interactive, and they pass answers forward: the map of twenty paths reads
            your energy audit and your four dials, marks the ones that fit what you said, and flags any sitting under the income floor
            you set. That is the part an article can&rsquo;t do.
          </p>
        </Card>

        <Card style={{ border: "1.5px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>$24</div><div style={{ fontSize: 13, color: "var(--muted)" }}>once, no subscription</div></div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 300, lineHeight: 1.55 }}>Comes off the full program when it launches, so you never pay for these twice. 30-day refund by replying to one email.</div>
          </div>
          {live ? (
            <>
              <div style={{ marginTop: 16 }}>
                <label style={S.label}>Email for your access link <span style={{ color: "var(--muted)", fontWeight: 400 }}>(you can also enter it at checkout)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={S.input} />
              </div>
              {err && <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 10 }}>{err}</div>}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={buy} disabled={busy} style={{ ...S.btn, padding: "15px 40px", fontSize: 17, opacity: busy ? 0.7 : 1 }}>{busy ? "Opening checkout…" : "Start Modules 1 and 2 — $24 →"}</button>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>Access arrives by email the moment payment clears, and opens on this browser immediately. Progress saves in the browser you use.</p>
              </div>
            </>
          ) : waited ? (
            <div style={{ marginTop: 16, fontSize: 14.5, color: "var(--accent)", fontWeight: 600 }}>✓ You&rsquo;ll get the link the day it opens. The free setup is open now.</div>
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

        <div style={{ textAlign: "center", margin: "6px 0 30px" }}>
          <a href="/course" style={{ fontSize: 13.5, color: "var(--accent)", fontWeight: 600 }}>The setup is free. Start there →</a>
        </div>
      </div>
    </PageShell>
  );
}
