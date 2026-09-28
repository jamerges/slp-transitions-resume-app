# slptransitions.com audit: homepage and top articles (2026-09-28)

Pages: the homepage at 1280px and 375px; the 20-paths pillar (post 3358); should-you-quit (3397), transferable skills (3389), the résumé post (3391), the LinkedIn post (3395) and the five stages (3600). Lenses: visual hierarchy, information density, affordance, `product-copy`, `mechanics.md`, research-facts.md.

## Fix first: accuracy

1. **The pillar contradicts itself.** Its opening answer says software engineering or data analysis "can double your income". The table on the same page lists $80k–$96k and $70k–$105k.
2. **The pillar has two unsourced figures.**
   - "About 42% [of postings close] within two weeks": CLAUDE.md already notes this has no source.
   - "Over 1,000 non-clinical jobs were posted per quarter": not in research-facts.md.
3. **The homepage says "260 companies that hire former SLPs" four times.** James's settled wording is "health and ed-tech companies that value clinical skills". The trust line also says the quiz is "built from 260 companies", which isn't how the quiz works.
4. **"$154k+"** overstates the documented top of $154k (informatics, healthtech UXR).
5. **The sale banner** says "find clarity on your next steps with real career paths · every tool $9, for a limited time". It says nothing concrete and gives no end date. The sale ends Oct 5, so say so.

## The 20-paths pillar (highest intent page, weakest execution)

6. **It opens with meta.** "Before we dive in: a word on why this guide exists" runs about 230 words before the answer, and the answer is labelled "Direct Answer:". Lead with the answer, then one comparison table (path, pay, time to switch, whether it uses your licence) with jump links to each path. Today the salary table sits at 82% of a 5,200-word page and has no timeline column.
7. **There is no quiz link after word 648 of 5,200.** The page ends on the Module 0 block, whose button still reads "Find clarity, free" and which sells the kit. Since Sep 22 the doors lead with what sells: add the mid-article quiz prompt around 35% and 70%, and end on the quiz.
8. **Mechanics.**
   - 42 em dashes (the five August posts have zero).
   - "You got this!"
   - An h4 reading "Ok, I'm scared but ready to make the leap. what now?"
   - "Linkedin".
   - "Clinicians Love" in the title.
   - Seven category tags above the title, which wrap to three lines on a phone.
   - Two unlabelled dates ("August 7, 2026 September 21, 2026").

## Homepage

9. **On a phone, the header, logo and banner take about 190px before the headline.** The logo alone is about 120px tall.
10. **The trust line wraps awkwardly on a phone,** and the first stat card repeats it immediately.
11. **On desktop there is about 150px of dead space** between the hero and the pillar box.
12. **The pillar-box button is a lighter green** than every other primary button.
13. **Story blurbs use " - " as a dash** ("She went sideways first - clinical consultant at the company - then into marketing"). Rewrite the sentences instead.
14. **The guides section.**
    - The heading "Find resources whether you're exploring or already applying" fails the portability test.
    - The ↗ arrows suggest an external link, but the guides are on-site.
15. **There is no founder on the page.** A stranger can't tell who runs this. Add one line of documented biography (former SLP, content strategist at a mental-health-tech company, Xceptional Leaders podcast host) with a link to About.
16. **About is missing from both the header and the footer nav.**
17. **The footer.**
    - It shows "WordPress Theme by Kadence WP".
    - The logo sits in a visible grey box.
    - "Jobs & companies" wraps.

## Article template (all posts)

18. **The header graphic is a second, different headline.** should-you-quit shows "Bad workplace, bad fit, or bad season?" as an image, then the H1 "Should You Quit Being an SLP?". The image fills the first screen on desktop and on a phone, so the reader sees no text.
19. **Three type systems.**
    - The homepage uses a serif with DM Sans.
    - Articles use Cabin with Lato.
    - Header images use Georgia.
    - The app uses Playfair Display with DM Sans.
20. **Lines are too long:** 773px at 17px is about 90 characters. Aim for 65–75 (max-width about 680px, or 18px type).
21. **The sidebar is 11 category links,** several of them thin (Operations/support, Research). A quiz card would earn that space.
22. **There is no author box,** and the byline links to the homepage.
23. **Posts end on the FAQ with no closing CTA.** "Similar Posts" pulls in off-topic older posts (Ikigai, the entertainment-industry story).
24. **No article has an image or diagram in the body.**

## What already works

The five August/September posts:
- open in James's voice ("If you're reading this at 11pm with a treatment room's worth of unfinished notes…");
- have zero em dashes;
- carry FAQ schema;
- link to the quiz at about 35% and about 85%.

The homepage keeps to one idea per section and uses real headshots.

## Status (2026-09-28, same day)

Done: 1–8 (pillar republished; categories left as they are), 3, 5, 10, 11, 13, 14, 15, 16 (About restored), and the $154k+ label reworded with the plus kept (James: it is the founder case). 12 was a false alarm: the button was caught mid-fade. Not done: 23, because the quiz block already sits just above the FAQ on every post, so a third CTA after it would be noise. James's in Kadence: 9 (mobile logo size), 17, 18–22.

## Who can fix what

- **Claude, over REST or by script:**
  - 1–8 (rewrite the pillar's opening, move and extend the table, add CTAs, clean the mechanics);
  - 3–5 and 9–15 (`scripts/build_home.py`, then rebuild and purge);
  - 23 (a closing quiz CTA on posts).
- **James, in the Customizer or Kadence settings:**
  - 16 and 17 (the menu can be done over REST; the footer credit can't);
  - 18–22 (featured-image placement, fonts, content width, sidebar, author box, date labels);
  - the related-posts source.
