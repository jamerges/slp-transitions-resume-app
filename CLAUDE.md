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
- `lib/quiz.ts` + `components/CareerQuiz.tsx` — in-app quiz (8 sectioned questions; experience-weighted scoring; **9 paths** each with exact `roleOption` chip mapping + icon). Adding a path touches three coupled places: `PATHS` here, a matching chip already present in `ROLE_OPTIONS` (lib/companies.ts), and a new `QUIZ_PATH_GROUPS` entry + real MailerLite group — a missing group key fails silently. Score ceilings should stay in a tight band; compute them from source rather than by hand (they drifted to 14–22 before the 2026-08 rebalance, so Content/Marketing could barely win). Clinical Research / Study Coordinator is deliberately scored **-4** for anyone who needs to match their SLP pay — it is the one path whose documented range sits below where most SLPs already are. `/quiz/embed` = chrome-free iframe version for the WordPress career-quiz page (CSP frame-ancestors in `next.config.mjs`; height postMessage).
- `app/api/finalize` ($24) & `app/api/report-finalize` ($9): verify paid session → retrieve stashed inputs (`stash_key` metadata, NOT session id) → generate → email → cache result by session id. **maxDuration 300**; full generation runs as two parallel prompts (buildFullPromptParts: materials + guidance, disjoint keys merged with a spread) — ~93s wall vs ~140s single-call. 120s maxDuration once caused killed functions (no render, no email).
- `app/api/refine` — buyers rewrite 6 sections, 10× cap. `app/api/parse-resume` — server-side PDF/DOCX (unpdf/mammoth). `app/api/fetch-job` — job-posting URL → text (SSRF-guarded; LinkedIn/Indeed block readers).
- `lib/email.ts` — all transactional templates. `lib/companies.ts` — 123-company DB + matching; ROLE_OPTIONS (functions) vs INDUSTRY_OPTIONS (separate axis).

## Workflows
- **Dev**: preview server via `.claude/launch.json` (`slp-career-suite`, port 3000). Shell wrapper exports empty `ANTHROPIC_API_KEY` — launch config handles it; if running manually, `unset ANTHROPIC_API_KEY` first. Secrets in `.env.local` (gitignored).
- **Typecheck**: `./node_modules/.bin/tsc --noEmit` before every commit.
- **Deploy**: push to `main` → Vercel auto-deploys (~90s). Plain `git push origin main` — auth is `osxkeychain`, and as of 2026-08-15 that is finally the whole story. For a long time `~/.gitconfig` also carried per-host `[credential "https://github.com"]` / `[credential "https://gist.github.com"]` sections containing an empty `helper =` (a chain **reset**) followed by `!/tmp/gh_2.86.0_macOS_arm64/bin/gh auth git-credential`, a binary that no longer exists. Every push printed two "No such file or directory" lines and still worked only because the generic `[credential] helper = osxkeychain` sat *later* in the file and got re-added after the reset — reorder those lines and GitHub auth breaks outright. Both sections were removed (backup: `~/.gitconfig.bak-20260815-130235`); verified with fetch, ls-remote and push. If those noisy lines ever reappear, something re-ran `gh auth setup-git` from a temp install. Never paste a PAT into chat or bake one into a command: GitHub's secret scanning revokes exposed tokens, which is what broke the last two. Verify prod by curling the API routes, not by hammering pages (tripped Vercel bot protection once).
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

## Homepage (redesigned 2026-08-02, second pass — replaces the grid layout from earlier the same day)
- **Generated by `scripts/build_home.py`** — edit that script and re-run it (it updates page 2729 in place when pointed at the right slug; see its __main__). The page body is one wp:html block: page-scoped CSS + semantic HTML. Do NOT hand-edit the page in the block editor; regenerate instead.
- Structure: hero (headline + quiz/resume CTAs + proof line + 3-stage pathway cards) → affirmations row → 6 career-path cards → dark story band (3 real headshot avatars) → guides by stage → companies band → single-CTA closer, then the MailerLite Universal script block (preserve it on any regen — build_home.py does NOT include it; the swap appended it manually).
- **Every salary/timeline traces to research-facts.md.** Clinical informatics and UX research carry amber "Worth knowing" caveat boxes (Epic sponsorship-gated; UXR oversaturated) — these are factual guardrails, do not remove.
- Palette is anchored to the logo's sampled color (vivid emerald ~#00A080; deep emerald #0B6B54 for buttons, #0A3D31 dark band). Coral from the ChatGPT design brief was rejected; amber = warnings only.
- Kadence's .entry-content link color overrides button text — the CSS uses scoped !important for .slp-btn colors. This specificity fight is a standing argument for the planned Next.js migration of the marketing site (decided in principle 2026-08-02; do AFTER list reactivation + $9 validation).
- **Motion (2026-08-02):** staggered fade-up reveals only. A drawn hero route SVG and a fixed left-edge "journey rail" with a travelling marker were built and then removed at James's request — read as distracting rather than helpful. Do not reintroduce edge furniture or drawn lines without asking. Reveals use a scroll-loop sweep, NOT IntersectionObserver (instant anchor jumps skip intersections and strand elements hidden). All motion gates on a `.js-anim` class added by JS, so no-JS and reduced-motion users get the full static page with zero CLS.
- James's copy rules from this session: no eyebrow/kicker labels that restate the adjacent headline; one CTA per closing section; no AI-generated people (real guest headshots only — avatar crops live in the media library as *-avatar.jpg).
- The old grid-based homepage (Guides cat 99 / Real Transitions cat 100 postgrids) is backed up at /tmp/home_backup_pre_redesign.txt and in WP revisions. The categories still exist and still drive /blog organization.
- Site favicon = split-road logo (media 3495); tagline = "Non-clinical careers for SLPs — real salary ranges, honest timelines, real stories."
- WP gotcha: re-uploading media under the SAME filename does NOT regenerate the -300x158/-600x315 crops — always upload under a versioned filename.
- Off-brand MailerLite popup ("Ready for a Change?", bright blue, stock sunset) still fires site-wide — restyle or disable in MailerLite (not writable via API).

## Blog index (/blog) — generated page (2026-08-02)
- **`scripts/build_blog.py` renders /blog** (page 3459): featured latest post + "New" list of 5 + full-image grid, Osmind-inspired. The posts-page designation was removed (`page_for_posts=0`) because WP ignores content on a posts page. Kadence title band hidden via `_kad_post_title: hide` meta (REST-writable on pages).
- **⚠️ /blog does NOT auto-update. Re-run `python3 scripts/build_blog.py` after publishing any post.** It warns about posts missing featured images.
- Category chips link to /category/{guides,real-transitions,entrepreneurs,mindset}/ — those archives still use the stock Kadence template.

## Companies list — ONE source of truth (2026-08-02)
- **`lib/companies.ts` is canonical.** 120 companies (was 126; 6 removed 2026-08-16 after a link audit found them unreachable, and Expressable/Athelas URLs corrected). Re-audit with `scripts/probe_job_feeds.py`, which reports unreachable entries as a side effect. The old Airtable share link held the same rows in the same order and has been retired — do not re-introduce it. Archive it in Airtable so nobody edits a dead copy.
- Rendered at **app.slptransitions.com/companies** (`app/companies/page.tsx` + `components/CompaniesDirectory.tsx`). Search + 5 category facets. `noindex` with canonical to the WP lead-magnet page so the two don't compete.
- **No role filter, deliberately.** The `roles` field is observed-at-some-point, not live openings. Filtering or badging on it implied a job board we don't run. If live postings ever get ingested (see the weekly-digest idea in the Notion action plan), it can come back.
- Delivery chain: WP `/ed-health-tech-jobs/` → MailerLite form `105146994009311053` (groot 9454261) → group **Ed and Health Tech List** `105147013209786016` → automation `105149559028582086` → email. The form's success block now links straight to /companies.
- **⚠️ The MailerLite welcome email still links to the retired Airtable URL** — it must be edited by hand in MailerLite (automation email content isn't writable via their API).
- WP gotcha: the success-block button is a hand edit inside the pasted MailerLite embed. Re-pasting the form code from MailerLite wipes it; there's an HTML comment in the page saying so.
- Dead domain found 2026-08-02: **freshslp.com now redirects to a spam site** and was linked from the Mattie Murrey-Tegels post. Link removed, correction note added. Re-check other outbound links periodically.- **Section order (settled 2026-08-03): hero → career paths → real transitions → guides → companies band → final CTA.** Career paths sits at #2 deliberately: it is the only mid-page section that does NOT link off the homepage, and it answers the question readers actually arrive with. Stories and guides are both exit links, so they come after. A stories-first variant was built, measured and rejected — it put the first off-site link 1,100px higher up the page.
- The translation strip (clinical phrase → business phrase) was removed from the homepage: it explained a mechanism before the reader had reason to care. Pairs still live in content/blog/03-slp-transferable-skills.md and in TRANSLATIONS in build_home.py.

## Email marketing state (2026-08-06)
- **First-ever sends prepared.** MailerLite API can create campaigns/groups but NOT email content on this plan ("Premium" gate) — content is pasted in the UI. Kit: `content/email-campaigns/2026-08/` (README has the 15-min step list + 48h checkpoint thresholds).
- Draft shells live in ML: quiz-takers (→ 8 quiz-path groups, ~19 ppl) and reactivation batch 1 (→ group "Reactivation 2026-08 — batch 1", exactly 200 newest active non-quiz subscribers, membership verified by listing; `active_count` lags — trust the listing).
- Deep link contract (verified in code + live): `app.slptransitions.com/?from=quiz&goal=report&path=<roleOption>` → enters $9 report flow with target preselected; unmatched/dummy `path` still enters the flow, just without preselect. `{$quiz_result}` merge field holds the roleOption.
- Group-assign API calls fail silently under rate pressure — assign, then LIST the group and retry the diff (103/200 landed on the first pass).
- Welcome automation stats at baseline (before email 3): E1 851 sent / 91% open / 71% click; E2 72% open. Zero campaigns had ever been sent on the account before this.
- James's sender identity for marketing: "James from SLP Transitions" <james@slptransitions.com>; intro line = former SLP → copywriter & content strategist at a mental-health-tech company.
