#!/usr/bin/env python3
"""Weekly job digest -> MailerLite (2026-10-06). Reads the quality-passed
content/job-digest-<date>.md (so rows removed by hand stay removed), creates a
DRAFT campaign to every quiz path group (MailerLite sends once per subscriber
across groups), and sends one copy to the James-only test group so he can see
it rendered. The real campaign is never scheduled from here: James sends it.
  python3 scripts/campaign_job_digest.py 2026-10-06            # draft + test
  python3 scripts/campaign_job_digest.py 2026-10-06 --no-test  # draft only
"""
import html, json, re, subprocess, sys

ENV = open(".env.local").read()
KEY = re.search(r"^MAILERLITE_API_KEY=(.*)$", ENV, re.M).group(1).strip().strip('"')
FROM, FROM_NAME = "james@slptransitions.com", "James from SLP Transitions"
TEST_GROUP = "197631028917961980"   # "zz test — James only"
# QUIZ_PATH_GROUPS in lib/mailerlite.ts: every quiz completion joins one.
QUIZ_GROUPS = re.findall(r'"(\d{15,})"', re.search(
    r"QUIZ_PATH_GROUPS[^{]*\{(.*?)\};", open("lib/mailerlite.ts").read(), re.S).group(1))

def api(path, method="GET", data=None):
    cmd = ["curl", "-s", "-X", method, f"https://connect.mailerlite.com/api{path}", "-H", f"Authorization: Bearer {KEY}", "-H", "Accept: application/json"]
    if data is not None: cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try: return json.loads(out) if out else {}
    except Exception: return {"_raw": out[:300]}

P = 'style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1F2937;"'
A = 'style="color:#0B6B54;"'
ROW = re.compile(r"^- \*\*(.+?)\*\* · \[(.+?)\]\((\S+?)\) — (.*?)( ●)?$")

# Prices come from lib/pricing.ts, the one price source; never type one here.
_PRICING = open("lib/pricing.ts").read()
_LIST = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"LIST[^{]*\{([^}]*)\}", _PRICING).group(1))}
_SALE = re.search(r"SALE = \{ on: (\w+), price: (\d+)", _PRICING)
def price_of(k):
    return min(int(_SALE.group(2)), _LIST[k]) if _SALE.group(1) == "true" else _LIST[k]

def utm(url, content):
    return f"{url}{'&' if '?' in url else '?'}utm_source=mailerlite&utm_medium=email&utm_campaign=job_digest&utm_content={content}"

def resources_box():
    rows = [
        ("Not sure you want to leave yet?",
         "The first four lessons of the course are free and take about twenty minutes. You finish knowing the salary your next job has to clear and whether it's the workplace, the fit or the season.",
         "Start free", utm("https://app.slptransitions.com/course", "box_course")),
        ("Ready to pick a path?",
         "The Pivot Report gives you three paths that fit your quiz answers, the first job title to apply for in each and your first 30 days.",
         f"Get the report · ${price_of('report')}", utm("https://app.slptransitions.com/?from=quiz&goal=report&path={$quiz_result}", "box_report")),
        ("Found a posting you want?",
         "Paste it into the Career Pivot Suite and get every résumé bullet, the cover letter, your LinkedIn and the interview answers rewritten for that job.",
         f"Try it free · ${price_of('suite')} for the full package", utm("https://app.slptransitions.com/", "box_suite")),
    ]
    cells = "".join(
        f'<p style="margin:{0 if i == 0 else 18}px 0 4px;font-size:15px;font-weight:700;color:#0A3D31;">{q}</p>'
        f'<p style="margin:0 0 6px;font-size:15px;line-height:1.55;color:#1F2937;">{d}</p>'
        f'<p style="margin:0;font-size:15px;"><a href="{html.escape(u)}" style="color:#0B6B54;font-weight:600;">{b} &rarr;</a></p>'
        for i, (q, d, b, u) in enumerate(rows))
    return (f'<div style="margin:28px 0;padding:20px 22px;border:1px solid #CFE7DF;border-radius:10px;background:#F1F8F5;">'
            f'<p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#0B6B54;">Other ways I can help</p>'
            f'{cells}</div>')

def build(md):
    count = int(re.search(r"_(\d+) roles worth a look", md).group(1))
    body = md.split("## A few from each path", 1)[1].split("\n---", 1)[0]
    parts = []
    for line in body.strip().splitlines():
        line = line.strip()
        if line.startswith("### "):
            if parts and parts[-1] != "<h3>": parts.append("</ul>")
            parts.append(f'<h3 style="margin:24px 0 8px;font-size:16px;color:#0A3D31;">{html.escape(line[4:])}</h3><ul style="margin:0;padding-left:20px;">')
        elif (m := ROW.match(line)):
            co, title, url, loc, remote = m.groups()
            loc = "Remote" if remote and "remote" in loc.lower() else loc + (" (remote)" if remote else "")
            parts.append(f'<li style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1F2937;"><a href="{html.escape(url)}" {A}>{html.escape(title)}</a> at {html.escape(co)}<br><span style="color:#6B7280;font-size:13px;">{html.escape(loc)}</span></li>')
        elif (m := re.match(r"^- _\+(\d+) more in this path_$", line)):
            parts.append(f'<li style="margin:0 0 8px;font-size:14px;"><a href="https://app.slptransitions.com/jobs" {A}>{m.group(1)} more on the jobs page</a></li>')
    parts.append("</ul>")
    return count, f"""<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F5;"><div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<p {P}>Hi {{$name|default(there)}},</p>
<p {P}>Here are this week's new openings that fit the paths from the quiz, pulled from the job boards of health and ed-tech companies that value clinical skills. I check each one for a licence you'd need and don't hold.</p>
{"".join(parts)}
<p style="margin:24px 0 16px;font-size:16px;line-height:1.6;color:#1F2937;">Every open role, updated weekly: <a href="https://app.slptransitions.com/jobs" {A}>app.slptransitions.com/jobs</a></p>
{resources_box()}
<p {P}>If one of these is the one, reply and tell me. I read every reply.</p>
<p {P}>James</p>
<p style="font-size:12px;color:#6B7280;margin-top:28px;">You're getting this because you took the career quiz at slptransitions.com. <a href="{{$unsubscribe}}" style="color:#6B7280;">Unsubscribe</a>.</p>
</div></body></html>"""

def create(name, subject, groups, content):
    r = api("/campaigns", "POST", {"name": name, "type": "regular", "groups": groups, "emails": [{"subject": subject, "from_name": FROM_NAME, "from": FROM, "content": content}]})
    cid = (r.get("data") or {}).get("id")
    if not cid: print("CREATE FAILED:", json.dumps(r)[:400]); sys.exit(1)
    return cid

if __name__ == "__main__":
    date = sys.argv[1]
    count, content = build(open(f"content/job-digest-{date}.md").read())
    subject = f"{count} new non-clinical jobs for SLPs this week"
    if "--no-test" not in sys.argv:
        tid = create(f"{date} Job digest (TEST James only)", subject, [TEST_GROUP], content)
        s = api(f"/campaigns/{tid}/schedule", "POST", {"delivery": "instant"})
        print(f"test campaign {tid} -> {(s.get('data') or {}).get('status')}")
    cid = create(f"{date} Job digest — quiz takers", subject, QUIZ_GROUPS, content)
    print(f"DRAFT campaign {cid} to {len(QUIZ_GROUPS)} quiz path groups, NOT scheduled: James sends it in MailerLite")
