"use client";
// Interactive lessons for Modules 0 and 1. Each receives the saved answer for
// its lesson, a save callback, and a `finish` callback that marks the lesson
// (and, for action lessons, the action) complete.
import { useMemo, useState, type ReactNode } from "react";
import { PATHS } from "@/lib/quiz";
import { DIAL_PROFILES } from "@/lib/course";
import { Btn, Panel, Slider, font } from "./ui";
import { Explainer } from "./Explainer";
import { fiveStagesScenes, threeLiesScenes, STAGE_META, StageRoad } from "./scenes";

export interface LessonProps { answer: any; save: (v: any) => void; finish: (opts?: { action?: boolean }) => void; done: boolean }

const H = ({ children }: { children: ReactNode }) => <h3 style={{ fontFamily: font.serif, fontSize: 21, fontWeight: 700, margin: "0 0 10px" }}>{children}</h3>;
const P = ({ children, style = {} }: { children: ReactNode; style?: any }) => <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text)", margin: "0 0 14px", ...style }}>{children}</p>;
const Muted = ({ children }: { children: ReactNode }) => <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 12px" }}>{children}</p>;
const Quote = ({ text, from }: { text: string; from: string }) => (
  <blockquote style={{ margin: "0 0 14px", padding: "10px 14px", borderLeft: "3px solid var(--accent)", background: "var(--accent-bg-subtle)", borderRadius: "0 10px 10px 0", fontSize: 15, lineHeight: 1.55 }}>
    <span style={{ fontStyle: "italic" }}>&ldquo;{text}&rdquo;</span> <span style={{ fontSize: 12, color: "var(--muted)" }}>&middot; {from}</span>
  </blockquote>
);
const Saved = ({ text = "Saved. Your map is updated." }: { text?: string }) => (
  <span className="tos-fade" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>&#10003; {text}</span>
);
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const rangeMid = (s: string) => { const m = s.replace(/,/g, "").match(/\d+/g)?.map(Number) || []; return m.length >= 2 ? (m[0] + m[1]) / 2 : m[0] || 0; };

/* ------------------------------ 0.1 Welcome ------------------------------ */
export function Welcome({ finish, done }: LessonProps) {
  return (
    <div>
      <VideoSlot title="Welcome from James" minutes={3} poster="This one is recorded on camera." />
      <Panel style={{ marginTop: 16 }}>
        <H>Script (what the video says)</H>
        <P>Hi. I'm James. I was a school and clinic SLP, and now I do marketing at a health-tech company. I built this because the two pieces of advice I got when I wanted out were &ldquo;tough it out&rdquo; and &ldquo;start over,&rdquo; and both were wrong.</P>
        <P>This program is ninety days. Six modules, short lessons, one action each. You will not watch anything longer than twelve minutes, and you will never be asked to do something vague. Every number in here comes from documented SLP transitions and public salary data, and the source sits under every lesson.</P>
        <P>You won&rsquo;t get cheerleading here, or a promise of six figures by fall. What you get is a map with the mileage marked, drawn by someone who has driven it. Some people finish in six weeks. Most take the full ninety days alongside a full-time caseload, which is how I designed it.</P>
        <P>If it doesn&rsquo;t help, write to me inside thirty days and you get your money back. No form, no call. Let&rsquo;s set your starting line.</P>
      </Panel>
      <div style={{ marginTop: 16 }}>{done ? <Saved text="Watched." /> : <Btn onClick={() => finish()}>Mark as watched</Btn>}</div>
    </div>
  );
}

export function VideoSlot({ title, minutes, poster }: { title: string; minutes: number; poster: string }) {
  return (
    <div style={{ aspectRatio: "16 / 9", borderRadius: 16, background: "linear-gradient(160deg, #0A3D31 0%, #0B6B54 70%, #00A080 100%)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(16px, 4vw, 32px)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 18, left: 20, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Transition OS · video</div>
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, paddingLeft: 5 }}>▶</div>
      <div style={{ fontFamily: font.serif, fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{minutes} min · {poster} Recording slot: James, from the script below.</div>
    </div>
  );
}

/* --------------------------- 0.2 Starting line --------------------------- */
const FLOORS = ["Must match my SLP pay from day one", "I can take a small dip for better conditions", "I have runway for a bigger jump"];
const plus90 = () => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().slice(0, 10); };

export function StartingLine({ answer, save, finish, done }: LessonProps) {
  const a = answer || {};
  const [stage, setStage] = useState<string>(a.stage || "");
  const [path, setPath] = useState<string>(a.path || "");
  const [floor, setFloor] = useState<number>(a.floor ?? -1);
  const [date, setDate] = useState<string>(a.date || plus90());
  const ok = stage && floor >= 0 && date;
  const submit = () => { save({ stage, path, floor, date }); finish({ action: true }); };
  return (
    <div>
      <Panel>
        <H>1. Which of these sounds most like right now?</H>
        {STAGE_META.map((s) => <Choice key={s.key} on={stage === s.key} onClick={() => setStage(s.key)}><b>{s.n}.</b> {s.name}: <span style={{ color: "var(--muted)" }}>&ldquo;{s.belief}&rdquo;</span></Choice>)}
      </Panel>
      <Panel style={{ marginTop: 14 }}>
        <H>2. A path, if you have one</H>
        <Muted>Optional. Imported from your quiz result when you bought through it. Leave it on &ldquo;Not sure yet&rdquo; and Module 2 picks it with you. Nothing before then needs it: the mindset, r&eacute;sum&eacute;, LinkedIn and networking lessons work for any title. A path only changes which examples, job postings and artifact brief you see.</Muted>
        <select value={path} onChange={(e) => setPath(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", fontFamily: font.sans }}>
          <option value="">Not sure yet</option>
          {Object.values(PATHS).map((p) => <option key={p.slug} value={p.slug}>{p.label} · {p.range}</option>)}
        </select>
      </Panel>
      <Panel style={{ marginTop: 14 }}>
        <H>3. Your income floor</H>
        {FLOORS.map((f, i) => <Choice key={f} on={floor === i} onClick={() => setFloor(i)}>{f}</Choice>)}
      </Panel>
      <Panel style={{ marginTop: 14 }}>
        <H>4. Target date</H>
        <Muted>Ninety days out is the default. Fast paths (liaison, UR, clinical educator) fit inside it. Long builds run 6–15 months and the map stretches to match.</Muted>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: "10px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans }} />
      </Panel>
      <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={submit} disabled={!ok}>Save my starting line</Btn>
        {done ? <Saved /> : !ok && <span style={{ fontSize: 13, color: "var(--muted)" }}>Stage and income floor are the two that matter.</span>}
      </div>
    </div>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, borderRadius: 10, border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg-subtle)" : "var(--card)", color: on ? "var(--accent)" : "var(--text)", fontSize: 15, lineHeight: 1.45, cursor: "pointer", fontFamily: font.sans, fontWeight: on ? 600 : 400 }}>
      {children}
    </button>
  );
}

/* ------------------------- 0.3 / 1.1 explainers -------------------------- */
export function ThreeLies({ finish, done }: LessonProps) {
  return <div><Explainer title="Three lies, three guardrails" scenes={threeLiesScenes} onFinished={() => { if (!done) finish(); }} /></div>;
}

export function FiveStages({ answer, save, finish, done }: LessonProps) {
  const [picked, setPicked] = useState<string>(answer?.stage || "");
  return (
    <div>
      <Explainer title="You're allowed to want out" scenes={fiveStagesScenes} onFinished={() => { if (!done) finish(); }} />
      <Panel style={{ marginTop: 16 }} tone="soft">
        <H>Find yours</H>
        <Muted>Tap the stage that sounds most like this week. It sets the first line of your map, and it can change next week.</Muted>
        <StageRoad active={STAGE_META.findIndex((s) => s.key === picked) + 1} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginTop: 8 }}>
          {STAGE_META.map((s) => <Choice key={s.key} on={picked === s.key} onClick={() => { setPicked(s.key); save({ stage: s.key }); }}><b>{s.n}</b> {s.name}</Choice>)}
        </div>
        {picked && <div className="tos-rise" style={{ marginTop: 10, fontSize: 15 }}><b>Your move this week:</b> {STAGE_META.find((s) => s.key === picked)!.move}</div>}
      </Panel>
    </div>
  );
}

/* ---------------------------- 1.2 Decision tree --------------------------- */
type Verdict = "workplace" | "fit" | "season";
const QS: { q: string; yes: Partial<Record<Verdict, number>>; no: Partial<Record<Verdict, number>>; help?: string }[] = [
  { q: "If the conditions were decent (a fair caseload, real documentation time, a manager who backs you), would the clinical work itself still light you up?", yes: { workplace: 2 }, no: { fit: 2 } },
  { q: "Have you already changed settings (schools to clinic, SNF to outpatient) and had the feeling follow you?", yes: { fit: 2 }, no: { workplace: 1 } },
  { q: "Is something outside work taking most of what you've got right now: a new baby, health, grief, a move?", yes: { season: 2 }, no: {} },
  { q: "Would any job feel impossible this month, even a good one?", yes: { season: 2 }, no: {} },
  { q: "Do you catch yourself more interested in the data, the training, the coordination or the tech around therapy than in the therapy itself?", yes: { fit: 2 }, no: { workplace: 1 } },
  { q: "Is the thing draining you a specific person, a specific building, or a specific productivity number?", yes: { workplace: 2 }, no: { fit: 1 } },
];
const VERDICTS: Record<Verdict, { title: string; body: string; next: string }> = {
  workplace: { title: "Bad workplace", body: "The profession might be fine and your setting is not. The thing draining you is a specific administrator, building or productivity requirement. That is a job problem, and the boring truth is that changing the conditions first is faster than changing careers, and it protects you from trading one burnout for a new-field version of the same burnout.", next: "Change the conditions first: setting, hours, employer. Keep this program as the plan behind the plan. One transitioner's version, from the forums: change settings as you leave the field, not instead of leaving it. If the feeling follows you to the new setting, come back to this lesson; the verdict will have changed." },
  fit: { title: "Bad fit", body: "The conditions could be perfect and you'd still feel it. The sessions drain you. You're more interested in the data, the training, the coordination and the technology around the therapy than in the therapy. You may have switched settings already and watched the feeling follow you. That's your interests talking, and they don't usually stop.", next: "Continue. Modules 2 to 5 are built for exactly this verdict. Your first move is the sunk-cost audit, next lesson, so the money question stops running the decision from the background." },
  season: { title: "Bad season", body: "Life outside work is taking everything you've got, and any job would feel impossible right now. This deserves real caution: burnt-out brains struggle with executive function, and planning a career change is one of the most executive-function-heavy things you can do.", next: "Survive the season first. Reduce hours if you can. Lower the bar. The program will hold your place; nothing expires. Make the big decision with a brain that can make it, and rerun this lesson then." },
};

export function DecisionTree({ answer, save, finish, done }: LessonProps) {
  const [ans, setAns] = useState<(boolean | null)[]>(answer?.answers || Array(QS.length).fill(null));
  const [show, setShow] = useState<boolean>(!!answer?.verdict);
  const scores = useMemo(() => {
    const s: Record<Verdict, number> = { workplace: 0, fit: 0, season: 0 };
    ans.forEach((a, i) => { if (a === null) return; const add = a ? QS[i].yes : QS[i].no; for (const k in add) s[k as Verdict] += add[k as Verdict]!; });
    return s;
  }, [ans]);
  const verdict = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as Verdict;
  const complete = ans.every((a) => a !== null);
  const reveal = () => { save({ answers: ans, verdict }); setShow(true); if (!done) finish(); };
  return (
    <div>
      <P>When I wanted to quit, it turned out to be three different problems at once: my building, the work itself, and a rough year at home. These six questions pull them apart so you can fix the right one. Answer honestly. Nothing here is graded, and the verdict can change next month.</P>
      <Quote text="I've worked in several settings so can't imagine a setting change is the answer. It's all the same story, different font." from="a school SLP, r/slp" />
      <P>If that&rsquo;s you, pay attention to question two. Everyone who says they want out gets told to try a different setting, usually by people who haven&rsquo;t tried it themselves. If you&rsquo;ve already changed settings and the feeling followed you, that counts as evidence.</P>
      {QS.map((q, i) => (
        <Panel key={i} style={{ marginBottom: 10, padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", fontSize: 15, lineHeight: 1.5 }}><span style={{ color: "var(--accent)", fontWeight: 700, marginRight: 8 }}>{i + 1}</span>{q.q}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[true, false].map((v) => (
                <button key={String(v)} type="button" onClick={() => { const n = [...ans]; n[i] = v; setAns(n); setShow(false); }}
                  style={{ padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${ans[i] === v ? "var(--accent)" : "var(--border)"}`, background: ans[i] === v ? "var(--accent)" : "var(--card)", color: ans[i] === v ? "#fff" : "var(--text)", fontWeight: 600, cursor: "pointer", fontFamily: font.sans, fontSize: 14 }}>{v ? "Yes" : "No"}</button>
              ))}
            </div>
          </div>
        </Panel>
      ))}
      {!show && <Btn onClick={reveal} disabled={!complete} style={{ marginTop: 6 }}>Show my verdict →</Btn>}
      {show && (
        <div className="tos-rise" style={{ marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }} className="tos-two-col">
            {(["workplace", "fit", "season"] as Verdict[]).map((k) => (
              <div key={k} style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${k === verdict ? "var(--accent)" : "var(--border)"}`, background: k === verdict ? "var(--accent-bg-subtle)" : "var(--card)" }}>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{VERDICTS[k].title}</div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}><div className="tos-grow" style={{ height: "100%", width: `${Math.min(100, scores[k] * 16)}%`, background: k === verdict ? "var(--accent)" : "var(--light)" }} /></div>
              </div>
            ))}
          </div>
          <Panel tone="soft">
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>Your verdict</div>
            <div style={{ fontFamily: font.serif, fontSize: 26, fontWeight: 700, margin: "4px 0 10px" }}>{VERDICTS[verdict].title}</div>
            <P>{VERDICTS[verdict].body}</P>
            <P style={{ margin: 0 }}><b>What you do first:</b> {VERDICTS[verdict].next}</P>
          </Panel>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- 1.3 Sunk-cost audit -------------------------- */
export function SunkCost({ answer, save, finish, done }: LessonProps) {
  const a = answer || {};
  const [years, setYears] = useState<number>(a.years ?? 6);
  const [debt, setDebt] = useState<number>(a.debt ?? 40000);
  const [salary, setSalary] = useState<number>(a.salary ?? 97870);
  const [path, setPath] = useState<string>(a.path || "customer-success");
  const [months, setMonths] = useState<number>(a.months ?? 10);
  const [dip, setDip] = useState<number>(a.dip ?? 0);
  const p = PATHS[path];
  const target = rangeMid(p.range);
  const stay10 = salary * 10;
  const bridgeYears = months / 12;
  const move10 = salary * (1 - dip / 100) * bridgeYears + target * (10 - bridgeYears);
  const diff = move10 - stay10;
  const num = (v: number, set: (n: number) => void, step = 1000) => (
    <input type="number" value={v} step={step} onChange={(e) => set(Number(e.target.value) || 0)} style={{ width: "100%", padding: "9px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans }} />
  );
  const submit = () => { save({ years, debt, salary, path, months, dip, stay10, move10 }); if (!done) finish(); };
  return (
    <div>
      <P>There are two kinds of numbers in this decision: the ones you&rsquo;ve already spent, which stay the same whether you go or stay, and the ones still on the table. Putting them in separate columns is most of the work, and it&rsquo;s the part the guilt doesn&rsquo;t want you to do.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="tos-two-col">
        <Panel>
          <H>Already spent</H>
          <Muted>These do not change with the decision. Write them down so they stop pretending to.</Muted>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Years in the field</label>{num(years, setYears, 1)}
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Student debt remaining ($)</label>{num(debt, setDebt)}
          <Muted>More than two-thirds of CSD master&rsquo;s students graduate with unpaid debt; the most common band is $10,000 to $50,000 (ASHA, 2024). The balance is the same on both sides of this page. If you&rsquo;re on PSLF or income-driven repayment, the loan is a calendar, not a leash: Module 4 covers the 120-payment count, what employers qualify, and how people time the exit. Nothing on the market covers this, and the forums ask for it more than anything except a sample r&eacute;sum&eacute;.</Muted>
        </Panel>
        <Panel>
          <H>Still live</H>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Current salary ($)</label>{num(salary, setSalary)}
          <Muted>Default is the BLS median for SLPs, May 2025: $97,870. The middle half earn $77,730 to $114,570.</Muted>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Target path</label>
          <select value={path} onChange={(e) => setPath(e.target.value)} style={{ width: "100%", padding: "9px 12px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans, marginBottom: 10 }}>
            {Object.values(PATHS).map((x) => <option key={x.slug} value={x.slug}>{x.label} · {x.range}</option>)}
          </select>
          <Slider label="Months to land it" left="6" right="24" value={((months - 6) / 18) * 100} onChange={(v) => setMonths(Math.round(6 + (v / 100) * 18))} format={() => `${months} months (typical: 6–15)`} />
          <Slider label="Pay dip during the bridge months, if you drop hours" left="0%" right="50%" value={dip * 2} onChange={(v) => setDip(Math.round(v / 2))} format={() => `${dip}%`} />
        </Panel>
      </div>
      <Panel tone="soft" style={{ marginTop: 14 }}>
        <H>The next ten years, side by side</H>
        <Bars a={stay10} b={move10} labelA="Stay" labelB={`Move to ${p.label}`} />
        <div className="tos-rise" style={{ marginTop: 12, fontSize: 16 }}>
          {diff >= 0 ? <><b style={{ color: "var(--accent)" }}>{money(diff)} more</b> over ten years, using the middle of the documented range and a {months}-month move.</> : <><b style={{ color: "#92400E" }}>{money(-diff)} less</b> over ten years at the middle of that range. On this path the pay cut is the expected outcome; treat it as a first step, not a destination.</>}
        </div>
        <Muted>These are your inputs against documented ranges, not a forecast. The range for {p.label} is {p.range}; the typical move takes {p.timeline}. {p.caveat}</Muted>
      </Panel>
      <Panel style={{ marginTop: 14 }}>
        <H>What the people who left say about the money</H>
        <Quote text="Sometimes a pay cut is worth sanity... and it may only be temporary anyway." from="r/SLPcareertransitions" />
        <Quote text="I make 10k more than I did as an SLP." from="r/slp, a former SLP now in tech" />
        <P style={{ margin: 0 }}>Across the forum threads, the people who took a cut describe it as temporary, and the ones who earn more (an Epic analyst up $10k, a data analyst up $20k base) are the commenters everyone asks questions of. The reframe that gets the most nods is the one you can use tonight: the degree isn&rsquo;t a sunk cost, it&rsquo;s a backup plan. One poster called the C&rsquo;s a fishing licence.</P>
      </Panel>
      <Panel tone="warm" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#92400E", marginBottom: 6 }}>Why the tuition feels refundable</div>
        <P style={{ margin: 0, fontSize: 14 }}>Arkes and Blumer (1985) gave theatre-goers randomly discounted season tickets. The people who paid full price went to more plays, because of what they had already spent. The money was gone either way. The tuition is gone either way too. The only thing still on the table is where the next ten years go.</P>
      </Panel>
      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={submit}>Save my numbers</Btn>
        {done && <Saved />}
      </div>
    </div>
  );
}

function Bars({ a, b, labelA, labelB }: { a: number; b: number; labelA: string; labelB: string }) {
  const max = Math.max(a, b) || 1;
  const row = (label: string, v: number, hi: boolean) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{label}</span><b>{money(v)}</b></div>
      <div style={{ height: 22, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
        <div key={v} className="tos-grow" style={{ height: "100%", width: `${(v / max) * 100}%`, background: hi ? "var(--accent)" : "var(--light)" }} />
      </div>
    </div>
  );
  return <div>{row(labelA, a, a >= b)}{row(labelB, b, b > a)}</div>;
}


/* ------------------------- 1.4a Energy audit ------------------------- */
/* Adapted from the Jobs to Be Done work of Bob Moesta and Clayton Christensen,
   and from Cliff Maxwell's energy-profile exercise. The SLP-specific task
   prompts and the mapping onto our eleven paths are ours. */

const SLP_TASKS = [
  "Direct therapy sessions", "Evaluations and report writing", "IEP or care-plan meetings",
  "Progress notes and documentation", "Parent and family conversations", "Supervising CFs or students",
  "Training colleagues or staff", "Scheduling and caseload management", "Insurance, authorisations, appeals",
  "Data collection and progress monitoring", "Choosing or trialling AAC and devices", "Materials and resource creation",
  "Meetings with administrators", "Advocating for a client or a service", "Learning a new system or platform",
];
/* Which paths each task points at when it energises someone. Mirrors the
   scoring weights in lib/quiz.ts rather than inventing a second system. */
const TASK_PATHS: Record<string, string[]> = {
  "Direct therapy sessions": ["clinical-educator", "customer-success"],
  "Evaluations and report writing": ["research-coordinator", "liaison-ur", "data-analysis"],
  "IEP or care-plan meetings": ["project-management", "leadership", "customer-success"],
  "Progress notes and documentation": ["informatics", "liaison-ur"],
  "Parent and family conversations": ["customer-success", "sales-bd", "clinical-educator"],
  "Supervising CFs or students": ["clinical-educator", "instructional-design", "leadership"],
  "Training colleagues or staff": ["clinical-educator", "instructional-design", "sales-bd"],
  "Scheduling and caseload management": ["project-management", "leadership"],
  "Insurance, authorisations, appeals": ["liaison-ur"],
  "Data collection and progress monitoring": ["data-analysis", "research-coordinator", "informatics"],
  "Choosing or trialling AAC and devices": ["sales-bd", "clinical-educator", "customer-success"],
  "Materials and resource creation": ["instructional-design", "content-marketing"],
  "Meetings with administrators": ["leadership", "project-management"],
  "Advocating for a client or a service": ["sales-bd", "liaison-ur", "content-marketing"],
  "Learning a new system or platform": ["informatics", "data-analysis", "instructional-design"],
};

type EnergyState = Record<string, "up" | "down" | undefined>;

export function EnergyAudit({ answer, save, finish, done }: LessonProps) {
  const [e, setE] = useState<EnergyState>(answer?.energy || {});
  const [custom, setCustom] = useState<string[]>(answer?.custom || []);
  const [draft, setDraft] = useState("");
  const tasks = [...SLP_TASKS, ...custom];
  const ups = tasks.filter((t) => e[t] === "up");
  const downs = tasks.filter((t) => e[t] === "down");

  const ranked = useMemo(() => {
    const score: Record<string, number> = {};
    for (const t of ups) for (const slug of TASK_PATHS[t] || []) score[slug] = (score[slug] || 0) + 1;
    for (const t of downs) for (const slug of TASK_PATHS[t] || []) score[slug] = (score[slug] || 0) - 0.5;
    return Object.entries(score).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([slug]) => slug);
  }, [ups.join("|"), downs.join("|")]);

  const set = (t: string, v: "up" | "down") => setE((prev) => ({ ...prev, [t]: prev[t] === v ? undefined : v }));

  return (
    <div>
      <P>
        You know your skills better than you know the conditions you need, because you have been too busy doing the
        job to notice which parts of it you would happily do again on a Saturday. That is the thing worth knowing
        before you choose a direction, and it is sitting in your last month of work.
      </P>
      <P>
        Go through the list below and mark what gave you energy and what took it. Ignore whether you are good at it,
        because competence and energy are different things, and plenty of careers get built on something a person does
        well and quietly resents.
      </P>
      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <H>Your last month of work</H>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{ups.length}</span> gave energy ·{" "}
            <span style={{ color: "#92400E", fontWeight: 700 }}>{downs.length}</span> took it
          </span>
        </div>
        {tasks.map((t) => {
          const v = e[t];
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ flex: 1, fontSize: 14.5, color: v ? "var(--text)" : "var(--muted)" }}>{t}</span>
              <button type="button" onClick={() => set(t, "up")} aria-label={`${t} gave me energy`}
                style={{ padding: "5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font.sans,
                  border: `1.5px solid ${v === "up" ? "var(--accent)" : "var(--border)"}`,
                  background: v === "up" ? "var(--accent)" : "var(--card)", color: v === "up" ? "#fff" : "var(--muted)" }}>Gave energy</button>
              <button type="button" onClick={() => set(t, "down")} aria-label={`${t} took energy`}
                style={{ padding: "5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font.sans,
                  border: `1.5px solid ${v === "down" ? "#DC6803" : "var(--border)"}`,
                  background: v === "down" ? "var(--warn-bg)" : "var(--card)", color: v === "down" ? "#92400E" : "var(--muted)" }}>Took it</button>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input value={draft} onChange={(ev) => setDraft(ev.target.value)} placeholder="Something else you spent time on"
            style={{ flex: 1, padding: "9px 12px", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, fontFamily: font.sans }} />
          <Btn outline onClick={() => { if (draft.trim()) { setCustom([...custom, draft.trim()]); setDraft(""); } }}>Add</Btn>
        </div>
      </Panel>

      {(ups.length > 0 || downs.length > 0) && (
        <div className="tos-rise" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <Panel tone="soft">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Gave you energy</div>
            {ups.length ? ups.map((t) => <div key={t} style={{ fontSize: 14, lineHeight: 1.5, padding: "3px 0" }}>{t}</div>) : <Muted>Nothing marked yet.</Muted>}
          </Panel>
          <Panel tone="warm">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#92400E", marginBottom: 8 }}>Took it</div>
            {downs.length ? downs.map((t) => <div key={t} style={{ fontSize: 14, lineHeight: 1.5, padding: "3px 0" }}>{t}</div>) : <Muted>Nothing marked yet.</Muted>}
          </Panel>
        </div>
      )}

      {ranked.length > 0 && (
        <Panel className="tos-rise" style={{ marginTop: 14 }}>
          <H>What that points at</H>
          <Muted>
            Paths whose day-to-day is built out of the work you marked as energising. This is a hint rather than an
            answer, and the dials in the next section sharpen it.
          </Muted>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ranked.map((slug) => { const pp = PATHS[slug]; return (
              <span key={slug} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, background: "var(--accent-bg-subtle)", border: "1px solid var(--accent-bg)", fontSize: 13.5, fontWeight: 600 }}>
                {pp.icon} {pp.label}
              </span>); })}
          </div>
        </Panel>
      )}

      <Panel tone="soft" style={{ marginTop: 14 }}>
        <H>One thing to notice</H>
        <P style={{ margin: 0 }}>
          If documentation drained you but the data itself did not, that is a different finding from disliking both,
          and it points somewhere quite specific. The same goes for meetings: running one is a different job from
          sitting in one, and the paths that reward each are not the same.
        </P>
      </Panel>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => { save({ energy: e, custom, energyPaths: ranked }); if (!done) finish(); }} disabled={ups.length === 0}>Save my audit</Btn>
        {done && <Saved />}
        {ups.length === 0 && <span style={{ fontSize: 13, color: "var(--muted)" }}>Mark at least one thing that gave you energy.</span>}
      </div>
    </div>
  );
}

/* -------------------------------- 1.4 Dials ------------------------------- */
const DIALS: { key: keyof typeof DIAL_PROFILES[string]; label: string; left: string; right: string }[] = [
  { key: "pay", label: "Pay floor", left: "I have runway", right: "Must match SLP pay now" },
  { key: "clinical", label: "Distance from clinical", left: "Clean break", right: "Stay close" },
  { key: "people", label: "Live people-time", left: "As little as possible", right: "Still love 1:1" },
  { key: "tech", label: "New tools and software", left: "Rather work with people", right: "Colleagues come to me" },
];
export function Dials({ answer, save, finish, done, all }: LessonProps & { all?: Record<string, any> }) {
  const fromAudit: string[] = all?.["1.4"]?.energyPaths || [];
  const [v, setV] = useState<Record<string, number>>(answer?.dials || { pay: 70, clinical: 60, people: 60, tech: 50 });
  const ranked = useMemo(() => Object.entries(DIAL_PROFILES).map(([slug, prof]) => {
    const d = DIALS.reduce((s, x) => s + Math.abs(prof[x.key] - v[x.key] / 100), 0) / DIALS.length;
    return { slug, fit: Math.round((1 - d) * 100) };
  }).sort((a, b) => b.fit - a.fit), [v]);
  const top = ranked.slice(0, 3);
  return (
    <div>
      <P>Set these four where you actually are this month, not where you&rsquo;d like to be. The paths on the right reorder as you move them, and the three at the top are the ones worth reading first.</P>
      {fromAudit.length > 0 && (
        <Panel tone="soft" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            <b>Your energy audit pointed at {fromAudit.map((s2) => PATHS[s2]?.label).filter(Boolean).join(", ")}.</b> If the
            dials disagree, that is worth sitting with, because the audit is built from what you actually did and the
            dials are built from what you think you want.
          </div>
        </Panel>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="tos-two-col">
        <Panel>{DIALS.map((d) => <Slider key={d.key} label={d.label} left={d.left} right={d.right} value={v[d.key]} onChange={(n) => setV({ ...v, [d.key]: n })} />)}</Panel>
        <div>
          {top.map((t, i) => { const p = PATHS[t.slug]; return (
            <div key={t.slug} className="tos-rise" style={{ animationDelay: `${i * 80}ms`, padding: 14, borderRadius: 12, border: `1.5px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`, background: i === 0 ? "var(--accent-bg-subtle)" : "var(--card)", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.icon} {p.label}</div>
                <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>{t.fit}% fit</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, margin: "2px 0 6px" }}>{p.range} · typically {p.timeline}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{p.why}</div>
            </div>); })}
          <Muted>Fit is how close your dials sit to each path&rsquo;s profile, using the same weights as the free quiz. Treat it as a ranking to explore. Module 2 makes the actual choice with your r&eacute;sum&eacute; in hand.</Muted>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => { save({ dials: v, top: top.map((t) => t.slug) }); if (!done) finish(); }}>Save these three to my map</Btn>
        {done && <Saved />}
      </div>
    </div>
  );
}

/* ------------------------------- 1.5 Still you ----------------------------- */
const STORIES = [
  { img: "https://slptransitions.com/wp-content/uploads/2026/08/caitlin-mueller-avatar-v1.jpg", name: "Caitlin Mueller", was: "School-based SLP", now: "Marketing Manager at an AAC device maker", kept: "Explaining a device to the people who have to trust it.", href: "https://slptransitions.com/clinical-consultant-and-marketing/" },
  { img: "https://slptransitions.com/wp-content/uploads/2026/08/lindsey-ison-avatar-v1.jpg", name: "Lindsey Ison", was: "SLP", now: "Enablement Consultant at a tech firm", kept: "Coaching people through something difficult. Now it's software instead of therapy.", href: "https://slptransitions.com/enablement-consultant/" },
  { img: "https://slptransitions.com/wp-content/uploads/2026/08/bethany-riebock-avatar-v1.jpg", name: "Bethany Riebock", was: "Medical SLP and rehab director", now: "UX Researcher", kept: "Watching how people actually use a thing, then telling the truth about it.", href: "https://slptransitions.com/slp-to-ux/" },
];
export function Identity({ finish, done }: LessonProps) {
  return (
    <div>
      <VideoSlot title="Still you" minutes={5} poster="On camera." />
      <Panel style={{ marginTop: 16 }}>
        <H>Script</H>
        <P>Every SLP I&rsquo;ve interviewed who left took something with them, and it was never the title. It was the part of the work that was actually them: explaining hard things simply, holding a room of people to a plan they didn&rsquo;t want, reading a page of data and knowing what to do next. In every case, that part turned out to be the thing they were hired for.</P>
        <P>Here are three, thirty seconds each. Watch for what each of them kept.</P>
        <Quote text="I've taken a long time to grieve the loss of who I was in my previous role." from="a comment on a former SLP's essay about leaving" />
        <P style={{ margin: 0 }}>Grief is the right word, and it&rsquo;s the word the people who left use most. One of them called leaving a completion rather than a failure. You chose this field at 22, before you knew yourself. Finishing it is allowed.</P>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }} className="tos-two-col">
        {STORIES.map((s, i) => (
          <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="tos-rise tos-card-hover" style={{ animationDelay: `${i * 120}ms`, textDecoration: "none", color: "inherit", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt={s.name} width={64} height={64} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", display: "block", marginBottom: 10, border: "3px solid var(--accent-bg)" }} />
            <div style={{ fontWeight: 700 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 8px" }}>{s.was} <span aria-hidden>→</span> {s.now}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}><b style={{ color: "var(--accent)" }}>Kept:</b> {s.kept}</div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>{done ? <Saved text="Watched." /> : <Btn onClick={() => finish()}>Mark as watched</Btn>}</div>
    </div>
  );
}

/* ------------------------------ 1.6 Tell one ------------------------------ */
const WHO = ["A partner", "A friend outside the field", "A colleague who already left", "A therapist or coach", "Someone else"];
export function TellOne({ answer, save, finish, done }: LessonProps) {
  const [who, setWho] = useState<string>(answer?.who || "");
  return (
    <div>
      <P>Keeping this to yourself is more tiring than it looks. You clear the search history, keep your face neutral in the staff room, and carry the whole thing alone. Telling one person, in one sentence, takes most of that weight off, and it doesn&rsquo;t commit you to anything.</P>
      <Panel>
        <H>Who</H>
        <Muted>Someone who won&rsquo;t argue with you. Arguing comes later, if ever.</Muted>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{WHO.map((w) => <button key={w} type="button" onClick={() => setWho(w)} style={{ padding: "8px 14px", borderRadius: 999, border: `1.5px solid ${who === w ? "var(--accent)" : "var(--border)"}`, background: who === w ? "var(--accent-bg-subtle)" : "var(--card)", color: who === w ? "var(--accent)" : "var(--text)", cursor: "pointer", fontFamily: font.sans, fontSize: 14, fontWeight: who === w ? 600 : 400 }}>{w}</button>)}</div>
      </Panel>
      <Panel tone="soft" style={{ marginTop: 14 }}>
        <H>The sentence</H>
        <div style={{ fontFamily: font.serif, fontSize: 22, lineHeight: 1.35 }}>&ldquo;I&rsquo;m looking at what else I could do with my SLP background.&rdquo;</div>
        <Muted>No plan. No date. No defence. If they ask what, say &ldquo;I don&rsquo;t know yet, I&rsquo;m finding out.&rdquo; That answer is true and it ends the conversation on your terms.</Muted>
      </Panel>
      <Panel style={{ marginTop: 14 }}>
        <H>If they push back</H>
        <Muted>Two replies show up in every forum thread about leaving, and you&rsquo;ll hear both eventually. Have the answer ready so it doesn&rsquo;t cost you anything.</Muted>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="tos-two-col">
          <div style={{ padding: 12, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 14, lineHeight: 1.5 }}><b>&ldquo;Have you tried a different setting?&rdquo;</b><br />&ldquo;Twice. The feeling came with me. I&rsquo;m looking at the work itself now.&rdquo;</div>
          <div style={{ padding: 12, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 14, lineHeight: 1.5 }}><b>&ldquo;There&rsquo;s a shortage. This makes it worse.&rdquo;</b><br />&ldquo;A burnt-out clinician isn&rsquo;t a gift to the kids. They deserve someone who wants to be in the room.&rdquo;</div>
        </div>
      </Panel>
      {!done ? <Btn onClick={() => { save({ who }); finish({ action: true }); }} style={{ marginTop: 16 }} disabled={!who}>I told someone ✓</Btn>
             : <div style={{ marginTop: 16, color: "var(--accent)", fontWeight: 600 }}>Done. That was the hardest sentence in the program.</div>}
    </div>
  );
}

/* ------------------------------ 1.7 Checkpoint ----------------------------- */
const PULL = ["I want to work at the scale of a system instead of one room.", "I want to build the training instead of deliver it.", "I want to use what I know about clinicians to make a product they'll actually use."];
export function Checkpoint1({ answer, save, finish, done, all }: LessonProps & { all: Record<string, any> }) {
  const [why, setWhy] = useState<string>(answer?.why || "");
  const verdict = all["1.2"]?.verdict as Verdict | undefined;
  const top: string[] = all["1.5"]?.top || [];
  const stage = all["1.1"]?.stage || all["0.2"]?.stage;
  const push = /burn|exhaust|hate|can't|cannot|paperwork|productivity|toxic|miserable/i.test(why);
  return (
    <div>
      <P>Before you move on, gather the three things you worked out this week and write one sentence about where you&rsquo;re going. That sentence opens Explore, and it will follow you into your cover letter and your interviews.</P>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="tos-two-col">
        <Stat label="Stage" value={stage ? STAGE_META.find((s) => s.key === stage)?.name || "Set" : "Not set"} ok={!!stage} href="/course/ground/1.1" />
        <Stat label="Verdict" value={verdict ? VERDICTS[verdict].title : "Not set"} ok={!!verdict} href="/course/ground/1.2" />
        <Stat label="Top paths" value={top.length ? top.map((s) => PATHS[s]?.label).join(", ") : "Not set"} ok={top.length > 0} href="/course/ground/1.5" />
      </div>
      <Panel style={{ marginTop: 14 }}>
        <H>Why I&rsquo;m leaving, in pull language</H>
        <Muted>One sentence about where you&rsquo;re going, not what you&rsquo;re escaping. It becomes the first line of your cover letter, your LinkedIn About, and your answer to &ldquo;why are you leaving clinical work?&rdquo;</Muted>
        <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} placeholder="I want to…" style={{ width: "100%", padding: 12, fontSize: 15, border: `1px solid ${push ? "var(--warn)" : "var(--border)"}`, borderRadius: 8, fontFamily: font.sans, lineHeight: 1.5 }} />
        {push && <div style={{ fontSize: 13, color: "#92400E", marginTop: 6 }}>That reads as push (what you&rsquo;re escaping). Hiring managers hear a retention risk. Try the shape below.</div>}
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>Examples:</div>
        {PULL.map((x) => <button key={x} type="button" onClick={() => setWhy(x)} style={{ display: "block", textAlign: "left", background: "none", border: "none", color: "var(--accent)", fontSize: 14, cursor: "pointer", padding: "4px 0", fontFamily: font.sans }}>&ldquo;{x}&rdquo;</button>)}
      </Panel>
      {!done ? <Btn onClick={() => { save({ why }); finish({ action: true }); }} disabled={why.trim().length < 12 || push} style={{ marginTop: 16 }}>Save and finish Module 1</Btn>
             : <Panel tone="soft" style={{ marginTop: 16 }}><b>Module 1 complete.</b> Explore is written and unlocks after James approves this sample. Your map on the dashboard already carries everything you set here.</Panel>}
    </div>
  );
}
function Stat({ label, value, ok, href }: { label: string; value: string; ok: boolean; href: string }) {
  return (
    <a href={href} style={{ textDecoration: "none", color: "inherit", padding: 14, borderRadius: 12, border: `1.5px solid ${ok ? "var(--accent-bg)" : "var(--border)"}`, background: ok ? "var(--accent-bg-subtle)" : "var(--card)", display: "block" }}>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{ok ? "✓" : "○"} {label}</div>
      <div style={{ fontWeight: 700, marginTop: 4, fontSize: 14, lineHeight: 1.4 }}>{value}</div>
    </a>
  );
}
