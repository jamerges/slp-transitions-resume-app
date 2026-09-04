#!/usr/bin/env python3
"""Expand the pillar article (post 3358) from 13 to 20 paths and replace its
stale salary table with the figures in content/research-facts.md.

Idempotent: every edit checks for its own marker first. Backup of the
pre-change content: content/flagship-post-backup-2026-09-03.html.
"""
import sys, os, json, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import wp_publish as wp

POST = 3358
NEW_TITLE = "Alternative Careers for SLPs: 20 Non-Clinical Paths Clinicians Love"

def para(t): return f"<!-- wp:paragraph -->\n<p>{t}</p>\n<!-- /wp:paragraph -->\n\n"
def h2(t): return f'<!-- wp:heading -->\n<h2 class="wp-block-heading">{t}</h2>\n<!-- /wp:heading -->\n\n'
def h3(t): return f'<!-- wp:heading {{"level":3}} -->\n<h3 class="wp-block-heading">{t}</h3>\n<!-- /wp:heading -->\n\n'
def li(t): return f"<!-- wp:list-item -->\n<li>{t}</li>\n<!-- /wp:list-item -->\n\n"
def sep(): return '<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->\n\n'

p = wp.api(f"/wp/v2/posts/{POST}?context=edit")
raw = p["content"]["raw"]
orig = raw

# ---- 1. the three timeline lists -------------------------------------------
def add_after_item(raw, anchor_text, new_items):
    """Insert list items after the list item containing anchor_text."""
    i = raw.index(anchor_text)
    j = raw.index("<!-- /wp:list-item -->", i) + len("<!-- /wp:list-item -->")
    block = "\n\n" + "".join(li(t) for t in new_items).rstrip("\n")
    return raw[:j] + block + raw[j:]

if "Clinical Educator / Trainer:" not in raw:
    raw = add_after_item(raw, "Special Education Coordinator:", [
        "Clinical Educator / Trainer: at AAC, voice and swallowing companies your license is the credential. You teach clinicians to use the product",
        "Rehab Management / Leadership: usually an internal move first (clinical or program manager), Director of Rehab later",
        "Clinical Research Coordinator: the fastest way onto a resume that no longer reads as purely clinical. Expect a pay cut and treat it as a first step, not a destination",
    ])
if "Instructional Design:" not in raw:
    raw = add_after_item(raw, "Conversation Designer:", [
        "Instructional Design: build the learning instead of delivering it. A two-piece portfolio beats a $3,000 certificate",
        "Voice &amp; Communication Coaching: self-employed. Your voice science and pragmatics training is the product, and generalist coaches don't have it",
    ])
if "Academia / Teaching:" not in raw:
    raw = add_after_item(raw, "Forensic SLP:", [
        "Academia / Teaching: clinical instructor and clinic supervisor roles are the door. Full-time faculty usually wants a clinical doctorate or PhD",
    ])

# ---- 2. six new path sections, before the part-time H2 ---------------------
MARK = "Six more paths worth knowing"
if MARK not in raw:
    sec = h2(MARK + " (and who they suit)")
    sec += para("The nine paths above get the most detail because they are where SLPs most often land. These six are real too. Each gets the same four things: what it is, what it pays, the door in, and the catch.")
    sec += h3("Clinical Educator / Trainer at device and speech-tech companies")
    sec += para("Companies that make AAC devices, speaking valves and voice or swallowing products need clinicians who can teach other clinicians to use them. Tobii Dynavox calls it a Learning Consultant; PRC-Saltillo, Lingraphica and Passy-Muir have equivalents. <strong>$75k&ndash;$116k</strong> (Glassdoor, Tobii Dynavox Learning Consultant). The door: every device, platform or protocol you have ever trained someone on is your qualification, and most SLPs undersell it. The catch: travel. Check the percentage before you fall for the posting.")
    sec += h3("Rehab Management / Leadership")
    sec += para("Clinical manager, rehab program manager, then Director of Rehab. You already run the parts of a department nobody bills for: schedules, coverage, audits, the new grad who is drowning. Management pays for that instead of treating it as unpaid time. <strong>$82k&ndash;$139k</strong> across the ladder (ZipRecruiter and Indeed for program manager, Glassdoor 25th&ndash;75th percentile for Director of Rehabilitation). Employers: Encompass Health, Select Medical, Lifepoint, Sanford, Reliant. The door is usually internal: ask your director who the last two manager openings went to and what those people had that you don't yet. The catch: you stay inside the system, and the pressure moves from productivity to census and staffing. It suits people who want to fix the system more than escape it.")
    sec += h3("Clinical Research Coordinator")
    sec += para("Universities and academic medical centers hire coordinators from varied backgrounds, entry takes weeks rather than months, and no new credential is required. Read this part carefully though: <strong>$48k&ndash;$72k</strong> (BLS 25th&ndash;75th percentile) is the one range on this page that sits below where most SLPs already are. Its value is as a springboard. Two documented SLPs used it exactly that way, one moving from coordinator into pharma patient safety with a $10k raise and a bonus inside two years. Never take it as a destination.")
    sec += h3("Instructional Design")
    sec += para("Instructional designers build the training rather than deliver it: onboarding modules, compliance courses, product education. <strong>$70k&ndash;$100k</strong>. The door: take one training you have already given to colleagues and rebuild it as a single Rise or Storyline module. That is sample number one, and hiring managers want two or three of those far more than a certificate. The catch: the field got more crowded when teachers started leaving in numbers, so the portfolio has to be specific to an industry, not generic.")
    sec += h3("Academia and teaching")
    sec += para("Clinical instructor and university clinic supervisor roles are the realistic door for a master's-level SLP; full-time and tenure-track faculty positions usually want a clinical doctorate or PhD. Speech pathology faculty pay runs <strong>$37.74&ndash;$50.96 an hour</strong> (ZipRecruiter 25th&ndash;75th percentile, roughly $78k&ndash;$106k full-time equivalent), and adjunct work is paid per course, which never adds up to a salary. The catch: starting faculty pay can sit below medical SLP pay, and tenure-track searches are competitive. Worth it if teaching is the part of supervision you loved.")
    sec += h3("Voice and communication coaching")
    sec += para("Executive presence, accent clarity, presentation delivery, voice for transgender and non-binary clients. This is a business, not a job, so there is no salary band. Market rates for communication and executive coaching run <strong>$200&ndash;$400 an hour</strong> at mid-level, and the whole problem is filling the hours. Your edge is real: you understand voice science and pragmatics in a way generalist coaches do not. The catch: no ladder, no benefits, and the first year is mostly marketing. Start it as a side practice before you count on it.")
    sec += para("<strong>Not on this list: telehealth.</strong> It is still clinical work, and pay tracks clinical, often a little lower on platform contracts. It belongs in the next section, as a bridge.")
    sec += sep()
    anchor = '<h2 class="wp-block-heading">What part-time options can I try'
    i = raw.index(anchor)
    i = raw.rfind("<!-- wp:heading -->", 0, i)
    raw = raw[:i] + sec + raw[i:]

# ---- 3. telehealth as a bridge in the part-time section --------------------
if "Telehealth is a bridge" not in raw:
    anchor = '<h2 class="wp-block-heading">Where can I find non-clinical SLP job postings?'
    i = raw.index(anchor)
    i = raw.rfind("<!-- wp:separator -->", 0, i)
    raw = raw[:i] + para("<strong>Telehealth is a bridge, not an exit.</strong> Dropping to a part-time telepractice contract (Presence, eLuma, Global Teletherapy, VocoVision) can cut the commute and the documentation load enough to free up the hours a transition needs, and the platforms themselves hire former clinicians into implementation, training and customer success roles. Just don't mistake it for a non-clinical career: the work is still therapy, and the pay is still therapy pay.") + raw[i:]

# ---- 4. salary table --------------------------------------------------------
rows = [
    ("Clinical Liaison", "$84k&ndash;$135k (often with bonuses)"),
    ("Utilization Review", "$80k&ndash;$88k"),
    ("Case Manager (non-RN)", "$54k&ndash;$82k; higher in government and insurance"),
    ("Clinical Educator / Trainer", "$75k&ndash;$116k"),
    ("Rehab Manager &rarr; Director of Rehab", "$82k&ndash;$139k"),
    ("Clinical Research Coordinator", "$48k&ndash;$72k (a pay cut is the expected outcome)"),
    ("Client / Customer Success", "$75k&ndash;$120k (base + bonus)"),
    ("Content Marketing / Copywriting", "$80k&ndash;$141k"),
    ("Medical / Device Sales (clinical specialist)", "$67k&ndash;$117k base, up to ~$125k with commission"),
    ("Instructional Design", "$70k&ndash;$100k"),
    ("Conversation Designer", "$68k&ndash;$102k (higher at big tech)"),
    ("Clinical Informatics / EHR Analyst", "$97.8k&ndash;$154k (Epic roles need employer sponsorship)"),
    ("UX Research / Writing (healthtech)", "$67k&ndash;$154k"),
    ("Project / Program Management", "$85k&ndash;$100k+"),
    ("Data Analyst", "$70k&ndash;$105k"),
    ("Software Engineer", "$80k&ndash;$96k (documented SLP outcomes; higher with experience)"),
    ("Academia (clinical faculty)", "~$78k&ndash;$106k full-time equivalent; adjunct paid per course"),
    ("Voice / Communication Coaching", "$200&ndash;$400 per hour market rate; income depends on filling the hours"),
]
table = ('<!-- wp:table -->\n<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th>Role</th><th>Typical Salary Range</th></tr></thead><tbody>'
         + "".join(f"<tr><td>{r}</td><td>{v}</td></tr>" for r, v in rows)
         + "</table></figure>\n<!-- /wp:table -->")
if "Rehab Manager &rarr; Director" not in raw:
    i = raw.index('<h2 class="wp-block-heading">What salary can I expect')
    a = raw.index("<!-- wp:table -->", i)
    b = raw.index("<!-- /wp:table -->", a) + len("<!-- /wp:table -->")
    raw = raw[:a] + table + raw[b:]
    old_note = "<p><strong>Note:</strong> Remote roles may pay differently based on location. Tech companies in major markets often pay at the higher end.</p>"
    new_note = ("<p><strong>Where these numbers come from:</strong> 25th to 75th percentile bands from Glassdoor, Payscale, ZipRecruiter and the BLS Occupational Employment survey, checked against documented SLP transitions. Self-report sites run high, so the low end is the honest one to plan around. Remote roles pay by company location, and tech companies in major markets sit at the top of each band.</p>")
    if old_note in raw: raw = raw.replace(old_note, new_note)
    raw = raw.replace("<p>Money matters, so here are real numbers. Many of these match or exceed clinical SLP salaries—often with better work-life balance.</p>",
                      "<p>Money matters, so here are real numbers. Most of these match or beat clinical SLP pay, often with better hours. One does not, and it is labelled.</p>")

# ---- 5. counts in copy -------------------------------------------------------
raw = raw.replace("13 non-clinical", "20 non-clinical").replace("13 paths", "20 paths")

if raw == orig:
    print("no content changes needed")
else:
    r = wp.api(f"/wp/v2/posts/{POST}", "POST", {"title": NEW_TITLE, "content": raw})
    print("updated:", r.get("id"), "|", r.get("title", {}).get("rendered"), "| modified", r.get("modified"))
    if not r.get("id"): print(r); sys.exit(1)
