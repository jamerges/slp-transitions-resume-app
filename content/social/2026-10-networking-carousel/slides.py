"""Instagram carousel (1080x1350) + blog header (1200x630) for the networking guide.

    python3 content/social/2026-10-networking-carousel/slides.py

Writes slide-1.png ... slide-8.png and header.png next to this file, rendered by the headless
Chromium that Playwright left in ~/Library/Caches/ms-playwright (same one the workbook uses).
Palette: forest #004820 on cream #EFEEE1 (2026-10-09). Type: Fraunces + DM Sans, as on the homepage.
"""
import glob
import html
import os
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = sorted(glob.glob(os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac/headless_shell")))[-1]

FOREST, DARK, CREAM, TINT, LINE, MUTED, AMBER = "#004820", "#002F15", "#EFEEE1", "#DCE1D2", "#DAD8C6", "#555B52", "#B45309"

BAD = ("Hi! I'm a speech pathologist looking to leave the field. I saw you're a Customer Success Manager. "
       "Could you tell me what a typical project looks like, how you got the job, what the interview was like, "
       "what the salary is, and whether they're hiring? Also, would you look at my résumé?")
GOOD = ("Hi Sam, I'm an SLP in a school district looking at implementation roles, and you made exactly that move. "
        "Would you have fifteen minutes in the next couple of weeks? I mostly want to know how you got the first one. "
        "No job ask, I promise.")

FOOT = '<div class="foot"><span>SLP Transitions</span><span>{n} / 8</span></div>'


def bubble(text, tone):
    mark = ('<div class="tag bad">Gets ignored</div>' if tone == "bad" else '<div class="tag good">Gets answered</div>')
    return f'{mark}<div class="bubble {tone}"><div class="who"><i></i><b>You</b></div><p>{html.escape(text)}</p></div>'


SLIDES = [
    # 1 cover
    ("dark", """<div class="kicker">For SLPs leaving clinical work</div>
<h1>The LinkedIn message that gets ignored, and the one that gets answered.</h1>
<p class="sub">Same goal. Very different odds.</p>
<div class="swipe">Swipe &rarr;</div>"""),
    # 2 bad
    ("cream", f"""<h2>This one asks a stranger for two hours of work.</h2>{bubble(BAD, 'bad')}"""),
    # 3 why bad
    ("cream", """<h2>Why it gets ignored</h2>
<ul class="x">
<li><b>Six questions.</b> Answering takes an evening.</li>
<li><b>No job title.</b> "Leave the field" gives them nothing to remember you by.</li>
<li><b>A résumé review.</b> That's a favor for a friend, not a stranger.</li>
<li><b>"Are they hiring?"</b> It reads as a job ask, so it gets treated like one.</li>
</ul>"""),
    # 4 good
    ("cream", f"""<h2>This one can be answered from the sofa.</h2>{bubble(GOOD, 'good')}"""),
    # 5 why good
    ("cream", """<h2>Five things make a message answerable</h2>
<ol class="num">
<li>It names <b>the move they made</b>.</li>
<li>It asks for a <b>small, fixed amount of time</b>.</li>
<li>It asks for <b>no job</b>.</li>
<li>It's <b>easy to decline</b>.</li>
<li>It's <b>easy to say yes to</b>: one question, or two time windows.</li>
</ol>"""),
    # 6 connection note
    ("cream", """<h2>Too much for a first contact? Send a connection note first.</h2>
<div class="note"><div class="who"><i></i><b>Connection request</b></div>
<p>Hi Sam, I'm an SLP looking at implementation roles and saw you made that move from schools. Would love to connect.</p>
<div class="count">Under 200 characters</div></div>
<p class="body">Its only job is getting a yes. The real message, with your one question, comes after they accept.</p>"""),
    # 7 the two questions
    ("dark", """<div class="kicker">Save these for the last two minutes</div>
<div class="q">&ldquo;Is there anyone else you'd talk to if you were me?&rdquo;</div>
<div class="q">&ldquo;If a role opens on your team, would you be open to me sending you the posting?&rdquo;</div>
<p class="sub">The first hands you the next name. The second is a referral ask in its least awkward form.</p>"""),
    # 8 CTA
    ("cream", """<h2>The full guide covers who to message first, when to follow up, and when to ask for a referral.</h2>
<div class="cta">How SLPs network into a non-clinical job</div>
<p class="body">Free on slptransitions.com. Link in bio.</p>
<p class="body small">Save this for the next message you send.</p>"""),
]

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1080px;height:1350px;overflow:hidden}}
.s{{width:1080px;height:1350px;padding:110px 96px 96px;position:relative;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;justify-content:center}}
.cream{{background:{CREAM};color:{DARK}}}
.dark{{background:{DARK};color:{CREAM}}}
h1{{font-family:'Fraunces',serif;font-weight:600;font-size:92px;line-height:1.05;letter-spacing:-.01em;margin:28px 0 36px}}
h2{{font-family:'Fraunces',serif;font-weight:600;font-size:62px;line-height:1.12;margin:0 0 48px}}
.kicker{{font-size:28px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C9D6C3}}
.sub{{font-size:36px;line-height:1.4;color:#D6DAC9;margin-top:12px}}
.swipe{{position:absolute;right:96px;bottom:110px;font-size:30px;font-weight:700;color:#C9D6C3}}
.bubble,.note{{background:#fff;border:2px solid {LINE};border-radius:28px;padding:40px 44px;box-shadow:0 18px 40px rgba(0,47,21,.08)}}
.bubble.bad{{border-color:#E8CFA8}}
.bubble.good{{border-color:{FOREST}}}
.who{{display:flex;align-items:center;gap:16px;margin-bottom:22px;font-size:28px;color:{MUTED}}}
.who i{{width:52px;height:52px;border-radius:50%;background:{TINT};display:inline-block}}
.bubble p,.note p{{font-size:36px;line-height:1.45;color:#1B1B1E}}
.tag{{display:inline-block;align-self:flex-start;font-size:26px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:10px 20px;border-radius:999px;margin-bottom:22px}}
.tag.bad{{background:#FBEFD9;color:{AMBER}}}
.tag.good{{background:{TINT};color:{FOREST}}}
ul.x,ol.num{{list-style:none;display:flex;flex-direction:column;gap:30px}}
ul.x li,ol.num li{{font-size:40px;line-height:1.35;padding-left:76px;position:relative}}
ul.x li::before{{content:'\\00d7';position:absolute;left:0;top:-6px;font-size:56px;font-weight:700;color:{AMBER}}}
ol.num{{counter-reset:n}}
ol.num li{{counter-increment:n}}
ol.num li::before{{content:counter(n);position:absolute;left:0;top:2px;width:52px;height:52px;border-radius:50%;background:{FOREST};color:{CREAM};font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center}}
.count{{margin-top:22px;font-size:26px;font-weight:700;color:{FOREST}}}
.body{{font-size:38px;line-height:1.45;margin-top:40px}}
.small{{font-size:30px;color:{MUTED};margin-top:20px}}
.q{{font-family:'Fraunces',serif;font-weight:500;font-size:58px;line-height:1.2;margin:44px 0 0;padding-left:34px;border-left:6px solid #C9D6C3}}
.cta{{background:{FOREST};color:{CREAM};font-family:'Fraunces',serif;font-weight:600;font-size:48px;line-height:1.2;padding:40px 44px;border-radius:24px}}
.foot{{position:absolute;left:96px;right:96px;top:56px;display:flex;justify-content:space-between;font-size:24px;font-weight:700;letter-spacing:.06em;opacity:.7}}
/* header */
.hdr{{width:1200px;height:630px;background:{DARK};color:{CREAM};padding:70px 80px;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;justify-content:center}}
.hdr h1{{font-size:68px;margin:18px 0 22px}}
.hdr .kicker{{font-size:22px}}
.hdr .sub{{font-size:28px}}
"""


def render(markup, path, w, h):
    page = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}html,body{{width:{w}px;height:{h}px}}</style></head><body>{markup}</body></html>"
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(page)
    subprocess.run([CHROME, "--headless", "--hide-scrollbars", f"--window-size={w},{h}", "--virtual-time-budget=6000",
                    f"--screenshot={path}", "file://" + f.name], check=True, capture_output=True)
    os.unlink(f.name)


if __name__ == "__main__":
    for i, (tone, inner) in enumerate(SLIDES, 1):
        assert "—" not in inner
        render(f'<div class="s {tone}">{FOOT.format(n=i)}{inner}</div>', os.path.join(HERE, f"slide-{i}.png"), 1080, 1350)
    render("""<div class="hdr"><div class="kicker">SLP Transitions · Guide</div>
<h1>How SLPs network into a non-clinical job</h1><p class="sub">Who to message first, what to say, and how one conversation leads to the next.</p></div>""",
           os.path.join(HERE, "header.png"), 1200, 630)
    print("rendered", len(SLIDES), "slides + header in", HERE)
