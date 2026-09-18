# Transition OS: what is still worth doing

Written 2026-09-18 after the Teacher Career Coach audit and the changes that
shipped from it (commit 1b5197c). The scripts live beside this file in
`scripts-by-path.md`. This is the rest, in the order I would do it.

Nothing here adds a number without a source. Where a claim needs a figure we
do not have, the item says so and the copy stays qualitative until the rows
exist.

## Do first, cheap

1. **Drop the scripts into the lessons that don't have them.** Done
   2026-09-18: pitches and the bad-message example in 3.2, headlines in 3.4,
   the hiring-manager note and recruiter comeback in 3.7, the finished cover
   letter in 4.6, "tell me about yourself" and eager-vs-desperate in 6.1,
   three why-leaving shapes in 6.2, five mid-interview lines in 6.3, the
   contract start date in 6.5. Per-path scripts use the new `bypath` block
   (LESSON_SPEC.md), which opens on the reader's own path.

2. **Regenerate the blank workbook for the new money page.** Done
   2026-09-18: "Your starting line" and "What you would trade" pages for 0.2,
   a "Kept private" page for 1.7, both editions and both PDFs rebuilt with
   `scripts/workbook-render/render.sh`.

3. **A benefits line in "Before you answer any offer" (6.5).** Done
   2026-09-18: a "what the package quietly includes" item in 6.5's package
   list (vesting, match, premium share, CEU and licence reimbursement,
   parental leave, school-year pay) and an eighth check on the 6.8 offer
   checklist. Questions to ask HR, no figures.

4. **Per-path proof piece.** Already done: lesson 5.2's artifact menu has
   a brief for every path (what to build, how long, what it proves, where it
   lives). Nothing to add. Listed here so nobody builds it twice.

## Networking, from the second pass over her course (2026-09-18)

Added the same day, in SLP terms and without her statistics: the who-first
list (cohort, the reps who sell into your building, the ones who left,
people who sell you things, pre-grad-school colleagues) and the conference
section in 3.1 (the exhibit hall, HIMSS/AMIA, ATIA, DevLearn, ISTE, state
chapters, four tactics, the wrong room); the connection-request and alumni
scripts and the communities question in 3.2; the seniority and
skip-the-influencers filters and networking-as-interview-prep in 3.3; the
broadcast-off warning, the "will take anything" headlines, positive posting
guidance and two new steps in 3.4, plus four new LinkedIn checklist items;
the check-for-an-in habit, why a stranger's no is rational, the referral
bonus, and "what other companies do this" in 3.5; the artifact ask, the
applying-now sweep and the after-you-land note in 3.6; recruiter vetting and
niche recruiters in 3.7; "ask ten people whether the certificate mattered"
in 5.1.

**Volume, revised the same day (James's point: her course predates the
models).** Three messages tonight (3.3) and two warm conversations (3.6)
stay as the floor, and 3.6 now adds the trickle: two new messages a week
while building, five a week once applying, on the argument that a
personalised message costs ten minutes rather than forty once the research
and the first draft are handed to a model. The people list counts the week
against a goal the reader sets. Our one-in-four no-reply figure stays; it is
from our own corpus. Not adopted: her counts (85% via networking, one in
five accept, 27x more findable, 500+ connections), which have no source.

**Shipped with it:** the people list in Module 3 is now a working CRM
(source, stage, log-a-touch with automatic next-touch dates, a due list,
what-I-learned and who-they-named per person, the four Module 3 scripts
copied with the person's name filled in, a weekly goal, CSV export matching
the tracker sheet), and lesson **3.8 "What to hand the model, and what to
keep"** with eight prompts prefilled with the reader's path and 4.3 numbers
(research a person, research a company, the interview-me first draft,
rehearse the call, notes into next steps, posting into a checklist, find the
rooms, the monthly update), the never-paste rule for client and employer
material, and the it-will-invent warning.

## Simplification pass (2026-09-18, James: "make it cleaner/simpler")

The rule: one tool per job, one place per number, one sentence per fact.
Her lessons run 656 to 6,668 spoken words (median about 1,700), so ours at
300 to 1,400 written words are in the same ballpark and were not cut for
length; they were cut for repetition.

- **Tools 20 to 17** (18 names, one a variant). Cut: the path deep-dive
  (2.7, the map and the pivot report already compare paths) and the
  screening-questions accordion (its six questions are now a list in 6.3).
  **Mounts 24 to 18:** the people list is mounted only in 3.3 and 3.6, the
  application tracker only in 4.7; both live together on **/course/tracker**
  ("Your people and applications"), linked from 3.1, 3.5, 3.7, 3.8, 6.6 and
  the dashboard. The artifact menu is mounted once.
- **Lessons 50 to 48.** 2.7 cut. 5.3 merged into 5.2, "Pick one thing and
  make it in a week" (the badge and any saved progress follow it).
- **One number, one place.** The weekly outreach goal is derived from the
  2.0 time budget; the second box in the people list is gone. The prompt kit
  is six prompts, not eight.
- **The "one in four gets no reply" sentence** appeared seven times; it now
  appears in 3.2's opener and 3.3's body. The sixty-second pitch moved from
  3.2 to 3.1, beside "say the title", so 3.2 is the three messages again.
- **The streak is gone from the screen.** The data still saves; nothing
  reads it. XP and badges stay.
- **Not touched:** Module 2's path lessons (2.2 to 2.4), which overlap the
  $9 report and the pillar article. That is a product decision, not a trim.

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
