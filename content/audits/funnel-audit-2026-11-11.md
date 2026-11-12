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

### Done on 2026-11-11, second pass (the Suite, walked on a phone)

10. **The Suite promised an email it never sent.** The last step asks "Where should we send your results?" and the address only went to the mailing list. Anyone who ran a free preview and closed the tab lost it, and nobody could come back to buy. The preview is now emailed (score, the three rewritten bullets, the two actions) with a link that reopens it with the résumé and posting in place, for 7 days. Tested on production end to end, as far as the live $24 checkout page.
11. **A rewrite cut a buyer's year of access to a week.** The page and the email say results stay open for a year. Using "rewrite this section" re-saved the package with a 7-day expiry. Fixed. Buyers who used a rewrite between Oct 18 and Nov 11 may have lost their page after a week; their results email still holds the content.
12. **The preview read like a report about someone else.** It called the reader by first name in the third person, used em dashes, and one run invented "six stakeholder groups". It now says "you", and may not add a count or an outcome the résumé doesn't state. Em dashes are removed in code from the preview, the explore results, the paid package and rewrites.
13. **The email step is honest and checks the address.** It says the preview is emailed and that the address joins the list, rejects a mistyped address before checkout does, and says what's missing instead of showing a dead button.
14. **Résumé step on a phone.** It said "drop your resume here, or click to browse". It now says "Choose your résumé file" and offers the LinkedIn route: copy the Experience section and paste it. An expired link's error message was being set and never shown, and now shows.
15. **Job step.** A link to the open roles for anyone who arrives without a posting.
16. **Plain words on the preview and the paid page.** "Interview bridge statements" and "Requirements gap plan" became the welcome page's wording, headings went to sentence case, two report buttons had the price typed in, the buy button's arrow no longer wraps onto its own line, and nine em dashes came out of the paid results page.
17. **The app's header on a phone** went from two rows of links to one, so every page opens about 80px higher.

Still open from this pass: the rewritten bullets sometimes add a soft outcome the résumé didn't state ("standardizing workflow"). A test set (item H) is the way to hold that line.

### Done on 2026-11-11, third pass (after "do whatever you think is best")

18. **Buyers are asked how it went.** Three to five days after a purchase, one plain email: did it help, the refund is one reply away, and may I quote you. Replies are the site's first source of testimonials. (Item G.)
19. **A note the day after an unbought Suite preview**, with the link back while it still works. (Item L. The abandoned report checkout, item I, is already covered by the day-2 quiz note, so nothing was added for it.)
20. **Private doubt and guilt now lead with the free twenty minutes**, with the kit as the line under it. (Item K.)
21. **The three finished articles were checked and are ready, and still drafts.** Publishing from here was refused by the permission system, so that click is yours: 3730, 3734, 3737. 3739 (new grads) waits on the "finish with a different employer" line.

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
L. **A note the day after a free Suite preview that wasn't bought.** The preview is saved now, so one plain email with the link back is possible. Same question as item I: it is an email nobody asked for.
M. **Audit the rest:** the report page and the Suite results page as a buyer sees them (their copy was scanned; nobody has walked them on a phone), course lessons and articles.
