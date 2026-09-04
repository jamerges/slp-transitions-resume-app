"use client";
// Scenes for the animated explainers in Modules 0 and 1. Content traces to
// content/voice-of-customer.md (the five stages) and research-facts.md
// (the guardrails). Pure presentation; no state.
import { Big, Sub, Kicker, Strike, type Scene } from "./Explainer";
import { font } from "./ui";

export const STAGE_META = [
  { key: "private", n: 1, name: "Private doubt", belief: "Looking means deciding.", truth: "Looking is research, and nobody charges you for it.", move: "Work out which problem you have: bad workplace, bad fit, or bad season.",
    voice: "Maybe it's just a problem with my brain and not the job.", from: "a school SLP, r/slp" },
  { key: "guilt", n: 2, name: "Guilt and identity", belief: "Leaving wastes the degree.", truth: "The degree goes with you. Every path on the map runs on it, and it's a backup plan if you ever want one.", move: "Read the five fears so they stop running things from the back seat.",
    voice: "One thing I'm struggling with the most is the feeling that I'm \u2018throwing away\u2019 my degree.", from: "r/SLPcareertransitions" },
  { key: "permission", n: 3, name: "Permission-seeking", belief: "It works for other people, not me.", truth: "Jeannette, Rachel and Mattie had no shortcut you don't have.", move: "Pick one story with your starting point. Copy its first month.",
    voice: "Has anyone left the field and regretted it?", from: "r/slp, one of the most-replied threads of the year" },
  { key: "panic", n: 4, name: "Practical panic", belief: "I'd have to start over at the bottom.", truth: "Liaison roles pay $84k\u2013$135k and customer success $75k\u2013$120k, from day one.", move: "Pick one path and stop reading about the other nineteen.",
    voice: "I feel dumb when I look at other jobs. I have no idea how anything works outside of speech.", from: "r/SLPcareertransitions" },
  { key: "action", n: 5, name: "Action", belief: "If I were good enough, I'd get callbacks.", truth: "You're sorted by vocabulary in seven seconds, long before ability.", move: "Fix the r\u00e9sum\u00e9 before the next application.",
    voice: "I applied to more than 500 jobs. I built a portfolio, earned certifications, rewrote my resume and cover letters dozens of times.", from: "r/SLPcareertransitions" },
];

/** The road with five stops. `active` lights one; the line draws in on first paint. */
export function StageRoad({ active, compact = false }: { active: number; compact?: boolean }) {
  const W = 600, H = compact ? 70 : 90, y = H / 2;
  const xs = STAGE_META.map((_, i) => 40 + i * ((W - 80) / 4));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxWidth: 640 }} aria-hidden>
      <path className="tos-draw" d={`M${xs[0]} ${y} L${xs[4]} ${y}`} stroke="var(--accent-bg)" strokeWidth={6} fill="none" strokeLinecap="round" />
      {xs.map((x, i) => {
        const on = i + 1 === active, past = i + 1 < active;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={on ? 16 : 11} fill={on || past ? "var(--accent)" : "#fff"} stroke={on || past ? "var(--accent)" : "var(--border)"} strokeWidth={3} className={on ? "tos-pop" : undefined} />
            <text x={x} y={y + 1} dominantBaseline="middle" textAnchor="middle" fontSize={on ? 13 : 11} fontWeight={700} fill={on || past ? "#fff" : "var(--muted)"} fontFamily={font.sans}>{i + 1}</text>
            {!compact && <text x={x} y={y + 32} textAnchor="middle" fontSize={11} fill={on ? "var(--accent)" : "var(--muted)"} fontWeight={on ? 700 : 500} fontFamily={font.sans}>{STAGE_META[i].name.split(" ")[0]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export const fiveStagesScenes: Scene[] = [
  { id: "open", ms: 5200, caption: "Nobody quits clinical work in an afternoon. You leave in stages, and most of them look nothing like a decision.",
    render: () => (<><Kicker>Module 1 · Lesson 1</Kicker><Big>Nobody leaves in an afternoon.</Big><Sub>You leave in stages. Five of them, and they repeat for almost everyone.</Sub></>) },
  { id: "road", ms: 5600, caption: "Five stages, in order. What changes from person to person is how long you sit in each one.",
    render: () => (<><Kicker>The road</Kicker><StageRoad active={0} /><Sub delay={900}>How long you sit in each one usually comes down to a single belief you never checked.</Sub></>) },
  ...STAGE_META.map((s, i): Scene => ({
    id: s.key, ms: 7600,
    caption: `Stage ${s.n}: ${s.name}. In their words: "${s.voice}" The belief underneath: "${s.belief}" The move: ${s.move}`,
    render: () => (
      <>
        <StageRoad active={s.n} compact />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px, 3vw, 28px)", marginTop: 12 }} className="tos-two-col">
          <div>
            <Kicker>Stage {s.n}</Kicker>
            <Big>{s.name}</Big>
          </div>
          <div style={{ fontSize: "clamp(13px, 1.8vw, 16px)", lineHeight: 1.5 }}>
            <div className="tos-rise" style={{ animationDelay: "300ms", color: "var(--muted)" }}>The belief that keeps you here:</div>
            <div className="tos-rise" style={{ animationDelay: "500ms", fontWeight: 700, marginBottom: 10, fontSize: "1.05em" }}><Strike delay={2200}>{s.belief}</Strike></div>
            <div className="tos-rise" style={{ animationDelay: "2600ms", color: "var(--accent)", fontWeight: 600 }}>{s.truth}</div>
            <div className="tos-rise" style={{ animationDelay: "4200ms", marginTop: 10, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--accent-bg)", borderRadius: 10 }}><b>The move:</b> {s.move}</div>
          </div>
        </div>
        <div className="tos-fade" style={{ animationDelay: "1400ms", marginTop: 10, fontSize: "clamp(12px, 1.6vw, 14px)", color: "var(--muted)", fontStyle: "italic", maxWidth: 640 }}>
          &ldquo;{s.voice}&rdquo; <span style={{ fontStyle: "normal" }}>&middot; {s.from}</span>
        </div>
      </>
    ),
  })),
  { id: "close", ms: 6000, caption: "Nothing in the five stages asks you to become someone else. The title changes. The competence goes with you.",
    render: () => (<><Kicker>Still you</Kicker><Big>The title changes. The competence goes with you.</Big><Sub>The person who explains a diagnosis to a frightened parent and tracks outcomes on sixty people at once is the person every one of these roles is hiring.</Sub></>) },
];

const LIES = [
  { lie: "I'd have to start over.", truth: "A few moves are a step down, and the program names them. Most aren't: liaison, utilization review and customer success pay at or above clinical from day one." },
  { lie: "I need a certificate first.", truth: "A few roles do require one, and Module 2 says which. Most hire on translated experience and proof. One transitioner got the CAPM first and said no one took her seriously until she could show the work." },
  { lie: "I'd be throwing away my degree.", truth: "For liaison, UR, clinical education and speech-tech roles the license is the qualification. For a clean break like software, it's your backup plan rather than your credential." },
];
const GUARDRAILS = [
  { title: "Epic certification", fact: "Cannot be bought. An employer has to sponsor you. Anyone selling an \"Epic cert\" is selling something else.", route: "Sponsor-track analyst roles, go-live support gigs, CAHIMS." },
  { title: "Medical science liaison", fact: "Doctorate-gated at nearly every pharma company. A master's SLP does not clear the screen.", route: "Clinical educator or clinical specialist at device companies instead." },
  { title: "UX research", fact: "Oversaturated: about 35% more graduates in five years against flat openings.", route: "Health-tech UX with two to four deep case studies, if at all." },
];

export const threeLiesScenes: Scene[] = [
  { id: "open", ms: 4200, caption: "Three things I believed when I wanted out. All three were wrong, and each one kept me in the building longer than I needed to be.",
    render: () => (<><Kicker>Module 0 · Lesson 3</Kicker><Big>Three things I believed.</Big><Sub>About a minute each. I held all three, and I&rsquo;d guess you hold at least one.</Sub></>) },
  ...LIES.map((l, i): Scene => ({
    id: `lie${i}`, ms: 8200, caption: `Belief ${i + 1}: "${l.lie}" ${l.truth}`,
    render: () => (<><Kicker>Belief {i + 1} of 3</Kicker><Big><Strike delay={1600}>{l.lie}</Strike></Big><Sub delay={2400}>{l.truth}</Sub></>),
  })),
  { id: "close", ms: 5200, caption: "Those three were mine. Yours may be different, and Module 1 is where you find out.",
    render: () => (<><Kicker>Done</Kicker><Big>Those three were mine.</Big><Sub>Yours may be different. Module 1 is where you find out which one is running things.</Sub></>) },
];

/** Module 2, lesson 5. Path facts, not mindset, so they live with the paths. */
export const guardrailScenes: Scene[] = [
  { id: "gr", ms: 4000, caption: "Three things the advice forums get wrong about specific paths, and what to do instead.",
    render: () => (<><Kicker>Guardrails</Kicker><Big>Three facts the forums get wrong.</Big><Sub>Each one costs people months.</Sub></>) },
  ...GUARDRAILS.map((g, i): Scene => ({
    id: `g${i}`, ms: 7200, caption: `${g.title}: ${g.fact} Instead: ${g.route}`,
    render: () => (
      <>
        <Kicker>Guardrail {i + 1} of 3</Kicker>
        <Big>{g.title}</Big>
        <div className="tos-rise" style={{ animationDelay: "500ms", marginTop: 12, padding: "12px 16px", background: "var(--warn-bg)", border: "1px solid #FDE68A", borderRadius: 12, fontSize: "clamp(13px, 1.9vw, 16px)", lineHeight: 1.5, maxWidth: 560 }}>{g.fact}</div>
        <div className="tos-rise" style={{ animationDelay: "2600ms", marginTop: 10, fontSize: "clamp(13px, 1.9vw, 16px)", color: "var(--accent)", fontWeight: 600 }}>Instead: {g.route}</div>
      </>
    ),
  })),
];
