---
name: product-copy
description: Write or edit any words a buyer sees on SLP Transitions product surfaces: landing and sales pages, course lessons, in-app UI, transactional and lifecycle emails, nav labels, buttons, error states. Use before shipping copy, and as a review pass on copy already written. Encodes James's corrections so the same mistakes stop recurring.
---

# Product copy for SLP Transitions

For **product surfaces**: sales pages, in-app UI, lesson bodies, buttons, nav,
emails, error states. For articles and essays use `slp-transitions-writer`. For
checking against how SLPs actually speak use `voice-of-customer`. This file is
the record of what James has sent back, in his words where possible. Every rule
below exists because a draft shipped and got corrected.

## The four failures, in the order they happen

Run these as a pass over any draft. Most bad copy fails one of them.

### 1. It talks about itself

The single most common correction. Copy that describes the page, the product or
the format instead of telling the reader something.

| Shipped | Why it failed | Fixed |
|---|---|---|
| "Nothing on this page needs buying." | Disclaims, then links two products | State the offer plainly |
| "Read and do, no video. Five of the eight are interactive and they pass answers forward, so the dials at lesson 5 read the energy audit at lesson 4." | The product explaining its own mechanics to someone who hasn't bought it | "Ready to find clarity?" |
| "Ninety days of the thinking that does not fit in a text box." | Describes the document to itself | "Print it, or type straight into it." |
| "The box is for thinking, not for prose." | Explains the box | "If you catch yourself drafting sentences, you have switched into work mode." |
| "Companion workbook" as a kicker, then "The workbook." as the title | Same word twice | Kicker names the program, title names the thing |

**Test:** does this sentence tell them what to do or what they get? If it tells
them what the page *is*, cut it.

### 2. It's vague where it could be concrete

> "lines like these are too vague, opt for more direct concrete things people
> can visualize when possible" (James)

Every claim carries a number, a name, or an image a reader can see.

- "The twelve-month builds, and what they pay for the wait" → **"Careers that take 12 months or more"**
- "Seven seconds. That's the whole first read." → **"How your résumé actually gets screened"**
- "The loan is a calendar: PSLF, the pay-cut budget, COBRA" → **"Student loans, pay cuts and health insurance"**
- "The proof-artifact menu" → **"Pick one thing to build"**
- "Bridge statements" → **"Explaining why you're changing careers"**

**Titles and nav are navigation, not voice.** Clever goes in the body. A title
must say what the thing is. Apply the portability test in reverse too: if a
sentence could run unchanged on a site for teachers or nurses, make it SLP-specific
or cut it.

### 3. It's longer than it needs to be, and it narrates

> "keep this tighter and more in my tone of voice, less like an epic narrator" (James)

Cut roughly a third. Remove stage-setting, the closing flourish, and the list of
things that come later.

- Cut "done properly in a week", "everything after this, the paths, the résumé, the applications"
- Prefer the outcome to the mechanism: "You finish with one sentence and everything after runs on it" → **"Leave with written clarity and set your 'why' to ground you in your transition."**

### 4. It isn't how a person talks

- "This browser already has access. Open the quest log →" → **"Pick up where you left off →"**
- Don't state a fact the reader can't act on. "You already have this" was cut entirely; the link was the whole message.
- Watch invented nouns: *quest log, artifact, readiness profile, bridge statement*. Some are load-bearing, but none of them should be the first word a buyer reads after paying.

## Mechanics (verified by a linter, not opinion)

Checked with `jv-k/deslopper` plus the taxonomy from `shessenauer/deslop-ai-lint-skill`.

- **No em-dashes.** Colon, comma, brackets, or two sentences.
- **No semicolons in prose.** This was a real tic: fixing "too many short punchy sentences" by joining them with semicolons just moved the tell. Rewrite as two sentences or a real conjunction. Semicolons are fine inside citation lists and numeric ranges.
- **No "it's not X, it's Y"**, no "here's the thing", no "in today's landscape".
- **Vary sentence length in prose.** Target 19-22 words average, under 15% of sentences below ten words, and **zero runs of three or more short sentences**. Consecutive fragments read as machine-written. This applies to paragraphs a reader reads, not to button labels, list items, table cells or field hints, where short is correct.
- **Don't cite the research as framing.** "Three claims circulate in SLP forums that…" → say the three things are false and what the real route is. The corpus is where facts come from, not a character in the sentence.
- **Don't state the obvious.** Readers know telehealth is clinical work.
- **No AI-adjacent vocabulary:** delve, leverage, unlock, empower, seamless, robust, tapestry, landscape, journey.

## Never invent James

The worst error in this project. Eight first-person passages were written in
James's voice as fact and none were true: a 2019 anecdote about filling in pages
with a pen in a car, "the first résumé I sent", "my instinct was to go get
qualified again", his first non-clinical interview, what started his own search.

Only these are documented and safe: **he was an SLP, he now works in marketing
at a health-tech company, he read the forum corpus for this course, he built the
Suite, he is not a financial adviser.** Anything else about his life must come
from him. When a lesson needs a personal opening and there is no real story,
write the documented pattern ("Almost everybody does the noun swap first") and
tell James the slot is open.

The same rule covers quotes: echo themes from `content/voice-of-customer.md`,
never fabricate a quote, and never attribute one to a named person.

## Selling

- **Don't promise what can't be delivered.** "from wondering whether you're allowed to leave, to an offer in writing" became "to interviewing for jobs outside the clinic". Ninety days cannot guarantee an offer.
- **Decide, don't hedge.** Pick the one thing this reader should do, say it plainly, then list alternatives underneath as a menu with the question each one answers.
- **Match the offer to the stage.** Stages 1–3 (private doubt, guilt, permission) have no résumé ready; selling them a résumé tool is the wrong ask at the wrong moment. See `lib/stage-map.ts` and `offerForStage`.
- **Never sell someone what they already own,** and never route a buyer back to a sales page.
- **Check cannibalisation before adding scope.** Module 2 was briefly bundled into the $19 and had to be pulled: it overlapped the $9 report, and a lesson inside the paid bundle sold the $9 report to someone who had just paid.
- **No fake discounts.** This audience already distrusts CEU vendors, résumé mills and coaches. A crossed-out price is the exact tell they are watching for. Honest anchoring only: what it includes, what it credits toward.
- **Prices and product names live in code, not prose:** `GROUND_PRICE` and `GROUND_NAME` in `lib/course-tiers.ts`, `PRODUCTS` in `components/ProductMenu.tsx`.

## Before you ship

1. **Read the rendered page, not the source.** Screenshot it. Several of these errors were invisible in code.
2. **Grep for internal notes.** A line reading "Explore is next, once James signs off on this sample" shipped to buyers on a paid page. Search any new copy for the words *sample, prototype, TODO, draft, James signs off*.
3. **Re-check numbers and cross-references after any restructure.** Lesson counts, module numbers and "Modules 3 to 5" style ranges all went stale when the course went from six modules to seven.
4. **Check every state, not just the happy one.** Copy differs for a visitor, a buyer, and a buyer who has finished, and each one has shipped a bug at least once.
5. **Say what changed and why** when reporting back, and flag anything you could not verify.
