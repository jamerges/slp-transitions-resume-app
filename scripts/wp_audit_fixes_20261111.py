"""WordPress fixes from the 2026-11-11 audit. Idempotent; backs up before writing.

    python3 scripts/wp_audit_fixes_20261111.py

1. /career-quiz/ (page 3352): the quiz iframe loads eagerly instead of lazily, shows a
   "Loading your quiz" line with a direct link while it loads, and the page's big
   "Career Quiz" title band is hidden so the first question starts higher on a phone.
Then purges the SiteGround cache. (The homepage search title, still "Home - SLP
Transitions", can't be set this way: Yoast fields aren't REST-writable on pages.)
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"^(WP_APP_USER|WP_APP_PASSWORD)=(.*)$", line.strip())
    if m:
        env[m.group(1)] = m.group(2).strip().strip('"')
AUTH = f"{env['WP_APP_USER']}:{env['WP_APP_PASSWORD']}"
BASE = "https://slptransitions.com/wp-json"


def api(path, method="GET", body=None):
    cmd = ["curl", "-s", "-m", "60", "-u", AUTH, "-X", method, BASE + path]
    if body is not None:
        cmd += ["-H", "Content-Type: application/json", "--data-binary", json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    return json.loads(out) if out.strip() else {}


backup = {}

# 1. The quiz page
quiz = api("/wp/v2/pages/3352?context=edit")
raw = quiz["content"]["raw"]
backup["quiz_3352"] = {"content": raw, "meta": quiz.get("meta", {})}
new = raw.replace('    loading="lazy"\n', "")
if "slp-quiz-loading" not in new:
    new = new.replace(
        '<div id="slp-quiz-wrap" style="max-width:720px;margin:0 auto;">',
        '<div id="slp-quiz-wrap" style="max-width:720px;margin:0 auto;position:relative;">\n'
        '  <p id="slp-quiz-loading" style="position:absolute;top:40px;left:0;right:0;text-align:center;margin:0;'
        'font-size:15px;color:#555B52;">Loading your quiz. If it doesn\'t appear, '
        '<a href="https://app.slptransitions.com/quiz" style="color:#004820;font-weight:600;">open it here</a>.</p>',
    )
    new = new.replace(
        'style="width:100%;border:0;height:760px;display:block;overflow:hidden;"',
        'style="width:100%;border:0;height:760px;display:block;overflow:hidden;position:relative;background:transparent;"',
    )
    # Hide the loading line once the quiz reports its height (it has rendered).
    new = new.replace(
        "      f.style.height = h + 'px';",
        "      f.style.height = h + 'px';\n      var l = document.getElementById('slp-quiz-loading'); if (l) l.style.display = 'none';",
    )
changed_quiz = new != raw
payload = {"meta": {"_kad_post_title": "hide"}}
if changed_quiz:
    payload["content"] = new
r = api("/wp/v2/pages/3352", "POST", payload)
print("quiz page:", r.get("id"), "content changed" if changed_quiz else "content already current",
      "| title band:", (r.get("meta") or {}).get("_kad_post_title"))

# 2. The homepage search title is NOT set here. Yoast's fields are REST-writable on
#    posts but not on pages, so the write is accepted and ignored. James sets it in
#    Pages -> Home -> Yoast (text in content/audits/funnel-audit-2026-11-11.md, item C).

path = os.path.join(ROOT, "content/wp-backups/audit-fixes-20261111.json")
if not os.path.exists(path):
    json.dump(backup, open(path, "w"), indent=1)
    print("backup:", path)

purge = subprocess.run(["curl", "-s", "-m", "60", "-u", AUTH, "-X", "PUT", BASE + "/siteground-optimizer/v1/purge-cache"],
                       capture_output=True, text=True).stdout
print("purge:", purge[:80])
