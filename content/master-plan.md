# SLP Transitions: the master plan

Written 2026-09-27 from the live numbers. This is the operating plan: what to build, in what order, how to tell if it worked, and what to leave alone. Any Claude session working on this business reads this file first, then CLAUDE.md for the mechanics.

---

## 1. The goal

**Help SLPs who want out of clinical work land a job they like, and get paid for the help at the moments they need it.** The business works when an SLP takes the quiz on a phone at 11pm, gets something useful in under two minutes, pays $9 without thinking twice, gets it instantly, does the first move it tells them to do, and a few months later posts in a Facebook group that they got the job and links to their story on slptransitions.com.

**North-star metric: paid buyers who received what they paid for, per week.** Revenue follows it. A sale that is never delivered is not a customer; it is a future refund and a person who tells their group the product didn't work.

Secondary: quiz completions per week (the top of everything), and landed jobs reported (the proof that makes everything else sell).

---

## 2. Where the business actually is (2026-09-27)

Sources: the ops-alert emails in James's Gmail (subject "Sale:" and "Stalled-report reminders sent"), the MailerLite API, CLAUDE.md. Stripe is the only source of truth for revenue; check the dashboard before quoting a total.

| Fact | Number | What it means |
|---|---|---|
| Quiz takers on the list (sum of the 11 "Quiz:" groups) | ~960 since launch | Traffic exists. It is small and bursty. |
| Sales to strangers since the Aug launch | ~19 (Aug 9–25: 9 per Stripe; Sep 7–23: 6 × $9 report, 2 × $24 Suite, 1 × $9 kit) | About **2% of quiz takers buy**. Teacher Career Coach's $9 guide is said to convert ~24% (secondhand, in content/product-strategy.md; the denominator is unverified, so treat it as direction, not a target), and theirs is an instant download. |
| $9 report buyers who never added a résumé, so never got a report | **August 4 of 6; September 6 of 6** (every Sep buyer got the day-5 second nudge, which only goes to people still missing a résumé) | **The product that is supposed to make customers is not being delivered.** This is the single biggest problem in the business. |
| $24 Suite | 2 sales in September, both delivered | Works, but needs a job posting in hand. Only ~5% of quiz takers are at that stage (135-signup cohort, 2026-09-11). |
| Getting Started kit (course) | 1 sale to a stranger ever (2026-09-23) | Not a revenue line yet. |
| Email list | ~2,500 active; opens 57–78%, clicks 3–30% by group | Healthy and responsive. It has never been asked to buy something that is delivered instantly. |
| Traffic spikes | Aug 14 (Organic Social, 174 of 287 sessions) and Sep 11 (135 quiz signups in a day, algorithmic share) | Both came from a share in a social feed, not from SEO or ads. |
| Sale | Every product $9 "for a limited time" since 2026-09-21, no end date set | A limited-time sale that never ends is a fake discount, which product-copy bans. It needs an end date. |

**What is already strong and must not be broken:** the quiz (9 questions, 11 paths, sourced pay and timelines), the honest tone and the caveats (Epic sponsorship, UXR saturation), the report and Suite generation quality, the price guard, the webhook, the reminders, the back-out-of-checkout fixes, the story intake form, the 30+ articles, the companies list (260).

---

## 3. The diagnosis: three things decide whether this works

1. **Delivery.** The $9 report asks for a résumé after payment. People buy it on a phone at the moment of feeling stuck, and the résumé is on a laptop, out of date, or nonexistent. They pay, hit a form, and leave. Reminders have not fixed this (September: 0 of 6 recovered). **Until the $9 product delivers instantly, more traffic just makes more undelivered sales.**
2. **Conversion.** 2% versus a (secondhand) 24% is not a copy problem. The benchmark product is instant and needs nothing from the buyer. Ours asks for work after payment and the result page pitches it as "built from your résumé", which reads as homework. Fix delivery and the pitch gets simpler: "Your full report, now, from the answers you just gave."
3. **A distribution engine instead of bursts.** Both spikes came from shares in social feeds. Nothing makes a share happen on purpose, on a schedule. The raw material exists: stories of SLPs who made it, sourced numbers people repost, a quiz people like finishing. The engine is: a steady stream of real transition stories, a monthly share moment, and a weekly email, all pointing at the quiz.

Everything below is in service of those three, in that order.

---

## 4. The strategy (what each product is for)

One audience (SLPs leaving clinical work), one front door (the quiz), one ladder. Each rung has one job.

| Rung | Product | Price after the sale | Its job |
|---|---|---|---|
| 0 | Career quiz | Free | Front door and list builder. Every channel points here. |
| 1 | **Pivot Report, instant** | $9 | **Make customers.** Delivered in under two minutes from the quiz answers. A résumé makes it sharper but is never required. |
| 2 | Career Pivot Suite | $24 | Revenue from the ~5–15% who have a posting in hand. Sold inside the report ("found a posting? paste it here"), not on cold traffic. |
| 3 | Getting Started kit → Transition OS | $19 now; OS $99 when it exists | Depth for the ones who want structure. Not pushed until rungs 1–2 work. |
| 4 | Transition Sprint (cohort, 30 days, live weekly call) | $199–$299, validate first | **The real revenue line** and the fastest route to landed jobs and testimonials. |
| 5 | Employer layer (podcast guests who hire) | Later | Parked until there are graduates to place. |

**The honest math:** at $9, 100 report sales a month is $900. The report makes customers; it does not pay the bills. The money is in rungs 2 and 4, sold to people who already trust you because rung 1 helped them for $9. So the order is fixed: **make rung 1 deliver and convert, then build proof, then sell the cohort.**

Worked target for Q1 2027 (targets, not forecasts): 1,000 quiz takers a month × 10% → 100 reports ($900) × 20% → 20 Suites ($480), plus one 15-person Sprint a quarter at $249 (~$1,250 a month averaged). Around $2,600 a month. To go beyond that, grow quiz volume (the engine) and fill two cohorts a quarter.

---

## 5. The plan, by phase

Each task has an owner, and each phase has a "done when" check that must be verified, not assumed. Claude does the building; James does anything that needs his accounts, his voice on camera, or his judgement on a person.

### Phase 1: Make the $9 report deliver instantly (week of 2026-09-28)

This is the only priority until it is done.

1. **Readout first (Claude, Sep 29).** Before changing anything, record the baseline: Stripe sales Sep 22–29 by product, quiz completions for the same week, and GA `begin_checkout` by `placement`. Use the `behavioural-analytics` skill: rule out a deploy, a tracking change or a moved denominator before reading anything into it. Write the result into this file under section 9.
2. **Build the instant report (Claude).**
   - Carry every quiz answer through `report-checkout` into the stash (they are small; today only the top path and stage ride along).
   - Add a quiz-edition prompt: same output schema as the résumé report (profile, stage, top three paths with first job title and first move, 30-day plan, outreach scripts, honest caveats). Built from the nine answers plus the scored top and runner-up paths. Nothing résumé-specific is claimed. Keep every guardrail in `SLP_SYSTEM_PROMPT` and never invent numbers.
   - `report-finalize` generates the quiz edition immediately when there is no résumé, instead of returning `needsIntake`. The report page shows it at once and emails it.
   - Add a box at the top of the report: "Add your résumé and we'll rebuild this around your actual experience (free, once)." It reuses the existing intake. The résumé makes the report better; it no longer blocks the report.
   - Desktop buyers who pasted a résumé before paying keep getting the résumé edition directly.
   - Repurpose the stalled-report cron: it now nudges "add your résumé to sharpen your report" only for people who opened their report, one nudge at day 3.
   - Validate on prod with a 100%-off live coupon (never a real card), then deactivate the coupon.
   - **Say what it is, everywhere.** The buyer is told before paying that the report is built from their quiz answers and can be rebuilt from their résumé for free. The report itself says which edition it is. Never quietly swap a résumé report for a quiz report (ChatGPT's review raised this, and it is right).
   - **Quality bar before it ships:** run the quiz edition on 10 real answer sets across school and medical SLPs, low and high income floors, little and lots of time. Score each 1–5 on factual accuracy, fit to the answers, specificity, and ease of taking the first move. Ship only if 8 of 10 score 4+ on every line and none invents a credential, employer or number.
   - **Decision rule for the next 10 buyers:** delivered 10 of 10; refund requests; replies to the day-7 check-in; how many use the free résumé rebuild. If refunds or complaints point at "too generic", strengthen the quiz edition, and keep the résumé rebuild as the main route rather than returning to pay-then-wait.
   - **Done when:** every paid report session in the following 7 days shows a delivered report in the ops alert ("Sale: $9 (delivered)"), with zero "awaiting résumé".
3. **Keep an order ledger (Claude).** A private list, not in analytics or public files, of every paid order since Aug 1: product, amount, date, input received, delivered or not, email sent, refund state, next action. Stripe is the truth for payment. Every order has a known state, and every failure has an owner by the next business day. Exclude owner tests and $0 coupons from every count.
4. **Keep offer claims true (Claude).** Build a one-page list of what each product actually delivers, from the output schemas and checkout metadata, and remove any claim the output doesn't support. (Found 2026-09-27: the quiz result said the Suite "includes the $9 Pivot Report". It doesn't, and the claim is gone.)
5. **Change the pitch to match (Claude, with `product-copy`).** The result page, the result email and the day-2 follow-up promise the instant report: what they get, now, from the answers they just gave, with the résumé as an optional upgrade. One change at a time: the pitch ships in the same deploy as the instant report, and nothing else on the result page changes that week.
6. **Rescue the stranded buyers (Claude drafts, James sends).** About 10 people paid $9 in August and September and never got a report. For each, generate a quiz edition from their stored quiz completion (`quiz:completions` in Redis holds email, slug and stage). Draft a personal Gmail note from James: sorry, here it is, no action needed, and reply if you want the résumé version. These are the first people who could love this business or bad-mouth it. Also add a line saying they can have a refund if they'd rather.
7. **Put an end date on the sale (James decides, Claude ships).** Recommended: the sale ends Sunday 2026-10-05. The quiz result, /products, the banner and the WP strip all say "ends Oct 5". Then flip `SALE.on = false`, point the env vars back at the list-price ids, redeploy, and set the WP `SALE_BANNER` to `None`. The report stays at $9 (it is $9 at list). A "limited time" sale with no end is the fake discount product-copy bans.
8. **James's 15-minute fixes that cost trust every day they wait:**
   - SiteGround → Email → Forwarders: make `james@slptransitions.com` forward to Gmail. Every buyer reply and every story-form reply goes there today, and on 2026-09-14 nothing sent there had reached Gmail in 90 days.
   - MailerLite → Forms → Pop-ups: turn off the pop-up.
   - Customizer → header button: remove the stray period from `/career-quiz/.`.
   - Stripe → Webhooks: subscribe the live endpoint to `charge.refunded`.
   - MailerLite welcome automation: replace the retired Airtable link.

### Phase 2: Make people love it and say so (October)

Loved products get talked about in the exact Facebook groups this business needs.

1. **The day-7 check-in (Claude).** Seven days after a report is delivered, a plain email from James: "Did you do the first move? What happened?" Reply-to James. It turns buyers into conversations, and conversations into stories. Once per buyer, skipped for opt-outs.
2. **Report → Suite handoff (Claude).** Inside the report, each of the three paths gets "Found a posting for this? Paste it and see how your résumé matches, free." That opens the Suite's free preview with the path pre-selected and the résumé carried over when there is one. This is where the Suite sells: to someone who already trusts the report.
3. **The story engine (James + Claude).** The form is live at slptransitions.com/share-your-story/.
   - Whenever someone in a Facebook group posts that they got a job, James comments with the link, using the ready-made comment in `content/story-intake.md`.
   - Target: **two published stories a month.** Claude drafts each one from the submission (the template is in story-intake.md). The transitioner approves the draft, then it publishes and goes back into the group with their permission.
   - Stories are the proof the product pages are missing. Once there are three, the result page and the Suite page can quote them, with each person's clearance and never invented.
4. **Testimonials, cleared (Claude builds, James approves).** Add one question to the day-7 check-in and to the report page: "Can we quote you?" with a yes/no box. Store the answer and pass only cleared quotes to product pages.
5. **Talk to people every week (James, Claude prepares).** In October: 5 buyers, 3 people who stalled, 2 who took the quiz and didn't buy. Ask about what they did, not what they'd buy: what was happening when they looked for help, what they'd already tried (including free AI tools), what they expected to get, where they hesitated, what they trusted least, and what they did with the result. Ten conversations give direction, not proof. Log what you hear in section 9.
6. **Show a real sample next to each offer (Claude, with permission).** A redacted excerpt of a real report and a real before/after Suite bullet, from a buyer who says yes or from James's own material, labelled as a demonstration. People buy what they can see. Never invented.
7. **Refunds, honored fast.** The 30-day refund is promised everywhere. Any refund request gets a same-day yes. A refund is cheaper than a complaint in a group of 10,000 SLPs.

**Done when (end of October):** at least 10 new report buyers all delivered, at least 2 stories published, and at least 3 cleared quotes on file.

### Phase 3: Build the distribution engine (October → December)

Aim for a steady weekly rhythm, not a viral hit. Everything points at the quiz.

1. **Facebook groups, relationship first.** The distribution playbook names "SLPs Leaving the Field" (~9.8k members) and The Non-Clinical PT's group (51–55k). Rules: never drop a link cold, post useful things, comment on "I got a job" posts with the story link, and offer admins a free live Q&A. One admin yes is worth months of posting.
2. **One share moment a month (Claude drafts, James posts).** Both spikes came from a share. Make one on purpose each month: a sourced data post (for example "113 applications, 7 interviews, 1 offer: what the numbers look like for SLPs who made it"), a short video from the Remotion or HyperFrames projects, or a new story. Post it from James's account, in his voice, with the quiz link in the first comment. Log the date in section 9 so the spike can be read against it.
3. **The Friday email (Claude drafts, James approves).** Weekly, short, one of each: a path with its real pay and timeline, a story, and one open role from the job digest (`content/job-digest-*.md` already exists). The quiz link and nothing else to buy, except to people who took the quiz and didn't buy the report. Keep opens above 40% and unsubscribes below 0.5% per send.
4. **Articles for the gaps readers name.** Write in this order: student loans and PSLF when you leave clinical work (the biggest unwritten gap); part-time and fractional non-clinical work; whether to keep paying for ASHA. Every article gets the mid-post quiz prompt and the end-of-post quiz block. Publish with `scripts/wp_publish.py` and re-run `scripts/build_blog.py`.
5. **Borrowed audiences (James).** Use the Xceptional Leaders podcast network. Ask every guest whether their company hires former clinicians and for what (that enriches the companies list), and pitch guest spots on SLP and clinician-career podcasts.

**Done when (end of December):** quiz completions average 250 or more a week for four consecutive weeks, without a one-day spike carrying the average.

### Phase 4: The revenue rung, the Transition Sprint (validate in November, run in January)

1. **Validate before building (Claude + James).** Put a waitlist page on the Getting Started / course surfaces and email report buyers:
   - 30 days, a small group of SLPs, one live call a week with James, the course lessons as homework, and a shared tracker.
   - Price $249, or a founding rate with a clear end.
   - **Go if 15 people join the waitlist and 8 put down a deposit.** If not, don't build it, and write down why here.
2. **Run cohort 1 (January 2027)** on what exists: the course, the tracker, and Zoom. No new software until the first cohort finishes. Measure completion, interviews landed within 60 days, and stories collected.
3. **Then Transition OS at $99** for self-paced buyers, only if cohort 1 shows which lessons actually got people interviews.

### Phase 5: Parked until there are graduates

These stay parked: the employer layer and job board, the B2B hiring partners, SLP Stash, and any new standalone tool. Revisit when there are 25 or more reported landings.

---

## 6. The weekly operating rhythm

| When | What | Who |
|---|---|---|
| Monday | Numbers: Stripe sales by product; delivered versus awaiting ("Sale:" ops alerts); quiz completions (MailerLite quiz groups, growth since last Monday); email open and click from last Friday; GA `begin_checkout` by `placement`. Add one line to section 9. | Claude |
| Monday | Pick **one** experiment for the week, written as "if we change X, Y moves, because Z". Write it into section 9 before shipping. Never two changes on the same door in the same week (Sep 15–18 lost a week of sales that way). | Claude proposes, James approves |
| Tue–Thu | Build and ship the experiment; verify on prod (curl the API routes, check the rendered page, test Back from Stripe on prod not dev) | Claude |
| Thursday | Story or article draft; share-moment draft on the week it's due | Claude drafts, James edits |
| Friday | Friday email; comment on "I got a job" posts in the groups | James sends and posts |

---

## 7. Metrics and targets

| Metric | Where it comes from | Now | Target by Dec 31 |
|---|---|---|---|
| Report delivery rate (delivered ÷ sold, within 24h) | "Sale:" ops alerts | ~0% in Sep | 100% |
| Quiz → $9 conversion | Stripe report sales ÷ new quiz completions | ~2% | 10% (stretch 20%) |
| Quiz completions per week | MailerLite quiz groups | ~60–125 (9–18 a day outside spikes) | 250 |
| Report → Suite upgrade | Stripe Suite sales with a `continue=` or report path | not tracked | 15% of report buyers |
| Refund rate | Stripe | ~0 | under 5% |
| Reader-submitted stories published | WP Real Transitions category | 0 (the 2026 posts are podcast interviews) | 2 a month |
| Landed jobs reported | story form + course "landed" form | 0 | 10 |
| Friday email | MailerLite (judge by clicks, replies and purchases; Apple Mail inflates opens) | first sends | click 5%+, unsub under 0.5%, zero spam complaints |
| Support time per order | a simple time log | not tracked | under 5 minutes; a $9 sale that needs 20 minutes of help loses money |
| Contribution | net revenue less Stripe fees, model cost, refunds | not tracked | positive every month; report it next to revenue |

---

## 8. Rules for any Claude session working on this

1. **Read CLAUDE.md, then this file, before touching anything.** (AGENTS.md and `.agents/` are the Codex copies; Claude reads CLAUDE.md and `.claude/skills/`.) CLAUDE.md is the mechanics (money paths, env vars, WP gotchas, what broke before). This file is the order of work.
2. **Phase order is not a suggestion.** Don't start Phase 3 work while the report is undelivered. Don't build Phase 4 software before its validation passes.
3. **Money paths are sacred.** Validate any checkout, finalize or webhook change with a 100%-off live coupon before a buyer can reach it; never a real card. `assertPriceAmount` stays on all three checkouts.
4. **Words.** Report small numbers as counts ("7 of 10"), not just percentages. Read `.claude/skills/product-copy/SKILL.md` and `content/writer-kit/mechanics.md` before writing anything a person will read. Second person, concrete, no em dashes, no invented numbers, no invented James. Every claim traces to `content/research-facts.md`. The companies list is "health and ed-tech companies that value clinical skills", never "has hired".
5. **Proof only with clearance.** No testimonial, quote, count, face or logo without the person's yes.
6. **One change per door per week, measured.** Write the hypothesis in section 9 first. If a number drops, check for a deploy, a tracking change or a moved denominator before blaming the page (`behavioural-analytics`).
7. **Verify on production** and say what was and wasn't verified. Update CLAUDE.md with anything a future session would otherwise relearn the hard way.
8. **James sends, posts and pays.** Claude drafts messages to buyers and groups; James sends them. Claude never publishes to a group, emails the list or changes account settings without his go-ahead in that session.

---

## 9. Log (newest first; one line per week or decision)

- 2026-09-28: James: take the section 10 recommendations (sale ends Oct 5, rescue the stranded buyers, Suite back to $24 after the sale) and **no group call yet**; optimise what exists. Phase 4 (cohort) is parked until he says otherwise.
- 2026-09-28: **Rescue drafted:** nine stranded $9 buyers (six in September, three in August) each have a Gmail draft from James with their report link, which now builds from their quiz result with nothing to upload, plus a refund offer. The three Sep 3 drafts to the August buyers were never sent and are now superseded (they still ask for a résumé): delete those.
- 2026-09-28: **Instant quiz edition shipped** (Phase 1, item 2). Quality bar: 10 answer sets, 9 of 10 scored 4+ on every line; first run caught invented referral statistics and invented details when only the path survived, both fixed in the prompt, plus ranges, timelines and em dashes enforced in code. Local end to end in Stripe test mode: checkout, payment, report on screen in 79s, email sent. Not yet exercised: the résumé rebuild and the Redis lock, which need Upstash, so they get their first run on prod with the $0 coupon. The stalled-report cron now builds missing reports instead of sending reminders. Also shipped: "Save as PDF" on the report (competitor read, `content/competitor-entry-offers-2026-09.md`).
- 2026-09-27: Merged the best of ChatGPT's review: order ledger, offer-claims check, 10-case quality bar, weekly customer conversations, a real sample by each offer, email judged by clicks, support time and contribution tracked, the 24% treated as unverified. Kept the instant quiz edition over "pay first, then wait" because the live alerts show 0 of 6 September buyers recovered even with reminders. The review also caught three real bugs, fixed the same day (77aaa84): first reminders re-sent after day 7 (the latch expired before the 14-day scan ended), a false "Suite includes the Pivot Report" claim, and "eight questions" on the homepage.
- 2026-09-27: Plan written. Baseline: ~960 quiz takers since launch, ~19 stranger sales, $9 report delivery 0 of 6 in September. Next: Sep 29 readout, then the instant report.

---

## 10. Decisions James owns (answer these once, then log them above)

1. The sale end date. Decided 2026-09-28: Sunday 2026-10-05.
2. Rescue the ~10 stranded report buyers with a personal note and their report. Decided 2026-09-28: yes.
3. After the sale, the Suite goes back to $24. Decided 2026-09-28; $29-with-report stays a later experiment.
4. ~~The cohort~~ Decided 2026-09-28: no group call yet. Phase 4 is parked.
