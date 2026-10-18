"""Create or update a WordPress DRAFT (never publishes) from a post's AEO package.

    python3 scripts/publish_aeo_draft.py content/blog/<file>.md <category_id> [--date YYYY-MM-DD]

Needs content/blog-images/<file>.png as the header (scripts/blog_header.py makes one).
Uploads it once, rebuilds content/blog/aeo/<slug>/ with that image URL, and saves the post as
two Custom HTML blocks (02-post-body.html, 03-faq-embed.html) with Yoast fields set.
Category ids: guides 99, mindset 25, real-transitions 100, entrepreneurs 98.
James previews and publishes from wp-admin, then runs scripts/build_blog.py and purges SiteGround.
"""
import importlib.util, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from wp_publish import api  # noqa: E402

spec = importlib.util.spec_from_file_location("aeo", os.path.join(ROOT, "scripts/aeo_post.py"))
aeo = importlib.util.module_from_spec(spec); spec.loader.exec_module(aeo)

args = sys.argv[1:]
md, category = os.path.abspath(args[0]), int(args[1])
date = args[args.index("--date") + 1] if "--date" in args else __import__("datetime").date.today().isoformat()
img = os.path.join(ROOT, "content/blog-images", os.path.basename(md).replace(".md", ".png"))
assert os.path.exists(img), f"missing header image {img}"

fm, _ = aeo.parse(md)
existing = api(f"/wp/v2/posts?slug={fm['slug']}&status=draft,publish,pending&_fields=id,status,featured_media")
media_id = existing[0]["featured_media"] if existing else None
if not media_id:
    r = api("/wp/v2/media", "POST", raw=img, ctype="image/png",
            extra=["-H", f'Content-Disposition: attachment; filename="{fm["slug"]}-header.png"'])
    media_id = r["id"]
    api(f"/wp/v2/media/{media_id}", "POST", {"alt_text": f"{fm['title']}, a guide from SLP Transitions", "title": fm["title"]})
image_url = api(f"/wp/v2/media/{media_id}?_fields=source_url")["source_url"]

out = aeo.build(md, date, image_url)
body = open(os.path.join(out, "02-post-body.html")).read()
faq = open(os.path.join(out, "03-faq-embed.html")).read()
payload = {"title": fm["title"], "slug": fm["slug"], "categories": [category], "excerpt": fm["metaDescription"],
           "content": f"<!-- wp:html -->\n{body}\n<!-- /wp:html -->\n\n<!-- wp:html -->\n{faq}\n<!-- /wp:html -->",
           "featured_media": media_id, "author": 1, "comment_status": "closed",
           "meta": {"_yoast_wpseo_metadesc": fm["metaDescription"], "_yoast_wpseo_focuskw": fm["targetKeyword"],
                    "_yoast_wpseo_title": fm.get("metaTitle", fm["title"]) + " %%sep%% %%sitename%%"}}
if existing:
    if existing[0]["status"] == "publish":
        sys.exit("already published: edit it in wp-admin; this script only writes drafts")
    r = api(f"/wp/v2/posts/{existing[0]['id']}", "POST", payload)
else:
    r = api("/wp/v2/posts", "POST", {**payload, "status": "draft"})
print("draft", r.get("id"), r.get("status"), r.get("link"), "image", image_url)
