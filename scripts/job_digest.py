#!/usr/bin/env python3
"""Weekly SLP-relevant job digest, grouped by the quiz's own career paths.

Why this exists: Non-Clinical PT gates a curated 300+ job board behind their
course and releases it to members a week before the public. That early-access
mechanic is their retention engine — and it needs no special access, because
the roles are already public on company career pages. It is a publishing
schedule, not a data advantage. This generates the same thing automatically,
SLP-filtered, which is the part they can't match.

Output is deliberately two shapes:
  * the full list grouped by career path, to paste into a standalone email
  * a short "Jobs of the week" block, to drop into any ongoing email

Roles are only included if they classify into one of the nine quiz paths.
That include-by-keyword rule keeps the list short and honest: a false negative
costs a reader nothing, a padded list costs them trust.

    python3 scripts/job_digest.py              # generate, respecting the seen-store
    python3 scripts/job_digest.py --fresh      # ignore the seen-store (first run/testing)
    python3 scripts/job_digest.py --refresh    # re-detect feeds before generating

Writes content/job-digest-<date>.md and updates content/job-digest-seen.json.
"""
import json, os, re, sys, ssl, urllib.request, datetime, html
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEEN_PATH = os.path.join(ROOT, "content/job-digest-seen.json")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

# Career path -> (display name, title keywords). Mirrors lib/quiz.ts, so a
# reader who took the quiz sees the same vocabulary in the email.
PATHS = {
    "customer-success": ("Customer Success / Implementation", [
        "customer success", "client success", "customer experience", "implementation",
        "onboarding", "customer onboarding", "client services", "account manager",
        "solutions consultant", "customer enablement", "client experience"]),
    "liaison-ur": ("Clinical Liaison / Utilization Review", [
        "clinical liaison", "utilization review", "utilization management",
        "case manager", "care manager", "care coordinator", "clinical reviewer",
        "admissions liaison", "clinical appeals"]),
    "informatics": ("Clinical Informatics / EHR", [
        "clinical informatics", "informatics", "ehr analyst", "epic analyst",
        "application analyst", "clinical systems", "clinical applications",
        "health information"]),
    "instructional-design": ("Instructional Design / Learning", [
        "instructional design", "learning experience", "learning design",
        "curriculum", "learning specialist", "training specialist",
        "learning and development", "courseware", "learning content"]),
    "content-marketing": ("Content / Marketing", [
        "content strategist", "content marketing", "content manager", "copywriter",
        "content designer", "ux writer", "editorial", "communications manager",
        "brand manager"]),
    "data-analysis": ("Healthcare Data / Analytics", [
        "data analyst", "analytics", "business intelligence", "clinical data",
        "reporting analyst", "quality analyst", "outcomes analyst"]),
    "clinical-educator": ("Clinical Educator / Trainer", [
        "clinical educator", "clinical education", "clinical specialist",
        "clinical trainer", "field trainer", "clinical consultant",
        "clinical account", "clinical engagement", "trainer"]),
    "project-management": ("Project / Program Management", [
        "project manager", "program manager", "project coordinator",
        "program coordinator", "implementation manager", "delivery manager"]),
    "research-coordinator": ("Clinical Research / Study Coordinator", [
        "research coordinator", "study coordinator", "clinical research",
        "research associate", "research assistant", "pharmacovigilance",
        "patient safety", "regulatory affairs"]),
}
# Roles an SLP is not a plausible candidate for, regardless of a keyword hit.
EXCLUDE = ["software engineer", "engineer", "developer", "devops", "architect",
           "data scientist", "machine learning", "security", "accountant",
           "controller", "recruiter", "sales development representative",
           "warehouse", "driver", "technician, ",
           # Roles gated behind a licence an SLP does not hold. These are hard
           # stops: a listing an SLP cannot legally take is worse than no listing.
           "nurse", "rn ", " rn", "physician", "pharmacist", "dietitian",
           "social worker", "physical therapist", "occupational therapist",
           "respiratory therapist", "psychologist", "counselor", "lcsw", "np ",
           # Caught by a loose keyword rather than a bad path: "Athletic Trainer"
           # matched "trainer" and needs an ATC; "Pharmacy Operations Trainer"
           # matched the same way. Both reached the weekly picks before this.
           "athletic trainer", "pharmacy", "phlebotom", "radiolog", "sonograph",
           "surgical tech", "medical assistant", "dental", "hygienist",
           "paramedic", "veterinar"]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=CTX) as r:
            return json.loads(r.read().decode("utf-8", "ignore"))
    except Exception:
        return None


def feed_sources():
    """Companies with a working JSON board, from the probe results."""
    out = {}
    for f in ("content/job-feed-probe.json", "content/candidate-probe.json"):
        path = os.path.join(ROOT, f)
        if not os.path.exists(path):
            continue
        for r in json.load(open(path)):
            if r.get("api") and r.get("open_jobs"):
                out[r["name"]] = (r["api"], r["ats"])
    return out


def normalise(job, company, ats):
    """Each ATS names things differently; flatten to one shape."""
    title = (job.get("title") or job.get("text") or job.get("name") or "").strip()
    loc = ""
    for k in ("location", "locationName", "categories", "offices", "city"):
        v = job.get(k)
        if isinstance(v, str) and v:
            loc = v; break
        if isinstance(v, dict):
            loc = v.get("name") or v.get("location") or ""
            if loc: break
        if isinstance(v, list) and v:
            loc = v[0].get("name", "") if isinstance(v[0], dict) else str(v[0])
            if loc: break
    url = (job.get("absolute_url") or job.get("hostedUrl") or job.get("jobUrl")
           or job.get("careers_url") or job.get("url") or job.get("applyUrl") or "")
    remote = bool(re.search(r"remote|anywhere|work from home", f"{loc} {title}", re.I))
    if job.get("isRemote") is True or job.get("remote") is True:
        remote = True
    return {"company": company, "title": title, "location": loc.strip(),
            "url": url, "remote": remote, "ats": ats}



def title_key(j):
    """Same role posted per-territory should count once."""
    t = re.sub(r"\s*\([^)]*\)", "", j["title"]).strip().lower()
    t = re.sub(r"[-–,]\s*(remote|hybrid|onsite).*$", "", t).strip()
    return (j["company"].lower(), t)


def collapse(rows, per_company=3):
    """One row per distinct role, and no company allowed to flood a section."""
    seen_titles, kept, counts, extra = set(), [], {}, {}
    for j in sorted(rows, key=lambda x: (x["company"], not x["remote"], x["title"])):
        k = title_key(j)
        if k in seen_titles:
            continue
        seen_titles.add(k)
        c = j["company"]
        if counts.get(c, 0) >= per_company:
            extra[c] = extra.get(c, 0) + 1
            continue
        counts[c] = counts.get(c, 0) + 1
        kept.append(j)
    return kept, extra




# --- Workday -------------------------------------------------------------
# Workday runs the big employers (IQVIA alone posts ~1,900 roles) and has no
# derivable board URL, which is why the probe could only detect it and stop.
# The endpoint IS public; only the per-tenant "site" segment varies, and those
# are recorded once in content/workday-feeds.json.
#
# These boards are far too large to pull whole, so we ask Workday to filter:
# one search per career path, server-side. That turns a 1,900-role download
# into a handful of small, already-relevant responses.
WORKDAY_QUERIES = ["customer success", "implementation", "clinical education",
                   "instructional design", "utilization review", "clinical research",
                   "clinical informatics", "program manager", "learning"]


def post_json(url, payload):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"User-Agent": UA, "Content-Type": "application/json",
                 "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=CTX) as r:
            return json.loads(r.read().decode("utf-8", "ignore"))
    except Exception:
        return None


def workday_jobs():
    path = os.path.join(ROOT, "content/workday-feeds.json")
    if not os.path.exists(path):
        return []
    out = []
    for f in json.load(open(path)):
        base = f"https://{f['tenant']}.{f['wd']}.myworkdayjobs.com"
        api = f"{base}/wday/cxs/{f['tenant']}/{f['site']}/jobs"
        for q in WORKDAY_QUERIES:
            d = post_json(api, {"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": q})
            if not d:
                continue
            for j in d.get("jobPostings", []):
                ext = j.get("externalPath", "")
                out.append({
                    "company": f["company"],
                    "title": (j.get("title") or "").strip(),
                    "location": (j.get("locationsText") or "").strip(),
                    "url": f"{base}/en-US/{f['site']}{ext}" if ext else base,
                    "remote": bool(re.search(r"remote|anywhere", f"{j.get('locationsText','')} {j.get('title','')}", re.I)),
                    "ats": "workday",
                })
    return out



# Readers are US-based. Workday's global boards surface Madrid and Bangalore
# roles that match on title alone; a listing someone can't take is noise.
NON_US = ["spain","india","germany","france","japan","china","brazil","poland",
          "romania","bulgaria","serbia","mexico","canada","united kingdom","uk -",
          "ireland","netherlands","sweden","italy","philippines","singapore",
          "australia","argentina","colombia","costa rica","hungary","slovakia",
          "czech","turkey","egypt","kenya","south africa","malaysia","thailand",
          "vietnam","korea","taiwan","israel","portugal","greece","finland",
          "norway","denmark","belgium","austria","switzerland","new zealand"]


def us_based(j):
    loc = (j.get("location") or "").lower()
    if not loc:
        return True                      # unknown location: let the human judge
    return not any(c in loc for c in NON_US)



# Seniority in these titles means experience IN THAT FUNCTION, not career
# length. A twenty-year SLP is still entry-level in customer success, so a
# "Senior CSM" posting screens them out. Readers here are new to the function.
#
# "Manager" is deliberately NOT a seniority marker: Customer Success Manager,
# Implementation Manager and Program Manager are the standard individual-
# contributor titles in those functions. Excluding them would empty the list.
SENIOR = ["senior ", "sr. ", "sr ", "staff ", "director", "vice president",
          "vp ", "vp,", "head of", "chief ", "executive ", "principal ",
          "lead ", " iii", " iv", "distinguished "]
# Epic calls a standard training role "Principal Trainer" — a job name, not a
# grade. Protect it before the seniority test, or the guardrail's own example
# role gets filtered out.
SENIOR_EXEMPT = ["principal trainer", "lead generation", "team lead nurse"]


def too_senior(title):
    t = title.lower()
    for phrase in SENIOR_EXEMPT:
        t = t.replace(phrase, "")
    return any(m in t for m in SENIOR)


def classify(title):
    t = title.lower()
    if any(x in t for x in EXCLUDE):
        return None
    if too_senior(title):
        return None
    for slug, (_, keys) in PATHS.items():
        if any(k in t for k in keys):
            return slug
    return None


def collect():
    sources = feed_sources()
    print(f"pulling {len(sources)} feeds…")

    def pull(item):
        name, (api, ats) = item
        data = get(api)
        if data is None:
            return []
        jobs = (data.get("jobs") or data.get("content") or data.get("offers") or []) \
            if isinstance(data, dict) else data
        if not isinstance(jobs, list):
            return []
        return [normalise(j, name, ats) for j in jobs if isinstance(j, dict)]

    with ThreadPoolExecutor(max_workers=10) as ex:
        allj = [j for batch in ex.map(pull, sources.items()) for j in batch]

    wd = workday_jobs()
    if wd:
        print(f"  + {len(wd)} from {len(json.load(open(os.path.join(ROOT, 'content/workday-feeds.json'))))} Workday boards")
        allj += wd

    senior_dropped = 0
    seen_urls = set()
    unique = []
    for j in allj:
        u = j.get("url")
        if u and u in seen_urls:
            continue
        if u:
            seen_urls.add(u)
        unique.append(j)
    if len(unique) != len(allj):
        print(f"  ({len(allj) - len(unique)} duplicate postings collapsed)")
    allj = unique

    hits = []
    for j in allj:
        if j["title"] and too_senior(j["title"]):
            senior_dropped += 1
        slug = classify(j["title"])
        if slug and j["title"] and us_based(j):
            j["path"] = slug
            hits.append(j)
    print(f"  ({senior_dropped} senior/lead titles filtered out)")
    return allj, hits


def render(hits, scanned_count):
    today = datetime.date.today().isoformat()
    by_path = {}
    for j in hits:
        by_path.setdefault(j["path"], []).append(j)

    md = [f"# SLP-relevant openings — week of {today}", ""]
    md.append(f"_{len(hits)} roles worth a look, filtered from {scanned_count} live "
              f"postings across the companies directory. Remote roles marked ●._")
    md.append("")

    # --- Jobs of the week: the short block for an ongoing email.
    # Remote-first, then spread across paths so it never shows five of one kind.
    picks, used_paths = [], set()
    deduped, _ = collapse(hits, per_company=1)
    for j in sorted(deduped, key=lambda x: (not x["remote"], x["company"])):
        if j["path"] not in used_paths:
            picks.append(j); used_paths.add(j["path"])
        if len(picks) == 5:
            break
    for j in sorted(deduped, key=lambda x: (not x["remote"], x["company"])):
        if len(picks) >= 5: break
        if j not in picks: picks.append(j)

    md += ["## Jobs of the week (short block for any email)", ""]
    for j in picks:
        dot = "● " if j["remote"] else ""
        loc = f" — {j['location']}" if j["location"] else ""
        md.append(f"- **{j['company']}** · [{j['title']}]({j['url']}){loc} {dot}".rstrip())
    md += ["", "---", ""]

    # --- full list, grouped by the quiz's own path names
    md += ["## The full list, by path", ""]
    for slug, (label, _) in PATHS.items():
        rows = by_path.get(slug, [])
        if not rows:
            continue
        rows, extra = collapse(rows)
        md.append(f"### {label} ({len(rows)})")
        md.append("")
        for j in sorted(rows, key=lambda x: x["company"]):
            dot = "● " if j["remote"] else ""
            loc = f" — {j['location']}" if j["location"] else ""
            md.append(f"- **{j['company']}** · [{j['title']}]({j['url']}){loc} {dot}".rstrip())
        for c, n in sorted(extra.items()):
            md.append(f"- _{c}: {n} more similar role{'s' if n > 1 else ''} on their board_")
        md.append("")
    return "\n".join(md), picks


def render_html(picks):
    """Paste-ready block for the email tool, since MailerLite wants HTML."""
    out = ['<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1f2b26">',
           '<p style="font-weight:700;margin:0 0 8px">Jobs of the week</p>', "<ul>"]
    for j in picks:
        loc = f" — {html.escape(j['location'])}" if j["location"] else ""
        dot = " ●" if j["remote"] else ""
        out.append(f'<li><strong>{html.escape(j["company"])}</strong> · '
                   f'<a href="{html.escape(j["url"])}" style="color:#0B6B54">'
                   f'{html.escape(j["title"])}</a>{loc}{dot}</li>')
    out += ["</ul>", '<p style="font-size:12px;color:#8a938e">● = remote</p>', "</div>"]
    return "\n".join(out)


if __name__ == "__main__":
    fresh = "--fresh" in sys.argv
    seen = {} if fresh else (json.load(open(SEEN_PATH)) if os.path.exists(SEEN_PATH) else {})

    allj, hits = collect()

    # Snapshot for the public /jobs page: everything currently open, NOT
    # filtered by the seen-store. The page answers "what's open right now";
    # the email answers "what's new since last week". Different questions.
    snapshot = {
        "generated": datetime.date.today().isoformat(),
        "scanned": len(allj),
        "paths": [{"slug": k, "label": v[0]} for k, v in PATHS.items()],
        "roles": [
            {k: j[k] for k in ("company", "title", "location", "url", "remote", "path")}
            for j in sorted(hits, key=lambda x: (x["path"], x["company"], x["title"]))
        ],
    }
    json.dump(snapshot, open(os.path.join(ROOT, "lib/open-roles.json"), "w"), indent=1)
    print(f"  wrote lib/open-roles.json ({len(hits)} open roles for the site)")

    before = len(hits)
    hits = [j for j in hits if j["url"] and j["url"] not in seen]
    print(f"  scanned {len(allj)} live roles → {before} SLP-relevant "
          f"→ {len(hits)} not sent before")

    if not hits:
        print("\nnothing NEW for the email this week (the site snapshot still updated).")
        sys.exit(0)

    md, picks = render(hits, len(allj))
    today = datetime.date.today().isoformat()
    out_md = os.path.join(ROOT, f"content/job-digest-{today}.md")
    open(out_md, "w").write(md + "\n")
    open(os.path.join(ROOT, f"content/job-digest-{today}.html"), "w").write(render_html(picks))

    seen.update({j["url"]: today for j in hits})
    json.dump(seen, open(SEEN_PATH, "w"), indent=1)

    print(f"\n  wrote {out_md}")
    print(f"  wrote content/job-digest-{today}.html  (Jobs of the week block)")
    print(f"  seen-store now tracks {len(seen)} roles\n")
    print(md[:1600])
