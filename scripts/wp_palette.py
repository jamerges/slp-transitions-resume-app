"""Site-wide palette override, as a hidden Custom HTML widget in Footer 1.

    python3 wp_palette.py <repo_root>            create or update
    python3 wp_palette.py <repo_root> remove     delete it (the site goes back to the Customizer palette)

Kadence's global palette can only be set in the Customizer (see CLAUDE.md), so
this redefines the same CSS variables later in the page. When James sets the
palette in the Customizer, remove this widget.
"""
import os
import sys

ROOT = sys.argv[1]
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from wp_publish import api  # noqa: E402

MARK = "slp-forest-palette"
# 1 accent, 2 accent dark, 3-6 text from strongest to subtle, 7 subtle fill, 8 page, 9 white.
PALETTE = ["#004820", "#002F15", "#1B1B1E", "#2E332C", "#555B52", "#5B6157", "#E2E3D3", "#F8F7F0", "#FFFFFF"]

root_vars = "".join(f"--global-palette{i}:{c};--wp--preset--color--palette-{i}:{c};" for i, c in enumerate(PALETTE, 1))
root_vars += f"--kb-token--primitive--color--brand--primary:{PALETTE[0]};--kb-token--primitive--color--brand--secondary:{PALETTE[1]};"
classes = "".join(
    f":root .has-palette{i}-color{{color:{c}}}:root .has-palette{i}-background-color{{background-color:{c}}}"
    for i, c in enumerate(PALETTE, 1))
CSS = (f'<style id="{MARK}">/* Forest palette, site-wide. Managed by scripts/wp_palette.py: do not edit here. */'
       f":root{{{root_vars}}}{classes}"
       "#kt-scroll-up-reader,#kt-scroll-up{border-radius:999px}"
       ".widget_custom_html{display:none}</style>")

existing = None
for w in api("/wp/v2/widgets?context=edit"):
    raw = ((w.get("instance") or {}).get("raw") or {})
    if w.get("id_base") == "custom_html" and MARK in (raw.get("content") or ""):
        existing = w
        break

if len(sys.argv) > 2 and sys.argv[2] == "remove":
    if existing:
        print("removed:", str(api(f"/wp/v2/widgets/{existing['id']}?force=true", "DELETE"))[:160])
    else:
        print("nothing to remove")
    raise SystemExit

body = {"id_base": "custom_html", "sidebar": "footer1", "instance": {"raw": {"title": "", "content": CSS}}}
if existing:
    r = api(f"/wp/v2/widgets/{existing['id']}", "POST", body)
else:
    r = api("/wp/v2/widgets", "POST", body)
print("widget:", r.get("id"), "| has style:", MARK in (r.get("rendered") or ""), "|", str(r)[:120] if not r.get("id") else "")
# The create call reports sidebar footer1 and then the widget turns up under
# Inactive widgets (2026-11-21). Setting the area's list is what places it.
if r.get("id"):
    current = api("/wp/v2/sidebars/footer1").get("widgets") or []
    if r["id"] not in current:
        api("/wp/v2/sidebars/footer1", "POST", {"widgets": current + [r["id"]]})
    print("footer1:", api("/wp/v2/sidebars/footer1").get("widgets"))
print("purge:", str(api("/siteground-optimizer/v1/purge-cache", "PUT"))[:100])
