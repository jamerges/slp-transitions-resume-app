"use client";
import { useProgress } from "@/lib/course-progress";
import { PATHS } from "@/lib/quiz";
import { STAGE_META } from "./scenes";
import { PageShell, S, Card } from "@/components/ui";
import { DIALS } from "@/lib/course";

/**
 * Your workbook: the same pages as the blank one, with the answers you have
 * already given filled in and the rest left as lines to write on. Reads the
 * progress store directly, so it is always current, and prints to PDF from
 * the browser rather than needing a generated file.
 */
const FLOORS = ["Match my SLP pay from day one", "A small dip for better conditions", "Runway for a bigger jump"];
const VERDICT_LABEL: Record<string, string> = { workplace: "Bad workplace", fit: "Bad fit", season: "Bad season" };
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function Line({ n = 1 }: { n?: number }) {
  return <>{Array.from({ length: n }).map((_, i) => <div key={i} style={{ borderBottom: "1px solid var(--border)", height: 26 }} />)}</>;
}
function Field({ label, value, lines = 1 }: { label: string; value?: string | null; lines?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      {value ? <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{value}</div> : <Line n={lines} />}
    </div>
  );
}
function Section({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ breakInside: "avoid", marginBottom: 26, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>Page {n}</div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, margin: "3px 0 2px" }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.55 }}>{sub}</p>}
      {children}
    </section>
  );
}

export default function MyWorkbook() {
  const { p, ready } = useProgress();
  if (!ready) return <PageShell><div style={{ ...S.wrap, padding: 40 }}>Loading your answers…</div></PageShell>;
  const A = p.answers as Record<string, any>;
  const start = A["0.2"] || {}, tree = A["1.2"] || {}, sunk = A["1.3"] || {};
  const energy = A["1.4"] || {}, dials = A["1.5"] || {}, told = A["1.7"] || {}, cp = A["1.8"] || {};
  const stageKey = A["1.1"]?.stage || start.stage;
  const stage = STAGE_META.find((s) => s.key === stageKey);
  const marks: Record<string, "up" | "down"> = energy.energy || {};
  const gave = Object.keys(marks).filter((k) => marks[k] === "up");
  const took = Object.keys(marks).filter((k) => marks[k] === "down");
  const top: string[] = dials.top || [];
  const filled = [stage, tree.verdict, sunk.years != null, gave.length, top.length, told.who, cp.why].filter(Boolean).length;

  return (
    <PageShell>
      <style>{`
        @media print { .no-print { display: none !important; } header, footer, nav { display: none !important; }
          body { background:#fff !important; } .sheet { box-shadow:none !important; border:none !important; padding:0 !important; } }
        @page { size: Letter; margin: 0.7in; }
      `}</style>
      <div style={{ ...S.wrap, maxWidth: 680 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "8px 0 14px" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {filled === 0 ? "Nothing filled in yet. Work through Module 1 and your answers appear here." : `${filled} of 7 sections filled in. Blank lines are for the parts worth writing by hand.`}
          </div>
          <button type="button" onClick={() => window.print()} style={{ ...S.btn, padding: "11px 22px", fontSize: 14.5 }}>Print or save as PDF</button>
        </div>

        <Card style={{ padding: 28 }}>
          <div className="sheet">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>SLP Transitions · your workbook</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>

            <Section n={1} title="Your starting line" sub="From lesson 0.2.">
              <Field label="The income floor the next job has to clear" value={start.floor >= 0 ? FLOORS[start.floor] : null} />
              <Field label="The date you are aiming at" value={start.date || null} />
            </Section>

            <Section n={2} title="Where you are, and the verdict" sub="From lessons 1.1 and 1.2.">
              <Field label="The stage you named" value={stage ? `${stage.n}. ${stage.name} — “${stage.belief}”` : null} />
              <Field label="Bad workplace, bad fit, or bad season" value={tree.verdict ? VERDICT_LABEL[tree.verdict] : null} />
              <Field label="What you would say to a CF who told you the same thing" lines={4} />
            </Section>

            <Section n={3} title="The sentence you tell yourself" sub="From lesson 1.3. The calculator did the years and the money; this is the sentence underneath them.">
              {sunk.years != null && (
                <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  {sunk.years} years in · {money(sunk.debt || 0)} of debt · {money(sunk.salary || 0)} now
                  {sunk.path && PATHS[sunk.path] ? ` · comparing against ${PATHS[sunk.path].label}` : ""}
                </div>
              )}
              <Field label="Write it exactly as it sounds in your head. Not the reasonable version." lines={4} />
              <Field label="Who taught you that sentence?" lines={2} />
            </Section>

            <Section n={4} title="What gave you energy, and what took it" sub="From lesson 1.4.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>Gave energy</div>
                  {gave.length ? gave.map((t) => <div key={t} style={{ fontSize: 14, lineHeight: 1.6 }}>· {t}</div>) : <Line n={4} />}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#92400E", marginBottom: 6 }}>Took it</div>
                  {took.length ? took.map((t) => <div key={t} style={{ fontSize: 14, lineHeight: 1.6 }}>· {t}</div>) : <Line n={4} />}
                </div>
              </div>
            </Section>

            <Section n={5} title="What you can't afford to lose" sub="From lesson 1.5.">
              {dials.dials ? (
                <div style={{ marginBottom: 12 }}>
                  {DIALS.map((d: any) => (
                    <div key={d.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>{d.label}</span><span style={{ color: "var(--muted)" }}>{dials.dials[d.key]} / 100</span>
                    </div>
                  ))}
                </div>
              ) : <Line n={4} />}
              <Field label="The three paths that came out of it" value={top.length ? top.map((sl) => PATHS[sl]?.label).filter(Boolean).join(", ") : null} />
            </Section>

            <Section n={6} title="What you will miss, and who you told" sub="From lessons 1.6 and 1.7.">
              <Field label="Finish the sentence: I will miss being the person who …" lines={3} />
              <Field label="The person you told" value={told.who || null} />
              <Field label="What they said back" lines={3} />
            </Section>

            <Section n={7} title="Pushes, pulls, and the sentence" sub="From the Module 1 checkpoint.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B42318", marginBottom: 6 }}>Moving away from</div>
                  {(cp.pushes || []).length ? cp.pushes.map((x: string, i: number) => <div key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>{i + 1}. {x}</div>) : <Line n={3} />}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1E40AF", marginBottom: 6 }}>Moving toward</div>
                  {(cp.pulls || []).length ? cp.pulls.map((x: string, i: number) => <div key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>{i + 1}. {x}</div>) : <Line n={3} />}
                </div>
              </div>
              <Field label="Where you're going, in one sentence" value={cp.why || null} lines={3} />
            </Section>

            <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              Come back at weeks 6 and 12 and print it again. The distance between the three is the useful part.
            </div>
          </div>
        </Card>

        <div className="no-print" style={{ textAlign: "center", margin: "14px 0 34px", fontSize: 13.5 }}>
          <a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>← Quest log</a>
          <span style={{ color: "var(--light)", margin: "0 10px" }}>·</span>
          <a href="/api/course/workbook?f=pdf" style={{ color: "var(--accent)", fontWeight: 600 }}>Blank copy to write in (PDF)</a>
        </div>
      </div>
    </PageShell>
  );
}
