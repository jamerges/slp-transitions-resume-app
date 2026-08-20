#!/usr/bin/env python3
"""Which of our companies expose a machine-readable job feed?

Decides one question: is a weekly SLP-relevant job digest a few hours of build
or an endless manual slog? Most modern employers run a hosted ATS, and the big
ones publish a public JSON board. If enough of our list does, the digest can be
generated; if not, the honest answer is that it can't be sustained.

Method is deliberately detection-first rather than guess-the-token. We fetch
each company's site and read the ATS signature out of the markup (a link to
boards.greenhouse.io/acme, jobs.lever.co/acme, ...). Guessing slugs from names
produces false positives — Ashby in particular serves an identical shell for
any slug, so a 200 there means nothing on its own.

    python3 scripts/probe_job_feeds.py            # probe all, write JSON + summary
    python3 scripts/probe_job_feeds.py 25         # first 25 only (quick look)

Writes content/job-feed-probe.json. Read-only against third parties: it GETs
public pages, sends a real UA, and caps concurrency.
"""
import json, os, re, sys, ssl, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " \
     "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
TIMEOUT = 7
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE  # some of these have sloppy certs; we only read public HTML

# ATS signature -> (name, how to build the public JSON endpoint from the slug)
ATS = [
    ("greenhouse", r"boards\.greenhouse\.io/(?:embed/job_board\?for=)?([a-zA-Z0-9_-]+)",
     lambda s: f"https://boards-api.greenhouse.io/v1/boards/{s}/jobs"),
    ("greenhouse", r"job-boards\.greenhouse\.io/([a-zA-Z0-9_-]+)",
     lambda s: f"https://boards-api.greenhouse.io/v1/boards/{s}/jobs"),
    ("lever", r"jobs\.lever\.co/([a-zA-Z0-9_-]+)",
     lambda s: f"https://api.lever.co/v0/postings/{s}?mode=json"),
    ("ashby", r"jobs\.ashbyhq\.com/([a-zA-Z0-9_-]+)",
     lambda s: f"https://api.ashbyhq.com/posting-api/job-board/{s}"),
    ("smartrecruiters", r"careers\.smartrecruiters\.com/([a-zA-Z0-9_-]+)",
     lambda s: f"https://api.smartrecruiters.com/v1/companies/{s}/postings"),
    ("workable", r"apply\.workable\.com/([a-zA-Z0-9_-]+)",
     lambda s: f"https://apply.workable.com/api/v1/widget/accounts/{s}"),
    ("recruitee", r"([a-zA-Z0-9_-]+)\.recruitee\.com",
     lambda s: f"https://{s}.recruitee.com/api/offers/"),
    # Workday exposes JSON but the tenant/site path varies too much to derive.
    ("workday", r"([a-zA-Z0-9_-]+)\.(?:wd\d+)\.myworkdayjobs\.com", lambda s: None),
    ("rippling", r"ats\.rippling\.com/([a-zA-Z0-9_-]+)", lambda s: None),
    ("paylocity", r"recruiting\.paylocity\.com/recruiting/jobs/All/([a-zA-Z0-9_-]+)", lambda s: None),
    ("icims", r"([a-zA-Z0-9_-]+)\.icims\.com", lambda s: None),
    ("bamboohr", r"([a-zA-Z0-9_-]+)\.bamboohr\.com", lambda s: f"https://{s}.bamboohr.com/careers/list"),
]

CAREER_PATHS = ["/careers", "/jobs"]
# Many companies host the board on a subdomain that the homepage only links to
# with JS, so try these directly rather than relying on markup discovery.
CAREER_SUBDOMAINS = ["careers.", "jobs."]


def get(url, as_json=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=CTX) as r:
            raw = r.read()
            if as_json:
                return json.loads(raw.decode("utf-8", "ignore")), r.status
            return raw.decode("utf-8", "ignore"), r.status
    except Exception as e:
        return None, getattr(e, "code", str(e)[:40])


def detect(company):
    name, host = company["name"], company["url"].strip().rstrip("/")
    if not host.startswith("http"):
        host = "https://" + host
    out = {"name": name, "url": host, "ats": None, "slug": None, "api": None,
           "open_jobs": None, "note": ""}

    bare = re.sub(r"^https?://", "", host).rstrip("/")
    targets = [host] + [host + p for p in CAREER_PATHS] + \
              [f"https://{sub}{bare}" for sub in CAREER_SUBDOMAINS]
    html = None
    for path_url in targets:
        body, status = get(path_url)
        if body:
            html = (html or "") + body
            # the homepage usually links to careers; one extra page is plenty
            if path_url != host and re.search(r"greenhouse|lever\.co|ashbyhq|smartrecruiters|workday|workable", body, re.I):
                break
    if not html:
        out["note"] = "site unreachable"
        return out

    for ats_name, pattern, endpoint in ATS:
        m = re.search(pattern, html, re.I)
        if not m:
            continue
        slug = m.group(1)
        if slug.lower() in ("www", "jobs", "careers", "embed"):
            continue
        out.update(ats=ats_name, slug=slug)
        api = endpoint(slug)
        if not api:
            out["note"] = "ATS found, no public JSON feed"
            return out
        data, status = get(api, as_json=True)
        if data is None:
            out.update(api=api, note=f"feed returned {status}")
            return out
        # count postings across the differing response shapes
        if isinstance(data, dict):
            jobs = data.get("jobs") or data.get("content") or data.get("offers") or []
        else:
            jobs = data
        out.update(api=api, open_jobs=len(jobs) if isinstance(jobs, list) else None)
        return out

    out["note"] = "no known ATS signature"
    return out


if __name__ == "__main__":
    src = open(os.path.join(ROOT, "lib/companies.ts")).read()
    block = src[src.index("COMPANIES_DB"):]
    companies = [json.loads(m) for m in re.findall(r"(\{\"name\".*?\}),?\n", block)]
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(companies)
    companies = companies[:limit]
    print(f"probing {len(companies)} companies…\n")

    with ThreadPoolExecutor(max_workers=12) as ex:
        results = list(ex.map(detect, companies))

    usable = [r for r in results if r["open_jobs"] is not None]
    ats_only = [r for r in results if r["ats"] and r["open_jobs"] is None]
    none = [r for r in results if not r["ats"]]

    for r in sorted(usable, key=lambda x: -(x["open_jobs"] or 0)):
        print(f"  ✓ {r['name'][:30]:32} {r['ats']:16} {r['open_jobs']:>4} open")
    print()
    for r in ats_only:
        print(f"  ~ {r['name'][:30]:32} {r['ats']:16} {r['note']}")
    print()
    total_jobs = sum(r["open_jobs"] or 0 for r in usable)
    print(f"  usable JSON feeds : {len(usable)}/{len(results)}  ({total_jobs} open roles today)")
    print(f"  ATS but no feed   : {len(ats_only)}")
    print(f"  no ATS detected   : {len(none)}")

    out_path = os.path.join(ROOT, "content/job-feed-probe.json")
    json.dump(results, open(out_path, "w"), indent=1)
    print(f"\n  wrote {out_path}")


# --------------------------------------------------------------------------
# Digest mode: pull every discovered feed and keep only what an SLP could
# plausibly apply for. Include-by-keyword, not exclude — the point is a short
# honest list, so a false negative costs less than a padded one.
# --------------------------------------------------------------------------
RELEVANT = [
    "customer success", "client success", "customer experience", "implementation",
    "onboarding", "customer onboarding", "clinical specialist", "clinical liaison",
    "clinical informatics", "clinical operations", "clinical program", "clinical education",
    "clinical trainer", "clinical content", "instructional design", "curriculum",
    "learning experience", "learning design", "content strategist", "content marketing",
    "speech", "slp", "pathologist", "training specialist", "enablement",
    "utilization review", "care coordinator", "patient experience", "product manager, clinical",
    "clinical product", "ux research", "user research", "accessibility",
]
EXCLUDE = ["engineer", "developer", "devops", "data scientist", "sre ", "security",
           "controller", "accountant", "recruiter", "sales development representative"]


def title_of(j):
    return (j.get("title") or j.get("text") or j.get("name") or
            (j.get("jobTitle") if isinstance(j, dict) else "") or "")


def location_of(j):
    for k in ("location", "locationName", "categories", "offices"):
        v = j.get(k)
        if isinstance(v, str): return v
        if isinstance(v, dict): return v.get("name") or v.get("location") or ""
        if isinstance(v, list) and v:
            return v[0].get("name", "") if isinstance(v[0], dict) else str(v[0])
    return ""


def digest():
    results = json.load(open(os.path.join(ROOT, "content/job-feed-probe.json")))
    feeds = [r for r in results if r.get("api") and r.get("open_jobs")]
    hits, scanned = [], 0
    for r in feeds:
        data, _ = get(r["api"], as_json=True)
        if data is None:
            continue
        jobs = data.get("jobs") or data.get("content") or data.get("offers") or [] \
            if isinstance(data, dict) else data
        if not isinstance(jobs, list):
            continue
        for j in jobs:
            if not isinstance(j, dict):
                continue
            scanned += 1
            t = title_of(j).strip()
            tl = t.lower()
            if any(x in tl for x in EXCLUDE):
                continue
            if any(k in tl for k in RELEVANT):
                hits.append({"company": r["name"], "title": t, "location": location_of(j)})
    print(f"\nscanned {scanned} live roles across {len(feeds)} feeds\n")
    for h in sorted(hits, key=lambda x: x["company"]):
        print(f"  {h['company'][:22]:24} {h['title'][:58]:60} {h['location'][:24]}")
    print(f"\n  SLP-relevant today: {len(hits)} of {scanned}")
    json.dump(hits, open(os.path.join(ROOT, "content/job-digest-sample.json"), "w"), indent=1)
