# Funnel audit: copy, design, UX, value and conversion (2026-11-11)

Walked on a phone-sized screen (375px), because most buyers are on phones: the WordPress homepage and quiz page, the quiz result for two stages, the Suite welcome page, the kit sales page, the Module 1 finish screen, and the two emails every quiz taker gets. Numbers come from MailerLite (quiz takers by stage, customers by product group). MailerLite undercounts buyers when delivery fails, so treat buyer counts as a floor; Stripe is the true record.

**Not audited this pass:** the Suite wizard past its welcome page, the free preview and paywall, the report results page, the Suite results page, course lessons, articles, and desktop layouts.

## The size of the prize, honestly

About 40 to 60 people finish the quiz each week. Since the report became instant on 2026-09-28, MailerLite shows 8 report buyers in six weeks, roughly $70. Fixing conversion can plausibly double the number of buyers, which at $9 to $24 is tens of dollars a week. The larger levers are traffic (one share has moved a week from 50 quiz takers to 250), price, and a higher-priced offer. Conversion fixes are worth doing because they are cheap and they compound with traffic, but they will not change the business on their own.

## What the data says

| Stage (quiz answer) | Shown first | Takers | Buyers | Since Sep 28 |
|---|---|---|---|---|
| Panic ("I don't know what else I could do") | $9 report | 464 | 11 (all report) | 161 takers, 8 buyers (about 5%) |
| Permission ("is it really possible?") | $19 kit | 206 | 1 (Suite) | 56 takers, 0 buyers |
| Guilt | $19 kit | 124 | 0 | 28 takers, 0 buyers |
| Private doubt | $19 kit | 115 | 0 | 31 takers, 0 buyers |
| Action ("applying, no traction") | $24 Suite | 45 | 0 | 11 takers, 0 buyers |

Half of all quiz takers were being shown a product that has sold three times ever. They were steered away from the report because it used to need a résumé; it hasn't since Sep 28.

## Ranked improvements

### Done on 2026-11-11

1. **The emails every quiz taker gets described a product that no longer exists.** The result email said the report "reads your real résumé", printed the price as "9, once." with no dollar sign, and the day-2 note linked into the old résumé-first flow, the one that stranded buyers in September. All three now describe the instant report and link to the one-button result page. (`lib/email.ts`)
2. **The permission stage now leads with the $9 report**, with the compact buy button under the result. One line in `offerForStage` (`lib/stage-map.ts`) undoes it. The day-2 note for that stage carries the report line instead of the kit line.
3. **A report bought later is still written from the buyer's answers.** The quiz answers were only carried through checkout in the same browser tab. Anyone buying from an email link, or on another device, got a report built from the path alone. The answers (option numbers, no free text) are now stored with the quiz completion and looked up by email at build time. (`quiz-result`, `quiz-log`, `report-finalize`). Typechecked; the lookup needs Redis, so its first real exercise is the next purchase from an email link.
4. **The quiz starts higher on the WordPress quiz page.** The "Career Quiz" title band is hidden, the quiz loads eagerly, and a "Loading your quiz" line with a direct link shows until it appears. On a 375px screen the quiz moved up 134px: four answer options show on the first screen where two did. (`scripts/wp_audit_fixes_20261111.py`, backup in `content/wp-backups/audit-fixes-20261111.json`)
5. **Result page order.** Why the path fits and the first move now come straight after the result, above the stage map. On a phone the map used to push them two screens down.
6. **"Pivot Reportis written"**: a missing space on the result page's main offer.
7. **The Module 1 finish screen ended on "the rest isn't open yet"** and never mentioned the five people and résumé lessons still in the kit. It now leads with "Next: find the people who made the move".
8. **The free course link overwrote the quiz stage in MailerLite** with the lesson-0.3 verdict ("fit", "workplace"), which breaks stage-based sends. Removed.
9. A semicolon out of the Pivot Report's menu copy.

### Yours (I can't do these, or shouldn't without you)

A. **Publish the four finished articles and send the networking email.** Distribution is the ceiling; every spike in quiz takers came from a post, a share or an email. Drafts 3730, 3734, 3737, 3739.
B. **Test a higher report price.** The panic stage buys at about 5% at $9. At $14, sales would have to fall by more than a third to lose money; at $19, by more than half. Four weeks at one price, then compare buyers per quiz taker. Needs a new Stripe price and one env var.
C. **Homepage search title.** It is "Home - SLP Transitions". In WordPress: Pages → Home → Yoast → SEO title: `Non-Clinical Careers for SLPs %%sep%% %%sitename%%`. Meta description: "Twenty non-clinical career paths for speech-language pathologists, with what each pays and how long the move takes. Take the free two-minute career quiz." Yoast fields on pages can't be written over the REST API (they can on posts).
D. **Kadence colours.** The site chrome is still teal: the quiz page shows a teal page around a cream quiz. Customizer → General → Colors → Global Palette; values are in CLAUDE.md.
E. **The Stripe and Node security steps** from 2026-10-24.
F. **Decide what the $19 kit is for.** Three buyers ever, none from the guilt or private-doubt stages it was built for (239 takers).

### Next (I can build these; each needs your yes)

G. **Ask buyers how it went.** No testimonial exists anywhere on the site. An automatic note three days after a purchase ("Did it help? Reply in one line") would produce the first real proof, with permission asked before anything is quoted.
H. **Upgrade the model that writes the reports and packages, with a test set first.** Removes the "could not parse" failure class. Costs a little API spend to measure.
I. **A reminder for a checkout someone started and left.** One plain email the next day with a link back to their result.
J. **A lower price for a second Suite run** (a second target role). One buyer has already asked.
K. **Guilt and private-doubt stages: lead with the free twenty minutes**, not the $19 sales page. Nobody at those stages has bought the kit.
L. **The app's header on a phone** takes two rows of navigation before any content, on every page including the result.
M. **Audit the rest:** the Suite's free preview and paywall, the report page, the Suite results page.
