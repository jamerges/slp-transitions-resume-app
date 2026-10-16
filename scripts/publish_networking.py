"""Draft (never publish) the networking guide on WordPress from its AEO package.

    python3 scripts/publish_networking.py

Uploads the header image once, rebuilds content/blog/aeo/<slug>/ with that image URL,
and creates or updates a DRAFT post whose content is two Custom HTML blocks
(02-post-body.html, then 03-faq-embed.html). James previews and publishes from wp-admin,
then runs scripts/build_blog.py and purges SiteGround.
"""
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from wp_publish import api  # noqa: E402

spec = importlib.util.spec_from_file_location("aeo", os.path.join(ROOT, "scripts/aeo_post.py"))
aeo = importlib.util.module_from_spec(spec); spec.loader.exec_module(aeo)

MD = os.path.join(ROOT, "content/blog/28-slp-networking-non-clinical-job.md")
IMG = os.path.join(ROOT, "content/blog-images/28-slp-networking-non-clinical-job.png")
DATE = "2026-10-16"
GUIDES = 99

fm, _ = aeo.parse(MD)
existing = api(f"/wp/v2/posts?slug={fm['slug']}&status=draft,publish,pending&_fields=id,status,featured_media")
media_id = existing[0]["featured_media"] if existing else None
if not media_id:
    r = api("/wp/v2/media", "POST", raw=IMG, ctype="image/png",
            extra=["-H", 'Content-Disposition: attachment; filename="slp-networking-non-clinical-job-header.png"'])
    media_id = r["id"]
    api(f"/wp/v2/media/{media_id}", "POST", {"alt_text": "How SLPs network into a non-clinical job, a guide from SLP Transitions", "title": fm["title"]})
image_url = api(f"/wp/v2/media/{media_id}?_fields=source_url")["source_url"]

out = aeo.build(MD, DATE, image_url)
body = open(os.path.join(out, "02-post-body.html")).read()
faq = open(os.path.join(out, "03-faq-embed.html")).read()
content = f"<!-- wp:html -->\n{body}\n<!-- /wp:html -->\n\n<!-- wp:html -->\n{faq}\n<!-- /wp:html -->"

payload = {"title": fm["title"], "slug": fm["slug"], "content": content, "categories": [GUIDES],
           "excerpt": fm["metaDescription"], "featured_media": media_id, "author": 1, "comment_status": "closed",
           "meta": {"_yoast_wpseo_metadesc": fm["metaDescription"], "_yoast_wpseo_focuskw": fm["targetKeyword"],
                    "_yoast_wpseo_title": fm.get("metaTitle", fm["title"]) + " %%sep%% %%sitename%%"}}
if existing:
    if existing[0]["status"] == "publish":
        sys.exit("already published: edit it in wp-admin, this script only writes drafts")
    r = api(f"/wp/v2/posts/{existing[0]['id']}", "POST", payload)
else:
    r = api("/wp/v2/posts", "POST", {**payload, "status": "draft"})
print("draft", r.get("id"), r.get("status"), r.get("link"), "image", image_url)
