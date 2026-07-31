# Reactivating the 2,500 (before you launch anything at them)

You have ~2,500 subscribers who joined for the ed/health-tech companies database. They are the single warmest audience for this product that exists anywhere — they already raised their hand for exactly this topic. But they've gone cold, and that creates a real risk that has to be handled first.

## The risk, plainly

Emailing 2,500 dormant contacts in one blast is the fastest way to land in spam — permanently. What goes wrong:

- **Stale addresses bounce.** People change jobs and lose work emails. A bounce rate over ~2% signals a bad list to inbox providers.
- **Low engagement gets you filtered.** Gmail decides placement partly on whether *your* recipients open *your* mail. One large send with poor opens teaches Gmail to route you to Promotions or Spam.
- **Complaints compound.** People who forgot they subscribed hit "spam" instead of unsubscribe. Above ~0.1% is trouble.

Get this wrong and it doesn't just hurt one campaign — it degrades deliverability for the launch sequence, the blog newsletter, and everything after.

**Your setup already helps:** marketing goes through MailerLite on the root domain (which has sending history), and transactional results go through Resend on `send.slptransitions.com`. Keep that separation. **Never send the reactivation campaign from the Resend subdomain** — it has no reputation yet, and a cold blast would burn it before your paid customers' results emails ever benefit from it.

## Step 1 — Clean before you send

In MailerLite, before anything:
1. Remove existing bounces and unsubscribes (should be automatic, but verify).
2. Segment by last-opened date. You likely have three groups: engaged (opened in last 6 months), dormant (6-18 months), and cold (18+ months / never opened).
3. **Consider not mailing the never-opened segment at all.** A subscriber who has never once opened is not an asset; they're deliverability drag.

## Step 2 — Ramp, don't blast

Send in ascending batches, most-engaged first, checking metrics between each:

| Day | Batch | Who |
|---|---|---|
| 1 | 250 | Most recently engaged |
| 3 | 500 | Next most engaged |
| 5 | 750 | Dormant |
| 8 | Remainder | Coldest (skip if the earlier batches went badly) |

**Stop and reassess if:** bounce rate >2%, complaint rate >0.1%, or open rate <15%. Those are signals the list needs more pruning, not more sending.

## Step 3 — The sequence (3 emails)

Voice per `style-guide.md`. The strategy: lead with value and an easy exit. Giving people a graceful way out *reduces* spam complaints, which protects everything downstream.

---

### Email 1 — the honest re-introduction
**Subject:** I went quiet. Here's what I was doing.
**Preview:** Plus a 2-minute quiz that's genuinely better than the old one.

Hey — James here, from SLP Transitions.

You signed up a while back for the list of ed-tech and health-tech companies that hire former SLPs. Then I mostly disappeared from your inbox. That's on me.

Here's what I was doing: I went deep on what actually works for SLPs leaving clinical work. Not the "explore your options!" version — the specific version. Which roles people genuinely land, what they pay, how long it really takes, and what the hiring side is looking for.

A few things that surprised me, and might surprise you:

- The most-documented path out isn't the one everyone talks about. It's **project and program management** — your caseload has been concurrent project management this whole time.
- If you've ever been the person who fixed the documentation system, **clinical informatics** pays $97-154k, and that EMR superuser stint is the qualification.
- The realistic timeline is **6-15 months**, not 6 weeks. One person I studied: 11 months, 113 tailored applications, 7 interviews, 1 offer. She'd tell you it was worth every week.

I rebuilt the career quiz around all of it. Eight questions, about two minutes, and it now gives you a real salary range and an honest catch instead of a vague vibe:

**[Take the new quiz →]**

If this isn't useful to you anymore, no hard feelings at all — **[unsubscribe here]** and I'll stop cluttering your inbox.

— James

*P.S. If you're still in the field and happy, genuinely glad. That's a fine outcome too.*

---

### Email 2 — what you built and why (send 4 days later, to openers of #1)
**Subject:** "Managed a caseload of 62" vs. "managed a portfolio of 62 accounts"
**Preview:** Same job. Different words. Only one gets interviews.

Quick follow-up to the last email.

The thing I kept running into, over and over, in every transition story I studied: **SLPs don't have a skills problem. They have a translation problem.**

Here's a real bullet from a school SLP's resume:

> *"Manage caseload of 62 students with IEPs across 3 school buildings"*

A hiring manager at an ed-tech company reads that in about 7 seconds — that's the real average — and thinks *clinical person, not for us.*

Same experience, translated:

> *"Managed a portfolio of 62 concurrent client accounts across 3 sites, each with individualized success plans, defined goals, and quarterly progress reviews"*

Nothing invented. Nothing exaggerated. Same Tuesday afternoon. But now it's in words the hiring manager can map to their own job posting.

A few more that came from SLPs who actually got hired:
- IEP meetings → cross-functional stakeholder alignment
- Chart audits → detail-oriented quality assurance
- Convincing a skeptical parent to buy into a treatment plan → objection handling *(sales and CS managers love this one)*

I got tired of watching smart clinicians pay $220 for generic resume writers who don't understand any of this, so I built a tool that does the translation from your actual resume against a real job posting. Free to try — you'll see your match score and three of your bullets rewritten before you decide anything.

**[Try it on a real job posting →]**

— James

---

### Email 3 — the sunset (send 5 days later, to non-openers of #1 and #2 only)
**Subject:** Should I stop emailing you?
**Preview:** Genuine question — one click either way.

Hey — this is the last email I'll send unless you tell me otherwise.

You signed up for the SLP Transitions companies list a while back, and I haven't heard from you since. Totally possible your situation changed, or you're happy where you are, or this just isn't relevant anymore.

So, one honest question: **want to keep hearing from me?**

**[Yes, keep me on the list →]**

If you don't click, I'll take you off — no hard feelings, and no more inbox clutter from me. Cleaning up my list is better for both of us.

If you *are* still thinking about leaving clinical work, the one thing worth doing today is the **[2-minute quiz]**. It'll at least tell you which direction your experience actually points, with real numbers attached.

Either way — I hope the paperwork is lighter than it was.

— James

---

## Step 4 — After the campaign

- **Everyone who clicks or opens** goes into the regular welcome sequence (`email-sequences.md`) if they haven't had it.
- **Everyone who doesn't engage across all three** gets removed. A 1,200-person list that opens is worth more than a 2,500-person list that doesn't — literally, in deliverability terms.
- Then **stay consistent.** The reason this list went cold is the reason it'll go cold again. Once the blog posts start publishing, one email per post is enough of a cadence.

## Why this sequencing matters

Don't run this campaign until the quiz and tool are in the state you want them, because you get one shot at re-earning attention from a cold list. The order should be:

1. Finish testing the quiz + tool (in progress)
2. Switch Stripe to live mode — so the campaign can actually convert
3. Publish 2-3 blog posts — so there's somewhere for the traffic to land
4. **Then** run reactivation
