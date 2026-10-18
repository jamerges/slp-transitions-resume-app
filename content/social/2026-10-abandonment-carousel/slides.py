"""Carousel for "Am I abandoning my patients if I leave SLP?" (1080x1350) + a one-file PDF.

    python3 content/social/2026-10-abandonment-carousel/slides.py

Reuses the networking carousel's renderer and styles. Every claim traces to research-facts.md
("Leaving a caseload: ethics and guilt"); the quote is from content/voc-2026-09-forums.md §2.11.
"""
import importlib.util, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("base", os.path.join(HERE, "../2026-10-networking-carousel/slides.py"))
base = importlib.util.module_from_spec(spec); spec.loader.exec_module(base)

EXTRA = """
.quote{font-family:'Fraunces',serif;font-weight:500;font-size:64px;line-height:1.18;color:#002F15}
.src{font-size:28px;color:#555B52;margin-top:28px}
.stat{font-family:'Fraunces',serif;font-weight:600;font-size:200px;line-height:1;color:#EFEEE1}
.def{background:#fff;border:2px solid #004820;border-radius:28px;padding:44px;font-family:'Fraunces',serif;font-size:52px;line-height:1.2;color:#002F15}
ul.ok{list-style:none;display:flex;flex-direction:column;gap:30px}
ul.ok li{font-size:40px;line-height:1.35;padding-left:76px;position:relative}
ul.ok li::before{content:'\\2713';position:absolute;left:0;top:-2px;font-size:46px;font-weight:700;color:#004820}
"""
base.CSS += EXTRA

SLIDES = [
    ("dark", """<div class="kicker">For SLPs thinking about leaving</div>
<h1>Am I abandoning my patients if I leave?</h1>
<p class="sub">What ASHA actually says, and how to leave a caseload well.</p>
<div class="swipe">Swipe &rarr;</div>"""),
    ("cream", """<div class="quote">&ldquo;I have such guilt for leaving mid year, I will be abandoning my students.&rdquo;</div>
<p class="src">An SLP on r/slp. Some version of this shows up in about eleven of the threads we read.</p>"""),
    ("cream", """<h2>What ASHA counts as abandonment</h2>
<div class="def">Stopping services without arranging for alternative care by an appropriately qualified professional.</div>
<p class="body small">ASHA, Issues in Ethics: Client Abandonment</p>"""),
    ("cream", """<h2>What the same guidance also says</h2>
<ul class="ok">
<li>Leaving for a career move <b>isn't unethical</b> in itself.</li>
<li>You <b>don't have to stay</b> until a replacement is hired.</li>
<li>The <b>effort you put into the handoff</b> matters more than the number of weeks.</li>
<li>Employers are expected to <b>cooperate</b> with a clinician who's leaving.</li>
</ul>"""),
    ("dark", """<div class="kicker">Your role gets filled</div>
<div class="stat">13,300</div>
<p class="sub">SLP openings a year on average through 2034, with employment growing 15%.</p>
<p class="sub" style="font-size:26px;margin-top:28px">Bureau of Labor Statistics, Occupational Outlook Handbook</p>"""),
    ("cream", """<h2>How to leave a caseload well</h2>
<ol class="num">
<li>Check your <b>contract window</b> or notice period.</li>
<li>Give <b>notice early</b>, employer first.</li>
<li><b>Finish</b> every report, note and bill.</li>
<li>Write a <b>handoff for each client</b>.</li>
<li>Leave <b>records and materials</b> where they belong.</li>
<li><b>Stay present</b> through the notice period.</li>
</ol>"""),
    ("cream", """<h2>When a colleague says you're making the shortage worse</h2>
<div class="tag good">Try</div>
<div class="bubble good"><div class="who"><i></i><b>You</b></div><p>The shortage is about caseloads and pay, and I can't fix that by burning out. I'm leaving with a full handoff, and I hope they fill the role fast.</p></div>"""),
    ("cream", """<h2>The guilt is real. It mostly tells you how much you cared.</h2>
<div class="cta">Am I abandoning my patients if I leave SLP?</div>
<p class="body">The full guide is free on slptransitions.com. Link in bio.</p>
<p class="body small">Send this to someone who needs it.</p>"""),
]

if __name__ == "__main__":
    for i, (tone, inner) in enumerate(SLIDES, 1):
        assert "—" not in inner
        base.render(f'<div class="s {tone}">{base.FOOT.format(n=i, total=len(SLIDES))}{inner}</div>', os.path.join(HERE, f"slide-{i}.png"), 1080, 1350)
    pdf_html = os.path.join(HERE, "pdf.html")
    open(pdf_html, "w").write("<!doctype html><html><head><meta charset=utf-8><style>@page{size:1080px 1350px;margin:0}html,body{margin:0}img{display:block;width:1080px;height:1350px;break-after:page}img:last-child{break-after:auto}</style></head><body>"
                              + "".join(f'<img src="slide-{i}.png">' for i in range(1, len(SLIDES) + 1)) + "</body></html>")
    subprocess.run([base.CHROME, "--headless", "--no-pdf-header-footer", f"--print-to-pdf={os.path.join(HERE, 'slp-abandonment-carousel.pdf')}", "file://" + pdf_html], check=True, capture_output=True)
    os.unlink(pdf_html)
    print("rendered", len(SLIDES), "slides + PDF in", HERE)
