#!/usr/bin/env python3
"""Publish SLP Transitions blog posts to WordPress via the REST API.

Per post: upload header image -> set featured, convert markdown -> Gutenberg
HTML, append an FAQ section + FAQPage JSON-LD, add the quiz CTA, set Yoast meta,
assign a category, publish, then verify by reading it back.
"""
import json, os, re, subprocess, sys, mimetypes

ROOT = "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool"
SITE = "https://slptransitions.com"
QUIZ = "https://app.slptransitions.com/quiz"

env = {}
for line in open(os.path.join(ROOT, ".env.local")):
    line = line.strip()
    if line.startswith("WP_APP_") and "=" in line:
        k, v = line.split("=", 1)
        env[k] = v.strip().strip('"').strip("'")
AUTH = f"{env['WP_APP_USER']}:{env['WP_APP_PASSWORD']}"


def api(path, method="GET", data=None, raw=None, ctype=None, extra=None):
    cmd = ["curl", "-s", "-u", AUTH, "-X", method, f"{SITE}/wp-json{path}"]
    if data is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    if raw is not None:
        cmd += ["-H", f"Content-Type: {ctype}", "--data-binary", f"@{raw}"]
    if extra:
        cmd += extra
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except Exception:
        return {"_raw": out[:400]}


# ---------------------------------------------------------------- markdown
import markdown as md

def to_html(body: str) -> str:
    html = md.markdown(body, extensions=["tables", "sane_lists", "attr_list"])
    # Wrap in Gutenberg block comments so the editor treats them as native
    # blocks rather than one opaque "Classic" lump.
    out = []
    for chunk in re.split(r"\n(?=<)", html):
        c = chunk.strip()
        if not c:
            continue
        if c.startswith("<h2"):   out.append(f"<!-- wp:heading -->\n{c}\n<!-- /wp:heading -->")
        elif c.startswith("<h3"): out.append(f'<!-- wp:heading {{"level":3}} -->\n{c}\n<!-- /wp:heading -->')
        elif c.startswith("<h4"): out.append(f'<!-- wp:heading {{"level":4}} -->\n{c}\n<!-- /wp:heading -->')
        elif c.startswith("<p"):  out.append(f"<!-- wp:paragraph -->\n{c}\n<!-- /wp:paragraph -->")
        elif c.startswith("<ul"): out.append(f"<!-- wp:list -->\n{c}\n<!-- /wp:list -->")
        elif c.startswith("<ol"): out.append(f'<!-- wp:list {{"ordered":true}} -->\n{c}\n<!-- /wp:list -->')
        elif c.startswith("<table"):
            out.append(f'<!-- wp:table -->\n<figure class="wp-block-table">{c}</figure>\n<!-- /wp:table -->')
        elif c.startswith("<blockquote"):
            out.append(f"<!-- wp:quote -->\n{c}\n<!-- /wp:quote -->")
        elif c.startswith("<hr"):
            out.append("<!-- wp:separator -->\n<hr class=\"wp-block-separator\"/>\n<!-- /wp:separator -->")
        else:
            out.append(f"<!-- wp:html -->\n{c}\n<!-- /wp:html -->")
    return "\n\n".join(out)


def parse(path):
    txt = open(path).read()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
    fm_raw, body = m.group(1), m.group(2)
    fm, key = {}, None
    for line in fm_raw.split("\n"):
        if re.match(r"^\s*-\s", line) and key:
            fm.setdefault(key + "_list", []).append(line.strip()[2:].strip())
        elif ":" in line:
            key, v = line.split(":", 1)
            key = key.strip(); fm[key] = v.strip().strip('"')
    # Drop the H1 — WordPress renders the title itself.
    body = re.sub(r"^#\s+.*?\n", "", body.lstrip(), count=1)
    return fm, body.strip()


def cta_block(text):
    return (
        '<!-- wp:group {"style":{"spacing":{"padding":{"top":"28px","bottom":"28px","left":"28px","right":"28px"}},'
        '"border":{"radius":"12px","width":"2px","color":"#2D6A4F"},"color":{"background":"#F0FAF3"}},"layout":{"type":"constrained"}} -->\n'
        '<div class="wp-block-group has-border-color" style="border-color:#2D6A4F;border-width:2px;border-radius:12px;'
        'background-color:#F0FAF3;padding:28px">\n'
        '<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"20px","fontStyle":"normal","fontWeight":"700"}}} -->\n'
        f'<p class="has-text-align-center" style="font-size:20px;font-weight:700">{text}</p>\n'
        '<!-- /wp:paragraph -->\n'
        '<!-- wp:paragraph {"align":"center"} -->\n'
        '<p class="has-text-align-center">Answer 8 questions and get your best-fit non-clinical path — '
        'with the realistic salary range, timeline, and the exact first move for your situation. Free.</p>\n'
        '<!-- /wp:paragraph -->\n'
        '<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->\n'
        '<div class="wp-block-buttons">\n<!-- wp:button {"backgroundColor":"","style":{"color":{"background":"#2D6A4F"},'
        '"border":{"radius":"37px"}}} -->\n'
        '<div class="wp-block-button"><a class="wp-block-button__link has-background wp-element-button" '
        f'href="{QUIZ}" style="border-radius:37px;background-color:#2D6A4F">Take the free 2-minute quiz →</a></div>\n'
        '<!-- /wp:button -->\n</div>\n<!-- /wp:buttons -->\n'
        '</div>\n<!-- /wp:group -->'
    )


def faq_block(faqs):
    """Visible FAQ + FAQPage JSON-LD in one wp:html block so AI answer engines
    and Google both get a machine-readable version."""
    parts = ['<!-- wp:heading -->\n<h2 class="wp-block-heading">Frequently asked questions</h2>\n<!-- /wp:heading -->']
    for q, a in faqs:
        parts.append(f'<!-- wp:heading {{"level":3}} -->\n<h3 class="wp-block-heading">{q}</h3>\n<!-- /wp:heading -->')
        parts.append(f"<!-- wp:paragraph -->\n<p>{a}</p>\n<!-- /wp:paragraph -->")
    ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": re.sub("<[^>]+>", "", q),
             "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", a)}}
            for q, a in faqs
        ],
    }
    parts.append(
        "<!-- wp:html -->\n"
        f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
        "<!-- /wp:html -->"
    )
    return "\n\n".join(parts)


def upload_image(slug, title):
    path = os.path.join(ROOT, "content/blog-images", f"{slug}.png")
    if not os.path.exists(path):
        return None
    fname = f"{re.sub(r'^[0-9]+-', '', slug)}-header.png"
    r = api("/wp/v2/media", "POST", raw=path, ctype="image/png",
            extra=["-H", f'Content-Disposition: attachment; filename="{fname}"'])
    mid = r.get("id")
    if mid:
        api(f"/wp/v2/media/{mid}", "POST",
            {"alt_text": f"{title} — SLP Transitions", "title": title})
    return mid
