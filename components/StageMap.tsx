import type { CSSProperties } from "react";
import { STAGE_MAP, STAGE_ORDER } from "@/lib/stage-map";
import type { StageKey } from "@/lib/quiz";

/**
 * Five stops on a line, the current one filled, then where you are, the belief
 * holding you there, the one move out, and what the next stage looks like.
 * Presentational only (no hooks) so the printable sheet can render it on the
 * server and the quiz can render it in the browser.
 */
export default function StageMap({
  stage,
  suiteHref,
  external,
  print,
  hideCta,
}: {
  stage: StageKey;
  /** Where the stage-5 move points; the quiz passes its path-preselected Suite link. */
  suiteHref?: string;
  /** Inside the WordPress iframe, links have to break out to a new tab. */
  external?: boolean;
  /** Tighter spacing and no buttons, for the sheet. */
  print?: boolean;
  /** The result page already shows the stage-5 offer twice; it hides this one. */
  hideCta?: boolean;
}) {
  const info = STAGE_MAP[stage];
  const href = stage === "action" && suiteHref ? suiteHref : info.move.href;
  const linkProps = external ? { target: "_blank", rel: "noopener" } : {};

  const kicker: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" };
  const body: CSSProperties = { fontSize: print ? 13.5 : 15, lineHeight: 1.65, color: "var(--text)", margin: "6px 0 0" };
  const muted: CSSProperties = { ...body, color: "var(--muted)" };

  return (
    <div>
      {/* the strip */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, margin: "4px 0 18px" }} aria-hidden>
        <div style={{ position: "absolute", left: "10%", right: "10%", top: 15, borderTop: "2px dotted var(--border)" }} />
        {STAGE_ORDER.map((k) => {
          const s = STAGE_MAP[k];
          const here = k === stage;
          const past = s.n < info.n;
          return (
            <div key={k} style={{ textAlign: "center", position: "relative" }}>
              <div style={{
                width: here ? 32 : 26, height: here ? 32 : 26, margin: `${here ? 0 : 3}px auto 6px`, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: here ? "var(--accent)" : past ? "var(--accent-bg)" : "var(--card)",
                border: `2px solid ${here || past ? "var(--accent)" : "var(--border)"}`,
                color: here ? "#fff" : past ? "var(--accent)" : "var(--muted)",
                fontSize: here ? 14 : 12, fontWeight: 700,
                boxShadow: here ? "0 0 0 5px var(--accent-bg-subtle)" : "none",
              }}>{s.n}</div>
              <div style={{ fontSize: 11, lineHeight: 1.25, color: here ? "var(--accent)" : "var(--muted)", fontWeight: here ? 700 : 500, padding: "0 2px" }}>{s.name}</div>
            </div>
          );
        })}
      </div>

      {/* you are here */}
      <div style={kicker}>You&rsquo;re here · stage {info.n} of 5</div>
      <div style={{ fontSize: print ? 19 : 21, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", margin: "4px 0 2px", color: "var(--text)" }}>{info.name}</div>
      <p style={muted}>{info.here}</p>

      <div style={{ marginTop: 14 }}>
        <div style={kicker}>The belief keeping people here</div>
        <p style={{ ...body, fontWeight: 600 }}>&ldquo;{info.belief}&rdquo;</p>
        <p style={muted}>{info.truth}</p>
      </div>

      {/* the one move */}
      <div style={{ marginTop: 16, padding: print ? "12px 14px" : "14px 16px", background: "var(--accent-bg-subtle)", borderLeft: "3px solid var(--accent)", borderRadius: 8 }}>
        <div style={kicker}>The one move</div>
        <div style={{ fontSize: print ? 15 : 16.5, fontWeight: 700, margin: "4px 0 4px", color: "var(--text)" }}>{info.move.label}</div>
        <p style={{ ...body, margin: 0 }}>{info.move.detail}</p>
        {href && info.move.cta && !print && !hideCta && (
          <a href={href} {...linkProps} style={{ display: "inline-block", marginTop: 12, padding: "10px 18px", background: "var(--accent)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            {info.move.cta} →
          </a>
        )}
        {href && print && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, wordBreak: "break-all" }}>{href}</div>
        )}
      </div>

      {/* next */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={kicker}>Next, when you&rsquo;re there · stage {Math.min(info.n + 1, 5)}{info.n === 5 ? "" : " of 5"}</div>
        <div style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 2px", color: "var(--text)" }}>{info.next.name}</div>
        <p style={{ ...muted, margin: 0 }}>{info.next.line}</p>
      </div>
    </div>
  );
}
