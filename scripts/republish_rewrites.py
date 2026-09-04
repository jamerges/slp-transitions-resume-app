#!/usr/bin/env python3
"""Push rewritten content/blog/*.md back to the live posts they came from,
keeping each post's id, slug, image, category and (for the podcast posts) the
Libsyn player, which add_podcast_players.py re-inserts afterwards.

Body = markdown → blocks (+ internal links). CTA + FAQ come from the publisher
config that created the post (publish-day1 / publish_batch2 /
publish_entrepreneurs), so FAQ edits in those files ship too. A post with no
config keeps its live tail (everything from the first CTA group block on).

Usage: python3 scripts/republish_rewrites.py [slug ...]   (--dry to print only)
"""
import sys, os, re, json, subprocess, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import wp_publish as wp

def load(name, fname):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", fname))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

_argv = sys.argv; sys.argv = [sys.argv[0]]
day1 = load("day1", "publish-day1.py")
sys.modules["day1"] = day1  # publish_batch2 / publish_entrepreneurs do `import day1`
batch2 = load("batch2", "publish_batch2.py")
entre = load("entre", "publish_entrepreneurs.py")
sys.argv = _argv
DRY = "--dry" in sys.argv
only = [a for a in sys.argv[1:] if not a.startswith("--")]

LIVE = {  # slug -> (post id, md file)
    "slp-transferable-skills": (3389, "03-slp-transferable-skills.md"),
    "slp-resume-non-clinical": (3391, "01-slp-resume-non-clinical.md"),
    "slp-cover-letter-non-clinical": (3393, "09-slp-cover-letter-non-clinical.md"),
    "slp-linkedin-career-change": (3395, "10-slp-linkedin-career-change.md"),
    "should-you-quit-slp": (3397, "07-should-you-quit-slp.md"),
    "slp-to-startup-cofounder-rachel-levy": (3425, "13-slp-to-startup-cofounder-rachel-levy.md"),
    "slp-to-software-engineer-jeannette-roberes": (3427, "14-slp-to-software-engineer-jeannette-roberes.md"),
    "building-a-startup-without-quitting-alan-vu": (3429, "15-building-a-startup-without-quitting-alan-vu.md"),
    "reinventing-yourself-mattie-murrey-tegels": (3441, "19-reinventing-yourself-mattie-murrey-tegels.md"),
    "slp-to-consultant-rachel-archambault": (3443, "20-slp-to-consultant-rachel-archambault.md"),
    "slp-content-creator-chris-wenger": (3445, "17-slp-content-business-chris-wenger.md"),
    "slp-to-founder-meredith-harold-informed-slp": (3447, "18-slp-to-founder-meredith-harold-informed-slp.md"),
    "slp-to-software-founder-michelle-boisvert": (3449, "16-slp-to-software-founder-michelle-boisvert.md"),
    "what-health-tech-founders-need-from-slps": (3451, "23-what-health-tech-founders-need-from-slps.md"),
    "slp-gender-affirming-voice-ruchi-kapila": (3453, "21-slp-gender-affirming-voice-ruchi-kapila.md"),
    "neurodivergent-hiring-mentra": (3455, "22-neurodivergent-hiring-mentra.md"),
    "grow-a-podcast-while-working-full-time-maya-chupkov": (3457, "24-grow-a-podcast-while-working-full-time-maya-chupkov.md"),
    "asha-career-transition-resources": (3550, "25-asha-career-resources.md"),
}

def config_for(slug):
    for m in (day1, batch2, entre):
        if slug in m.POSTS: return m.POSTS[slug]
    return None

def build(slug, pid, mdfile):
    fm, body = wp.parse(os.path.join(ROOT, "content/blog", mdfile))
    cfg = config_for(slug)
    html = day1.add_links(wp.to_html(body), (cfg or {}).get("links", []), slug)
    if cfg:
        tail = "\n\n".join([wp.cta_block(cfg["cta"]), wp.faq_block(cfg["faqs"])])
    else:
        live = wp.api(f"/wp/v2/posts/{pid}?context=edit")["content"]["raw"]
        i = live.find("<!-- wp:group")
        tail = live[i:] if i >= 0 else ""
    return fm, "\n\n".join([html, tail])

done = {}
for slug, (pid, mdfile) in LIVE.items():
    if only and slug not in only: continue
    fm, content = build(slug, pid, mdfile)
    n = content.count("—")
    print(f"{slug}: {len(content)} chars, em-dashes in content: {n}, cfg={'yes' if config_for(slug) else 'live-tail'}")
    if DRY: continue
    r = wp.api(f"/wp/v2/posts/{pid}", "POST", {
        "content": content, "excerpt": fm.get("metaDescription", ""),
        "meta": {"_yoast_wpseo_metadesc": fm.get("metaDescription", "")},
    })
    if "id" not in r: print("  FAILED:", json.dumps(r)[:300]); continue
    done[slug] = r["id"]
print(json.dumps(done, indent=1))
