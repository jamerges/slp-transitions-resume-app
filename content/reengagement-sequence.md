# Re-engagement sequence (one track, whole list)

Supersedes the two-track plan sketched in `list-reactivation.md`. James's call, and
he's right: group membership here records *which form someone filled out*, not a
different ICP. Everyone on this list is an SLP who opted into a site about leaving
clinical work. One sequence, value-first.

## Who gets it

**Filter (build in MailerLite → Subscribers → Segments → Create):**
- Status is **Active**, AND
- **Has not received an email in the last 14 days**

That second rule mostly excludes people who just came through the welcome
automation — the only thing currently sending. Rebuild/refresh the segment before
each send so newly-welcomed subscribers keep rolling out of it.

## Before you send anything: the deliverability constraint

The API shows **zero campaigns ever sent** on this account. A list of ~2,481 mostly
dormant addresses, on a domain with no bulk-sending history, blasted in one go is
the textbook way to land in spam — and it would take the whole list with it.

**Send in ascending-risk batches, checking results between each:**

| Batch | Who | Wait for |
|---|---|---|
| 1 | 200 most recent subscribers | 48h — need >25% open, <0.3% spam complaints |
| 2 | Next 500 | 48h — same thresholds |
| 3 | Remainder (~1,700) | — |

If batch 1 opens below ~15%, stop and reconsider rather than pushing on. And send
Email 1 to a batch before anyone gets Email 2 — don't run the whole sequence for
batch 1 while batch 3 hasn't had Email 1.

Marketing sends go from the root domain; transactional runs on
`send.slptransitions.com`. Keep it that way — a spam spike on marketing shouldn't
be able to take down purchase-receipt delivery.

---

## Email 1 — Day 0

**Subject:** I built you something (and it's free)
**Preview:** No pitch. Just the thing I wish I'd had.

Hi {$name},

You signed up for SLP Transitions at some point — maybe for the companies list,
maybe from an article at 11pm when you were googling whether anyone actually
leaves this field.

Either way, I went quiet for a while. That's on me. I've been building instead of
writing, and I want to show you what came out of it.

It's a career quiz. Eight questions, about two minutes, no cost. It matches how
you actually work to the non-clinical paths where SLPs genuinely land — and it
gives you the real salary range, the honest timeline, and one specific thing to do
this week. Not "explore your options!" Actual numbers.

[Take the quiz →]

Some of what it'll tell you is uncomfortable. One path takes 12–15 months. Another
one you might already qualify for today without a single new certificate. I'd
rather you know which is which.

That's the whole email. No upsell.

— James

*P.S. If SLP Transitions isn't useful to you anymore, [unsubscribe here] and I
genuinely won't take it personally. I'd rather have 400 people who want this than
2,000 who don't.*

---

## Email 2 — Day 4

**Subject:** The two doors that are already open to you
**Preview:** Most SLPs never hear about these.

Hi {$name},

Quick one, because it's the thing most people don't know.

Almost every non-clinical path asks you to build something first — a portfolio, a
certificate, a new skill. Two don't. For these, your clinical license *is* the
qualification:

**Clinical liaison.** $80,000–$135,000. You already meet the requirements for
postings that are live today. Encompass Health, Select Medical, and Lifepoint hire
for these constantly.

**Utilization review.** $80,000–$88,000, and heavily remote. Your documentation
and medical-necessity experience is the job.

Both keep you adjacent to healthcare, which some people want and some people
really don't. That's worth being honest with yourself about before you apply.

I keep a list of 120+ ed-tech and health-tech companies that hire former SLPs,
sorted by what they hire for. If you grabbed it when you signed up, it's grown
a lot since:

[Get the companies list →]

— James

---

## Email 3 — Day 9

**Subject:** Do you still want these?
**Preview:** A real question, not a guilt trip.

Hi {$name},

Last one for now.

If the last two were useful, do nothing — I'll keep sending things like them,
roughly weekly, and never more than that.

If they weren't, [unsubscribe here]. No hard feelings and no follow-up sequence
trying to win you back. A smaller list of people who actually want this is worth
more to me than a big number in a dashboard.

If you're somewhere in between — still in the field, not sure you're leaving, just
curious — that's the most common place to be. Nothing here assumes you're quitting.
The quiz works fine for someone who just wants to know what else exists:

[Take the quiz →]

Either way, thanks for having been here a while.

— James

*You deserve to wake up and enjoy going to work. Everyone does.*

---

## Notes on the copy

- **Names the gap** in Email 1 rather than pretending regular sending happened.
  A cold list already knows; pretending otherwise is the credibility risk.
- **Works for both entry points.** Email 2's companies-list line is written to
  land whether they already have it ("it's grown a lot since") or never did.
- **Every number traces to `research-facts.md`** — liaison and UR bands, the
  12–15 month PM timeline. No rounding up.
- **Unsubscribe offered in two of three emails.** On a list this cold that's a
  deliverability *feature*: an unsubscribe is vastly cheaper than a spam complaint.
- **Quiz is the only CTA**, matching the blog. Email 2's companies list is the one
  exception, and it's a lead magnet they already opted into.
- Pain-mirroring stays inside the VoC quota — one "11pm googling" line in Email 1
  and nothing more. Mirroring is validation; repeating it is wallowing.
