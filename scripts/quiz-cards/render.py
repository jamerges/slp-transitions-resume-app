#!/usr/bin/env python3
"""One 1200x630 card per quiz path, in the 2026-11-20 design: the forest panel,
a light Fraunces headline, the range and timeline under it.

    python3 scripts/quiz-cards/render.py            every path
    python3 scripts/quiz-cards/render.py liaison-ur one path

Replaces scripts/make_quiz_path_images.py (Georgia Bold on cream, drawn with
Pillow). This one prints an HTML page with the headless Chromium that
Playwright left in ~/Library/Caches/ms-playwright, so the cards use the same
web fonts as the site. Reads PATHS from lib/quiz.ts; re-run after adding a
path or changing a range or timeline. Output: public/quiz/<slug>.png.
"""
import glob
import html
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, "lib/quiz.ts")).read()
paths = []
for m in re.finditer(r'^  "?([a-z-]+)"?: \{\n    slug:(.*?)\n  \},', src, re.S | re.M):
    body = m.group(2)
    g = lambda k: re.search(r'\n    ' + k + r': "((?:[^"\\]|\\.)*)"', body).group(1).replace('\\"', '"')
    paths.append((m.group(1), g("label"), g("range"), g("timeline")))
assert paths, "no paths parsed from lib/quiz.ts"

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,300&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{display:flex;flex-direction:column;justify-content:center;padding:0 110px;box-sizing:border-box;color:#fff;
  font-family:'DM Sans',sans-serif;
  background:radial-gradient(1100px 520px at 100% -10%,rgba(214,232,170,.34),transparent 60%),
    radial-gradient(800px 460px at 0% 110%,rgba(57,140,96,.55),transparent 60%),
    linear-gradient(140deg,#002F15 0%,#004820 50%,#145C39 100%)}
.k{font-size:21px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#D9E9B4}
h1{font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:SIZEpx;line-height:1.08;letter-spacing:-.015em;margin:26px 0 30px;max-width:900px}
.m{font-size:34px;line-height:1.35;color:rgba(255,255,255,.9)}
.m b{font-weight:500;color:#fff}
</style></head><body>
<div class="k">Your closest path</div>
<h1>LABEL</h1>
<div class="m"><b>RANGE</b><br>typically TIMELINE</div>
</body></html>"""

chrome = sorted(glob.glob(os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac/headless_shell")))
assert chrome, "no headless Chromium found under ~/Library/Caches/ms-playwright"
only = sys.argv[1] if len(sys.argv) > 1 else None
tmp = tempfile.mkdtemp(prefix="quiz-cards-")
n = 0
for slug, label, rng, timeline in paths:
    if only and slug != only:
        continue
    size = 92 if len(label) <= 22 else 80 if len(label) <= 34 else 68
    page = (PAGE.replace("SIZE", str(size)).replace("LABEL", html.escape(label))
            .replace("RANGE", html.escape(rng)).replace("TIMELINE", html.escape(timeline)))
    f = os.path.join(tmp, slug + ".html")
    open(f, "w").write(page)
    out = os.path.join(ROOT, "public/quiz", slug + ".png")
    subprocess.run([chrome[-1], "--headless", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000",
                    "--window-size=1200,630", "--screenshot=" + out, "file://" + f],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", os.path.relpath(out, ROOT))
    n += 1
print(n, "cards")
