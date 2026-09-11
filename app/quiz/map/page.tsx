import { PageShell, S, Card } from "@/components/ui";
import StageMap from "@/components/StageMap";
import PrintButton from "@/components/PrintButton";
import { PATHS, STAGES, type StageKey } from "@/lib/quiz";
import { STAGE_MAP } from "@/lib/stage-map";

/**
 * The printable stage map: one sheet with where you are, the one move, what's
 * next, your path with its first move, and three dated lines to fill in at
 * weeks 1, 6 and 12. Linked from the quiz result and both quiz emails. Takes
 * only a stage key and a path slug so there is never a name or email in a URL.
 */
export const metadata = {
  title: "Your map | SLP Transitions",
  robots: { index: false, follow: false },
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; path?: string }>;
}) {
  const p = await searchParams;
  const stage: StageKey = (p.stage && p.stage in STAGES ? p.stage : "panic") as StageKey;
  const path = p.path ? PATHS[p.path.toLowerCase()] : undefined;
  const info = STAGE_MAP[stage];
  const suiteHref = `https://app.slptransitions.com/?from=quiz${path ? `&path=${encodeURIComponent(path.roleOption)}` : ""}`;

  const line: React.CSSProperties = { borderBottom: "1px solid var(--border)", height: 26 };
  const cellLabel: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: "var(--muted)", paddingTop: 10 };

  return (
    <PageShell>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          header, footer, nav { display: none !important; }
          .sheet { box-shadow: none !important; border: none !important; }
        }
        @page { size: Letter; margin: 0.6in; }
      `}</style>
      <div style={{ ...S.wrap, maxWidth: 640 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, margin: "8px 0 14px", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Stick it somewhere you&rsquo;ll see it. Come back at weeks 6 and 12.</div>
          <PrintButton />
        </div>

        <Card style={{ padding: 26 }}>
          <div className="sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>SLP Transitions · your map</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Stage {info.n} · {path ? path.label : "twenty paths"}</div>
            </div>

            <StageMap stage={stage} suiteHref={suiteHref} print />

            {path && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>Your path from the quiz</div>
                <div style={{ fontSize: 17, fontWeight: 700, margin: "4px 0 2px" }}>{path.icon} {path.label}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{path.range} · typically {path.timeline}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 8 }}><strong>First move:</strong> {path.firstMove}</div>
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>The same three questions, three times</div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0 6px", lineHeight: 1.5 }}>Which stage you&rsquo;re in, which path you&rsquo;d name, and where you&rsquo;re going in one sentence. The distance between the rows is the useful part.</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", fontSize: 11.5, color: "var(--muted)", fontWeight: 600, paddingBottom: 4, width: "18%" }}></th>
                    <th style={{ textAlign: "left", fontSize: 11.5, color: "var(--muted)", fontWeight: 600, paddingBottom: 4 }}>Stage</th>
                    <th style={{ textAlign: "left", fontSize: 11.5, color: "var(--muted)", fontWeight: 600, paddingBottom: 4 }}>Path</th>
                    <th style={{ textAlign: "left", fontSize: 11.5, color: "var(--muted)", fontWeight: 600, paddingBottom: 4, width: "40%" }}>Where you&rsquo;re going</th>
                  </tr>
                </thead>
                <tbody>
                  {["Week 1", "Week 6", "Week 12"].map((w) => (
                    <tr key={w}>
                      <td style={cellLabel}>{w}</td>
                      <td><div style={line} /></td>
                      <td><div style={line} /></td>
                      <td><div style={line} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              The five stages are from slptransitions.com/youre-allowed-to-want-out. Nothing on this sheet asks you to become someone else; your title changes, the competence doesn&rsquo;t.
            </div>
          </div>
        </Card>

        <div className="no-print" style={{ textAlign: "center", margin: "14px 0 32px" }}>
          <a href="/quiz" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>← Back to the quiz</a>
        </div>
      </div>
    </PageShell>
  );
}
