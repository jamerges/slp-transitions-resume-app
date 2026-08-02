#!/usr/bin/env python3
"""Stat-led 1200x630 header template for the guide posts.

The original guide headers printed the post title, which reads as a stutter
once the image sits directly above the card title in a post grid. These carry
a verified fact instead, so the image adds information the headline doesn't.

Every `stat` and `sub` below must trace to content/research-facts.md or to a
figure already stated in the post itself.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CREAM = (250, 249, 246)
DARK = (27, 27, 30)
GREEN = (45, 106, 79)
MUTED = (107, 114, 128)

GB = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
G = "/System/Library/Fonts/Supplemental/Georgia.ttf"
HELV = "/System/Library/Fonts/Helvetica.ttc"

# Same safe zone as the guest headers: the single-post hero crops ~10.6% per side.
SAFE_W = int(W * 0.66)
SAFE_LEFT = (W - SAFE_W) // 2


def wrap(d, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=font) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    lines.append(cur)
    return lines


def make(kicker, stat, sub, out_path):
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # auto-fit the stat line (it's the hero element)
    for size in range(92, 34, -3):
        sf = ImageFont.truetype(GB, size)
        stat_lines = wrap(d, stat, sf, SAFE_W)
        if len(stat_lines) <= 3:
            break
    stat_lh = int(size * 1.16)

    subf = ImageFont.truetype(G, 25)
    sub_lines = wrap(d, sub, subf, SAFE_W)[:3]
    sub_lh = 35

    kf = ImageFont.truetype(HELV, 20)
    kicker_h = 27
    # Georgia's descenders hang well below the baseline, so the rule needs real
    # clearance or it reads as an underline on the last line's first glyph.
    pre_rule, post_rule = 26, 30

    block = (kicker_h + 16 + len(stat_lines) * stat_lh
             + pre_rule + 4 + post_rule + len(sub_lines) * sub_lh)
    y = (H - block) // 2

    d.text((SAFE_LEFT, y), kicker.upper(), font=kf, fill=GREEN)
    y += kicker_h + 16

    for ln in stat_lines:
        d.text((SAFE_LEFT, y), ln, font=sf, fill=DARK)
        y += stat_lh

    y += pre_rule
    d.rectangle((SAFE_LEFT, y, SAFE_LEFT + 64, y + 4), fill=GREEN)
    y += post_rule

    for ln in sub_lines:
        d.text((SAFE_LEFT, y), ln, font=subf, fill=MUTED)
        y += sub_lh

    img.save(out_path, optimize=True)
    print(f"wrote {out_path}")


GUIDES = [
    # slug, kicker, stat (the hero fact), supporting line
    ("01-slp-resume-non-clinical", "Resume", "7.4 seconds",
     "That's the first pass a recruiter gives your resume before deciding."),
    ("03-slp-transferable-skills", "Transferable skills", "“Communication skills.”",
     "On a resume, from someone with a master's in communication. A chef listing “food.”"),
    ("07-should-you-quit-slp", "Deciding", "Bad workplace, bad fit, or bad season?",
     "Three different problems. Only one of them means quitting."),
    ("09-slp-cover-letter-non-clinical", "Cover letters", "Spotted in 20 seconds",
     "33.5% of employers say that's all it takes to tell AI wrote it."),
    ("10-slp-linkedin-career-change", "LinkedIn", "They check before they call",
     "If your profile still reads clinical, it contradicts the resume you just fixed."),
]

if __name__ == "__main__":
    import sys
    ROOT = "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool"
    OUT = os.path.join(ROOT, "content/blog-images")
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for slug, kicker, stat, sub in GUIDES:
        if only and only not in slug:
            continue
        make(kicker, stat, sub, os.path.join(OUT, f"{slug}.png"))
