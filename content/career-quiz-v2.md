# Career Quiz v2 — rebuild spec

Based on analysis of 357 real responses (330 completed) from the current Typeform, cross-referenced against the July 2026 research in `research-facts.md`.

## What the data says about v1

**What's working — don't break it:**
- **92% completion rate.** Excellent. Only drop-off is 27 people after Q1. The length (8 questions) and tone are right.
- The gentle, low-pressure voice matches the brand and clearly isn't scaring people off.

**Three accuracy problems:**

### 1. The quiz can't return the paths where SLPs actually land
Only four endings exist: Client Success (46%), Coaching (20%), Admin (13%), Sales (13%).

Paths with documented SLP success that the quiz can *never* suggest:
Project/Program Management (the **most** documented successes, six-figure outcomes), Healthcare Data Analyst (Tier 1 — "$20k more than I ever made as an SLP"), Clinical Liaison ($84–135k, credential is sufficient), Utilization Review ($80–88k, remote-heavy), Clinical Informatics/EHR ($97–154k), Instructional Design, Content/Marketing, Clinical Educator at device companies ($75–116k).

### 2. 72% of respondents signal a path the quiz can't give them
236 of 330 completers chose answers indicating data/analysis, building resources and tools, systems thinking, or working at scale. All 236 were routed to Client Success, Sales, Coaching, or Admin because nothing else exists. Specifically:
- 34% picked "Building resources, clarifying information, or designing useful tools" (Q7) — that's **instructional design / content**, unavailable.
- 28% picked "Dig into research and use data to clarify" (Q4) — that's **data/analytics**, unavailable.
- 28% picked "Creating order from chaos — structuring systems and operations" (Q1) — that's **program/project management**, unavailable (routed to "Admin" instead, which is a different and often lower-paid job).

### 3. Two endings carry risk worth naming
- **Admin** (Office Manager, Scheduling Lead) is frequently a *lateral or downward* pay move from SLP. 47 people were pointed there.
- **Coaching** (20% of results) is among the *least* documented successful transitions in the research and has the least certain income. Worth keeping as an option, but honestly labeled.

**Low-discrimination questions to fix:** Q8 (50% pick one answer), Q6 (one option gets 7.6%), Q3 (46% pick one).

## v2 design principles

1. **Ask what they've done, not just what they like.** Feasibility is driven by concrete experience (EMR superuser, supervision, data, AAC tech, authorizations). This is the single biggest accuracy upgrade.
2. **Ask about constraints.** Income floor and timeline decide which paths are realistic. Naming them builds trust and is on-brand.
3. **Return real numbers.** Salary ranges and timelines, per `research-facts.md`. "SLP to 96K" is already brand-proven.
4. **Keep the gentle voice, drop the vagueness.** Warmth plus specifics, not warmth instead of specifics.

## v2 questions (8 — same length, better signal)

**Q1. Which of these have you actually done? (select all that apply)** ← *new, highest-value question*
- Been a superuser / helped roll out an EMR or new documentation system
- Supervised CFs, students, or trained colleagues
- Built a program, caseload system, or workflow from scratch
- Tracked and analyzed outcome data beyond required reporting
- Handled authorizations, appeals, or insurance documentation
- Chosen, trialed, or implemented AAC or assistive tech
- Created materials, handouts, or trainings others reused
- None of these yet — my experience is direct treatment

**Q2. When work feels genuinely good, what are you doing?**
- Creating order from chaos — designing systems and moving projects forward
- Helping one person get unstuck, in real time
- Finding the pattern in messy information
- Making something others use — a resource, guide, or tool
- Winning someone over to a plan they were unsure about

**Q3. What's your honest income requirement in the next role?**
- I need to match or beat my current SLP pay from day one
- I can take a small dip (up to ~10%) for better conditions
- I have runway and can invest 6–12 months in a bigger jump
- Income matters less than hours and flexibility right now

**Q4. How much time can you realistically put in outside work?**
- Almost none — I'm running on empty
- A couple hours a week
- A few hours a week, consistently
- I'm ready to go hard for a defined stretch

**Q5. How do you feel about people-facing work now?**
- I still love 1:1 — I just want better conditions and pay
- I want people contact, but as accounts/colleagues, not a caseload
- I'd rather influence people through systems, data, or content
- I want as little live people-time as possible for a while

**Q6. Which is closest to true?**
- I want to stay close to clinical — that knowledge is my edge
- I want clinical-adjacent, but out of direct care
- I want a clean break into business/tech
- I don't know yet

**Q7. What's your relationship with new tools and software?**
- I'm the one colleagues ask for help
- I learn what I need, when I need it
- I'd rather work with people than systems
- I actively enjoy learning new platforms

**Q8. If a door opened tomorrow, what would you regret NOT trying?**
- Running projects and programs at scale
- Working with the data behind the decisions
- Teaching, training, or designing how people learn
- Being the trusted expert clients rely on
- Telling the story — writing, content, marketing

## v2 endings (8) with the real numbers

Each ending should include: the honest salary range, realistic timeline, the entry door, one first move this week, and one honest caveat. All figures from `research-facts.md`.

| Ending | Slug | Range | Timeline | Entry door / honest note |
|---|---|---|---|---|
| **Customer Success / Implementation** | `customer-success` | $75–120k | 3–9 mo | Best odds-to-effort. At speech-tech/AAC companies your CCC *is* the credential. Enter via Implementation or Onboarding Specialist. |
| **Project / Program Management** | `project-management` | $85–100k+ | 12–15 mo | Most documented successes. Google PM cert (free) → CAPM ($175) → PMP. Honest: certs alone don't sell — translated experience does. |
| **Healthcare Data / Analytics** | `data-analysis` | $70–105k | 6–24 mo | Healthcare orgs, not big tech. Google Data cert route. Honest: one SLP sent 500+ applications — referrals cut that down. |
| **Clinical Liaison / Utilization Review** | `liaison-ur` | $80–135k | Fast | Your credential *is* the qualification — no bootcamp. Encompass Health, Select Medical, Lifepoint. Honest: you stay adjacent to the system you're leaving. |
| **Clinical Informatics / EHR** | `informatics` | $97–154k | 6–18 mo | EMR superuser work is the ticket. **Epic cert requires employer sponsorship** — target sponsor-track analyst roles; CAHIMS is the self-serve entry. |
| **Instructional Design / Learning** | `instructional-design` | $70–100k | 6–12 mo | Portfolio over certificates — 3–5 Storyline/Rise samples. Skip the $3k certificate. Honest: more competitive since the teacher influx. |
| **Content / Marketing** | `content-marketing` | $80–141k | ~12 mo | Explaining complex things to worried parents is the paid skill. Freelance starts small (one SLP began with a $200 article). |
| **Clinical Educator / Trainer** | `clinical-educator` | $75–116k | Moderate | Device/AAC companies: Tobii Dynavox, PRC-Saltillo, Lingraphica, Passy-Muir. Clinical credibility is the requirement. |

**Coaching:** keep as a *secondary* suggestion rather than a primary ending — it's the least documented path in the research and has the least certain income. If retained as an ending, say so plainly.

**Retire "Admin"** as an ending. People choosing "creating order from chaos" should route to Project/Program Management (real pay growth), not office administration (frequent pay cut).

## Scoring logic (simple and tunable)

Score each path 0–N; highest wins, second-highest becomes "also consider."

**Q1 (experience) — the heaviest weights, because evidence beats preference:**
- EMR/superuser → Informatics +3, PM +1
- Supervised/trained → Instructional Design +2, Clinical Educator +2, CS +1
- Built program/workflow → PM +3, Ops +1
- Analyzed data → Data +3, Informatics +1
- Authorizations/appeals → UR/Liaison +3
- AAC/assistive tech → CS +2 (speech-tech), Clinical Educator +2
- Created reused materials → Instructional Design +3, Content +2
- None yet → no penalty; rely on preference questions

**Q3/Q4 (constraints) — gates, not points:**
- "Must match pay day one" → suppress Instructional Design and Content (longer ramp); boost Liaison/UR, CS, Informatics
- "Almost no time outside work" → suppress paths needing portfolios (ID, Content, Data); boost Liaison/UR and CS
- "Runway for a bigger jump" → unlock Data, Informatics, PM

**Q5/Q6 (people + proximity):**
- Loves 1:1 → CS, Clinical Educator, Coaching
- Accounts not caseload → CS, Sales-adjacent, Liaison
- Systems/data/content → Data, Informatics, ID, Content
- Minimal live people-time → Data, Informatics, ID
- Stay close to clinical → Liaison/UR, Informatics, Clinical Educator
- Clean break → PM, Data, Content

**Q2/Q7/Q8:** +1–2 to the obvious matching path; use as tie-breakers.

## Redirect wiring (once v2 is built)

Set each Typeform ending to redirect to:
```
https://app.slptransitions.com/quiz?path=SLUG
```
Slugs are in the table above. `/quiz` already has copy for `customer-success`, `project-management`, `data-analysis`, `instructional-design`, `content-marketing`, `ux-research` — I'll add `liaison-ur`, `informatics`, and `clinical-educator` when v2 ships.

## Two funnel notes

1. **Add email capture before the result** if it isn't there already — quiz takers are the warmest possible list, and the current export has no email column.
2. **The 27 people who dropped after Q1** are the only leak. If Q1 becomes the "what have you done" multi-select, it'll feel more substantial and may hold them.
