"use client";
import { useState } from "react";
import { PageShell, S, Card } from "./ui";
import { track } from "@/lib/analytics";
import StageMap from "./StageMap";
import { PRODUCTS, type ProductKey } from "./ProductMenu";
import { STAGE_MAP, STAGE_ORDER, offerForStage } from "@/lib/stage-map";
import type { StageKey } from "@/lib/quiz";

/**
 * The map, without the quiz. Two thirds of what we sell was reachable only
 * from a quiz result, so anyone arriving from an article or an email could
 * not find it. Pick the stage you are in and the page shows the one move and
 * the one thing worth buying, if any. Same logic as the quiz result, minus
 * the nine questions.
 */
const HREF: Record<ProductKey, string> = { ground: "/course/ground", report: "/quiz", suite: "/" };
const FREE = [
  { label: "The two-minute quiz", detail: "Nine questions, and it names the path your experience already fits.", href: "/quiz" },
  { label: "Open roles, by path", detail: "What is actually posted this week for each of the twenty paths.", href: "/jobs" },
  { label: "120 companies that hire former SLPs", detail: "Searchable, with the roles each one has hired for.", href: "/companies" },
  { label: "The five stages of leaving", detail: "Where people get stuck, and the one move out of each.", href: "https://slptransitions.com/youre-allowed-to-want-out/" },
];

export default function StartHere() {
  const [stage, setStage] = useState<StageKey | null>(null);
  // offerForStage returns "map" for stages 1-3, meaning "don't pitch". Here the
  // page already leads with the map, so the product to surface first is Ground.
  const raw = stage ? offerForStage(stage) : null;
  const offer: ProductKey | null = raw === null ? null : raw === "map" ? "ground" : raw;
  const pick = (k: ProductKey, placement: string) =>
    track("select_item", {
      item_list_id: "start_here", item_list_name: "Start here",
      items: [{ item_id: k, item_name: PRODUCTS[k].name, price: PRODUCTS[k].price, quantity: 1 }],
      placement, stage: stage || "none",
    });

  const Product = ({ k, lead }: { k: ProductKey; lead?: boolean }) => {
    const p = PRODUCTS[k];
    return (
      <a
        href={HREF[k]}
        onClick={() => pick(k, lead ? "start_lead" : "start_menu")}
        style={{
          display: "block", textDecoration: "none", color: "inherit",
          border: `1.5px solid ${lead ? "var(--accent)" : "var(--border)"}`, borderRadius: 12,
          background: lead ? "var(--accent-bg-subtle)" : "var(--card)",
          padding: lead ? "18px 20px" : "14px 16px", marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: lead ? 19 : 16, fontWeight: 700, fontFamily: lead ? "'Playfair Display', Georgia, serif" : undefined }}>{p.name}</div>
          <div style={{ fontSize: lead ? 19 : 15, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>${p.price}</div>
        </div>
        <div style={{ fontSize: lead ? 15 : 14, marginTop: 4 }}>{p.answers}</div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 4 }}>{p.detail}</div>
        {lead && <div style={{ marginTop: 12, fontSize: 14.5, fontWeight: 700, color: "var(--accent)" }}>Start &rarr;</div>}
      </a>
    );
  };

  return (
    <PageShell>
      <div style={{ ...S.wrap, maxWidth: 660 }}>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <h1 style={{ ...S.h1, fontSize: 38, margin: "0 0 10px", lineHeight: 1.15 }}>Where are you?</h1>
          <p style={{ ...S.p, fontSize: 17, maxWidth: 480, margin: "0 auto 22px" }}>
            Everyone who leaves goes through the same five stages. Pick the one that sounds like this week and the page
            shows you the next move.
          </p>
        </div>

        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: 8 }}>
            {STAGE_ORDER.map((k) => {
              const info = STAGE_MAP[k];
              const on = stage === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => { setStage(k); track("select_content", { content_type: "start_stage", stage: k }); }}
                  style={{
                    textAlign: "left", cursor: "pointer", padding: "11px 12px", borderRadius: 10,
                    border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`,
                    background: on ? "var(--accent-bg-subtle)" : "var(--card)",
                    color: on ? "var(--accent)" : "var(--text)", fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>{info.n}</div>
                  <div style={{ fontSize: 14, fontWeight: on ? 700 : 600, lineHeight: 1.25, marginTop: 2 }}>{info.name}</div>
                </button>
              );
            })}
          </div>
          {!stage && (
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "14px 0 0" }}>
              Not sure? <a href="/quiz" style={{ color: "var(--accent)", fontWeight: 600 }}>The quiz picks for you</a>, and names a path while it is at it.
            </p>
          )}
        </Card>

        {stage && (
          <>
            <Card>
              <StageMap stage={stage} suiteHref="/" />
            </Card>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                What to use for this stage
              </div>
              {offer && <Product k={offer} lead />}
              {(["ground", "report", "suite"] as ProductKey[]).filter((k) => k !== offer).map((k) => <Product key={k} k={k} />)}
            </Card>
          </>
        )}

        {!stage && (
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
              Everything, if you would rather just look
            </div>
            {(["ground", "report", "suite"] as ProductKey[]).map((k) => <Product key={k} k={k} />)}
          </Card>
        )}

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Free, and worth the time</div>
          {FREE.map((f, i) => (
            <a key={f.href} href={f.href} onClick={() => track("select_content", { content_type: "start_free", item_id: f.href })}
              style={{ display: "block", textDecoration: "none", color: "inherit", padding: "11px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>{f.label} &rarr;</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 2 }}>{f.detail}</div>
            </a>
          ))}
        </Card>

        <p style={{ fontSize: 13, color: "var(--light)", textAlign: "center", margin: "6px 0 34px", lineHeight: 1.6 }}>
          Every price is one payment. Thirty-day refund on all of them, by replying to one email.
        </p>
      </div>
    </PageShell>
  );
}
