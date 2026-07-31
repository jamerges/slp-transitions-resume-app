# SLP Career Pivot Suite — project guide for Claude

Paid web tool + funnel for SLPs (speech-language pathologists) leaving clinical work.
Live at **https://app.slptransitions.com** (also slp-transitions-resume-app.vercel.app).
Marketing/WordPress site: **slptransitions.com** (SiteGround; Kadence theme; separate from this repo).
Owner: James Berges (jamoberges@gmail.com) — SLP → growth marketer; hosts the Xceptional Leaders podcast.

## The product ladder (strategy: content/product-strategy.md)
1. Free career quiz → `/quiz` (email-gated result, tags MailerLite with `quiz_result`)
2. **$9 Pivot Report** — quiz result → resume → stage question → Stripe → `/report`
3. **$24 Career Pivot Suite** — resume + job posting → free preview → Stripe → `/success` (full package)
4. Later: Transition OS ($79-99), cohort, employer layer via podcast. One ICP, one funnel — park anything else.

## Stack & architecture
- Next.js 16 App Router, TypeScript, React 18, inline-style design system (tokens in `app/globals.css` `:root` — **never rely on inline `--var` style objects; React's server renderer drops them**).
- Anthropic SDK server-side only (`lib/anthropic.ts`, model `claude-sonnet-4-6`). System prompt = research-backed rules: banned AI-tell words, never fabricate numbers (bracketed placeholders), push→pull burnout reframing, factual guardrails (Epic cert needs employer sponsorship; MSL is doctorate-gated; UXR saturated).
- Stripe Checkout, **test mode** ($24 `price_1TRlBQKyPrmclvwmo8coeL30`, $9 `price_1Tz6TjKyPrmclvwmJBqCzPcB`). Webhook endpoint exists + verifies signature. **Live-mode switch is the gate to revenue** — needs live keys, live webhook, business rename from "Buy Me a Coffee".
- Upstash Redis via `lib/stash.ts` (inputs + results, 7-day TTL). Not configured locally — payloads >450 chars fail checkout in dev; short test payloads fit Stripe metadata and work.
- Resend (`send.slptransitions.com`, verified) for transactional; MailerLite for marketing list (~2,500 subs, cold — see content/list-reactivation.md before ANY blast).

## Key flows / files
- `components/SLPCareerSuite.tsx` — main wizard. URL params: `?continue=<stripe_session>` rehydrates paid inputs via `/api/session-inputs`; `?from=quiz&path=<ROLE_OPTION>` pre-selects target; `+&goal=report` routes resume → REPORT_INTAKE → $9 checkout.
- `lib/quiz.ts` + `components/CareerQuiz.tsx` — in-app quiz (8 sectioned questions; experience-weighted scoring; 8 paths each with exact `roleOption` chip mapping + icon). `/quiz/embed` = chrome-free iframe version for the WordPress career-quiz page (CSP frame-ancestors in `next.config.mjs`; height postMessage).
- `app/api/finalize` ($24) & `app/api/report-finalize` ($9): verify paid session → retrieve stashed inputs (`stash_key` metadata, NOT session id) → generate → email → cache result by session id. **maxDuration 300** — full generation runs ~140s; 120 caused killed functions (no render, no email).
- `app/api/refine` — buyers rewrite 6 sections, 10× cap. `app/api/parse-resume` — server-side PDF/DOCX (unpdf/mammoth). `app/api/fetch-job` — job-posting URL → text (SSRF-guarded; LinkedIn/Indeed block readers).
- `lib/email.ts` — all transactional templates. `lib/companies.ts` — 123-company DB + matching; ROLE_OPTIONS (functions) vs INDUSTRY_OPTIONS (separate axis).

## Workflows
- **Dev**: preview server via `.claude/launch.json` (`slp-career-suite`, port 3000). Shell wrapper exports empty `ANTHROPIC_API_KEY` — launch config handles it; if running manually, `unset ANTHROPIC_API_KEY` first. Secrets in `.env.local` (gitignored).
- **Typecheck**: `./node_modules/.bin/tsc --noEmit` before every commit.
- **Deploy**: push to `main` → Vercel auto-deploys (~90s). Push with `git push https://x-access-token:<GITHUB_PAT>@github.com/jamerges/slp-transitions-resume-app.git main` — the PAT is in this repo's git remote helper failing, so use the token from `.env.local`-era chats or ask James. Verify prod by curling the API routes, not by hammering pages (tripped Vercel bot protection once).
- **Test generation quality** dev-only: create a temp `app/api/test-*/route.ts` gated on NODE_ENV=development, curl it, **delete before committing**. Quality checks: banned words, burnout leakage into documents, fabricated numbers, stage grounded in `transitionStage`.
- **Test purchases**: test mode, card 4242 4242 4242 4242. Full E2E has been done for both prices.

## State & other memory
- **Notion HQ** (boulders Now/Next/Later + to-dos kanban): https://app.notion.com/p/3ae8bea627688165859cd63024729aa4
- `content/` = all strategy docs, 12 ready blog posts, email sequences (13), distribution playbook, list-reactivation plan, WordPress page copy + quiz embed snippet, research-facts.md (**every content claim must trace to this file**), style-guide.md (James's voice).
- Auto-memory has the focus/ladder decision. Deploy emails to James come from `results@send.slptransitions.com`.

## Open items (also in Notion HQ)
- Stripe live-mode switch (top priority for revenue)
- James: swap Typeform embed on slptransitions.com/career-quiz/ for `content/wordpress-quiz-embed.html`; publish blog posts; MailerLite sequences; add buyers to a "Customers" group in finalize (code TODO)
- 30-day refund promised on paywalls — honor it
