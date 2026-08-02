# SLP Career Pivot Suite — project guide for Claude

Paid web tool + funnel for SLPs (speech-language pathologists) leaving clinical work.
Live at **https://app.slptransitions.com** (also slp-transitions-resume-app.vercel.app).
Marketing/WordPress site: **slptransitions.com** (SiteGround; Kadence theme; separate from this repo).
Owner: James Berges (jamoberges@gmail.com) — SLP → growth marketer; hosts the Xceptional Leaders podcast.

## The product ladder (strategy: content/product-strategy.md)
1. Free career quiz → `/quiz` (email-gated result, tags MailerLite with `quiz_result`)
2. **$9 Pivot Report** — quiz result → **Stripe** → `/report` collects the resume *after* payment. Pay-first is deliberate: the pre-payment resume upload was the funnel's biggest drop (people take the quiz on a phone, nowhere near their resume). `report-finalize` returns `needsIntake` for a paid session with no resume, and emails a link back so a phone buyer can finish from a laptop.
3. **$24 Career Pivot Suite** — resume + job posting → free preview → Stripe → `/success` (full package)
4. Later: Transition OS ($79-99), cohort, employer layer via podcast. One ICP, one funnel — park anything else.

## Stack & architecture
- Next.js 16 App Router, TypeScript, React 18, inline-style design system (tokens in `app/globals.css` `:root` — **never rely on inline `--var` style objects; React's server renderer drops them**).
- Anthropic SDK server-side only (`lib/anthropic.ts`, model `claude-sonnet-4-6`). System prompt = research-backed rules: banned AI-tell words, never fabricate numbers (bracketed placeholders), push→pull burnout reframing, factual guardrails (Epic cert needs employer sponsorship; MSL is doctorate-gated; UXR saturated).
- Stripe Checkout, **LIVE MODE since 2026-07-31** — production charges real cards. Webhook endpoint exists + verifies signature. `lib/stripe-guard.ts` (`assertKeyPriceMatch`) fails the request if key mode and price mode ever diverge, so a half-switched env surfaces loudly instead of silently. Live $24 price: `price_1TzOQ0KyPrmclvwmStUeaCoj` (also the in-code fallback in `app/api/checkout/route.ts`). The $9 live price comes from `STRIPE_REPORT_PRICE_ID`. Old test IDs (`price_1TRlBQ…` $24, `price_1Tz6Tj…` $9) are historical and are what `KNOWN_TEST_PRICES` still guards against. **Env var names differ between the two products** — `STRIPE_PRICE_ID` ($24) vs `STRIPE_REPORT_PRICE_ID` ($9); updating one and assuming the other followed is how the $24 flow broke on launch day.
  - **Never run a live-mode E2E with a real card.** Both checkout routes set `allow_promotion_codes: true`: create a 100%-off live coupon, run the flow at $0.00, then deactivate it.
  - Anything touching a payment path is now a change to a money-handling system. Validate before it can reach a buyer, not after.
- Upstash Redis via `lib/stash.ts` (inputs + results, 7-day TTL). Not configured locally — payloads >450 chars fail checkout in dev; short test payloads fit Stripe metadata and work.
- Resend (`send.slptransitions.com`, verified) for transactional; MailerLite for marketing list (~2,500 subs, cold — see content/list-reactivation.md before ANY blast).

## Key flows / files
- `components/SLPCareerSuite.tsx` — main wizard. URL params: `?continue=<stripe_session>` rehydrates paid inputs via `/api/session-inputs`; `?from=quiz&path=<ROLE_OPTION>` pre-selects target; `+&goal=report` routes resume → REPORT_INTAKE → $9 checkout.
- `lib/quiz.ts` + `components/CareerQuiz.tsx` — in-app quiz (8 sectioned questions; experience-weighted scoring; 8 paths each with exact `roleOption` chip mapping + icon). `/quiz/embed` = chrome-free iframe version for the WordPress career-quiz page (CSP frame-ancestors in `next.config.mjs`; height postMessage).
- `app/api/finalize` ($24) & `app/api/report-finalize` ($9): verify paid session → retrieve stashed inputs (`stash_key` metadata, NOT session id) → generate → email → cache result by session id. **maxDuration 300**; full generation runs as two parallel prompts (buildFullPromptParts: materials + guidance, disjoint keys merged with a spread) — ~93s wall vs ~140s single-call. 120s maxDuration once caused killed functions (no render, no email).
- `app/api/refine` — buyers rewrite 6 sections, 10× cap. `app/api/parse-resume` — server-side PDF/DOCX (unpdf/mammoth). `app/api/fetch-job` — job-posting URL → text (SSRF-guarded; LinkedIn/Indeed block readers).
- `lib/email.ts` — all transactional templates. `lib/companies.ts` — 123-company DB + matching; ROLE_OPTIONS (functions) vs INDUSTRY_OPTIONS (separate axis).

## Workflows
- **Dev**: preview server via `.claude/launch.json` (`slp-career-suite`, port 3000). Shell wrapper exports empty `ANTHROPIC_API_KEY` — launch config handles it; if running manually, `unset ANTHROPIC_API_KEY` first. Secrets in `.env.local` (gitignored).
- **Typecheck**: `./node_modules/.bin/tsc --noEmit` before every commit.
- **Deploy**: push to `main` → Vercel auto-deploys (~90s). Plain `git push origin main` — `credential.helper` is set to `osxkeychain` (it previously pointed at a deleted `/tmp/gh` binary, which failed confusingly). Never paste a PAT into chat or bake one into a command: GitHub's secret scanning revokes exposed tokens, which is what broke the last two. Verify prod by curling the API routes, not by hammering pages (tripped Vercel bot protection once).
- **Test generation quality** dev-only: create a temp `app/api/test-*/route.ts` gated on NODE_ENV=development, curl it, **delete before committing**. Quality checks: banned words, burnout leakage into documents, fabricated numbers, stage grounded in `transitionStage`.
- **Test purchases**: LIVE mode — a real card is a real charge. Use a 100%-off live promo code (`allow_promotion_codes` is on for both prices), then deactivate it. Card 4242… only works if you point env at test keys.

## State & other memory
- **Notion HQ** (boulders Now/Next/Later + to-dos kanban): https://app.notion.com/p/3ae8bea627688165859cd63024729aa4
- `content/` = all strategy docs, 12 ready blog posts, email sequences (13), distribution playbook, list-reactivation plan, WordPress page copy + quiz embed snippet, research-facts.md (**every content claim must trace to this file**), style-guide.md (James's voice).
- Auto-memory has the focus/ladder decision. Deploy emails to James come from `results@send.slptransitions.com`.

## Open items (also in Notion HQ)
- **Validate the pay-first $9 flow against live Stripe with a 100%-off promo code** — deployed 2026-08-01, never run end-to-end (Upstash isn't configured locally, so the post-payment resume step can only be exercised in prod). If `report-intake` fails, buyers pay and get nothing.
- James: swap Typeform embed on slptransitions.com/career-quiz/ for `content/wordpress-quiz-embed.html`; publish blog posts; MailerLite sequences; add buyers to a "Customers" group in finalize (code TODO)
- 30-day refund promised on paywalls — honor it

## WordPress publishing (added 2026-08-01)
- REST API works; auth = `WP_APP_USER` + `WP_APP_PASSWORD` (Application Password, in `.env.local`, **unspaced** — WP ignores the spaces and unspaced avoids shell-quoting issues). Note `.env.local` has a pre-existing multi-line value that breaks `source`; parse the WP vars directly instead.
- `scripts/wp_publish.py` = helpers (markdown→Gutenberg blocks, FAQ + FAQPage JSON-LD, quiz CTA group, media upload). `scripts/publish-day1.py` = the per-post config (category, CTA line, authored FAQs, internal links) + runner. Pass a slug as argv[1] to publish just one.
- Live cluster (2026-08-01): slp-transferable-skills 3389, slp-resume-non-clinical 3391, slp-cover-letter-non-clinical 3393, slp-linkedin-career-change 3395, should-you-quit-slp 3397. Remaining 7 posts in `content/blog/` are unpublished.
- Verify after publishing by curling the live URL: check FAQPage JSON-LD parses, featured image, quiz CTA, internal links, and that no raw markdown (`**`) leaked.

## MailerLite (fixed 2026-08-01)
- `lib/mailerlite.ts` is the single source of group ids + field names. **MailerLite silently ignores unknown `fields` keys** — that's how `quiz_result` was dropped for every quiz taker since launch (the field didn't exist on the account). Adding a new field here means creating it in MailerLite first.
- `QUIZ_PATH_GROUPS` is keyed by **`roleOption`** (from lib/quiz.ts), NOT the display label — they differ for Data Analysis, Instructional Design, and Content Strategy / Marketing. A key miss fails silently, adding no group.
- Root cause of the outage: Vercel's `MAILERLITE_API_KEY` (added Apr 29) predated the working token (created Apr 30), so production 401'd and skipped. A stray `Mailerlite_API_Key_quiz` var held a Stripe `sk_live_` key and was deleted.
- List shape: ~2,481 active, but only ~851 in "Ed and Health Tech List" and **~1,628 in no group at all**. Reactivation must be two-track — see content/list-reactivation.md.
- Buyers auto-join Customers groups from both finalize routes with `customer_product` set.

## Aug 2026 sweep — findings (Notion: "Action Plans — Aug 2026")
- **Secrets leaked in Notion.** The "Resume reviewer web app" sub-page holds plaintext Anthropic, MailerLite, Resend + Stripe test keys. Rotate before scrubbing; scrubbing alone doesn't un-leak.
- **Five finished interviews sit unpublished in Drive** (Katie Seaver ~90%, Jeannie Baranowski, Lucinda Bowman, Porcupine Coffee, Jon). Katie Seaver is also Rachel Levy's Babel Group co-founder and emailed Aug 2025 — still unread — offering a cross-post on their blog.
- **Biggest unwritten content gap is PSLF / student loans** — readers name it as the specific blocker, and there's zero coverage. Then part-time/fractional roles, remote-for-health, and "should I keep paying for ASHA."
- **Reader mail dries up after 2024**, matching the MailerLite outage. The list isn't just distribution — it's the voice-of-customer input.
- Dead links in old plans: rehabrebels.org now redirects elsewhere; slpburnoutcoach.com has an expired cert (both are named affiliate/pitch targets).
- The Notion to-do that said "real card, real $24, then refund yourself" has been corrected — it contradicted the live-mode rule above.

## Homepage design system (2026-08-02)
- Hero rebuilt: cream/white, kicker + 58px H1 ("You're more than just a clinician." — the brand reframe from the style guide), subhead, quiz CTA, proof line ("Free · 2 minutes · built on 123 companies"). Font sizes use clamp() — fixed px broke mobile. The old hero was a 600px-wide band with an off-brand #2f44f5 gradient over 2021 Unsplash stock.
- Site tagline (Settings → General) was "Learn How SLPs find fulfilling second careers" and leaked into Yoast JSON-LD; now "Non-clinical careers for SLPs — real salary ranges, honest timelines, real stories."
- Site favicon was a cropped Unsplash photo since 2021; now the split-road-sign logo (media 3495).
- WP gotcha: re-uploading media under the SAME filename does NOT regenerate the -300x158/-600x315 crops — grids keep serving stale thumbnails. Always upload under a versioned filename.
- Homepage structure: hero → Start Here grid (cat 99) → Real Transitions grid (cat 100) → Browse-all → 4 value props → closing quiz CTA. Grids are category-driven; publishing new posts can't evict the guides.
