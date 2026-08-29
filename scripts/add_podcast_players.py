#!/usr/bin/env python3
"""Put a Libsyn player into each Xceptional Leaders-derived blog post.

The show is hosted on Libsyn (Podpage only renders a website from the feed), so
the player comes straight from the host — no dependency on Podpage staying
subscribed. Episode ids are scraped from each episode's own Libsyn page because
the RSS guid is a UUID, not the numeric id the embed needs.

The player goes directly under the opening summary: the reader has the gist and
can hit play while reading. The existing credit line at the foot of each post
stays where it is.

Idempotent — re-running skips posts that already have a player.
Pass --dry to print the plan without writing.
"""
import json, os, re, subprocess, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import api

DRY = "--dry" in sys.argv
FEED = "https://rss.libsyn.com/shows/153011/destinations/990293.xml"
BRAND = "0B6B54"

# Two posts whose guest name can't be matched from the title alone.
OVERRIDES = {
    "neurodivergent-hiring-mentra": "jhillika kumar",
    "slp-to-software-founder-michelle-boisvert": "michelle boisvert",
}


def fetch(url):
    return subprocess.run(["curl", "-sL", "--max-time", "30", url],
                          capture_output=True, text=True).stdout


def episodes():
    x = fetch(FEED)
    out = []
    for it in re.findall(r"<item>(.*?)</item>", x, re.S):
        t = re.search(r"<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", it, re.S)
        l = re.search(r"<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</link>", it, re.S)
        if t and l:
            out.append((html.unescape(t.group(1)).strip(), l.group(1).strip()))
    return out


def embed_id(page_url):
    """The numeric id lives only in the episode page's own embed markup."""
    m = re.search(r"html5-player\.libsyn\.com/embed/episode/id/(\d+)", fetch(page_url))
    return m.group(1) if m else None


NAME = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z']+))\b")


def match(post_title, slug, eps):
    needle = OVERRIDES.get(slug)
    if needle:
        for t, l in eps:
            if needle in t.lower():
                return t, l
    for cand in NAME.findall(post_title):
        for t, l in eps:
            if cand.lower() in t.lower():
                return t, l
    return None, None


def block(eid, ep_title):
    src = (f"https://html5-player.libsyn.com/embed/episode/id/{eid}"
           f"/height/90/theme/custom/thumbnail/no/direction/backward"
           f"/render-playlist/no/custom-color/{BRAND}/")
    return (
        "<!-- wp:html -->\n"
        '<div class="slp-episode" style="margin:1.5rem 0 2rem">'
        '<p style="margin:0 0 .5rem;font-size:.8rem;font-weight:700;letter-spacing:.06em;'
        'text-transform:uppercase;color:#0B6B54">Listen to the episode</p>'
        f'<iframe title="{html.escape(ep_title, quote=True)}" src="{src}" height="90" '
        'width="100%" style="border:none;display:block" scrolling="no" loading="lazy" '
        'allowfullscreen></iframe>'
        "</div>\n"
        "<!-- /wp:html -->"
    )


if __name__ == "__main__":
    eps = episodes()
    print(f"{len(eps)} episodes in the feed")

    rows, page = [], 1
    while True:
        r = api(f"/wp/v2/posts?per_page=100&page={page}&status=publish&context=edit"
                "&_fields=id,slug,title,content")
        if not isinstance(r, list) or not r:
            break
        rows += r
        if len(r) < 100:
            break
        page += 1
    xl = [p for p in rows
          if "xceptional leaders podcast" in re.sub(r"<[^>]+>", " ", p["content"]["raw"]).lower()]
    print(f"{len(xl)} Xceptional Leaders posts\n")

    done = skipped = failed = 0
    for p in xl:
        title = html.unescape(re.sub(r"<[^>]+>", "", p["title"]["rendered"]))
        raw = p["content"]["raw"]
        if "html5-player.libsyn.com" in raw:
            print(f"  – already has a player: {title[:55]}"); skipped += 1; continue

        ep_title, ep_url = match(title, p["slug"], eps)
        if not ep_url:
            print(f"  !! no episode match: {title[:55]}"); failed += 1; continue
        eid = embed_id(ep_url)
        if not eid:
            print(f"  !! no embed id: {ep_title[:55]}"); failed += 1; continue

        # Straight after the opening summary paragraph.
        anchor = "<!-- /wp:paragraph -->"
        i = raw.find(anchor)
        if i < 0:
            print(f"  !! no insertion point: {title[:55]}"); failed += 1; continue
        i += len(anchor)
        new = raw[:i] + "\n\n" + block(eid, ep_title) + raw[i:]

        print(f"  ✓ {title[:52]}\n      id {eid} — {ep_title[:60]}")
        if not DRY:
            api(f"/wp/v2/posts/{p['id']}", "POST", {"content": new})
        done += 1

    print(f"\n{'planned' if DRY else 'updated'}: {done} | skipped: {skipped} | failed: {failed}")
