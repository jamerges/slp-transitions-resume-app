#!/usr/bin/env python3
"""Build the redesigned SLP Transitions homepage as WordPress page content.

Everything ships inside the page: one <style> block plus semantic HTML in
wp:html blocks. That's the only route to this design on a classic Kadence
theme — the Customizer's Additional CSS has no REST route (custom_css is a
404), so page-scoped CSS it is.

Design direction is adapted from the brief James was given. What is NOT
adapted is the data: every salary range and timeline below traces to
content/research-facts.md. The reference mock understated all six ranges
(clinical informatics by ~$57k) and dropped the oversaturation caveat on
UX research, which is a named factual guardrail in CLAUDE.md.
"""
import re, sys, os
sys.path.insert(0, "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool/scripts")
from wp_publish import api

# The companies count, derived from lib/companies.ts so this page and the app
# never disagree again (they did: 120 / 123 / 126 / 188 across surfaces).
def company_count() -> int:
    ts = open(os.path.join(os.path.dirname(__file__), "..", "lib", "companies.ts"), encoding="utf-8").read()
    n = len(re.findall(r'^  \{"name":', ts, re.M))
    assert n > 100, f"companies count looks wrong: {n}"
    return n
COMPANY_COUNT = company_count()

# Tags on every quiz link, so GA can say which door gets used.
def utm(content: str) -> str:
    return f"utm_source=slptransitions&utm_medium=home&utm_content={content}"

QUIZ = "https://app.slptransitions.com/quiz"
APP = "https://app.slptransitions.com/"
SITE = "https://slptransitions.com"

# ---------------------------------------------------------------- data

# People who took a JOB, not people who founded a company. The homepage
# reader is deciding whether they can be hired somewhere else, and a founder
# answers a different question — one most of them are not asking. Xceptional
# Leaders guests are deliberately excluded here for the same reason; those
# interviews still live on the blog under Entrepreneurs.
#
# Photos are the real photographs the subjects supplied (content/guest-photos,
# uploaded to WP media 3743 to 3745 on 2026-11-20 at about 500px, which is as
# large as the hero and the story cards show them). Emily Harford is NOT here
# despite being a good story: her post image is AI-generated and no photograph
# of her exists. Real photographs only.
STORIES = [
    dict(photo="2026/11/caitlin-mueller-portrait-v1.jpg", name="Caitlin Mueller",
         was="School-based SLP", now="Marketing Manager at an AAC device maker",
         short="School-based SLP &rarr; Marketing Manager",
         line="She took a clinical consultant job at the company first, then moved into marketing, where knowing the clinical side is the qualification.",
         href=f"{SITE}/clinical-consultant-and-marketing/"),
    dict(photo="2026/11/lindsey-ison-portrait-v1.jpg", name="Lindsey Ison",
         was="SLP", now="Enablement Consultant at a tech firm",
         short="SLP &rarr; Enablement Consultant",
         line="Still coaching people through something difficult, now it's software instead of therapy. Comparable pay, and the flexibility she left for.",
         href=f"{SITE}/enablement-consultant/"),
    dict(photo="2026/11/bethany-riebock-portrait-v1.jpg", name="Bethany Riebock",
         was="Medical SLP and rehab director", now="UX Researcher",
         short="Medical SLP &rarr; UX Researcher",
         line="Burnt out running a rehab department, she went through a UX bootcamp and into research in Silicon Valley.",
         href=f"{SITE}/slp-to-ux/"),
]

# A featured story without a headshot is not shippable — the faces are what
# make this band land visually, and a text-only card reads as a placeholder.
# If you have no photograph of someone, they do not go here, however good the
# story is. Never substitute an AI-generated face.
for _s in STORIES:
    assert _s.get("photo"), f"STORIES entry {_s['name']!r} has no photograph — see the note above"

# (name, low $k, high $k, timeline class) from the pillar's pay table.
PAY_ROWS = [
    ("Clinical liaison", 84, 135, "t1"),
    ("Utilization review", 80, 88, "t1"),
    ("Clinical research coordinator", 48, 72, "t1"),
    ("Customer success", 75, 120, "t2"),
    ("Content marketing", 80, 141, "t2"),
    ("Clinical informatics", 97.8, 154, "t2"),
    ("Instructional design", 70, 100, "t2"),
    ("Data analyst", 70, 105, "t3"),
]

RESOURCES = [
    dict(step="01 · Find direction", title="Should you quit being an SLP?",
         copy="Tell a bad workplace apart from a bad fit and a bad season before you decide anything.",
         href=f"{SITE}/should-you-quit-slp/"),
    dict(step="02 · Build your bridge", title="Translate your transferable skills",
         copy="The exact wording that turns a caseload into language a hiring manager can map to their open role.",
         href=f"{SITE}/slp-transferable-skills/"),
    dict(step="03 · Make the move", title="Build a non-clinical resume",
         copy="Recruiters spend about 7.4 seconds on the first pass. Here is what has to survive it.",
         href=f"{SITE}/slp-resume-non-clinical/"),
]

# Retired from the homepage 2026-08-03 (it explained a mechanism before the
# reader had reason to care). Canonical home is content/blog/03-slp-transferable-skills.md.
TRANSLATIONS = [
    ("Caseload of 60", "Portfolio of 60 concurrent clients"),
    ("IEP meetings", "Cross-functional stakeholder alignment"),
    ("Progress monitoring", "Outcome analytics"),
    ("Treatment plans", "Goals, timelines, deliverables"),
    ("Documentation review", "Detail-oriented QA"),
]

# Retained for reference; the homepage now shows the translation strip instead,
# which makes the same point with a fraction of the prose.
AFFIRMATIONS = [
    ("Your degree still counts.",
     "Clinical reasoning, communication, education, documentation and stakeholder management all carry outside the clinic."),
    ("Start with a small experiment.",
     "One conversation, portfolio sample or test project usually teaches you more than a month of comparing every option."),
    ("Test a path while you're still employed.",
     "Translate your experience, close one skill gap, and try a role without giving up the income you need."),
    ("Focus on the next few years.",
     "Look for work that gives you more energy, growth, flexibility or choice. You can reassess as your life changes."),
]

SCRIPT = """
<script>
(function(){
  var home=document.querySelector('.slp-home');if(!home)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  home.classList.add('js-anim');   /* no-JS + reduced-motion keep the static page */

  document.querySelectorAll('[data-stagger]').forEach(function(g){
    var i=0;g.querySelectorAll(':scope > .slp-rv, :scope > * > .slp-rv').forEach(function(el){
      el.style.setProperty('--i', i++);});});

  /* Reveal sweep runs in the scroll loop rather than via IntersectionObserver:
     instant jumps (anchor links) skip intersections and strand elements hidden. */
  var rvs=[].slice.call(document.querySelectorAll('.slp-rv'));
  function sweep(){
    rvs=rvs.filter(function(el){
      if(el.getBoundingClientRect().top<innerHeight*0.92){el.classList.add('is-in');return false;}
      return true;});}
  addEventListener('scroll',function(){requestAnimationFrame(sweep);},{passive:true});
  addEventListener('resize',sweep);
  sweep();
})();
</script>
"""

CSS = """
<style id="slp-home-2026">
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=DM+Sans:wght@400;500;600;700&display=swap');

/* 2026-11-20 redesign (James: "looks a bit generic", pointing at osmind.org).
   What changed is the frame the same words sit in: light serif headlines with
   one phrase in italics, real photographs at size, a row of numbers, and one
   saturated panel that holds the product. The comp it was built from is
   content/design/home-direction-2026-11-20.html.
   Palette: forest #004820 (James's pick, 2026-10-09) on a paper a shade lighter
   than the app's cream, so the photographs and the green panels carry the page. */
.slp-home{--page:#F8F7F0;--paper:#FFFFFF;--forest:#004820;--forest-dark:#002F15;--ink:#14201A;
  --brand:#266341;--mint:#DCE1D2;--sage:#B3C4B1;--line:#DAD8C6;--slate:#555B52;--glow:#D9E9B4;
  font-family:'DM Sans',system-ui,sans-serif;color:var(--ink);line-height:1.5;
  background:var(--page);margin:0 calc(50% - 50vw);width:100vw;overflow-x:hidden}
.slp-home *,.slp-home *::before,.slp-home *::after{box-sizing:border-box}
.slp-wrap{max-width:1216px;margin:0 auto;padding:0 clamp(18px,4vw,48px)}
.slp-home h1,.slp-home h2,.slp-home h3{
  font-family:'Fraunces',Georgia,serif;font-weight:300;letter-spacing:-.015em;margin:0;color:var(--ink)}
/* One phrase per headline is set in italics. It is the only emphasis the page uses. */
.slp-home h1 em,.slp-home h2 em{font-style:italic;font-weight:300}
.slp-home p{margin:0}
.slp-home a{text-decoration:none;color:inherit}
.slp-kicker{font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--brand);margin:0}

/* buttons */
.slp-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  min-height:54px;padding:.85rem 1.6rem;border-radius:999px;font-weight:600;font-size:1rem;
  transition:transform .18s ease,background .18s ease}
/* !important because Kadence's .entry-content a color otherwise wins */
.slp-home a.slp-btn-primary{background:var(--forest);color:#fff!important}
.slp-home a.slp-btn-primary:hover{background:var(--brand);transform:translateY(-2px)}
.slp-home a.slp-btn-light{background:#fff;color:var(--forest-dark)!important}
.slp-home a.slp-btn-light:hover{background:var(--glow);transform:translateY(-2px)}
.slp-quiet{color:var(--forest);font-weight:600;font-size:.92rem;border-bottom:1px solid currentColor;
  padding-bottom:.2rem}

/* hero */
.slp-hero{padding:clamp(32px,4.5vw,64px) 0 clamp(44px,5.5vw,76px)}
.slp-hero-grid{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);
  gap:clamp(32px,5vw,72px);align-items:center}
.slp-hero h1{font-size:clamp(2.6rem,5.4vw,4.75rem);line-height:1.06}
.slp-lede{font-size:clamp(1.1rem,1.6vw,1.3rem);line-height:1.5;color:var(--slate);
  margin-top:1.3rem!important;max-width:30em}
.slp-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.9rem}
.slp-trust{margin-top:1.1rem!important;font-size:.92rem;color:var(--slate)}
.slp-trust b{color:var(--forest);font-weight:600}
.slp-side{font-size:.92rem;color:var(--slate);margin-top:1.3rem!important}
.slp-side a{color:var(--forest)!important;font-weight:600;border-bottom:1px solid currentColor}
/* three real people, staggered: one tall, two square. The caption is a strip
   under the photo, never over it: two of the three are tight headshots and an
   overlaid tag covered the mouth and chin. */
.slp-faces{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.slp-home a.slp-face{display:flex;flex-direction:column;border-radius:24px;overflow:hidden;
  background:var(--paper);border:1px solid var(--line);transition:transform .18s ease}
.slp-home a.slp-face:hover{transform:translateY(-3px)}
.slp-face img{display:block;width:100%;max-width:none;object-fit:cover;object-position:50% 20%}
.slp-face.tall{grid-row:1 / span 2}
.slp-face.tall img{flex:1 1 0;height:0;min-height:0}
.slp-face.sq img{aspect-ratio:1/1;flex:0 0 auto}
.slp-face.inset{margin-right:12%}
.slp-tag{display:block;padding:11px 14px 13px;font-size:.78rem;line-height:1.35;color:var(--slate)}
.slp-tag b{display:block;font-size:.88rem;color:var(--ink)}

/* numbers */
.slp-nums{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:30px 0}
.slp-nums .slp-wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.slp-num{display:flex;gap:14px;align-items:center}
.slp-num b{font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:2.9rem;line-height:1;
  color:var(--forest-dark);letter-spacing:-.02em;white-space:nowrap}
.slp-num span{font-size:.86rem;line-height:1.35;color:var(--slate)}

/* the stage: one saturated panel that holds the product */
.slp-stage-sec{padding:clamp(48px,7vw,84px) 0 clamp(20px,3vw,40px)}
.slp-stage{border-radius:32px;color:#fff;text-align:center;
  padding:clamp(36px,5vw,64px) clamp(18px,4.4vw,56px) clamp(28px,4.4vw,56px);
  background:radial-gradient(1200px 520px at 85% -10%,rgba(214,232,170,.34),transparent 60%),
    radial-gradient(900px 500px at 0% 110%,rgba(57,140,96,.55),transparent 60%),
    linear-gradient(140deg,#002F15 0%,#004820 48%,#145C39 100%)}
.slp-home .slp-stage h2{font-size:clamp(2rem,4vw,3.25rem);line-height:1.1;color:#fff}
.slp-stage .slp-sub{font-size:1.05rem;color:rgba(255,255,255,.84);margin:.7rem auto 2.4rem!important;max-width:34em}
.slp-glass-grid{display:grid;grid-template-columns:1.6fr 1fr 1.15fr;gap:18px;text-align:left}
.slp-glass{display:block;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);
  border-radius:20px;padding:22px;color:#fff}
.slp-home .slp-glass h3{font-weight:400;font-size:1.25rem;color:#fff;margin:0 0 .85rem}
.slp-row{display:grid;grid-template-columns:9.4rem minmax(0,1fr) 6.4rem;gap:.85rem;align-items:center;
  font-size:.84rem;line-height:1.3;margin:.55rem 0;color:rgba(255,255,255,.92)}
.slp-row .v{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.slp-track{position:relative;height:8px;border-radius:4px;background:rgba(255,255,255,.16)}
.slp-track span{position:absolute;top:0;bottom:0;border-radius:4px}
.t1{background:#D9E9B4}.t2{background:#9CC9A4}.t3{background:#6FA382}
.slp-legend{display:flex;flex-wrap:wrap;gap:.3rem 1rem;margin-top:.9rem!important;font-size:.74rem;color:rgba(255,255,255,.75)}
.slp-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.35rem;vertical-align:-1px}
.slp-result .k{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.72)}
.slp-result .t{font-family:'Fraunces',Georgia,serif;font-size:1.7rem;line-height:1.15;margin:.5rem 0 .75rem;color:#fff}
.slp-result .m{font-size:.95rem;color:rgba(255,255,255,.88);line-height:1.5}
.slp-result .go{display:inline-block;margin-top:1rem;font-size:.86rem;font-weight:600;color:var(--glow);
  border-bottom:1px solid currentColor;padding-bottom:.15rem}
.slp-home ul.slp-stops{list-style:none!important;margin:0!important;padding:0!important}
.slp-home ul.slp-stops li{display:flex;align-items:center;gap:.6rem;padding:.42rem 0;margin:0;
  font-size:.9rem;line-height:1.3;color:rgba(255,255,255,.78)}
.slp-stops li::before{content:"";width:9px;height:9px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);flex:0 0 auto}
.slp-home ul.slp-stops li.here{color:#fff;font-weight:600}
.slp-stops li.here::before{background:var(--glow);border-color:var(--glow)}
.slp-stops small{margin-left:auto;font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--glow);color:var(--forest-dark);border-radius:999px;padding:.2rem .6rem;white-space:nowrap}
.slp-stage-cta{margin-top:2.2rem}

/* sections */
.slp-sec{padding:clamp(48px,7vw,84px) 0}
.slp-sec-head{margin-bottom:clamp(24px,3.4vw,40px);max-width:42rem}
.slp-sec h2{font-size:clamp(1.95rem,3.6vw,3rem);line-height:1.1;margin-top:.6rem}

/* stories: the photograph leads, then where they were and where they are */
.slp-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.slp-story{display:block}
.slp-story .ph{border-radius:22px;overflow:hidden;aspect-ratio:4/3.5;background:var(--mint);margin-bottom:1rem}
.slp-story .ph img{width:100%;height:100%;max-width:none;object-fit:cover;object-position:50% 22%;display:block;
  transition:transform .4s ease}
.slp-story:hover .ph img{transform:scale(1.03)}
.slp-was{font-size:.84rem;color:var(--slate)}
.slp-now{font-family:'Fraunces',Georgia,serif;font-size:1.5rem;line-height:1.2;color:var(--ink);
  margin:.25rem 0 .5rem;letter-spacing:-.01em}
.slp-story .slp-story-line{font-size:.97rem;line-height:1.55;color:var(--slate);margin:0 0 .6rem}
.slp-story-link{font-size:.9rem;font-weight:600;color:var(--forest)}

/* resources */
.slp-res{border-top:1px solid var(--line)}
.slp-res a{display:grid;grid-template-columns:.6fr 1.1fr 1.3fr auto;gap:2rem;align-items:center;
  padding:1.5rem .25rem;border-bottom:1px solid var(--line);transition:background .18s ease,padding .18s ease}
.slp-res a:hover{background:rgba(220,225,210,.5);padding-left:1rem;padding-right:1rem}
.slp-res .step{font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}
.slp-res b{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:1.5rem;line-height:1.2;color:var(--ink);letter-spacing:-.01em}
.slp-res p{font-size:.95rem;line-height:1.55;color:var(--slate)}
.slp-res .arrow{font-size:1.4rem;color:var(--forest)}

/* companies band and closer */
.slp-band{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.2rem;
  background:var(--paper);border:1px solid var(--line);border-radius:20px;
  padding:1.6rem 1.9rem;margin-top:clamp(28px,4vw,44px)}
.slp-home .slp-band h3{font-size:1.45rem;font-weight:400}
.slp-band p{font-size:.95rem;color:var(--slate);margin-top:.35rem}
.slp-final{border-radius:32px;padding:clamp(32px,4.6vw,56px);display:grid;
  grid-template-columns:minmax(0,1.3fr) auto;gap:clamp(24px,4vw,40px);align-items:center;color:#fff;
  margin-bottom:clamp(48px,7vw,88px);
  background:radial-gradient(900px 400px at 100% 0%,rgba(214,232,170,.3),transparent 60%),
    linear-gradient(140deg,#002F15,#004820 60%,#145C39)}
.slp-home .slp-final h2{font-size:clamp(1.95rem,3.6vw,3rem);line-height:1.1;color:#fff}
.slp-final p{color:rgba(255,255,255,.84);font-size:1.05rem;line-height:1.6;margin-top:.9rem!important;max-width:32em}

@media (max-width:900px){
  .slp-hero-grid{grid-template-columns:1fr}
  .slp-face.inset{margin-right:0}
  .slp-nums .slp-wrap{grid-template-columns:1fr 1fr;gap:20px}
  .slp-num{flex-direction:column;align-items:flex-start;gap:4px}
  .slp-num b{font-size:2.25rem}
  .slp-glass-grid{grid-template-columns:1fr}
  .slp-story-grid{grid-template-columns:1fr 1fr}
  .slp-res a{grid-template-columns:1fr auto;gap:.55rem 1.5rem}
  .slp-res .step,.slp-res b,.slp-res p{grid-column:1}
  .slp-res .arrow{grid-column:2;grid-row:1/4}
  .slp-final{grid-template-columns:1fr}
}
@media (max-width:620px){
  .slp-story-grid{grid-template-columns:1fr}
  .slp-row{grid-template-columns:6.5rem minmax(0,1fr) 5rem;gap:.6rem;font-size:.78rem}
  .slp-actions{flex-direction:column;align-items:stretch}
  .slp-hero .slp-btn,.slp-final .slp-btn{width:100%}
  .slp-tag{font-size:.72rem;padding:9px 11px 11px}
  .slp-tag b{font-size:.82rem}
  .slp-stage{border-radius:24px}
}
/* ---- scroll animation layer (added only when JS runs: .js-anim) ---- */
.slp-home.js-anim .slp-rv{opacity:0;transform:translateY(22px);
  transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1);
  transition-delay:calc(var(--i,0)*80ms)}
.slp-home.js-anim .slp-rv.is-in{opacity:1;transform:none}

@media (prefers-reduced-motion:reduce){
  .slp-home *{animation:none!important;transition:none!important}
  .slp-home.js-anim .slp-rv{opacity:1;transform:none}
}
</style>
"""


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")



SALE_BANNER = None  # the $9 sale ended 2026-10-06


def build():
    p = []
    a = p.append

    a('<div class="slp-home">')

    # ---- sale strip (2026-09-21). One flag; set SALE_BANNER = None to remove
    # it and re-run. Same words and link as components/SaleBanner.tsx in the
    # app, so the two sites show one sale. The Kadence "Sale banner" element
    # (3656) is the site-wide version and sits in draft until it renders.
    if SALE_BANNER:
        a('<a class="slp-sale" href="{}" style="display:block;background:#004820;color:#fff;text-align:center;'
          'padding:10px 16px;font-size:15px;line-height:1.4;text-decoration:none;font-weight:600;">{}</a>'
          .format(SALE_BANNER[1], SALE_BANNER[0]))

    # ---- hero
    # One message and one button (2026-09-28: a hero with a quiz question, a
    # sample result and three numbers read as too busy). Since 2026-11-20 the
    # right side is three real people instead of the hype video: the video was
    # still in the old teal, and faces are what the page was missing.
    a('<section class="slp-hero"><div class="slp-wrap"><div class="slp-hero-grid"><div class="slp-hero-copy">')
    a('<h1>Your SLP skills can take you <em>somewhere new.</em></h1>')
    # The subhead carries the validation the headline doesn't: permission first
    # (voice-of-customer §5.1), then the practical promise. "Want out" is the
    # reader's own phrase.
    a('<p class="slp-lede">You&rsquo;re allowed to want out. See the paths, what they pay, '
      'and how long each move takes.</p>')
    # One filled button, and it means the quiz. The Suite is a text link for
    # the few who already hold a posting.
    a(f'<div class="slp-actions"><a class="slp-btn slp-btn-primary" href="{QUIZ}?{utm("home_hero")}">Find my career path &rarr;</a></div>')
    a('<p class="slp-trust"><b>Free</b> &middot; <b>2 minutes</b> &middot; nine questions</p>')
    a(f'<p class="slp-side">Have a job posting already? <a href="{APP}?{utm("home_hero_suite")}">'
      'Translate your r&eacute;sum&eacute; for it &rarr;</a></p>')
    a('</div>')
    # Each photo links to that person's story. The first is tall, the other two
    # square, the last one inset so the three don't read as a grid.
    a('<div class="slp-faces">')
    for i, s in enumerate(STORIES):
        shape = ("tall", "sq", "sq inset")[i]
        # Above the fold, so never lazy: the two squares arrived seconds late.
        # data-skip-lazy keeps SiteGround's lazy-loader off them too.
        load = ('fetchpriority="high" ' if i == 0 else '') + 'loading="eager" data-skip-lazy class="skip-lazy"'
        a(f'<a class="slp-face {shape}" href="{s["href"]}">'
          f'<img src="{SITE}/wp-content/uploads/{s["photo"]}" alt="{esc(s["name"])}" {load} />'
          f'<span class="slp-tag"><b>{esc(s["name"])}</b>{s["short"]}</span></a>')
    a('</div>')
    a('</div></div></section>')  # grid, wrap, section

    # ---- four numbers. Every one is a claim the site already makes: the
    # pillar's count, the companies DB, the top documented salary (research-facts,
    # with James's note that founders can pass it) and the documented timeline.
    nums = [
        ("20", "paths compared, with pay and timelines"),
        (str(COMPANY_COUNT), "health and ed-tech companies that value clinical skills"),
        ("$154k", "top documented salary, and founders can go past it"),
        ("6&ndash;15", "months, the documented range for a move"),
    ]
    a('<section class="slp-nums"><div class="slp-wrap">'
      + "".join(f'<div class="slp-num"><b>{n}</b><span>{l}</span></div>' for n, l in nums)
      + '</div></section>')

    # ---- the stage: the 20-paths chart, with a quiz result and the stage map
    # beside it. Filled white means the pillar article here; the quiz result
    # card is a quiet link to the quiz.
    # Eight of the twenty, drawn to one scale and coloured by how long the move
    # takes. Ranges are the 25th-75th bands in the pillar article's table
    # (content/research-facts.md); keep the two in sync.
    lo_k, hi_k = 40, 160
    rows = "".join(
        f'<div class="slp-row"><span class="n">{esc(n)}</span>'
        f'<span class="slp-track"><span class="{t}" style="left:{(lo-lo_k)/(hi_k-lo_k)*100:.1f}%;width:{(hi-lo)/(hi_k-lo_k)*100:.1f}%"></span></span>'
        f'<span class="v">${lo:g}k&ndash;${hi:g}k</span></div>'
        for n, lo, hi, t in PAY_ROWS)
    a('<section class="slp-stage-sec" id="career-paths"><div class="slp-wrap"><div class="slp-stage">')
    a('<h2>Compare 20 paths <em>in one place.</em></h2>')
    a('<p class="slp-sub">Eight of them here, by pay and by how long the move usually takes.</p>')
    a('<div class="slp-glass-grid" data-stagger>')
    a('<div class="slp-glass slp-rv"><h3>What they pay</h3>'
      f'{rows}'
      '<p class="slp-legend"><span><i class="t1"></i>Weeks to a few months</span>'
      '<span><i class="t2"></i>6 to 12 months</span><span><i class="t3"></i>12 to 24 months</span></p></div>')
    # The range and timeline are the customer-success path in lib/quiz.ts PATHS.
    a(f'<a class="slp-glass slp-result slp-rv" href="{QUIZ}?{utm("home_stage_result")}">'
      '<div class="k">A quiz result</div>'
      '<div class="t">Customer Success / Implementation</div>'
      '<div class="m">$75,000&ndash;$120,000<br>typically 3&ndash;9 months</div>'
      '<span class="go">Find yours &rarr;</span></a>')
    # The five stages, as the quiz result names them (lib/stage-map.ts).
    a('<div class="slp-glass slp-rv"><h3>Where you are</h3><ul class="slp-stops">'
      '<li>Private doubt</li><li>Guilt and identity</li><li>Permission-seeking</li>'
      '<li class="here">Practical panic <small>You are here</small></li><li>Action</li></ul></div>')
    a('</div>')
    a(f'<div class="slp-stage-cta"><a class="slp-btn slp-btn-light" href="{SITE}/alternative-careers-speech-pathologists-slps/">'
      'See all 20, with what each one asks of you &rarr;</a></div>')
    a('</div></div></section>')

    # ---- stories
    a('<section class="slp-sec" id="real-stories"><div class="slp-wrap">')
    a('<div class="slp-sec-head"><p class="slp-kicker">Real transitions</p>'
      '<h2>See where other SLPs <em>actually landed.</em></h2></div>')
    a('<div class="slp-story-grid" data-stagger>')
    for s in STORIES:
        a(f'<a class="slp-story slp-rv" href="{s["href"]}">'
          f'<div class="ph"><img src="{SITE}/wp-content/uploads/{s["photo"]}" alt="{esc(s["name"])}" loading="lazy" /></div>'
          f'<div class="slp-was">{esc(s["was"])} <span aria-hidden="true">→</span></div>'
          f'<div class="slp-now">{esc(s["now"])}</div>'
          f'<p class="slp-story-line">{esc(s["line"])}</p>'
          f'<span class="slp-story-link">Read the full transition →</span></a>')
    a('</div></div></section>')

    # ---- resources
    a('<section class="slp-sec" id="resources" style="padding-top:0"><div class="slp-wrap">')
    a('<div class="slp-sec-head"><p class="slp-kicker">Guides</p>'
      '<h2>Three reads, in the order <em>most SLPs need them.</em></h2></div>')
    a('<div class="slp-res">')
    for r in RESOURCES:
        a(f'<a class="slp-rv" href="{r["href"]}"><span class="step">{esc(r["step"])}</span>'
          f'<b>{esc(r["title"])}</b><p>{esc(r["copy"])}</p>'
          f'<span class="arrow">→</span></a>')
    a('</div>')
    a(f'<p style="margin-top:1.8rem"><a class="slp-quiet" href="{SITE}/blog/">Browse every article →</a></p>')
    # companies list gets its own CTA here rather than crowding the final one
    a(f'<div class="slp-band"><div><h3>Know where to look first.</h3>'
      f'<p>{COMPANY_COUNT} health, ed-tech and speech companies that value clinical skills, searchable and free.</p></div>'
      f'<a class="slp-quiet" href="{SITE}/ed-health-tech-jobs/">Browse the companies list →</a></div>')
    a('</div></section>')

    # ---- who runs this. A stranger had no way to tell; only documented facts
    # and a link to the About page. Marketing manager since James confirmed it
    # on 2026-10-16 (it said content strategist until 2026-11-20).
    a('<div class="slp-wrap"><p class="slp-byline" style="display:flex;gap:14px;align-items:center;font-size:.98rem;line-height:1.6;color:var(--slate);'
      'max-width:46em;margin:0 0 clamp(28px,4vw,44px)">'
      f'<img src="{SITE}/wp-content/uploads/2026/09/james-berges-headshot-2026.jpg" alt="James Berges" width="64" height="64" loading="lazy" '
      'style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid var(--sage)"><span>'
      'Built by <b style="color:var(--forest-dark)">James Berges</b>, a former SLP who now works as a marketing manager '
      'at a mental-health-tech company and hosts the Xceptional Leaders podcast. '
      f'<a class="slp-quiet" href="{SITE}/about/">More about James &rarr;</a></span></p></div>')

    # ---- final cta
    a('<div class="slp-wrap"><section class="slp-final">')
    a('<div><h2>Two minutes can make the next six months <em>clearer.</em></h2>'
      '<p>Answer nine questions. You get your best-fit path, a realistic salary range, '
      'an honest timeline, and one thing to do this week.</p></div>')
    a(f'<div><a class="slp-btn slp-btn-light" href="{QUIZ}?{utm("home_final")}">Find my career path →</a></div>')
    a('</section></div>')

    a(SCRIPT)
    a('</div>')  # .slp-home

    body = "\n".join(p)
    page = "<!-- wp:html -->\n" + CSS + "\n" + body + "\n<!-- /wp:html -->"
    # Em-dashes read as an AI tell to this audience. &#45; not "-" because
    # wptexturize rewrites a spaced hyphen into an en dash, so a literal
    # hyphen has to be smuggled past it as an entity.
    return page.replace("&mdash;", "&#45;").replace("—", "&#45;")


MAILERLITE_MARK = "MailerLite Universal"


def carry_over_mailerlite(new_content, page_id):
    """Keep the MailerLite tracking block across a regen.

    build() does not generate it — it was appended by hand when the homepage
    was swapped — so a plain overwrite silently drops site-wide tracking. Lift
    it off the page we are about to replace and re-append it.
    """
    old = api(f"/wp/v2/pages/{page_id}?context=edit").get("content", {}).get("raw", "")
    i = old.find(MAILERLITE_MARK)
    if i < 0:
        print("  ! no MailerLite block found on the existing page — nothing carried over")
        return new_content
    start = old.rfind("<!-- wp:html -->", 0, i)
    end = old.find("<!-- /wp:html -->", i)
    if start < 0 or end < 0:
        print("  ! MailerLite block found but not inside a wp:html block — carrying nothing")
        return new_content
    block = old[start:end + len("<!-- /wp:html -->")]
    print(f"  carried over the MailerLite block ({len(block)} chars)")
    return new_content + "\n\n" + block


if __name__ == "__main__":
    content = build()
    slug = sys.argv[1] if len(sys.argv) > 1 else "zz-preview-redesign"
    existing = api(f"/wp/v2/pages?slug={slug}&status=publish,draft&_fields=id", "GET")
    if isinstance(existing, list) and existing:
        content = carry_over_mailerlite(content, existing[0]["id"])
        r = api(f"/wp/v2/pages/{existing[0]['id']}", "POST", {"content": content})
        print("updated preview:", r.get("id"), r.get("link"))
    else:
        r = api("/wp/v2/pages", "POST", {
            "title": "zz preview redesign", "slug": slug,
            "status": "publish", "content": content})
        print("created preview:", r.get("id"), r.get("link"))
    print("content chars:", len(content))
