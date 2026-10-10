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
# Avatars are cropped from the circular headshot inside each post's own
# -hdr-v2 header graphic — real photographs the subjects supplied. Emily
# Harford is NOT here despite being a good story: her post image is
# AI-generated and no photograph of her exists. Real headshots only.
STORIES = [
    dict(img="caitlin-mueller-avatar-v1.jpg", name="Caitlin Mueller",
         was="School-based SLP", now="Marketing Manager at an AAC device maker",
         line="She took a clinical consultant job at the company first, then moved into marketing, where knowing the clinical side is the qualification.",
         href=f"{SITE}/clinical-consultant-and-marketing/"),
    dict(img="lindsey-ison-avatar-v1.jpg", name="Lindsey Ison",
         was="SLP", now="Enablement Consultant at a tech firm",
         line="Still coaching people through something difficult, now it's software instead of therapy. Comparable pay, and the flexibility she left for.",
         href=f"{SITE}/enablement-consultant/"),
    dict(img="bethany-riebock-avatar-v1.jpg", name="Bethany Riebock",
         was="Medical SLP and rehab director", now="UX Researcher",
         line="Burnt out running a rehab department, she went through a UX bootcamp and into research in Silicon Valley.",
         href=f"{SITE}/slp-to-ux/"),
]

# A featured story without a headshot is not shippable — the faces are what
# make this band land visually, and a text-only card reads as a placeholder.
# If you have no photograph of someone, they do not go here, however good the
# story is. Never substitute an AI-generated face.
for _s in STORIES:
    assert _s.get("img"), f"STORIES entry {_s['name']!r} has no headshot — see the note above"

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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=DM+Sans:wght@400;500;600;700&display=swap');

/* Palette since 2026-10-09: forest #004820 on cream #EFEEE1 (James's pick). */
.slp-home{--cream:#EFEEE1;--paper:#FFFFFF;--forest:#004820;--forest-dark:#002F15;
  --brand:#266341;--mint:#DCE1D2;--sage:#B3C4B1;--amber:#E6A83A;--line:#DAD8C6;
  --slate:#555B52;
  font-family:'DM Sans',system-ui,sans-serif;color:var(--forest-dark);
  background:var(--cream);margin:0 calc(50% - 50vw);width:100vw;overflow-x:hidden}
.slp-home *,.slp-home *::before,.slp-home *::after{box-sizing:border-box}
.slp-wrap{max-width:1240px;margin:0 auto;padding:0 clamp(18px,4vw,48px)}
.slp-home h1,.slp-home h2,.slp-home h3,.slp-home blockquote{
  font-family:'Fraunces',Georgia,serif;font-weight:500;letter-spacing:-.02em;margin:0}
.slp-home p{margin:0}
.slp-home a{text-decoration:none;color:inherit}
.slp-kicker{font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:var(--brand);margin:0 0 1rem}

/* hero */
.slp-hero{padding:clamp(36px,4.5vw,64px) 0 clamp(40px,5vw,64px)}
.slp-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;
  gap:clamp(32px,5vw,72px);align-items:center}
.slp-video{position:relative;margin:0;width:clamp(230px,22vw,290px);aspect-ratio:9/16;border-radius:28px;overflow:hidden;
  background:#1B1B1E;border:6px solid #fff;box-shadow:0 22px 50px rgba(0,47,21,.18)}
.slp-video video{display:block;width:100%;height:100%;object-fit:cover}
.slp-home .slp-sound{position:absolute;right:10px;top:10px;border:0;border-radius:999px;background:rgba(255,255,255,.92);
  color:var(--forest-dark)!important;font:600 .78rem/1 'DM Sans',system-ui,sans-serif!important;text-transform:none!important;
  letter-spacing:normal!important;padding:.5rem .75rem;cursor:pointer;box-shadow:none}
.slp-hero h1{font-size:clamp(2.3rem,4.6vw,3.6rem);line-height:1.04;color:var(--forest-dark)}
.slp-lede{font-size:clamp(1rem,1.5vw,1.18rem);line-height:1.6;color:var(--slate);
  margin-top:1rem;max-width:34em}
.slp-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.9rem}
.slp-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;
  min-height:56px;padding:.85rem 1.6rem;border-radius:10px;font-weight:700;font-size:1rem;
  transition:transform .18s ease,background .18s ease}
/* !important because Kadence's .entry-content a color otherwise wins and
   renders near-black text on the forest button */
.slp-home a.slp-btn-primary,.slp-home button.slp-btn-primary{background:var(--forest);color:#fff!important;
  border:0;cursor:pointer;font-family:inherit}
.slp-home button.slp-btn-primary:hover{background:var(--forest-dark);transform:translateY(-2px)}
/* Kadence styles <button> with uppercase, letter-spaced text; this one should read like the others */
.slp-home button.slp-btn{text-transform:none!important;letter-spacing:normal!important;font-size:1rem!important;line-height:1.2;box-shadow:none}
/* pay chart */
.slp-compare{background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,3.4vw,44px)}
.slp-compare h2{font-size:clamp(1.6rem,3vw,2.4rem);line-height:1.12;margin:0 0 .45rem;color:var(--forest-dark)}
.slp-compare > p{font-size:.98rem;line-height:1.55;color:var(--slate)}
.slp-legend{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:1.1rem 0 1.2rem;font-size:.82rem;color:var(--slate)}
.slp-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:.4rem;vertical-align:-1px}
.slp-rows{display:grid;gap:10px}
.slp-row{display:grid;grid-template-columns:13rem minmax(0,1fr) 7.5rem;gap:1rem;align-items:center;font-size:.9rem}
.slp-row .n{color:var(--forest-dark);font-weight:600}
.slp-row .v{color:var(--slate);font-variant-numeric:tabular-nums;text-align:right}
.slp-track{position:relative;height:12px;border-radius:6px;background:#E2E3D3}
.slp-track span{position:absolute;top:0;bottom:0;border-radius:6px}
.slp-axis{display:grid;grid-template-columns:13rem minmax(0,1fr) 7.5rem;gap:1rem;margin-top:.4rem;font-size:.74rem;color:var(--slate)}
.slp-axis div{display:flex;justify-content:space-between}
.t1{background:var(--forest)}.t2{background:#6E9578}.t3{background:var(--sage)}
.slp-compare .slp-quiet{display:inline-block;margin-top:1.3rem}
.slp-home a.slp-btn-primary:hover{background:var(--forest-dark);transform:translateY(-2px)}
.slp-home a.slp-btn-ghost{border:1.5px solid var(--forest);color:var(--forest)!important}
.slp-btn-ghost:hover{background:var(--mint);transform:translateY(-2px)}
.slp-trust{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin-top:1.4rem;
  font-size:.9rem;color:var(--slate)}
.slp-trust b{color:var(--forest);font-weight:600}
.slp-side{font-size:.92rem;color:var(--slate);margin-top:.9rem!important}
.slp-side a{color:var(--forest)!important;font-weight:700;border-bottom:1px solid currentColor}

/* pathway */
.slp-proof{display:grid;gap:12px}
.slp-proof-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;
  padding:1.15rem 1.35rem;display:flex;flex-direction:column;gap:.15rem}
.slp-proof-n{font-family:'Fraunces',Georgia,serif;font-size:2.15rem;line-height:1;color:var(--forest)}
.slp-proof-l{font-size:.86rem;line-height:1.4;color:var(--slate)}
.slp-pillar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;
  gap:clamp(16px,3vw,40px);background:var(--paper);border:1px solid var(--line);
  border-radius:20px;padding:clamp(24px,3.4vw,44px);text-decoration:none;color:inherit;
  transition:transform .18s ease,box-shadow .18s ease}
.slp-pillar:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,47,21,.09)}
.slp-pillar-body{flex:1 1 22em;min-width:0}
.slp-pillar-body h2{font-size:clamp(1.6rem,3vw,2.4rem);line-height:1.12;margin:0 0 .55rem;
  color:var(--forest-dark)}
.slp-pillar-body p{font-size:.98rem;line-height:1.55;color:var(--slate);margin:0;max-width:46em}
.slp-pillar-cta{flex:0 0 auto;color:#fff;background:var(--forest);font-weight:700;font-size:.92rem;
  padding:13px 24px;border-radius:10px;white-space:nowrap}
.slp-here{display:flex;align-items:center;gap:.6rem;font-size:.72rem;letter-spacing:.12em;
  text-transform:uppercase;color:var(--slate);margin-bottom:2px}
.slp-here i{width:11px;height:11px;border-radius:50%;background:var(--amber);
  box-shadow:0 0 0 4px rgba(230,168,58,.22);display:inline-block}

/* sections */
.slp-sec{padding:clamp(56px,8vw,104px) 0}
.slp-sec h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.08}
.slp-sec-intro{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
  gap:clamp(20px,4vw,56px);align-items:end;margin-bottom:clamp(28px,4vw,52px)}
.slp-sec-intro p{color:var(--slate);font-size:1rem;line-height:1.65}

/* career cards */

/* stories */
.slp-stories{background:var(--forest-dark);color:var(--paper)}
.slp-stories h2{color:var(--paper)}
.slp-stories .slp-sec-intro p{color:#D6DAC9}
.slp-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.slp-story{background:#F7F6EE;border-radius:16px;padding:1.6rem;display:flex;flex-direction:column;
  transition:transform .18s ease}
.slp-story:hover{transform:translateY(-4px)}
.slp-story-top{display:flex;align-items:center;gap:.85rem}
.slp-story-top img{width:54px;height:54px;border-radius:50%;object-fit:cover;
  border:2px solid var(--sage);display:block;flex:0 0 auto}
.slp-story-top b{display:block;color:var(--forest-dark);font-size:.98rem}
.slp-story-top small{color:var(--slate);font-size:.78rem}
/* The before/after pair does the work the headshot used to: it is the thing a
   reader scans for, and it does not need a photograph we do not have. */
.slp-move{margin:.7rem 0 0;display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem;
  font-size:.86rem;line-height:1.3}
.slp-was{color:var(--slate)}
.slp-arrow{color:var(--forest);font-weight:700}
.slp-now{color:var(--forest-dark);font-weight:700}
.slp-story .slp-story-line{font-size:1.05rem;line-height:1.4;color:var(--forest-dark);margin:1.1rem 0 1.4rem}
.slp-story-link{margin-top:auto;color:var(--forest);font-weight:700;font-size:.88rem}

/* resources */
.slp-res{border-top:1px solid var(--line)}
.slp-res a{display:grid;grid-template-columns:.6fr 1.1fr 1.3fr auto;gap:2rem;align-items:center;
  padding:1.5rem .25rem;border-bottom:1px solid var(--line);transition:background .18s ease,padding .18s ease}
.slp-res a:hover{background:rgba(220,225,210,.6);padding-left:1rem;padding-right:1rem}
.slp-res .step{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--brand)}
.slp-res b{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:1.3rem;color:var(--forest-dark)}
.slp-res p{font-size:.9rem;line-height:1.55;color:var(--slate)}
.slp-res .arrow{font-size:1.5rem;color:var(--forest)}

/* final cta */
.slp-band{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.2rem;
  background:var(--paper);border:1px solid var(--line);border-radius:14px;
  padding:1.6rem 1.9rem;margin-top:clamp(28px,4vw,44px)}
.slp-band h3{font-size:1.3rem}
.slp-band p{font-size:.9rem;color:var(--slate);margin-top:.35rem}
.slp-final{background:var(--mint);border:1px solid var(--sage);border-radius:18px;
  padding:clamp(32px,5vw,64px);display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr);
  gap:clamp(24px,4vw,56px);align-items:center;margin-bottom:clamp(48px,7vw,88px)}
.slp-final h2{font-size:clamp(1.85rem,3.4vw,2.8rem);line-height:1.1}
.slp-final p{color:var(--slate);font-size:1rem;line-height:1.6;margin-top:1.1rem}
.slp-final-actions{display:flex;flex-direction:column;gap:1rem;align-items:flex-start}
.slp-final-actions .slp-btn{width:100%}
.slp-quiet{color:var(--forest);font-weight:700;font-size:.9rem;border-bottom:1px solid currentColor;
  padding-bottom:.25rem}

@media (max-width:1000px){
  .slp-hero-grid{grid-template-columns:1fr}
  .slp-hero-media{display:flex;justify-content:center}
  .slp-video{width:min(240px,64vw)}
  .slp-sec-intro{grid-template-columns:1fr;align-items:start;gap:1.1rem}
  .slp-story-grid{grid-template-columns:1fr 1fr}
  .slp-story-grid > a:last-child{grid-column:1/-1}
  .slp-res a{grid-template-columns:1fr auto;gap:.55rem 1.5rem}
  .slp-res .step,.slp-res b,.slp-res p{grid-column:1}
  .slp-res .arrow{grid-column:2;grid-row:1/4}
  .slp-final{grid-template-columns:1fr}
  .slp-final-actions{max-width:420px}
}
@media (max-width:620px){
  .slp-row{grid-template-columns:1fr auto;gap:.3rem .8rem}
  .slp-row .slp-track{grid-column:1/-1;grid-row:2}
  .slp-axis{grid-template-columns:1fr}.slp-axis > span{display:none}
  .slp-story-grid{grid-template-columns:1fr}
  .slp-story-grid > a:last-child{grid-column:auto}
  .slp-actions{flex-direction:column;align-items:stretch}
  .slp-btn{width:100%}
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
    # 2026-09-28 (second pass): question one, a sample result and three numbers
    # in the hero read as too busy (James). Back to one message and one button,
    # with the hype video on the right doing the showing.
    a('<section class="slp-hero"><div class="slp-wrap"><div class="slp-hero-grid"><div class="slp-hero-copy">')
    a('<h1>Your SLP skills can take you somewhere new.</h1>')
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
    # The 32-second hype video (~/Desktop/slp-transitions-video, HyperFrames),
    # re-encoded to 540x960 at 1.2MB. Muted autoplay is the only autoplay
    # browsers allow; the button turns sound on (text only: WordPress swaps
    # emoji for large images). Reduced-motion readers get
    # the poster and press play themselves.
    a('<div class="slp-hero-media"><figure class="slp-video">'
      f'<video src="{SITE}/wp-content/uploads/2026/09/slp-hype-540.mp4" poster="{SITE}/wp-content/uploads/2026/09/slp-hype-poster.jpg" '
      'width="540" height="960" autoplay muted loop playsinline preload="none" '
      'aria-label="32-second video: you&rsquo;re allowed to want out, three paths and what they pay, and the free quiz"></video>'
      '<button type="button" class="slp-sound" aria-pressed="false">Sound on</button>'
      '</figure></div>')
    a('<script>(function(){var f=document.querySelector(".slp-video");if(!f)return;var v=f.querySelector("video"),b=f.querySelector(".slp-sound");'
      'var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;'
      'if(calm){v.removeAttribute("autoplay");v.pause();}'
      'b.addEventListener("click",function(){v.muted=!v.muted;if(v.paused)v.play();b.setAttribute("aria-pressed",String(!v.muted));'
      'b.textContent=v.muted?"Sound on":"Sound off";});})();</script>')
    a('</div></div></section>')  # grid, wrap, section

    # ---- career paths
    # One box pointing at the pillar article, not six cards. The homepage
    # stopped being a comparison table when the article already is one.
    # Tight top: the hero already ends in padding, and the two stacked left a
    # dead band above this box on desktop.
    a('<section class="slp-sec" id="career-paths" style="padding-top:0"><div class="slp-wrap">')
    # Eight of the twenty, drawn to one scale and coloured by how long the move
    # takes. Ranges are the 25th-75th bands in the pillar article's table
    # (content/research-facts.md); keep the two in sync.
    lo_k, hi_k = 40, 160
    rows = "".join(
        f'<div class="slp-row"><span class="n">{esc(n)}</span>'
        f'<span class="slp-track"><span class="{t}" style="left:{(lo-lo_k)/(hi_k-lo_k)*100:.1f}%;width:{(hi-lo)/(hi_k-lo_k)*100:.1f}%"></span></span>'
        f'<span class="v">${lo:g}k&ndash;${hi:g}k</span></div>'
        for n, lo, hi, t in PAY_ROWS)
    a('<div class="slp-compare slp-rv">'
      '<h2>Compare 20 paths in one place.</h2>'
      '<p>Eight of them here, by pay and by how long the move usually takes.</p>'
      '<p class="slp-legend"><span><i class="t1"></i>Weeks to a few months</span>'
      '<span><i class="t2"></i>6 to 12 months</span><span><i class="t3"></i>12 to 24 months</span></p>'
      f'<div class="slp-rows">{rows}</div>'
      '<div class="slp-axis"><span></span><div><span>$40k</span><span>$80k</span><span>$120k</span><span>$160k</span></div><span></span></div>'
      f'<a class="slp-quiet" href="{SITE}/alternative-careers-speech-pathologists-slps/">'
      'See all 20, with what each one asks of you &rarr;</a>'
      '</div>')
    a('</div></section>')

    # ---- stories
    a('<section class="slp-sec slp-stories" id="real-stories"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><p class="slp-kicker" style="color:#C9D6C3">Real transitions</p>'
      '<h2>See where other SLPs actually landed.</h2></div></div>')
    a('<div class="slp-story-grid" data-stagger>')
    for s in STORIES:
        a(f'<a class="slp-story slp-rv" href="{s["href"]}">'
          f'<div class="slp-story-top">'
          f'<img src="{SITE}/wp-content/uploads/2026/08/{s["img"]}" alt="{esc(s["name"])}" width="54" height="54" loading="lazy" />'
          f'<b>{esc(s["name"])}</b></div>'
          f'<div class="slp-move">'
          f'<span class="slp-was">{esc(s["was"])}</span>'
          f'<span class="slp-arrow" aria-hidden="true">→</span>'
          f'<span class="slp-now">{esc(s["now"])}</span></div>'
          f'<p class="slp-story-line">{esc(s["line"])}</p>'
          f'<span class="slp-story-link">Read the full transition →</span></a>')
    a('</div></div></section>')

    # ---- resources
    a('<section class="slp-sec" id="resources"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><p class="slp-kicker">Guides</p>'
      + '<h2>Three reads, in the order most SLPs need them.</h2></div>'
      + '</div>')
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
    # (CLAUDE.md, email identity) and a link to the About page.
    a('<div class="slp-wrap"><p class="slp-byline" style="display:flex;gap:14px;align-items:center;font-size:.98rem;line-height:1.6;color:var(--slate);'
      'max-width:46em;margin:0 0 clamp(28px,4vw,44px)">'
      f'<img src="{SITE}/wp-content/uploads/2026/09/james-berges-headshot-2026.jpg" alt="James Berges" width="64" height="64" loading="lazy" '
      'style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid var(--sage)"><span>'
      'Built by <b style="color:var(--forest-dark)">James Berges</b>, a former SLP who now works as a content strategist '
      'at a mental-health-tech company and hosts the Xceptional Leaders podcast. '
      f'<a class="slp-quiet" href="{SITE}/about/">More about James &rarr;</a></span></p></div>')

    # ---- final cta
    a('<div class="slp-wrap"><section class="slp-final">')
    a('<div><h2>Two minutes can make the next six months clearer.</h2>'
      '<p>Answer nine questions. You get your best-fit path, a realistic salary range, '
      'an honest timeline, and one thing to do this week.</p></div>')
    a(f'<div class="slp-final-actions"><a class="slp-btn slp-btn-primary" href="{QUIZ}?{utm("home_final")}">Find my career path →</a></div>')
    a('</section></div>')

    a(SCRIPT)
    a('</div>')  # .slp-home

    body = "\n".join(p)
    page = "<!-- wp:html -->\n" + CSS + "\n" + body + "\n<!-- /wp:html -->"
    # Em-dashes read as an AI tell to this audience. &#45; not "-" because
    # wptexturize rewrites a spaced hyphen into an en dash, so a literal
    # hyphen has to be smuggled past it as an entity.
    return page.replace("&mdash;", "&#45;").replace("\u2014", "&#45;")


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
