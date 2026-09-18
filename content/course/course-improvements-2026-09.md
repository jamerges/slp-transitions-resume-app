# Transition OS: what is still worth doing

Written 2026-09-18 after the Teacher Career Coach audit and the changes that
shipped from it (commit 1b5197c). The scripts live beside this file in
`scripts-by-path.md`. This is the rest, in the order I would do it.

Nothing here adds a number without a source. Where a claim needs a figure we
do not have, the item says so and the copy stays qualitative until the rows
exist.

## Do first, cheap

1. **Drop the scripts into the lessons that don't have them.** Eleven
   sixty-second pitches into 3.2, the eleven headlines into 3.4, the four-move
   cover letter and its customer-success sample into 4.6, "tell me about
   yourself" and eager-vs-desperate into 6.1, the five mid-interview lines
   into 6.3, the contract start-date answer into 6.5. Each is a `script`
   block. The path-specific ones can key off `shared.path` so a buyer sees
   their own first.

2. **Regenerate the blank workbook for the new money page.** Lesson 0.2 now
   saves hourly rate, expenses, the tax slider and the six trades. The blank
   docx and PDF still show the old floor-and-date page. Update the 0.2 page
   in `scripts/make_course_workbook.mjs`, then rebuild both editions and both
   PDFs.

3. **A benefits line in "Before you answer any offer" (6.5).** The offer
   checklist has salary, remote days, PTO and a review date. It has nothing
   on what a school or hospital package quietly includes: pension vesting
   dates, employer retirement match, health premium share, CEU and licence
   renewal reimbursement, summer pay structure. Add them as questions to ask
   HR, with "check your own plan" and no figures. A person leaving a
   district two years before vesting should know that before they sign.

4. **Per-path proof piece, as a table.** Module 5 argues for one honest
   artifact over a certificate. It does not say, path by path, what that
   artifact is. Add a `paths` block: instructional design gets a Rise module
   built from an in-service; data gets a small dashboard from de-identified
   caseload data; content gets three published pieces; customer success gets
   a written onboarding sequence for a product they've used; informatics gets
   a documented template redesign; liaison and UR get a sample justification
   letter; sales gets a recorded product walkthrough; PM gets a one-page
   project brief for something they ran. Each row: what to build, how long,
   where it goes (LinkedIn, a link on the résumé, or the portfolio line in
   the skeleton).

## Do when the rows exist

5. **The interview question bank.** Lesson 6.4 now asks buyers what they
   were asked, and the answers land in the ops inbox. Keep a sheet by path.
   When a path has ten or more real questions, publish them as a section in
   6.3 with the count. Until then the mock coach's five stay the bank, and
   the lesson says so.

6. **"Where SLPs landed."** Lesson 7.1 collects title, path and salary band.
   Same rule: a sheet by hand, publish only bands, only once there are enough
   rows that no single person is identifiable. The first place it goes is the
   Ground page as the proof block that page does not yet have. No count
   until it is true.

7. **Three static résumé examples.** The skeleton in 4.7 is the tool; a
   filled example is what people copy. This needs one real, anonymised SLP
   résumé as the source, then three targets (customer success, clinical
   liaison, instructional design). Do not invent an SLP. When James supplies
   one, this is an afternoon.

## Structural, when the full program sells

8. **A weekly check-in email for full-program buyers.** Read-and-do courses
   die at week three. The existing cron and `claimOnce` pattern can send one
   short note per module week keyed to the buyer's progress, with the one
   thing to do this week and the workbook link. Nothing to build until the
   OS checkout exists.

9. **A place to ask.** The audit's clearest lesson was that the private
   group did more work than any lesson. We have no community and should not
   start one for a $19 product. When the full program has buyers, a
   moderated space (even an email thread with James) is the first thing to
   add, and the reports from items 5 and 6 are what seed it.

10. **Retire "coming soon".** The visitor dashboard collapses Modules 2–7
    into one card. When the OS checkout goes live, that card becomes the
    product, and the Ground page's "credited toward the full program" line
    needs the price beside it.

## Copy pass, ongoing

11. **Shorten every lesson `tldr` to the outcome.** The clearest pages in the
    audited course say what you will have when you finish, in one sentence,
    before anything else. Several of ours open on context. Rule: first
    sentence names the thing in your hands at the end; delete anything
    before it.

12. **Read Module 0 as a stranger once a week for a month.** It is the door
    for the Facebook push. Any word a visitor has to already know ("stage",
    "dial", "quest log") on the first screen is a word to cut or explain in
    place.

## Left out on purpose

- Any claim about what share of jobs come through networking, how fast
  postings close, or how many applications the average changer sends. No
  source we hold supports a figure, and the lessons say "most" or "often"
  instead.
- A "steer clear of healthcare" line. The audited course tells its audience
  that; ours are clinicians and health-tech is where their licence is an
  asset.
- Video. There is no footage. Nothing above depends on it.
