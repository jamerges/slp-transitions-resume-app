#!/usr/bin/env python3
"""Build the /blog index as a generated page (same pattern as build_home.py).

Why generated: WordPress ignores the content of a designated posts page —
the theme renders its stock archive instead (grey title band, cramped cards,
"By James Berges" on every row). Converting /blog to a normal page whose body
we render gives full layout control. The trade: it does NOT auto-update.
RE-RUN THIS SCRIPT AFTER PUBLISHING ANY POST. It de-designates the posts page
(page_for_posts=0) on first run.

Layout is Osmind-blog-inspired per James: one featured (latest) post with a
full-weight image + a "New" list beside it, then a spacious grid where the
1200x630 headers finally render at a size that lets them carry the card.
"""
import sys, os, html as h, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import api

SITE = "https://slptransitions.com"
BLOG_PAGE_ID = 3459

# The categories worth a nav chip, in display order.
CATS_NAV = [("Guides", "guides"), ("Real Transitions", "real-transitions"),
            ("Entrepreneurs", "entrepreneurs"), ("Mindset", "mindset")]

CSS = """
<style id="slp-blog-2026">
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=DM+Sans:wght@400;500;600;700&display=swap');
.slp-blog{--bg:#F6F8F4;--paper:#FFFFFF;--forest:#0B6B54;--forest-dark:#0A3D31;
  --brand:#0BA183;--line:#DCE5DE;--slate:#53655C;
  font-family:'DM Sans',system-ui,sans-serif;color:var(--forest-dark);
  background:var(--bg);margin:0 calc(50% - 50vw);width:100vw}
.slp-blog *,.slp-blog *::before,.slp-blog *::after{box-sizing:border-box}
.slp-blog a{text-decoration:none;color:inherit}
.slp-bwrap{max-width:1240px;margin:0 auto;padding:0 clamp(18px,4vw,48px)}
.slp-blog h1,.slp-blog h2,.slp-blog h3{font-family:'Fraunces',Georgia,serif;
  font-weight:500;letter-spacing:-.02em;margin:0}
.slp-blog p{margin:0}

.slp-bhead{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem;
  flex-wrap:wrap;padding:clamp(36px,5vw,60px) 0 1.4rem;border-bottom:1px solid var(--forest-dark)}
.slp-bhead h1{font-size:clamp(2.2rem,4.5vw,3.4rem)}
.slp-cats{display:flex;flex-wrap:wrap;gap:1.4rem}
.slp-cats a{font-size:.76rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--slate)}
.slp-cats a:hover{color:var(--forest)}

.slp-feat{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);
  gap:clamp(28px,4vw,64px);padding:clamp(30px,4vw,52px) 0}
.slp-feat-main img{width:100%;aspect-ratio:1200/630;object-fit:cover;border-radius:12px;
  border:1px solid var(--line);display:block}
.slp-feat-main h2{font-size:clamp(1.7rem,3vw,2.5rem);line-height:1.12;margin:1.3rem 0 .8rem}
.slp-feat-main p{color:var(--slate);font-size:1.02rem;line-height:1.6;max-width:44em}
.slp-kick{font-size:.72rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--brand)}
.slp-new h3{font-size:1.5rem;margin-bottom:.4rem}
.slp-new a{display:block;padding:1.05rem 0;border-bottom:1px solid var(--line)}
.slp-new a:first-of-type{border-top:1px solid var(--line)}
.slp-new b{display:block;font-family:'Fraunces',Georgia,serif;font-weight:500;
  font-size:1.08rem;line-height:1.3;margin-top:.35rem}
.slp-new a:hover b{color:var(--forest)}

.slp-bgrid{display:grid;grid-template-columns:repeat(3,1fr);
  gap:clamp(24px,3vw,40px) clamp(20px,2.5vw,32px);padding:clamp(20px,3vw,40px) 0 clamp(56px,7vw,88px)}
.slp-bcard img{width:100%;aspect-ratio:1200/630;object-fit:cover;border-radius:10px;
  border:1px solid var(--line);display:block;transition:transform .2s ease}
.slp-bcard:hover img{transform:translateY(-3px)}
.slp-bcard .slp-kick{display:block;margin:.85rem 0 .3rem}
.slp-bcard h3{font-size:1.24rem;line-height:1.25}
.slp-bcard:hover h3{color:var(--forest)}
.slp-bcard p{color:var(--slate);font-size:.9rem;line-height:1.55;margin-top:.45rem;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

@media (max-width:1000px){
  .slp-feat{grid-template-columns:1fr}
  .slp-bgrid{grid-template-columns:1fr 1fr}
}
@media (max-width:620px){
  .slp-bgrid{grid-template-columns:1fr}
  .slp-bhead{padding-top:28px}
}
</style>
"""


def esc(s):
    return h.escape(s, quote=True)


def clean_excerpt(raw, limit=170):
    t = re.sub(r"<[^>]+>", " ", raw)
    t = h.unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s*(Read More|&hellip;|…)\s*$", "", t)
    return (t[: limit].rsplit(" ", 1)[0] + "…") if len(t) > limit else t


def fetch_posts():
    posts = api("/wp/v2/posts?per_page=100&orderby=date&order=desc"
                "&_fields=id,slug,link,title,excerpt,date,categories,featured_media", "GET")
    cats = {c["id"]: c["name"] for c in
            api("/wp/v2/categories?per_page=100&_fields=id,name", "GET")}
    mids = [p["featured_media"] for p in posts if p["featured_media"]]
    media = {}
    for i in range(0, len(mids), 20):
        for m in api("/wp/v2/media?include=" + ",".join(map(str, mids[i:i+20]))
                     + "&per_page=50&_fields=id,source_url", "GET"):
            media[m["id"]] = m["source_url"]
    out = []
    for p in posts:
        out.append(dict(
            title=h.unescape(p["title"]["rendered"]),
            url=p["link"],
            img=media.get(p["featured_media"], ""),
            cat=next((cats[c] for c in p["categories"] if c in cats), "Articles"),
            excerpt=clean_excerpt(p["excerpt"]["rendered"]),
        ))
    return out


def build(posts):
    a = []
    feat, new5, rest = posts[0], posts[1:6], posts[6:]

    a.append('<div class="slp-blog"><div class="slp-bwrap">')

    # header row: serif title + category nav (Osmind's top strip)
    a.append('<div class="slp-bhead"><h1>The SLP Transitions blog</h1><nav class="slp-cats">')
    for name, slug in CATS_NAV:
        a.append(f'<a href="{SITE}/category/{slug}/">{esc(name)}</a>')
    a.append('</nav></div>')

    # featured + New list
    a.append('<div class="slp-feat">')
    a.append(f'<a class="slp-feat-main" href="{feat["url"]}">'
             f'<img src="{feat["img"]}" alt="{esc(feat["title"])}" loading="eager" />'
             f'<h2>{esc(feat["title"])}</h2><p>{esc(feat["excerpt"])}</p></a>')
    a.append('<div class="slp-new"><h3>New</h3>')
    for p in new5:
        a.append(f'<a href="{p["url"]}"><span class="slp-kick">{esc(p["cat"])}</span>'
                 f'<b>{esc(p["title"])}</b></a>')
    a.append('</div></div>')

    # the rest, full-weight images
    a.append('<div class="slp-bgrid">')
    for p in rest:
        a.append(f'<a class="slp-bcard" href="{p["url"]}">'
                 f'<img src="{p["img"]}" alt="{esc(p["title"])}" loading="lazy" />'
                 f'<span class="slp-kick">{esc(p["cat"])}</span>'
                 f'<h3>{esc(p["title"])}</h3><p>{esc(p["excerpt"])}</p></a>')
    a.append('</div>')

    a.append('</div></div>')
    return "<!-- wp:html -->\n" + CSS + "\n" + "\n".join(a) + "\n<!-- /wp:html -->"


if __name__ == "__main__":
    posts = fetch_posts()
    missing = [p["title"] for p in posts if not p["img"]]
    if missing:
        print("WARNING - posts without featured image (will render blank):", missing)
    content = build(posts)

    # /blog must be a normal page for its content to render
    s = api("/wp/v2/settings", "GET")
    if s.get("page_for_posts") == BLOG_PAGE_ID:
        api("/wp/v2/settings", "POST", {"page_for_posts": 0})
        print("page_for_posts un-set (content now renders)")

    r = api(f"/wp/v2/pages/{BLOG_PAGE_ID}", "POST", {
        "content": content,
        "meta": {"_kad_post_title": "hide", "_kad_post_vertical_padding": "hide"},
    })
    print(f"updated /blog (page {r.get('id')}) — {len(posts)} posts, {len(content)} chars")
