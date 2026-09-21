"use client";
import { S } from "./ui";
import { priceOf, wasOf, SALE } from "@/lib/pricing";
import { GROUND_NAME, GROUND_PRICE } from "@/lib/course-tiers";

/**
 * The three paid products as a menu, with the one that matches this reader's
 * stage marked. Shown under whichever offer the result page led with, so a
 * stage-2 reader who happens to have a posting in hand can still find the
 * Suite without hunting. Each card opens with the situation it is for, in
 * the reader's terms, because "which of these is me" is the actual decision.
 */
export type ProductKey = "ground" | "report" | "suite";

/** The verb on each card's button. `direct` when the click is a checkout,
 *  `via` when it goes somewhere first (the quiz, the free preview). The price
 *  is appended at render from `price`, so it is never typed twice. */
/** `button`, when set, replaces the verb-plus-price button entirely: the free
 *  door to a product is the button, and the price lives in `detail`. */
export const PRODUCTS: Record<ProductKey, { name: string; price: number; answers: string; detail: string; thumb?: string; cta: { direct: string; via: string }; button?: string }> = {
  ground: {
    name: GROUND_NAME,
    price: GROUND_PRICE,
    answers: "Want out, but don't know where to start?",
    thumb: "/marketing/workbook-cover.png",
    cta: { direct: "Start here", via: "Start here" },
    button: "Start free",
    detail: "Twenty free minutes: know the number your next job has to clear, and whether it's your workplace, the work, or the season that's wrong. Then the first month in one kit: your reasons in writing, the people who already made the move, and the r\u00e9sum\u00e9 pass, with the workbook.",
  },
  report: {
    name: "Pivot Report",
    price: priceOf("report"),
    answers: "Ready to pick a path?",
    cta: { direct: "Get the report", via: "Take the quiz" },
    detail: "Upload your résumé and get three paths you already qualify for, plus what to do in the first 30 days.",
  },
  suite: {
    name: "Career Pivot Suite",
    price: priceOf("suite"),
    answers: "Ready to start applying?",
    cta: { direct: "Try it free", via: "Try it free" },
    detail: "Paste one job posting. Get every bullet, the cover letter, your LinkedIn and the interview answers rewritten for it.",
  },
};

export default function ProductMenu({
  order,
  onPick,
  hrefFor,
  heading = "The other two, and what each one answers",
}: {
  /** Which to list, in order: the ones NOT already sold by the card above. */
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
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{p.name}</div>
              <div style={{ fontSize: 13.5, color: "var(--text)", marginTop: 3 }}>{p.answers}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 3 }}>{p.detail}{!p.button && wasOf(k) && <> <b style={{ color: "var(--accent)" }}>${p.price} {SALE.note}.</b></>}</div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "8px 14px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13.5, fontWeight: 600 }}>
                {p.button ? <>{p.button}&nbsp;&rarr;</> : <>{href ? p.cta.via : p.cta.direct} &middot; ${p.price}{wasOf(k) && <s style={{ opacity: 0.7, fontWeight: 400, marginLeft: 6 }}>${wasOf(k)}</s>}&nbsp;&rarr;</>}
              </span>
            </div>
            {p.thumb && <img src={p.thumb} width={44} height={57} alt="" style={{ width: 44, height: 57, objectFit: "cover", objectPosition: "top", borderRadius: 3, border: "1px solid var(--border)", flexShrink: 0 }} />}
          </div>
        );
        const style: React.CSSProperties = {
          display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8,
          border: "1px solid var(--border)", borderRadius: 10, background: "var(--card)",
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
