"""Render a 1200x630 blog header (and OG image) in the forest-and-cream palette.

    python3 scripts/blog_header.py "Kicker" "Headline" "Subhead" content/blog-images/<file>.png
"""
import glob, html, os, subprocess, sys, tempfile

CHROME = sorted(glob.glob(os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac/headless_shell")))[-1]
kicker, head, sub, out = sys.argv[1:5]
page = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
*{{margin:0;box-sizing:border-box}}html,body{{width:1200px;height:630px}}
.h{{width:1200px;height:630px;background:#002F15;color:#EFEEE1;padding:70px 80px;display:flex;flex-direction:column;justify-content:center;font-family:'DM Sans',sans-serif}}
.k{{font-size:22px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C9D6C3}}
h1{{font-family:'Fraunces',serif;font-weight:600;font-size:68px;line-height:1.05;margin:18px 0 22px}}
p{{font-size:28px;line-height:1.4;color:#D6DAC9}}
</style></head><body><div class="h"><div class="k">{html.escape(kicker)}</div><h1>{html.escape(head)}</h1><p>{html.escape(sub)}</p></div></body></html>"""
with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
    f.write(page)
subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--window-size=1200,630", "--virtual-time-budget=6000", f"--screenshot={os.path.abspath(out)}", "file://" + f.name], check=True, capture_output=True)
os.unlink(f.name)
print("wrote", out)
