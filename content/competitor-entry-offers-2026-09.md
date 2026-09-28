# Competitor entry offers and lead magnets (read 2026-09-27)

How four competitors sell their cheapest paid product and their free lead
magnet, and what a buyer gets. Everything is paraphrased; at most one short
quote per competitor. Numbers appear only where a page I read states them;
anything else is marked unknown. Earlier reads that this builds on:
`competitor-teacher-career-coach-course.md` (the TCC course from the inside),
`competitor-practitioner-pivot-bundle.md` (Hannah Pugh's bundle, bought),
`competitor-formats.md` (content formats).

---

## 1. Teacher Career Coach (Daphne Gomez)

### Entry offers and prices

| Offer | Price | What arrives | Source |
|---|---|---|---|
| Free quiz, "What career outside the classroom is right for YOU?" | Free, email gated (first name + email, no skip) | A result "bucket" (one of six) with five named example careers, each with a paragraph | Quiz JSON at `quiz.api.tryinteract.io/quiz/5f14852a41509a001401a8fa`, embedded on https://teachercareercoach.com/quiz/ |
| Career Transition Guide for Teachers | **$9, shown as "usually $19"** | A 40-page ebook (per https://teachercareercoach.com/career-change-for-teachers/). Delivery speed and format beyond calling it digital are not stated on the sales page | https://teacherccoach.samcart.com/products/transition-guide-for-teachers |
| Teacher Career Coach Course | **$129 one time, or $39/month for 4 months**, 30-day money-back guarantee | 20 to 25+ video lessons, 100+ pages of printables, résumé templates, private community | https://teacherccoach.samcart.com/products/course |
| Second quiz, "Are You Stuck Transitioning Out of Teaching?" | Free, email gated | Four outcomes (see below) | https://teachercareercoach.com/quiz-stuck (quiz id 668d9afecd824000159b2771) |

Older third-party figures, not re-verified: growthinreverse.com (Nov 2024)
reported the course at $179 or 3 x $49, said roughly a quarter of quiz
takers buy, and said the quiz brings in six figures a year. The
denominator of that 24% is not explained. It also reads the 20,000-educators
line on the guide page as buyers; the page itself only says that many have
explored their options, so treat 20,000 buyers as unconfirmed.

### How the quiz hands off to the $9 guide (the most useful finding)

I clicked through all nine questions without submitting an email and then
read the quiz's public configuration. The sequence:

1. Nine questions. The first asks the minimum starting salary that would let
   them leave; others ask years taught, the biggest reason for leaving, the
   number-one roadblock (sell myself / guilt / pay cut / confidence), tech
   comfort, working with children, and timeline.
2. Email gate: heading "Your Potential Career Path Is In!", first name and
   email, button "See My Results". Email goes to ConvertKit.
3. **The result redirects straight to a SamCart product page, one per
   bucket** (for example `teacherccoach.samcart.com/products/working-outside-of-education`).
   That page is the result and the checkout at once:
   - a banner thanking them for the email and telling them to check the inbox now;
   - a results-are-in heading, the bucket name, a paragraph on what it means;
   - five example careers, each with a short description of the job and why
     a teacher fits it;
   - then the $9 guide pitch: why leaving is hard, "Plan B" framing, the $9
     price compared to a latte, her founder story, the eight-item contents
     list, one testimonial, an About Daphne block that ties back to the quiz
     they just took;
   - **the checkout form inline at the bottom of the same page** (first name,
     last name, email, phone, card or Apple Pay or Google Pay, button "Place
     Order Now"). No second click to a checkout.
4. The same result also exists as a blog page (`/working-outside-of-education/`)
   that repeats the bucket and five careers, says it is only the tip of the
   iceberg, and links the $9 guide four times.

So the free result is genuinely useful (five named jobs with explanations)
and the paid step promises breadth: all six buckets, 40+ careers, how to read
a job description, risk evaluation, résumé translations, a checklist.

### The $9 sales page, in order

Headline: product name plus "Get it now for $9!". Then: why transitioning is
hard (the myth that you need another degree) · the Plan B argument and the
latte comparison · CTA "GET THE GUIDE NOW FOR $9!" · founder story (left for
burnout, landed consulting and instructional design) · CTA · a value section
with the $9-usually-$19 line and a credit to a certified career coach and HR
expert · eight bullet contents · **one testimonial** (Jessica,
3rd grade teacher, on confidence and organising her résumé) · About Daphne ·
CTA · note that the receipt will say "Aspireship" · inline checkout.

- CTA wording: "GET THE GUIDE NOW FOR $9!" (three times), "Place Order Now".
- Guarantee: **none shown on the $9 page.** The SamCart config has a 30-day
  setting but the page text never mentions a refund.
- Proof: one named testimonial with a role, the 20,000 line, the HR-expert
  credit. No press on this page.
- Order bump: none configured.

### The course page, briefly

Opens with a since-2019, thousands-helped line and named destination roles,
then the price and guarantee in the second sentence, a preview video, a
logo strip of employers where graduates work, four benefit blocks (one contrasts
templates written by HR professionals with ChatGPT), ~14 screenshot
testimonials, eight pain points (one is applying and never hearing back), the
contents, a named-module FAQ. CTAs: "I'm ready to start!", "Join Risk-Free".
Guarantee wording is specific about how: email support within 30 days for a
full refund, including when life gets in the way.

### The broken second quiz

The "Are you stuck" quiz sorts people into four stuck points: weighing pros
and cons, needs career clarity, not getting interviews, getting interviews
but no offer. All four redirect to `teachercareercoach.com/quiz-stuck-results`,
which **returns a 404 today**. The segmentation is good; the page is gone.

### Podcast themes (why people buy)

Episode list at https://teachercareercoach.com/category/teacher-career-coach-podcast/
(205 episodes). Recurring shapes: "From Teacher to [role] with [name]" is
most of the feed; then the job market (AI, a 2025 survey), fear and myths
about clarity, and staying near education.

- Ep 199 (2025 survey of 717 former teachers,
  https://teachercareercoach.com/ep-199-what-i-learned-from-our-2025-job-market-survey/):
  2024 to 2025 leavers reported roughly 40 to 50 applications before landing,
  up from about 30 in 2022 to 2023; 48% took a raise and 45.5% a cut; top
  destinations instructional design, project management, customer success.
  What helped: corporate language, metrics, networking.
- Ep 42, Delaney Carr (https://teachercareercoach.com/teaching-to-learning-designer/):
  40 to 50 applications, ghosting, then a referral from a course graduate got
  the job. She credits the course for rewriting her résumé bullets and
  networking.
- Ep 17, Daphne's own story: three months of applications with few callbacks
  before a consulting role.

Reasons to buy that recur: not knowing which jobs they qualify for without
another degree; applying widely and hearing nothing; not knowing anyone
outside the field.

### After purchase

For the $9 guide: unknown (I did not buy it or submit an email). For the
course (from our earlier audit): a community, a spotlight form for people who
land a job, a "celebrate a new job" badge and an alumni group.

---

## 2. The Non-Clinical PT (Meredith Castin)

### Entry offers and prices

| Offer | Price | What arrives | Source |
|---|---|---|---|
| Free mini course ("four secrets" to a non-clinical job) | Free, email | An email with a course link within about fifteen minutes | Kit form on https://thenonclinicalpt.com/, thank-you page https://thenonclinicalpt.com/non-clinical-mini-course-thank-you |
| Sunday jobs email | Free | Non-clinical job listings most Sundays | https://thenonclinicalpt.com/start-here/ |
| Facebook group | Free | 51,000+ members per Start Here (55,000+ per the homepage) | same |
| Non-Clinical 101 | **$599**, BNPL (Affirm, Afterpay, Klarna) | Video course, 27 career paths, assessments, 50+ résumé and cover letter templates, company list, early job access, lifetime access, alumni groups, an AI coach | https://thenonclinicalpt.com/non-clinical-101/ |
| Crash Courses (e.g. Utilization Review) | $79 per a search snippet, **credited toward Non-Clinical 101** | Path-specific application documents and interview prep | academy.thenonclinicalpt.com, **now offline** (the platform shows an offline notice), so the price and credit could not be confirmed on a live page |

There is **no low-priced paid entry product live today.** The ladder is free
(mini course, jobs email, Facebook group) straight to $599. I found no quiz on
the site.

### Non-Clinical 101 page, in order

Headline "Launch Your Non-Clinical Career" with the price and "I'M READY!"
above the fold · a fresh-start-without-starting-over promise · a clinical metaphor,
a two-step plan of care · the reader's past achievements as ticks
(school, boards, letters) · six emoji pain lines (productivity, billing
machine, no lunch) · Meredith's story · the future-self list · "4 steps" ·
student video · an 11-item value stack with a dollar "value" on every line
($500, $1,000 and so on) · six bonuses · instructor bio (burned out at three
years, a patient threw a gait belt) · a 14-question FAQ · closing CTA.

- CTA: "Get started now for only $599!" / "I'M READY!", repeated about eight times.
- FAQ questions worth noting because they are the objections: can't afford a
  pay cut; still paying loans; too busy and exhausted; not sure I'm ready;
  other courses never changed anything; can't I figure it out alone; how do I
  talk to my spouse; I'm an assistant; I'm a new grad; is it too late.
- Guarantee: none on the page. The terms of use say refunds are case by case
  and typically not given.
- Proof: 5,000+ students and 55,000+ group members (homepage), four named
  success stories with new titles, a 20+ testimonial carousel, "featured on"
  logos, and an unsourced claim that many grads report a 20%+ raise.

### Hand-offs

The mini-course thank-you page links nothing paid. The SLP article
(https://thenonclinicalpt.com/alternative-careers-speech-pathologists-slps/,
14 paths) ends with the email list, the Facebook group and a Non-Clinical 101
link that points at the **offline** academy domain. The Q2 2026 hiring
report article pitches the course and the paid community's two-week head
start on job postings.

### What keeps buyers using it

The jobs feed. Early access to postings (two weeks before the public
newsletter, per the Q2 2026 report page) and a quarterly hiring report give
people a reason to come back every week.

---

## 3. The Clinician Transition (Emma Brady and Emily Kelly, PTs)

The domain is **thecliniciantransition.com** (cliniciantransition.com does
not resolve). A volunteer-run community, not a store.

- Offers: free LinkedIn and Slack communities, a podcast (hosts are PTs with
  an SLP guest host), a blog, and a favorite-resources page marked as coming
  soon. A book of the same name is on Amazon (price not checked).
  **No paid entry product, no quiz, no lead magnet found.**
- Community rules ban the word burnout in posts and prefer calling the move
  non-traditional rather than leaving. Tone is curious rather than escape-driven.
- Podcast (https://tct.buzzsprout.com/): recent episodes cover sales careers,
  customer experience, getting a recruiter's attention in seconds, and moving
  toward something rather than away. Theme: people don't know where to go
  next, not that they need permission to leave.

Sources: https://www.thecliniciantransition.com/, `/home-1`, `/podcast`,
`/favorite-resources`.

---

## 4. Practitioner Pivot (Hannah Pugh) and Non-Clinical Gig (Cody Thompson)

**Practitioner Pivot**: practitionerpivot.com did not resolve today. We
already own and read her Getting Started Bundle (see
`competitor-practitioner-pivot-bundle.md`): a folder of files (webinar,
deck, networking guide, résumé checklist) built on one framework, sold on
one diagnosis, that most people start at the résumé. Price was not recorded
in that file and is unknown here.

**Non-Clinical Gig** (https://nonclinicalgig.com/, founder Cody Thompson, PT;
the search engine associates it with Practitioner Pivot, but the page names
Thompson):

- ReDefined book as an instant download, plus the ReDefined Bundle (roadmap +
  book) at **$49**, sold on Payhip (checkout pages blocked by Cloudflare, so
  contents beyond the homepage copy are unknown).
- Career Compass package (https://nonclinicalgig.com/compass): discovery
  call, résumé and cover letter, LinkedIn and networking strategy, **with the
  $49 bundle included free**. Price not shown.
- StreamAhead assessment (affiliate link to careercliniq.com).
- Proof: an SLP quote placed first, Julie, MS, CCC-SLP, now a clinical
  manager, remote within four months at a 20% raise; three more named quotes
  with before and after titles (PA to professor, PT to RTM specialist, PT to
  revenue cycle manager); a claim of helping 200+ clinicians.
- A plain disclaimer that nothing guarantees a role.

---

## 5. SLP-specific competitors

Two searches ("SLP career change coach", "non-clinical SLP" coaching) turned
up no SLP-only business selling a low-priced entry product. Results were
NCPT's SLP article, generic "alternative careers for SLPs" listicles, résumé
template sites, ASHA's mentorship program, and slptransitions.com itself. The
closest SLP-facing proof in the market is Non-Clinical Gig's CCC-SLP quote.

---

## What SLP Transitions should borrow

Scoped to the quiz result page (the $9 sales moment), the report delivery
and the $24 Suite page. Nothing here adds a product.

1. **Put one named buyer quote beside the $9 button, and start collecting it
   now.** TCC's $9 page carries exactly one testimonial (first name + role);
   Non-Clinical Gig leads with a CCC-SLP's before and after title. We have no
   cleared report quote, so add one question to the report delivery email
   (or the day-7 email in item 5): "Would you let us quote one sentence, first
   name and former setting only?" The first yes goes under the result-page
   button. Proof rule unchanged: nothing until it is cleared.

2. **Split the "applying" stage into the two stuck points TCC found.** TCC's
   second quiz separates "not getting interviews" from "getting interviews,
   no offer" (its results page now 404s, so nobody is serving this well).
   Replace the single action-stage answer with those two, and point each at
   the part of the $24 Suite that fixes it: the rewritten résumé and match
   score for the first, the interview answers for the second. Same offer,
   named for their actual problem.

3. **Say how the refund works, in one line, next to both buttons.** TCC's
   course names the mechanism (email within 30 days, full refund, even when
   life gets in the way); TCC's $9 page and NCPT show none, and NCPT's terms
   say refunds are typically not given. Ours already promises 30 days; add
   the how: reply to the receipt email within 30 days. This is a place we
   are already ahead, so make it concrete.

4. **Hand the report over as a file as well as a page.** TCC's $9 guide is a
   40-page PDF with a transition checklist, and the Practitioner Pivot bundle
   is a folder of files the buyer owns. Add a print/save-as-PDF button to the
   finished report and a one-page 30-day checklist (the plan's weeks as
   tick boxes, the first move at the top), linked in the delivery email.
   A phone buyer can then keep it without the tab.

5. **Send report buyers two use-it emails: day 7 and day 21.** Every guest
   story checked (TCC ep 42, the ep 199 survey, our own research-facts line
   on referrals) says the job came through a person, and our report already
   writes three LinkedIn messages. Today nothing after delivery asks whether
   they were sent (the crons cover stalled intakes and quiz takers only).
   Day 7: their first move and the three messages again, "who did you send
   one to?". Day 21: "did anything move?", which also feeds the story intake.
   NCPT's weekly jobs email shows a recurring reason to come back works; what
   TCC sends after the $9 purchase is unknown.

6. **Credit the $9 toward the $24 Suite once the sale ends.** NCPT credited
   its $79 crash courses toward the $599 course (per search result; the
   academy is now offline), and Non-Clinical Gig folds its $49 bundle into
   its coaching package. The report's existing cross-sell ("Try it free ·
   $24") becomes "$15 for you" via a Stripe coupon on the carried-over
   session. While every product is $9 this does nothing, so it belongs in
   the end-of-sale checklist.

7. **Open the Suite page on the application problem, with our own number.**
   TCC's course names applying and never hearing back as a pain
   and its survey found 40 to 50 applications per landed job; NCPT's pain
   list is written in clinic language (productivity, billing). Their numbers
   are about teachers, so use research-facts instead: 113 tailored
   applications, 7 interviews, 1 offer over 11 months, and referrals decide
   most transitions. The Suite's promise, one posting rewritten properly
   instead of fifty generic ones, follows from that.

8. **Answer "why not just use ChatGPT?" on the Suite page.** TCC's course
   page spends a benefit block on HR-written templates versus ChatGPT, and
   NCPT's FAQ answers whether you could just figure it out alone. The Suite is an
   AI product, so the question is sharper for us. Answer it with what is
   true and sourced: the banned-word list, placeholders instead of invented
   numbers, SLP-specific guardrails (Epic sponsorship, MSL), and the
   research-facts line that 62% of employers reject AI résumés that lack
   personalisation. One short block near the paywall, not a full FAQ (James
   cut a five-question FAQ from the kit page; this is one question).

**Not worth borrowing:** a permanent "usually $19" anchor on a price that is
always $9 (TCC); a dollar "value" on every bullet (NCPT); refunds hidden in
the terms (NCPT); outcome claims without a source, such as NCPT's many-grads-get-a-20%-raise line
(NCPT); linking a paid offer to a dead domain (NCPT's SLP article).
