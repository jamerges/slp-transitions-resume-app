#!/usr/bin/env python3
"""Friday 'compass' email (2026-09-18). Builds the campaign fresh in MailerLite
(content is only accepted on create) and schedules it instantly to the group
given on the command line. Default is the James-only test group.
  python3 scripts/campaign_friday_compass.py                  # test group
  python3 scripts/campaign_friday_compass.py <group_id> <name>
"""
import json, re, subprocess, sys

ENV = open(".env.local").read()
KEY = re.search(r"^MAILERLITE_API_KEY=(.*)$", ENV, re.M).group(1).strip().strip('"')
FROM, FROM_NAME = "james@slptransitions.com", "James from SLP Transitions"
TEST_GROUP = "197631028917961980"   # "zz test — James only"

def api(path, method="GET", data=None):
    cmd = ["curl", "-s", "-X", method, f"https://connect.mailerlite.com/api{path}", "-H", f"Authorization: Bearer {KEY}", "-H", "Accept: application/json"]
    if data is not None: cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    try: return json.loads(out) if out else {}
    except Exception: return {"_raw": out[:300]}

P = 'style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1F2937;"'
A = 'style="color:#0B6B54;"'
SUBJECT = "A compass, not a clock"
HTML = f"""<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F5;"><div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<p {P}>Hi {{$name|default(there)}},</p>
<p {P}>Happy Friday (hopefully not fried-day).</p>
<p {P}>I&rsquo;ve been building more resources for SLPs figuring out what&rsquo;s next, and I&rsquo;d love you to test them.</p>
<p {P}>Module 0 is free: <a href="https://app.slptransitions.com/course" {A}>app.slptransitions.com/course</a>. Twenty minutes, no account. Module 1 is only $19, and it&rsquo;s credited toward the full course once it comes out.</p>
<p {P}>A quote I keep coming back to: always remember the compass was invented before the clock, because direction was more important than how long it took to get there.</p>
<p {P}>Careers are windy now, mine included. I can&rsquo;t tell you how long yours will take. I&rsquo;m hoping these give you a compass.</p>
<p {P}>If you&rsquo;d rather read first: <a href="https://slptransitions.com/youre-allowed-to-want-out/" {A}>You&rsquo;re allowed to want out</a> or <a href="https://slptransitions.com/alternative-careers-speech-pathologists-slps/" {A}>the 20 paths and what they pay</a>.</p>
<p {P}>Reply with any feedback. I read every one.</p>
<p {P}>James</p>
<p style="font-size:12px;color:#9CA3AF;margin-top:28px;">You&rsquo;re getting this because you signed up at slptransitions.com. <a href="{{$unsubscribe}}" style="color:#9CA3AF;">Unsubscribe</a>.</p>
</div></body></html>"""

if __name__ == "__main__":
    group = sys.argv[1] if len(sys.argv) > 1 else TEST_GROUP
    name = sys.argv[2] if len(sys.argv) > 2 else "2026-09-18 Friday compass (TEST James only)"
    r = api("/campaigns", "POST", {"name": name, "type": "regular", "groups": [group], "emails": [{"subject": SUBJECT, "from_name": FROM_NAME, "from": FROM, "content": HTML}]})
    cid = (r.get("data") or {}).get("id")
    if not cid: print("CREATE FAILED:", json.dumps(r)[:400]); sys.exit(1)
    s = api(f"/campaigns/{cid}/schedule", "POST", {"delivery": "instant"})
    print(f"campaign {cid} -> {(s.get('data') or {}).get('status')} (group {group})")
