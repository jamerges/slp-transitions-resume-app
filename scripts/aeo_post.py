"""Build the AEO WordPress package for one blog post (slp-blog-aeo skill, WordPress mode).

    python3 scripts/aeo_post.py content/blog/28-slp-networking-non-clinical-job.md [--date 2026-10-16] [--image URL]

Reads the post's markdown and writes content/blog/aeo/<slug>/:
  01-schema-jsonld.txt   Article + FAQPage + BreadcrumbList (plugin format, then <script> fallback)
  02-post-body.html      the whole body as ONE Custom HTML block, self-styled
  03-faq-embed.html      the FAQ accordion + its FAQPage <script>
  04-cms-fields.txt      Yoast fields
  preview.html           everything in one page, for a browser check

Markdown conventions it relies on: frontmatter (title, slug, metaDescription, targetKeyword,
secondaryKeywords, category, definitionTerm, definition), a "**The short answer:**" paragraph
(the TL;DR), a "## What to take from this" bulleted list (exactly five: the takeaways box),
"[[MIDPOST]]" where the mid-article quiz prompt goes, and "## FAQ" as the last section with
"**Question**" lines each followed by an answer paragraph. The FAQ text in the schema and on the
page are generated from the same strings, so they cannot drift apart.
"""
import html as H
import json
import math
import os
import re
import sys

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://slptransitions.com"
CATEGORY_SLUGS = {"Guides": "guides", "Mindset": "mindset", "Real transitions": "real-transitions", "Entrepreneurs": "entrepreneurs"}
LOGO = SITE + "/wp-content/uploads/2021/09/cropped-Paper-Airplane-Company-Logo-2.png"

# Palette since 2026-10-09: forest on cream. Hex values, not CSS variables: Gutenberg
# Custom HTML blocks don't reliably inherit page-level variables.
FOREST, DARK, TINT, SUBTLE, LINE, TEXT, MUTED, CREAM = "#004820", "#002F15", "#DCE1D2", "#E5E7D9", "#DAD8C6", "#1B1B1E", "#555B52", "#EFEEE1"


def parse(path):
    raw = open(path).read()
    _, fm_raw, body = raw.split("---", 2)
    fm, key = {}, None
    for line in fm_raw.strip().splitlines():
        if line.startswith("  - ") and key:
            fm.setdefault(key, []).append(line[4:].strip().strip('"'))
        else:
            key, _, val = line.partition(":")
            key, val = key.strip(), val.strip()
            if val:
                fm[key] = val.strip('"').replace("\\'", "'")
    return fm, body.strip()


def inline(md):
    return markdown.markdown(md).removeprefix("<p>").removesuffix("</p>")


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:70]


def build(path, date, image):
    fm, body = parse(path)
    slug, title = fm["slug"], fm["title"]
    url = f"{SITE}/{slug}/"
    body = re.sub(r"^# .*\n+", "", body)  # the theme prints the H1 from the post title

    tldr = re.search(r"^\*\*The short answer:\*\* (.+)$", body, re.M).group(1).strip()
    body = re.sub(r"^\*\*The short answer:\*\*.+\n+", "", body, flags=re.M)

    take_sec = re.search(r"^## What to take from this\n(.*?)(?=^## )", body, re.M | re.S)
    takeaways = [l[2:].strip() for l in take_sec.group(1).splitlines() if l.startswith("- ")]
    closing = "\n".join(l for l in take_sec.group(1).splitlines() if l.strip() and not l.startswith("- "))
    assert len(takeaways) == 5, f"need exactly five takeaways, found {len(takeaways)}"
    body = body.replace(take_sec.group(0), "")

    faq_md = body[body.index("## FAQ"):]
    body = body[:body.index("## FAQ")].strip()
    faqs = re.findall(r"^\*\*(.+?)\*\*\n(.+?)(?=\n\n|\Z)", faq_md.split("\n", 1)[1].strip(), re.M | re.S)
    faqs = [(q.strip(), a.strip()) for q, a in faqs]
    assert 4 <= len(faqs) <= 6, f"need 4 to 6 FAQ pairs, found {len(faqs)}"

    # Intro = paragraphs before the first H2; the first sentence becomes the bold lead.
    intro_md, rest_md = body.split("\n## ", 1)
    rest_md = "## " + rest_md
    intro_paras = [p.strip() for p in intro_md.strip().split("\n\n") if p.strip()]

    rest_html = markdown.markdown(rest_md, extensions=["fenced_code"])
    rest_html = re.sub(r"<h2>(.+?)</h2>", lambda m: f'<h2 id="{slugify(H.unescape(re.sub("<[^>]+>", "", m.group(1))))}">{m.group(1)}</h2>', rest_html)
    midpost = (f'<aside class="slpt-midpost"><strong>Thinking about your own move?</strong> The '
               f'<a href="{SITE}/career-quiz/?utm_source=slptransitions&amp;utm_medium=article&amp;utm_content=midpost_{slug}">career quiz</a> '
               'is nine questions and shows the path your experience points to, what it pays and how long the move usually takes.</aside>')
    assert "<p>[[MIDPOST]]</p>" in rest_html
    rest_html = rest_html.replace("<p>[[MIDPOST]]</p>", "<!-- slp-midpost-quiz -->\n" + midpost)

    words = len(re.sub("<[^>]+>", " ", rest_html).split()) + sum(len(p.split()) for p in intro_paras)
    minutes = math.ceil(words / 200)

    lead, _, after = intro_paras[0].partition(". ")
    intro_html = f'<p class="slpt-intro"><strong>{inline(lead + ".")}</strong> {inline(after)}</p>' if after else f'<p class="slpt-intro"><strong>{inline(lead)}</strong></p>'
    intro_html += "".join(f"<p>{inline(p)}</p>" for p in intro_paras[1:])

    cta = (f'<div class="slpt-cta"><p>{inline(closing)}</p>'
           f'<a class="slpt-btn" href="{SITE}/career-quiz/?utm_source=slptransitions&amp;utm_medium=article&amp;utm_content=end_{slug}">Take the free 2-minute quiz &rarr;</a></div>')

    css = f"""<style>
.slpt-article{{font-size:17px;line-height:1.65;color:{TEXT};max-width:720px;margin:0 auto}}
@media (min-width:1100px){{.slpt-article{{max-width:1080px;display:grid;grid-template-columns:minmax(0,720px) 280px;gap:40px}}
.slpt-article>*:not(.slpt-toc){{grid-column:1}}.slpt-article .slpt-toc{{grid-column:2;grid-row:1/span 100}}}}
.slpt-article h2{{font-size:26px;font-weight:700;color:{DARK};margin:48px 0 16px;line-height:1.3;scroll-margin-top:24px}}
.slpt-article h3{{font-size:20px;font-weight:600;color:{DARK};margin:32px 0 12px}}
.slpt-article p{{margin:0 0 16px}}
.slpt-article a{{color:{FOREST};text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}}
.slpt-article ul,.slpt-article ol{{margin:0 0 16px;padding-left:22px}}
.slpt-article li{{margin-bottom:8px}}
.slpt-article blockquote{{margin:20px 0;padding:16px 20px;background:#fff;border:1px solid {LINE};border-left:4px solid {FOREST};border-radius:8px}}
.slpt-article blockquote p{{margin:0}}
.slpt-article code{{background:{SUBTLE};padding:2px 6px;border-radius:4px;font-size:15px}}
.slpt-intro{{font-size:19px}}
.slpt-tldr{{background:{SUBTLE};border-left:4px solid {FOREST};padding:20px 24px;border-radius:8px;margin:0 0 32px}}
.slpt-label{{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:{FOREST};margin-bottom:8px}}
.slpt-tldr p{{margin:0}}
.slpt-takeaways{{background:#fff;border:1px solid {LINE};padding:24px;border-radius:8px;margin:0 0 40px}}
.slpt-takeaways h3{{font-size:18px;margin:0 0 16px;color:{DARK}}}
.slpt-takeaways ul{{margin:0;padding-left:20px}}
.slpt-dfn{{background:{SUBTLE};padding:16px 20px;border-radius:8px;margin:24px 0;border-left:3px solid #E6A83A}}
.slpt-dfn .slpt-label{{color:#8A5A00}}
.slpt-dfn dfn{{font-style:normal;font-weight:700}}
.slpt-dfn p{{margin:0}}
.slpt-midpost{{background:{SUBTLE};border-left:4px solid {FOREST};padding:14px 18px;border-radius:8px;margin:24px 0}}
.slpt-toc{{background:{SUBTLE};border-radius:8px;padding:20px 24px;margin:0 0 32px}}
@media (min-width:1100px){{.slpt-toc{{position:sticky;top:24px;align-self:start;margin:0;max-height:calc(100vh - 48px);overflow-y:auto}}}}
.slpt-toc-list{{list-style:none;margin:0;padding:0;counter-reset:slpttoc}}
.slpt-toc-list li{{counter-increment:slpttoc;margin-bottom:8px;padding-left:28px;position:relative}}
.slpt-toc-list li::before{{content:counter(slpttoc);position:absolute;left:0;top:0;font-size:13px;font-weight:700;color:{MUTED}}}
.slpt-article .slpt-toc-list a{{color:{TEXT};text-decoration:none;font-size:15px;line-height:1.4}}
.slpt-article .slpt-toc-list a:hover,.slpt-article .slpt-toc-list a.active{{color:{FOREST};font-weight:600}}
.slpt-cta{{background:{DARK};color:#fff;border-radius:12px;padding:28px;margin:40px 0}}
.slpt-cta p{{color:#fff;margin:0 0 16px}}
.slpt-article a.slpt-btn{{display:inline-block;background:{CREAM};color:{DARK}!important;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px}}
@media (max-width:600px){{.slpt-article h2{{font-size:22px}}}}
</style>"""

    toc = ('<aside class="slpt-toc" aria-label="Table of contents"><div class="slpt-label">In this article</div>'
           '<ol class="slpt-toc-list" id="slpt-toc-list"></ol></aside>') if words >= 1500 else ""
    toc_js = """<script>(function(){var l=document.getElementById('slpt-toc-list');if(!l)return;var a=document.querySelector('.slpt-article');
var hs=a?a.querySelectorAll('h2[id]'):[];if(!hs.length){l.closest('.slpt-toc').style.display='none';return;}var map={};
hs.forEach(function(h){var li=document.createElement('li'),x=document.createElement('a');x.href='#'+h.id;x.textContent=h.textContent.trim();li.appendChild(x);l.appendChild(li);map[h.id]=x;});
if('IntersectionObserver'in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){Object.values(map).forEach(function(x){x.classList.remove('active')});if(map[e.target.id])map[e.target.id].classList.add('active');}});},{rootMargin:'-20% 0px -70% 0px'});hs.forEach(function(h){o.observe(h)});}})();</script>""" if toc else ""

    body_html = (css + '\n<div class="slpt-article">\n'
                 f'<aside class="slpt-tldr"><div class="slpt-label">The short answer</div><p>{inline(tldr)}</p></aside>\n'
                 + toc + "\n"
                 '<section class="slpt-takeaways" aria-label="Key takeaways"><h3>What you\'ll learn</h3><ul>'
                 + "".join(f"<li>{inline(t)}</li>" for t in takeaways) + "</ul></section>\n"
                 + intro_html + "\n"
                 f'<div class="slpt-dfn"><div class="slpt-label">Definition</div><p><dfn>{fm["definitionTerm"]}</dfn>: {fm["definition"]}</p></div>\n'
                 + rest_html + "\n" + cta + "\n</div>\n" + toc_js)

    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", inline(a))}} for q, a in faqs]}
    faq_html = (f"""<style>
.slpt-faq{{margin:40px auto;max-width:720px;padding-top:24px;border-top:1px solid {LINE};font-family:inherit}}
.slpt-faq h2{{font-size:28px;color:{DARK};margin:0 0 24px}}
.slpt-faq details{{border-bottom:1px solid {LINE};padding:16px 0}}
.slpt-faq summary{{cursor:pointer;font-size:18px;font-weight:600;color:{DARK};display:flex;justify-content:space-between;align-items:center;gap:16px;list-style:none}}
.slpt-faq summary::-webkit-details-marker{{display:none}}
.slpt-faq .indicator{{display:inline-block;flex:0 0 auto;font-size:22px;color:{FOREST};transition:transform .2s}}
.slpt-faq details[open] .indicator{{transform:rotate(45deg)}}
.slpt-faq .answer{{margin-top:12px;color:{TEXT};line-height:1.6}}
</style>
<div class="slpt-faq" id="faq"><h2>Frequently asked questions</h2>
""" + "\n".join(f'<details><summary>{H.escape(q)}<span class="indicator" aria-hidden="true">+</span></summary><div class="answer">{inline(a)}</div></details>' for q, a in faqs)
        + "\n</div>\n" + f'<script type="application/ld+json">{json.dumps(faq_ld, ensure_ascii=False)}</script>\n')

    cat = fm.get("category", "Guides")
    article_ld = {"@context": "https://schema.org", "@type": "Article", "headline": title, "description": fm["metaDescription"],
                  "image": image, "author": {"@type": "Person", "name": "James Berges", "url": f"{SITE}/about/"},
                  "publisher": {"@type": "Organization", "name": "SLP Transitions", "url": SITE, "logo": {"@type": "ImageObject", "url": LOGO}},
                  "datePublished": date, "dateModified": date, "url": url, "keywords": [fm["targetKeyword"]] + fm.get("secondaryKeywords", []),
                  "articleSection": cat, "inLanguage": "en-US", "wordCount": words, "mainEntityOfPage": {"@type": "WebPage", "@id": url}}
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": cat, "item": f"{SITE}/category/{CATEGORY_SLUGS.get(cat, slugify(cat))}/"},
        {"@type": "ListItem", "position": 3, "name": title, "item": url}]}
    graph = {"@context": "https://schema.org", "@graph": [{k: v for k, v in x.items() if k != "@context"} for x in (article_ld, faq_ld, crumbs_ld)]}
    schema_txt = ("=== YOAST FREE (what this site runs): paste ONLY the FAQPage block ===\n"
                  "Yoast already prints Article and BreadcrumbList for every post, so adding them again duplicates them.\n"
                  "03-faq-embed.html already carries the FAQPage <script>, so if you paste that file you are done.\n\n"
                  "=== FULL GRAPH, for a plugin with a custom schema field (Yoast Premium / RankMath Pro / AIOSEO Pro) ===\n"
                  + json.dumps(graph, ensure_ascii=False, indent=2)
                  + "\n\n=== FALLBACK: <script> tags for a Custom HTML block at the top of the post ===\n"
                  + "\n".join(f'<script type="application/ld+json">\n{json.dumps(x, ensure_ascii=False, indent=2)}\n</script>' for x in (article_ld, faq_ld, crumbs_ld)) + "\n")

    meta_title = title if len(title) <= 60 else fm.get("metaTitle", title)
    cms = (f"Meta Title: {meta_title}\nMeta Description: {fm['metaDescription']}\nSlug: {slug}\nOG Image URL: {image}\n"
           f"Focus Keyword: {fm['targetKeyword']}\nPrimary Category: {cat}\nTag Suggestions: {', '.join(fm.get('secondaryKeywords', []))}\n"
           f"Publish Date: {date}\nModified Date: {date}\nWord Count: {words}\nReading Time: {minutes} min\n")

    preview = (f'<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
               f'<title>{H.escape(title)}</title><meta name="description" content="{H.escape(fm["metaDescription"])}"><link rel="canonical" href="{url}">'
               + "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (article_ld, crumbs_ld))
               + f'<style>body{{margin:0;padding:40px 24px;background:{CREAM};font-family:Lato,system-ui,sans-serif}}h1{{max-width:1080px;margin:0 auto 28px;font-size:40px;color:{DARK};line-height:1.15}}</style></head><body>'
               f"<h1>{H.escape(title)}</h1>{body_html}{faq_html}</body></html>")

    out = os.path.join(ROOT, "content/blog/aeo", slug)
    os.makedirs(out, exist_ok=True)
    for name, text in [("01-schema-jsonld.txt", schema_txt), ("02-post-body.html", body_html), ("03-faq-embed.html", faq_html),
                       ("04-cms-fields.txt", cms), ("preview.html", preview)]:
        open(os.path.join(out, name), "w").write(text)
    for name in ("02-post-body.html", "03-faq-embed.html"):
        t = open(os.path.join(out, name)).read()
        assert "—" not in t, f"em dash in {name}"
        assert "[[" not in t, f"placeholder left in {name}"
    print(f"{out}\n  words {words}, {minutes} min, toc {'yes' if toc else 'no'}, faqs {len(faqs)}, meta title {len(meta_title)} chars, description {len(fm['metaDescription'])} chars")
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    path = args[0]
    date = args[args.index("--date") + 1] if "--date" in args else "2026-10-16"
    image = args[args.index("--image") + 1] if "--image" in args else ""
    build(path, date, image)
