# Mindset & stage validation plan (2026-09-03)

## Why this exists
Our funnel speaks fluently to stages 4–5 of the emotional sequence in
voice-of-customer.md (practical panic → action): paths, pay, timelines, résumé,
$9 report, $24 suite. It barely speaks to stages 1–3 (private doubt, guilt and
identity, permission-seeking), which is where the quiz is supposed to sell and
where the list's reader mail says people actually are.

The two strongest competitor pieces are identity frameworks with no data:
ASHA's "7R" article (Reflect, Reframe, Research, Reach out, Reimagine,
Risk-take, Renew) and Rinki Varindani Desai's "9 career archetypes for SLPs"
(Clinical Specialist, Researcher, Educator, Leader, Entrepreneur, Innovator,
Advocate, Connector, Multi-Hyphenate). They validate first and never get to
"and here is what that pays". We do the opposite. The gap is the mirror image,
which means we can close it without becoming them: keep the data, add the
validation in front of it.

## What to ship, in order

### 1. Stage question in the quiz (small code change, biggest lever)
Add one non-scoring question at the start of "Your reality":
**"Which of these sounds most like right now?"**
- "I haven't told anyone I'm thinking about this." (stage 1)
- "I feel guilty even looking. The degree, the loans, the patients." (stage 2)
- "I keep reading exit stories and wondering if it's really possible." (stage 3)
- "I want out. I just don't know what else I could do." (stage 4)
- "I know what I want. I'm applying and not getting traction." (stage 5)

Store it (quiz-log + MailerLite field `stage`, create the field first: unknown
fields are dropped silently). Then use it in three places:

a) **Result page opener** (before the path card): one stage-matched line.
   - 1: "You don't have to tell anyone yet. Looking is allowed."
   - 2: "Wanting out doesn't undo the good you did. It also doesn't waste the
        degree: every path below runs on it."
   - 3: "It is possible. Three of the people on this site did it from exactly
        where you are, and their stories are linked under your result."
   - 4: "This page is the answer to 'what else'. Start with the one path below,
        not all twenty."
   - 5: "Skip the reading. Your résumé is the bottleneck, and that's fixable
        this week."
b) **Day-2 follow-up email variant** by stage (stages 1–3 get the story link
   and no pitch; 4 gets the first move; 5 gets the $9 report).
c) **Reporting**: the stage split tells us what the list actually needs.

### 2. Article: "You're allowed to want out: the five stages of leaving clinical SLP work"
Pillar-adjacent, on slptransitions.com. Targets the searches that currently
route to Reddit ("I hate being an SLP", "SLP burnout should I quit", "leaving
speech pathology"). Structure = the five stages, each with: what it feels like
(echo the VoC themes: the car cry once, degree grief, identity fusion, fear of
the bottom rung), the false belief that keeps people stuck there, the one
thing that moves someone to the next stage, and a link to the asset that does
it (stage 2 → transferable-skills post; 3 → real-transition stories; 4 →
20-paths pillar and quiz; 5 → résumé post and the suite). Ends on identity
continuity, never "reinvent yourself".

### 3. Article: "What you're actually optimizing for" (our answer to archetypes)
Rinki's archetypes ask "who are you". Ours should ask "what are you protecting"
because that is what the quiz already measures: pay floor, hours available,
distance from clinical, live people-time, appetite for new tools. Five dials,
each with the paths that fit and the pay that comes with them. It reads as
self-knowledge but lands on real numbers, which her piece can't.

### 4. Stories as permission (format is the value)
The most-upvoted exit posts are plain testimony. Every real-transition story on
the site should carry a short "where I was when I started looking" box at the
top (stage, setting, years in). Ask for it in the story form on /about; add it
to the five unpublished interviews when they go out.

### 5. Map the 7Rs to our assets (and see the hole)
- Reflect → quiz
- Reframe → transferable-skills post, "you're not wasting your degree"
- Research → 20-paths pillar, companies list, /jobs
- Reach out → LinkedIn post, story form, podcast guests
- Reimagine → real-transition stories
- Risk-take → $9 report, $24 suite
- Renew → nothing. This is the PSLF / student-loan / part-time / rest gap
  already flagged in the Aug sweep. The "Renew" content (drop to part-time,
  telehealth as a bridge, what happens to PSLF if you leave) is the next
  unwritten piece after the stage article.

## Rules
- Every claim traces to research-facts.md or voice-of-customer.md.
- Echo themes; never fabricate quotes. Name the car cry at most once per piece.
- Identity continuity, not reinvention. No "journey".
