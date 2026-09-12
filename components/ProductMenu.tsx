"use client";
import { S } from "./ui";
import { GROUND_NAME, GROUND_PRICE } from "@/lib/course-tiers";

/**
 * The three paid products as a menu, with the one that matches this reader's
 * stage marked. Shown under whichever offer the result page led with, so a
 * stage-2 reader who happens to have a posting in hand can still find the
 * Suite without hunting. Each line says what question it answers, because
 * "which of these do I need" is the actual decision.
 */
export type ProductKey = "ground" | "report" | "suite";

export const PRODUCTS: Record<ProductKey, { name: string; price: number; answers: string; detail: string }> = {
  ground: {
    name: GROUND_NAME,
    price: GROUND_PRICE,
    answers: "Should I go, and what am I protecting if I do?",
    detail: "Module 1 of Transition OS plus the workbook. The decision, the sunk-cost audit, the energy audit, the four dials.",
  },
  report: {
    name: "Pivot Report",
    price: 9,
    answers: "Which paths does my résumé already qualify me for?",
    detail: "Reads your actual résumé and returns three best-fit paths with entry doors, and a 30-day plan.",
  },
  suite: {
    name: "Career Pivot Suite",
    price: 24,
    answers: "How do I write this application?",
    detail: "One posting, rewritten end to end: every résumé bullet, the cover letter, your LinkedIn, the interview answers.",
  },
};

export default function ProductMenu({
  recommended,
  order,
  onPick,
  hrefFor,
  heading = "The other two, if one of them is closer",
}: {
  recommended: ProductKey;
  /** Which to list, in order. Usually the two that aren't recommended. */
  order: ProductKey[];
  onPick: (k: ProductKey) => void;
  hrefFor: (k: ProductKey) => string | undefined;
  heading?: string;
}) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>{heading}</div>
      {order.map((k) => {
        const p = PRODUCTS[k];
        const href = hrefFor(k);
        const body = (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>${p.price}</div>
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text)", marginTop: 3 }}>{p.answers}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 3 }}>{p.detail}</div>
            {k === recommended && <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)", marginTop: 5 }}>Matches where you said you are</div>}
          </>
        );
        const style: React.CSSProperties = {
          display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8,
          border: `1px solid ${k === recommended ? "var(--accent)" : "var(--border)"}`, borderRadius: 10,
          background: k === recommended ? "var(--accent-bg-subtle)" : "var(--card)",
          cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
        };
        return href ? (
          <a key={k} href={href} onClick={() => onPick(k)} style={style}>{body}</a>
        ) : (
          <button key={k} type="button" onClick={() => onPick(k)} style={style}>{body}</button>
        );
      })}
    </div>
  );
}
