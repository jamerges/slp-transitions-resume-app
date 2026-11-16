"use client";
import { useProgress } from "@/lib/course-progress";
import { PATHS } from "@/lib/quiz";
import { STAGE_META } from "./scenes";
import { PageShell, S, Card } from "@/components/ui";
import { DIALS } from "@/lib/course";
import { ASKS } from "@/lib/course-content";
import type { CourseProduct } from "@/lib/course-tiers";

/**
 * Your workbook: the same pages as the blank one, with the answers you have
 * already given filled in and the rest left as lines to write on. Reads the
 * progress store directly, so it is always current, and prints to PDF from
 * the browser rather than needing a generated file.
 */
const FLOORS = ["Match my SLP pay from day one", "A small dip for better conditions", "Runway for a bigger jump"];
const VERDICT_LABEL: Record<string, string> = { workplace: "Bad workplace", fit: "Bad fit", season: "Bad season" };
const TRADE_LABELS = [
  { key: "move", text: "move to a new city for the right role" },
  { key: "dip", text: "take a dip in pay for the right first door" },
  { key: "benefits", text: "go without employer benefits for a while" },
  { key: "commute", text: "commute again" },
  { key: "remote", text: "work fully remote" },
  { key: "office", text: "be in an office most days" },
];
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
// The people list's stages, in the words the tracker uses.
const PERSON_STAGE: Record<string, string> = { to: "to message", sent: "messaged", replied: "replied", spoke: "spoke", warm: "warm", referred: "referred you", closed: "closed" };
const APP_STATUS: Record<string, string> = { sent: "sent", screen: "phone screen", interview: "interview", offer: "offer", no: "no" };
const ticked = (v: unknown) => (Array.isArray(v) ? `${v.filter(Boolean).length} of ${v.length} checked` : null);

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

export default function MyWorkbook({ product }: { product?: CourseProduct }) {
  const { p, ready } = useProgress();
  if (!ready) return <PageShell><div style={{ ...S.wrap, padding: 40 }}>Loading your answers…</div></PageShell>;
  const A = p.answers as Record<string, any>;
  const start = A["0.2"] || {}, tree = A["0.3"] || {}, sunk = A["1.3"] || {};
  const energy = A["1.4"] || {}, dials = A["1.5"] || {}, told = A["1.7"] || {}, cp = A["1.8"] || {};
  const stageKey = A["1.1"]?.stage || start.stage;
  const stage = STAGE_META.find((s) => s.key === stageKey);
  const marks: Record<string, "up" | "down"> = energy.energy || {};
  const gave = Object.keys(marks).filter((k) => marks[k] === "up");
  const took = Object.keys(marks).filter((k) => marks[k] === "down");
  const top: string[] = dials.top || [];
  // Modules 2 to 7. Tools save into one shared slot; written answers sit in notes by lesson id.
  const SH: Record<string, any> = A.__shared || {};
  const notes: Record<string, string> = SH.notes || {};
  const note = (id: string) => (notes[id] || "").trim() || null;
  const Ask = ({ id }: { id: string }) => { const a = ASKS.find((x) => x.id === id); return a ? <Field label={a.label} value={note(id)} lines={a.lines} /> : null; };
  const hours = Number(SH.time?.hours) || 0;
  const pathSlug: string | undefined = start.path || top[0];
  const people: any[] = Array.isArray(SH.contacts) ? SH.contacts.filter((c: any) => c?.name) : [];
  const apps: any[] = Array.isArray(SH.apps) ? SH.apps.filter((a: any) => a?.company) : [];
  const numbers: [string, string][] = Object.entries((SH.numbers || {}) as Record<string, string>).filter(([, v]) => (v || "").trim());
  const run = SH.runway;
  const gap = run ? run.expenses * (run.dip / 100) + run.cobra + run.loan : 0;
  const artifact = SH.artifact?.link ? SH.artifact : null;
  const bridge = SH.bridge?.prep || SH.bridge?.win ? SH.bridge : null;
  const has = (ids: string[]) => ids.some((id) => note(id));
  const later = [
    hours > 0 || has(["2.2", "2.3", "2.4", "2.5"]),
    people.length > 0 || !!SH.linkedin,
    numbers.length > 0 || !!SH.translation?.out || apps.length > 0 || has(["4.1", "4.4"]),
    !!artifact || !!run || has(["5.1", "5.4"]),
    !!bridge || !!SH.offer || has(["6.3", "6.7"]),
    has(["7.2"]),
  ];
  // The full program prints every page. A kit shows the later pages its lessons have written to.
  const full = product === "os";
  const show = (i: number) => full || later[i];
  const first = [stage, tree.verdict, sunk.years != null, gave.length, top.length, told.who, cp.why].filter(Boolean).length;
  const filled = first + later.filter(Boolean).length;
  const total = 7 + (full ? 6 : later.filter(Boolean).length);

  return (
    <PageShell>
      <style>{`
        @media print { .no-print { display: none !important; } header, footer, nav { display: none !important; }
          body { background:#fff !important; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .sheet { box-shadow:none !important; border:none !important; padding:0 !important; } }
        @page { size: Letter; margin: 0.7in; }
      `}</style>
      <div style={{ ...S.wrap, maxWidth: 680 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "8px 0 14px" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {filled === 0 ? "Nothing filled in yet. Your answers appear here as you work through the lessons." : `${filled} of ${total} pages have your answers on them. Blank lines are for the parts worth writing by hand.`}
          </div>
          <button type="button" onClick={() => window.print()} style={{ ...S.btn, padding: "11px 22px", fontSize: 14.5 }}>Print or save as PDF</button>
        </div>

        <Card style={{ padding: 28 }}>
          <div className="sheet">
            <div style={{ background: "var(--accent)", color: "#fff", padding: "22px 26px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: "1px solid var(--accent-light)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent-bg)" }}>Workbook</div>
                <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "#B3C4B1" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, margin: "20px 0 0", letterSpacing: "-0.02em" }}>Transition OS</h1>
              <div style={{ width: 54, height: 3, background: "var(--accent-bg)", margin: "14px 0 0" }} />
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, lineHeight: 1.45, color: "var(--accent-bg)", margin: "14px 0 0" }}>Your answers so far, with blank lines where you have not written one yet.</p>
            </div>

            <Section n={1} title="Your starting line" sub="From lesson 0.2.">
              <Field label="What you really earn per hour now" value={start.hourly > 0 ? `$${Number(start.hourly).toFixed(2)} an hour, over ${Math.round((start.hours || 0) * (start.weeks || 0)).toLocaleString("en-US")} hours a year` : null} />
              <Field label="The income floor the next job has to clear" value={start.floor >= 0 ? FLOORS[start.floor] + (start.floorDollars > 0 ? ` · about ${money(start.floorDollars)} a year before tax` : "") : null} />
              <Field label="The date you are aiming at" value={start.date || null} />
              <Field label="What you would trade" value={start.trades && Object.keys(start.trades).length ? TRADE_LABELS.filter((t) => start.trades[t.key] !== undefined).map((t) => `${start.trades[t.key] ? "Yes" : "No"}: ${t.text}`).join("\n") : null} lines={3} />
            </Section>

            <Section n={2} title="Where you are, and the verdict" sub="From lessons 1.1 and 0.3.">
              <Field label="The stage you named" value={stage ? `${stage.n}. ${stage.name}: “${stage.belief}”` : null} />
              <Field label="Bad workplace, bad fit, or bad season" value={tree.verdict ? VERDICT_LABEL[tree.verdict] : null} />
              <Field label="What you would say to a CF who told you the same thing" lines={4} />
            </Section>

            <Section n={3} title="Why leaving isn’t a wasted degree" sub="From lesson 1.3.">
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
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>What two people said you are good at, in their words</div>
                {energy.outside ? <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{energy.outside}</div> : <Line n={3} />}
              </div>
            </Section>

            <Section n={5} title="What you can’t afford to lose" sub="From lesson 1.5.">
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

            <Section n={6} title="What you’ll miss, and who you told" sub="From lessons 1.6 and 1.7.">
              <Field label="Finish the sentence: I will miss being the person who …" lines={3} />
              <Field label="The person you told" value={told.who || null} />
              <Field label="What they said back" lines={3} />
              <Field label="Kept private" value={Array.isArray(told.private) ? `${told.private.filter(Boolean).length} of ${told.private.length} settings and habits in place` : null} />
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

            {show(0) && (
              <Section n={8} title="Your hours, and the paths you’re weighing" sub="From Module 2.">
                <Field label="Hours a week you gave the search" value={hours > 0 ? `${hours} hours a week` : null} />
                <Field label="The path you’re aiming at" value={pathSlug && PATHS[pathSlug] ? `${PATHS[pathSlug].label} · ${PATHS[pathSlug].range} · typically ${PATHS[pathSlug].timeline}` : null} />
                <Ask id="2.2" /><Ask id="2.3" /><Ask id="2.4" /><Ask id="2.5" />
              </Section>
            )}

            {show(1) && (
              <Section n={9} title="The people who already made the move" sub="From Module 3. The full list, with what each person said, is under Your people.">
                {people.length ? (
                  <div style={{ marginBottom: 12 }}>
                    {people.slice(0, 14).map((c: any, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                        <span>{c.name}{c.role || c.company ? <span style={{ color: "var(--muted)" }}> · {[c.role, c.company].filter(Boolean).join(", ")}</span> : null}</span>
                        <span style={{ color: "var(--muted)", flexShrink: 0 }}>{PERSON_STAGE[c.stage] || (c.replied ? "replied" : c.sent ? "messaged" : "to message")}</span>
                      </div>
                    ))}
                    {people.length > 14 && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>and {people.length - 14} more in your list</div>}
                  </div>
                ) : <Field label="Three people to message first: name, title, company" lines={3} />}
                <Field label="LinkedIn, one pass" value={ticked(SH.linkedin)} />
                <Field label="What the first person who answered told you" lines={3} />
              </Section>
            )}

            {show(2) && (
              <Section n={10} title="Your résumé, in their words" sub="From Module 4.">
                {numbers.length ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Numbers you already have</div>
                    {numbers.map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                        <span>{k}</span><span style={{ fontWeight: 600, flexShrink: 0 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : <Field label="Numbers you already have: caseload, evaluations a year, people you trained" lines={3} />}
                <Field label="One bullet, before" value={SH.translation?.mine || null} lines={2} />
                <Field label="The same bullet, translated" value={SH.translation?.out || null} lines={2} />
                <Ask id="4.1" /><Ask id="4.4" />
                <Field label="The résumé, one pass" value={ticked(SH.resume)} />
                {apps.length ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Applications sent</div>
                    {apps.slice(0, 14).map((a: any, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                        <span>{a.role ? `${a.role}, ` : ""}{a.company}</span><span style={{ color: "var(--muted)", flexShrink: 0 }}>{APP_STATUS[a.status] || a.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <Field label="The first application you sent properly: role, company, date" lines={2} />}
              </Section>
            )}

            {show(3) && (
              <Section n={11} title="Your proof, and your runway" sub="From Module 5.">
                <Ask id="5.1" />
                <Field label="The thing you made, and where it lives" value={artifact ? `${PATHS[artifact.slug]?.label ? PATHS[artifact.slug].label + ": " : ""}${artifact.link}` : null} lines={2} />
                <Ask id="5.4" />
                <Field label="Your runway" value={run ? `${money(run.savings)} saved against a gap of ${money(gap)} a month${gap > 0 ? `: about ${Math.floor(run.savings / gap)} months` : ""}` : null} lines={2} />
              </Section>
            )}

            {show(4) && (
              <Section n={12} title="The interview, and the offer" sub="From Module 6.">
                <Field label="What you did to prepare for the move" value={bridge?.prep || null} lines={2} />
                <Field label="Your proof, with a number in it" value={bridge?.win || null} lines={2} />
                <Ask id="6.3" /><Ask id="6.7" />
                <Field label="Before you say yes" value={ticked(SH.offer)} />
                <Field label="Your opening number, and the floor you won’t go under" lines={2} />
              </Section>
            )}

            {show(5) && (
              <Section n={13} title="A year in" sub="From Module 7.">
                <Ask id="7.2" />
              </Section>
            )}

            <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              Print this again at weeks 6 and 12, so one bad Tuesday does not decide it.
            </div>
          </div>
        </Card>

        <div className="no-print" style={{ textAlign: "center", margin: "14px 0 34px", fontSize: 13.5 }}>
          <a href="/course" style={{ color: "var(--accent)", fontWeight: 600 }}>← Your lessons</a>
          <span style={{ color: "var(--light)", margin: "0 10px" }}>·</span>
          <a href="/api/course/workbook?f=pdf" style={{ color: "var(--accent)", fontWeight: 600 }}>Blank copy to write in (PDF)</a>
        </div>
      </div>
    </PageShell>
  );
}
