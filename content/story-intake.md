# Transition stories: intake form → email → draft → published post

Built 2026-09-24. The form lives at **slptransitions.com/share-your-story/** (WordPress page, iframe of `app.slptransitions.com/share/embed`) and standalone at **app.slptransitions.com/share**. Code: `components/StoryForm.tsx`, `app/api/story/route.ts`, `lib/story.ts` (the one question list), `sendStorySubmission` / `sendStoryThanks` in `lib/email.ts`.

## What the old interviews had, and what the form adds

Two formats already run on the site:

- **2021–2023 written Q&A** (Emily Harford 3320, Lindsey 3180, clinical consultant 3300, Taimi 3195, slp-burnout 3112). Five questions every time: backstory and why you left, what you do now, training, how you found the job, advice. Summary line on top, "In this interview you'll learn" bullets, answers in the transitioner's own words. 1,000–1,800 words.
- **2026 podcast write-ups** (Rachel Levy 3425, Meredith Harold 3447 and nine more). "The short answer" box, takeaways, question-shaped H2s, "What to take from this", FAQ with FAQPage JSON-LD, quiz CTA. 1,700–3,000 words. This is the structure that wins search and AI answers.

The form keeps the Q&A's five questions and adds what readers ask about and the old posts never had:

| Added | Why |
|---|---|
| Settings and years (chips) | Readers look for "someone like me": a school SLP 8 years in reads a different story from a CF-year SNF SLP. |
| How long the search took, applications, interviews | The site's differentiator is numbers (113 apps / 7 interviews / 1 offer). Every story adds a data point. |
| How the job came to them (referral, cold, recruiter, internal) | research-facts says referrals decide most moves; each story either confirms it or is the interesting exception. |
| A normal week now | "What do you actually do all day" is the question under every "what's X like" search. |
| Did you have to take additional education, and what did that look like | Readers are about to spend money on certificates. What it cost, and whether they'd do it again, is the valuable half. |
| Résumé: what changed, one bullet before/after, optional upload | The most-asked question in the group, and the proof the Suite's promise is real. The file is never published. |
| Pay versus clinical, direction plus optional range, private unless ticked | Pay is the stage-4 question. Direction alone is still useful; a range is only published with the box ticked. |
| What was harder than expected | Keeps the stories honest; the site's voice is "the honest catch". |
| Credit: full name / first name / anonymous; photo optional | People in the group still work with people from their old job. Anonymous gets more stories told. |
| Consent and "you'll see the draft first" | Required. The thank-you email repeats the promise. |

Required fields are only first name, email, new job title and consent. Everything else is optional so a phone reply in the group can still become a story.

## The Facebook comment

> Congratulations! Would you share how you did it? It helps the next SLP more than anything I could write: slptransitions.com/share-your-story/ (about 15 minutes, and you see the draft before anything goes live)

## What James gets

An email "Story submission: {name}, SLP → {title}" to the ops inbox with every answer, the résumé and photo attached, reply-to set to the transitioner, and a **private link** (`/api/story?id=…&k=…`) that returns the whole submission as JSON, photo included. The submission is also stored in Redis (`story:<id>`, no expiry; `story:index` lists them). Owner listing: `GET /api/story` with `Authorization: Bearer <CRON_SECRET>`.

## Publishing (James says "draft the story from Jane")

1. Find the email in Gmail, open the private link, save the JSON.
2. Write the article in James's voice (read `content/writer-kit/` and `product-copy` first; the transitioner's words go in as quotes, never paraphrased into claims they didn't make; nothing the form marked private goes in: email, résumé text, pay unless `payPublic`, company unless `nameCompany`).
3. Template, the 2026 shape built from Q&A material:
   - **Title:** "SLP to {job title}: how {credit name} made the move" (anonymous: "An SLP who became a {job title}").
   - **The short answer** (2–3 sentences): from which setting and years, to which role, how long, how the job came.
   - **At a glance** list: Before · Now · Search (length, applications → interviews) · How it came · Pay (only if public).
   - **Question H2s**, each answered mostly in their words: Why did {name} start looking? · What does the new job look like week to week? · How did the job actually come? · What changed on the résumé? (the before/after bullet as a two-row block) · Did {name} need more education, and what did it look like? · What was harder than expected? · What would {name} tell an SLP in the old seat?
   - **What to take from this** (3 bullets, James's voice, each tied to research-facts.md where a number is used).
   - **FAQ** (3–4, `wp_publish.py` builds the FAQPage JSON-LD) and the **quiz CTA block**.
   - Category **Real Transitions (100)**; featured image from the headshot only if they gave one (never a generated face), otherwise the site's text-card header.
4. Create it as a **WordPress draft** (`scripts/wp_publish.py` helpers), then email the transitioner the draft text from James's Gmail as a draft for James to send. Publish only after both say yes, then re-run `python3 scripts/build_blog.py` and purge SiteGround.
