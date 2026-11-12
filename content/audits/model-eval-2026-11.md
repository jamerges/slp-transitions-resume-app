# Which model writes the products (2026-11-11)

The app moved from Claude Sonnet 4.6 to **Claude Opus 5.5 at low effort** on 2026-11-11. Set `ANTHROPIC_MODEL_ID=claude-sonnet-4-6` in Vercel to go back without a code change.

## What was run

The app's own prompts, through the app's own `callClaude`, on three invented résumés (hospital SLP to customer success, school SLP to instructional design, skilled-nursing SLP to clinical liaison) and two quiz answer sets. 19 generations, about $4 of API use. Every check below is mechanical, plus one read of the documents side by side.

## Results

| Product | Model | Time | Cost each | Em dashes | Other problems found |
|---|---|---|---|---|---|
| Free preview (3 cases) | Sonnet 4.6 | 20 to 23s | $0.02 to $0.03 | 0 | Invented a "68% uptake rate" from the wrong denominator. Résumé bullets that comment on the job ("a core responsibility of the liaison role"). One action referred to a JSON field by name. Scored a liaison role 88% for someone with no sales or referral experience. |
| | **Opus 5.5 low** | **14 to 17s** | $0.05 to $0.06 | 0 | None of those. Scores were lower and matched the gaps it listed (56 to 63%). |
| | Opus 5.5 medium | 19 to 28s | $0.06 to $0.08 | 0 | Same quality as low, more tokens. |
| Paid Suite package (2 cases) | Sonnet 4.6 | 106 to 113s | $0.12 to $0.13 | 28 and 37 | "Seven years at Mercy General" (the résumé says six). "Nearly 10 years" (it is nine). A banned sentence shape in the cover letter ("was not the content. It was follow-up"). The reader's name in the third person. |
| | **Opus 5.5 low** | **57 to 67s** | $0.22 | 0 | Years correct. Bracketed placeholders where a number was missing, which is the rule. One soft outcome the résumé didn't state ("cutting documentation time"). |
| | Opus 5.5 medium | 98 to 112s | $0.36 to $0.38 | 0 | No better than low on these checks. |
| $9 Pivot Report (2 answer sets) | Sonnet 4.6 | 75 to 78s | $0.06 | 31 and 0 | |
| | **Opus 5.5 low** | **43 to 45s** | $0.11 to $0.12 | 0 | Same structure, slightly shorter. |

## What it costs

About 10 cents more per $24 Suite sale, 5 cents more per $9 report, and 3 cents more per free preview. Previews are rate limited (12 an hour per IP).

## What changed in the code

- `lib/anthropic.ts`: the default model, `output_config.effort` (`ANTHROPIC_EFFORT` overrides `low`), 8,000 tokens of room for thinking on top of each call's limit (thinking is always on for this model and counts toward the limit), streamed responses, a plain error if a safety classifier declines, and the server-side fallback that reruns a declined request on another model.
- The installed Anthropic SDK is 0.32.1, which predates `output_config` and `fallbacks`. It passes both through untouched, and all 19 runs were accepted. Upgrading the SDK is a separate job.

## What this did not test

- Long résumés (20 years of jobs). The retry with twice the room is unchanged.
- Refine ("rewrite this section") and the explore results, which share the same call.
- Whether buyers like the output better. The feedback email that started the same day is the measure of that.
- Preview scores are lower and more honest on this model. If fewer people buy after a 56% than after an 88%, that will show in GA as fewer `begin_checkout` events with `placement: preview_top` per preview.

## Running it again

`scripts/model-eval/` holds the two scripts and the dev-only route they call. Copy `route.ts.txt` to `app/api/test-eval/route.ts`, start the dev server, run `python3 scripts/model-eval/model_eval.py preview out.json` (or `full`), then delete the route before committing.
