#!/usr/bin/env python3
"""Put the two factual guardrails into the 13-paths pillar article.

They used to live in the homepage career-path cards. Those were retired on
2026-08-29, which left Epic-sponsorship and UXR-saturation on the app subdomain
and nowhere on the marketing site. The article discusses both roles at length,
so it is the better home anyway.

Also corrects a line claiming Epic certification "can be expensive if you're
paying out of pocket" - it cannot be bought at any price, which is the whole
point of the guardrail.

Idempotent; --dry prints without saving. Wording traces to research-facts.md.
"""
import sys, re
sys.path.insert(0, "scripts")
from wp_publish import api

POST = 3358
DRY = "--dry" in sys.argv

def box(text):
    return (
        "<!-- wp:html -->\n"
        '<div style="border-left:3px solid #DC6803;background:#FEF9EB;border-radius:8px;'
        'padding:14px 18px;margin:1.6rem 0">'
        '<p style="margin:0 0 6px;font-size:.76rem;font-weight:700;letter-spacing:.06em;'
        'text-transform:uppercase;color:#8A5A22">Worth knowing</p>'
        f'<p style="margin:0;font-size:.97rem;line-height:1.55">{text}</p>'
        "</div>\n<!-- /wp:html -->\n\n"
    )

UX = ("This is the most oversaturated path on this list &mdash; roughly 35% more graduates "
      "over five years against flat openings. It is doable: one SLP went from rehab director "
      "to UX researcher through a bootcamp. But expect it to take longer than the other paths "
      "here, treat health-tech as the realistic niche rather than big tech, and know that a "
      "portfolio of two to four deep case studies beats any certificate.")

INFO = ("<strong>Epic certification cannot be bought.</strong> It is only available through an "
        "employer who sponsors you, so anyone selling you an &ldquo;Epic cert&rdquo; is selling "
        "you something else. The routes that actually work are sponsor-track junior analyst "
        "roles, go-live and activation support contracts, and consulting firms like Nordic and "
        "Tegria. The credential you <em>can</em> get on your own is CAHIMS through HIMSS, which "
        "has no experience prerequisite.")

raw = api(f"/wp/v2/posts/{POST}?context=edit")["content"]["raw"]
if "Worth knowing" in raw:
    print("caveats already present — nothing to do"); sys.exit(0)

# The existing line implies you can self-fund Epic certification. You cannot.
BAD = ("Epic certification can be expensive if you're paying out of pocket, but many "
       "employers will sponsor it.")
alt = BAD.replace("'", "’")
GOOD = ("Epic certification is not something you can buy for yourself &mdash; it comes only "
        "through an employer that sponsors you.")
for variant in (BAD, alt):
    if variant in raw:
        raw = raw.replace(variant, GOOD, 1)
        print("corrected the Epic self-funding sentence")
        break
else:
    print("!! could not find the Epic sentence to correct")

for label, needle, text in [("UX", "How can an SLP become a UX researcher", UX),
                            ("informatics", "What is clinical informatics", INFO)]:
    i = raw.index(needle)
    j = raw.find("<!-- wp:separator", i)
    raw = raw[:j] + box(text) + raw[j:]
    print(f"inserted {label} caveat before the section break")

if DRY:
    print("\n(dry run — not saved)")
else:
    r = api(f"/wp/v2/posts/{POST}", "POST", {"content": raw})
    print("saved:", r.get("status"), r.get("modified"))
