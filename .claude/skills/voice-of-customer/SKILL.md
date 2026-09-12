---
name: voice-of-customer
description: Check any draft (blog, email, social post, landing copy) against how SLPs actually talk about leaving clinical work, and against James's brand voice. Also used to fold new community screenshots/pastes into the VoC corpus.
---

# Voice-of-Customer Check

You are auditing a piece of SLP Transitions copy against two documents:
1. `content/voice-of-customer.md` — the *reader's* language (phrase bank, themes, register rules)
2. `content/style-guide.md` — the *writer's* voice (James: empathetic-direct, anti-hype, psychology-literate, self-deprecating)

Read both before judging anything.

## Mode 1 — Audit a draft (default)

When given a draft (pasted text or a file path):

1. **Stage check**: identify which emotional stage (1–5, per VoC §1) the piece targets,
   and whether the language matches that stage. Flag stage mismatches first — they're
   the most expensive error (e.g. ATS-keyword talk aimed at a reader who hasn't
   admitted she wants out yet).
2. **Line flags**: go through the draft and flag every instance of:
   - Marketer-tells (VoC §4 banned list) and AI-tells (lib/anthropic.ts banned words
     + structural tropes: negation pivots, em-dash overuse, triad stacking, aphorism openers)
   - Pain-mirroring past the quota (trapped/guilt/permission/"I want out" — max once each)
   - Vague numbers where exact ones exist in content/research-facts.md
   - ASHA/CCC bashing or bitterness (brand violation)
   - Identity-erasure framing ("reinvent yourself") instead of continuity framing
   - Hype closes ("you've got this!") instead of permission-granting closes
3. **Rewrites**: for each flag, offer a replacement in the reader's own register,
   pulling from the VoC phrase bank where a verified quote or theme fits.
4. **Output format**: a short verdict (ship / fix-then-ship / rework), then a table:
   `Line/excerpt | Problem | Rewrite`. End with the 1-2 highest-leverage changes,
   not an exhaustive lecture.

Never rewrite the whole piece unless asked — James's voice should stay his.

## Mode 2 — Fold in new community material

When given screenshots, pasted posts, or comment threads from Facebook groups,
Reddit, or LinkedIn:

1. Extract: exact phrases (mark ✅ verified, note source + rough date), recurring
   themes, and the *questions people ask* (questions = objections = future copy angles).
2. Strip all names and identifying details.
3. Update `content/voice-of-customer.md` in place — add to the right section, keep the
   ✅/⚠️ status convention, don't duplicate existing entries.
4. If a new theme contradicts an existing ⚠️ entry, update the entry rather than
   appending a second opinion.

## Hard rules

- Never fabricate a quote. Anything not verifiably sourced is a ⚠️ theme, phrased as
  a pattern.
- Never put verbatim customer data (quiz answers, report inputs, emails) into public
  copy — themes only.
- The check covers register, not facts. Factual claims route to
  `content/research-facts.md` (every content claim must trace to it).
