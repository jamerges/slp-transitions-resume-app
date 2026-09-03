# August 2026 sends — 15-minute MailerLite session

> **Batch 1 SENT 2026-09-03 via API** (details in CLAUDE.md, MailerLite section). Quiz-takers campaign still unsent. The "content is Premium-gated" note below is wrong: create accepts content, update ignores it.

The API on this plan can't submit email *content* (Premium-gated), so the copy
below gets pasted in the MailerLite UI. Everything else is already done:

- **Draft shells exist** under Campaigns → Drafts, with name, subject, sender
  and audience already set:
  - `2026-08 · Quiz takers — your result + the Pivot Report` → all 8 quiz-path groups (~19 people)
  - `2026-08 · Reactivation batch 1 (200 newest)` → group "Reactivation 2026-08 — batch 1" (200 members, verified)
- Deep links verified live (they enter the $9 report flow with the path carried).

## Steps

1. **Campaigns → Drafts → open the quiz-takers shell.** Build the body from
   `quiz-takers.html` (paste into the custom-HTML editor if your plan shows one;
   otherwise recreate in the drag-and-drop editor from `quiz-takers.txt` — it's
   five paragraphs and one button). **Before sending, use Preview with a real
   subscriber** to confirm `{$quiz_result}` renders their path, not the literal
   tag. Send.
2. **Open the batch-1 shell**, same procedure with `reactivation-batch1.*`. Send.
3. **Automations → Simple welcome email:**
   - **Email 1:** replace the Airtable link (`airtable.com/appywCZNDxFveMSks/...`)
     with `https://app.slptransitions.com/companies`. This is the last place the
     retired list is still being handed out — 608 clicks have gone through it.
   - **After Email 2 ("5 biases"):** add a delay of 1 day, then a new email:
     subject `The part the free tools can't see`, body from `welcome-email-3.*`.

## 48-hour checkpoint (before batch 2)

Per `content/reengagement-sequence.md`: batch 1 needs **>25% opens and <0.3%
spam complaints** before the next 500 go out. If opens land under ~15%, stop
and rethink rather than pushing on. Ask Claude to pull the stats — they're
readable via API.

## Copy rules honored

Voice per style-guide (no hype, no banned constructions), all salary figures
trace to research-facts.md, unsubscribe link in every body, James introduced as
former SLP → copywriter/content strategist in mental-health tech.
