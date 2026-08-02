#!/usr/bin/env python3
"""Update the 3 already-published Entrepreneurs posts in place with the
revised bodies (direct quotes + independent research added)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import *  # noqa
import day1
from publish_entrepreneurs import POSTS, ROOT

POST_IDS = {
    "slp-to-startup-cofounder-rachel-levy": 3425,
    "slp-to-software-engineer-jeannette-roberes": 3427,
    "building-a-startup-without-quitting-alan-vu": 3429,
}


def update(slug):
    cfg = POSTS[slug]
    pid = POST_IDS[slug]
    fm, body = parse(os.path.join(ROOT, "content/blog", cfg["file"]))
    print(f"\n=== {slug} (post {pid}) ===")
    html = day1.add_links(to_html(body), cfg["links"], slug)
    content = "\n\n".join([html, cta_block(cfg["cta"]), faq_block(cfg["faqs"])])
    payload = {
        "title": fm["title"], "content": content,
        "excerpt": fm.get("metaDescription", ""),
        "meta": {"_yoast_wpseo_metadesc": fm.get("metaDescription", ""),
                 "_yoast_wpseo_focuskw": fm.get("targetKeyword", "")},
    }
    r = api(f"/wp/v2/posts/{pid}", "POST", payload)
    if "id" not in r:
        print("  FAILED:", json.dumps(r)[:300]); return None
    print(f"  updated id={r['id']}  {r.get('link')}")
    return r["id"]


if __name__ == "__main__":
    for s in POST_IDS:
        update(s)
