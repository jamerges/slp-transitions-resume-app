#!/usr/bin/env python3
"""First-ever campaigns on this MailerLite account (2026-08).

Two sends, per James:
1. Quiz-segment emails — one per non-empty quiz-path group. Each remembers
   the subscriber's result and deep-links into the $9 report flow with their
   path pre-selected (?from=quiz&path=X&goal=report), so they never re-enter
   anything. No "take the quiz" ask: they already took it.
2. Reactivation batch 1 — the 200 newest active subscribers who are NOT in a
   quiz group. Context-setting, James's intro, the rebuilt companies list
   (which also re-routes everyone who only ever had the retired Airtable
   link), quiz as the soft CTA. Batches per content/reengagement-sequence.md:
   200 -> check 48h -> 500 -> rest.

Every salary figure traces to content/research-facts.md.

Usage:
    python3 scripts/campaigns_2026_08.py preview   # print copy, send nothing
    python3 scripts/campaigns_2026_08.py quiz      # create + send path emails
    python3 scripts/campaigns_2026_08.py batch1    # build group + send intro
"""
import os, sys, json, time, subprocess, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(os.path.join(ROOT, ".env.local"))
           if l.startswith("MAILERLITE_API_KEY="))

APP = "https://app.slptransitions.com"
FROM = "james@slptransitions.com"
FROM_NAME = "James from SLP Transitions"


def api(path, method="GET", data=None):
    cmd = ["curl", "-s", "-X", method, f"https://connect.mailerlite.com/api{path}",
           "-H", f"Authorization: Bearer {KEY}", "-H", "Accept: application/json"]
    if data is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try:
        return json.loads(out) if out else {}
    except Exception:
        return {"_raw": out[:300]}


# ---------------------------------------------------------------- paths
# roleOption -> (group_id, hook line). Hooks trace to research-facts.md.
PATHS = {
    "Customer Success / Implementation": ("194651287211476747",
        "Documented range $75–120k, typical move in 3–6 months — the best effort-to-odds ratio of any path. At speech-tech companies, the CCC-SLP itself is the credential."),
    "Data Analysis": ("194651288674239817",
        "Real outcomes include a fully remote analyst role and one SLP making $20k more base than she ever did clinically. Healthcare orgs need someone who understands both the spreadsheet and the clinical reality behind it."),
    "Clinical Liaison / Utilization Review": ("194651289392514526",
        "Liaison runs $84–135k and UR $80–88k, both reachable in 1–3 months — your clinical license is the qualification, no new degree or certificate."),
    "Clinical Informatics / EHR": ("194651290097157641",
        "The highest ceiling of the eight paths: $97.8–154k. One thing worth knowing early: Epic certification is employer-sponsored only, so the door in is sponsor-track analyst roles."),
    "Instructional Design": ("194651290808092182",
        "Portfolio-first: 3–5 work samples beat any certificate, spec work is fully acceptable, and the typical timeline is 6–12 months."),
    "Content Strategy / Marketing": ("194651291552581188",
        "Documented range $80–141k. One real path: corporate marketing after about a year of applying; another started with a single $200 article and grew into an agency."),
    "Clinical Educator / Trainer": ("194651292277147519",
        "Device companies hire for exactly this — Tobii Dynavox's version of the role posts at $78–116k — and your clinical credibility is the product."),
    # "Project / Program Management" group is empty today; add here when it isn't.
}

FOOT = ("<p style='font-size:12px;color:#8a938e;margin-top:28px;line-height:1.6'>"
        "You're getting this because you signed up at slptransitions.com. "
        "If it's not useful anymore, <a href='{$unsubscribe}' style='color:#8a938e'>unsubscribe here</a> "
        "and I genuinely won't take it personally.</p>")

STYLE = "font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#1f2b26;max-width:560px"


def quiz_email(path, hook):
    deep = f"{APP}/?from=quiz&path={urllib.parse.quote(path)}&goal=report"
    short = path.split(" / ")[0]
    subject = f"Your quiz result ({short}) — and the part the quiz couldn't check"
    html = f"""<div style="{STYLE}">
<p>Hi there,</p>
<p>James here — I run SLP Transitions. Former SLP, now a copywriter and content
strategist at a mental-health-tech company, which is to say: I made the move
you're weighing, and I remember exactly how foggy it looked from the inside.</p>
<p>You took the career quiz and matched with <strong>{path}</strong>. Good match
on paper: {hook}</p>
<p>Here's the honest limit of that result: the quiz ranked the paths, but it
never saw your resume. It can't tell you whether <em>you're</em> six weeks or
six months from a real application, or what to do first.</p>
<p>That's what the <strong>$9 Pivot Report</strong> does. It reads your actual
resume and gives you your readiness profile, which stage of the transition
you're in, your top three paths with the entry doors for each, and a 30-day
plan. It already knows {short} is your target — you won't re-enter anything:</p>
<p style="margin:24px 0"><a href="{deep}"
style="background:#0B6B54;color:#ffffff;text-decoration:none;padding:13px 26px;
border-radius:8px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold">
Get your Pivot Report — $9</a></p>
<p>Already have a specific job posting in hand? The $24 Career Pivot Suite goes
further: every resume bullet rewritten for that posting, a cover letter in your
voice, LinkedIn rewrite, and interview prep.</p>
<p>And the free things stay free — the companies list is now searchable at
<a href="{APP}/companies" style="color:#0B6B54">app.slptransitions.com/companies</a>
(126 companies that hire former SLPs).</p>
<p>— James</p>
{FOOT}</div>"""
    return subject, html


BATCH1_SUBJECT = "Why you're hearing from me (and a better version of the list you signed up for)"
BATCH1_HTML = f"""<div style="{STYLE}">
<p>Hi there,</p>
<p>You signed up at SLP Transitions at some point — most likely for the list of
ed-tech and health-tech companies that hire SLPs — and then didn't hear much
from me. That's on me, and I'd rather name it than pretend otherwise.</p>
<p>Quick reintroduction: I'm James. I was a school and private-practice SLP;
these days I work as a copywriter and content strategist at a mental-health-tech
company. SLP Transitions is where I put everything I wish I'd had while I was
deciding whether to leave — real salary ranges, honest timelines, and interviews
with SLPs who actually moved.</p>
<p>Two useful things since you signed up:</p>
<p><strong>1. The companies list got rebuilt.</strong> The old spreadsheet link
you may have saved is retired. It's now a searchable directory — 126 companies,
filterable by type, each one linking straight to the company:</p>
<p style="margin:20px 0"><a href="{APP}/companies"
style="background:#0B6B54;color:#ffffff;text-decoration:none;padding:12px 24px;
border-radius:8px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold">
Open the new companies list</a></p>
<p><strong>2. There's now a 2-minute career quiz.</strong> Eight questions,
matched against documented SLP transitions — it gives you a best-fit path with
the real salary range and an honest timeline, not "explore your options!"
It's free: <a href="{APP}/quiz" style="color:#0B6B54">take it here</a>.</p>
<p>I'll write roughly weekly from here — one useful thing at a time, no flood.</p>
<p>— James</p>
{FOOT}</div>"""


QUIZ_GROUP_IDS = [gid for gid, _ in PATHS.values()]


def send_campaign(name, subject, html, group_ids):
    r = api("/campaigns", "POST", {
        "name": name, "type": "regular", "groups": group_ids,
        "emails": [{"subject": subject, "from_name": FROM_NAME, "from": FROM,
                    "content": html}],
    })
    cid = (r.get("data") or {}).get("id")
    if not cid:
        print("  CREATE FAILED:", json.dumps(r)[:300]); return None
    s = api(f"/campaigns/{cid}/schedule", "POST", {"delivery": "instant"})
    ok = (s.get("data") or {}).get("status")
    print(f"  {name}: id={cid} scheduled={ok}")
    return cid


def cmd_preview():
    first_path, (_, first_hook) = list(PATHS.items())[0]
    subj, html = quiz_email(first_path, first_hook)
    print("=== SAMPLE QUIZ EMAIL (Customer Success) ===\n", subj, "\n", html[:1200])
    print("\n=== BATCH 1 ===\n", BATCH1_SUBJECT, "\n", BATCH1_HTML[:1200])


def cmd_quiz():
    for path, (gid, hook) in PATHS.items():
        g = api(f"/groups/{gid}").get("data") or {}
        n = g.get("active_count", 0)
        if not n:
            print(f"  skip (empty): {path}"); continue
        subj, html = quiz_email(path, hook)
        send_campaign(f"2026-08 quiz-path: {path} ({n})", subj, html, [gid])
        time.sleep(1)


def cmd_batch1():
    # collect quiz-group member ids to exclude
    exclude = set()
    for gid in QUIZ_GROUP_IDS:
        r = api(f"/groups/{gid}/subscribers?limit=50")
        for s_ in r.get("data", []):
            exclude.add(s_["id"])
    print(f"excluding {len(exclude)} quiz-group members")

    # newest 200 active subscribers
    rows, cursor = [], None
    while len(rows) < 260:
        q = "/subscribers?filter[status]=active&limit=100" + (f"&cursor={cursor}" if cursor else "")
        r = api(q)
        batch = r.get("data", [])
        if not batch:
            break
        rows += batch
        cursor = (r.get("meta") or {}).get("next_cursor")
        if not cursor:
            break
    rows.sort(key=lambda s_: s_.get("subscribed_at") or "", reverse=True)
    picked = [s_ for s_ in rows if s_["id"] not in exclude][:200]
    print(f"batch 1 members: {len(picked)} (newest {picked[0]['subscribed_at'][:10]} … oldest {picked[-1]['subscribed_at'][:10]})")

    g = api("/groups", "POST", {"name": "Reactivation 2026-08 — batch 1"})
    gid = (g.get("data") or {}).get("id")
    print("batch group:", gid)
    for i, s_ in enumerate(picked):
        api(f"/subscribers/{s_['id']}/groups/{gid}", "POST")
        if (i + 1) % 50 == 0:
            print(f"  assigned {i+1}/200")
    send_campaign("2026-08 reactivation batch 1 (200 newest)", BATCH1_SUBJECT, BATCH1_HTML, [gid])


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "preview"
    {"preview": cmd_preview, "quiz": cmd_quiz, "batch1": cmd_batch1}[mode]()
