#!/usr/bin/env python3
"""One 1200x630 card per quiz path, in the guide-header visual system
(cream ground, Georgia display, emerald rule). Typographic on purpose: no
stock photos, no generated faces. Reads PATHS straight from lib/quiz.ts so a
new path gets a card by re-running this. Output: public/quiz/<slug>.png."""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from make_guide_header import wrap, W, H, CREAM, DARK, GREEN, MUTED, GB, G, HELV, SAFE_W, SAFE_LEFT

src = open(os.path.join(ROOT, "lib/quiz.ts")).read()
paths = []
for m in re.finditer(r'^  "?([a-z-]+)"?: \{\n    slug:(.*?)\n  \},', src, re.S | re.M):
    body = m.group(2)
    g = lambda k: re.search(r'\n    ' + k + r': "((?:[^"\\]|\\.)*)"', body).group(1).replace('\\"', '"')
    paths.append((m.group(1), g("label"), g("range"), g("timeline")))

def card(slug, label, rng, timeline):
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)
    for size in range(84, 40, -3):
        lf = ImageFont.truetype(GB, size)
        lines = wrap(d, label, lf, SAFE_W)
        if len(lines) <= 2: break
    lh = int(size * 1.14)
    kf = ImageFont.truetype(HELV, 20)
    sf = ImageFont.truetype(G, 27)
    sub = f"{rng}  ·  typically {timeline}"
    sub_lines = wrap(d, sub, sf, SAFE_W)[:2]
    block = 27 + 16 + len(lines) * lh + 26 + 4 + 30 + len(sub_lines) * 37
    y = (H - block) // 2
    d.text((SAFE_LEFT, y), "YOUR CLOSEST PATH", font=kf, fill=GREEN); y += 43
    for ln in lines: d.text((SAFE_LEFT, y), ln, font=lf, fill=DARK); y += lh
    y += 26; d.rectangle((SAFE_LEFT, y, SAFE_LEFT + 64, y + 4), fill=GREEN); y += 34
    for ln in sub_lines: d.text((SAFE_LEFT, y), ln, font=sf, fill=MUTED); y += 37
    out = os.path.join(ROOT, "public/quiz", f"{slug}.png")
    img.save(out, optimize=True); return out

for p in paths: print("wrote", card(*p))
print(len(paths), "cards")
