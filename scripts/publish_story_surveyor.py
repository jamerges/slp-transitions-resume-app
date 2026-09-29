#!/usr/bin/env python3
"""Draft the surveyor transition story (submission c1b82de7, 2026-09-27) as a
WordPress DRAFT. Anonymous by request: no name, no employer, no pay. Every
quote is the transitioner's own words; see content/story-intake.md."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import api, to_html, parse, cta_block, faq_block, upload_image, ROOT

FILE = "27-slp-to-health-care-facility-surveyor"
FAQS = [
    ("Can an SLP become a health care facility surveyor?",
     "Yes. This SLP was hired as a health care facility surveyor by a state health department after 11 to 20 years in skilled nursing and acute care. In their experience, the role takes clinicians from many backgrounds, including social workers, physical therapists, occupational therapists, dietitians and nurses."),
    ("Do you need extra certification to become a state surveyor?",
     "They didn't. They took no additional education before being hired, and the training happened on the job. In their words, it was extensive."),
    ("What does a health care facility surveyor do day to day?",
     "During training: learning modules from home and classes at the main office about once a week. Once trained: travelling to facilities in the region to run surveys, with periodic days at home writing up the reports."),
    ("How long did the move take?",
     "Twelve to eighteen months of searching, five applications and two interviews, both for the same position. The first interview ended in a no; when the job was posted again, the hiring team called and invited them to reapply."),
]
MIDPOST = ('<!-- slp-midpost-quiz -->\n<!-- wp:paragraph {"style":{"color":{"background":"#f0faf3"},"spacing":{"padding":{"top":"14px","bottom":"14px","left":"18px","right":"18px"}},"border":{"left":{"color":"#0b6b54","width":"4px"}}}} -->\n'
           '<p class="has-background" style="border-left-color:#0b6b54;border-left-width:4px;background-color:#f0faf3;padding-top:14px;padding-right:18px;padding-bottom:14px;padding-left:18px">'
           '<strong>Thinking about your own move?</strong> The <a href="https://slptransitions.com/career-quiz/?utm_source=slptransitions&amp;utm_medium=article&amp;utm_content=midpost_slp-to-health-care-facility-surveyor">career quiz</a> '
           'is nine questions and shows the path your experience points to, what it pays and how long the move usually takes.</p>\n<!-- /wp:paragraph -->')

fm, body = parse(os.path.join(ROOT, "content/blog", FILE + ".md"))
html = to_html(body)
assert "[[MIDPOST]]" in html
html = html.replace("<!-- wp:paragraph -->\n<p>[[MIDPOST]]</p>\n<!-- /wp:paragraph -->", MIDPOST)
assert "[[MIDPOST]]" not in html, "placeholder survived: check to_html's paragraph markup"
content = "\n\n".join([html, cta_block("Want to know which kind of day fits you?"), faq_block(FAQS)])
assert "—" not in content, "em dash in content"

existing = api(f"/wp/v2/posts?slug={fm['slug']}&status=draft,publish&_fields=id,status")
payload = {"title": fm["title"], "slug": fm["slug"], "content": content, "status": "draft",
           "categories": [100], "excerpt": fm["metaDescription"], "author": 1, "comment_status": "closed",
           "meta": {"_yoast_wpseo_metadesc": fm["metaDescription"], "_yoast_wpseo_focuskw": fm["targetKeyword"]}}
if existing:
    r = api(f"/wp/v2/posts/{existing[0]['id']}", "POST", payload)
else:
    mid = upload_image(FILE, fm["title"])
    if mid: payload["featured_media"] = mid
    r = api("/wp/v2/posts", "POST", payload)
print(json.dumps({"id": r.get("id"), "status": r.get("status"), "link": r.get("link"), "media": r.get("featured_media")}))
