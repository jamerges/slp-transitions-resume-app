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
import sys, os
sys.path.insert(0, "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool/scripts")
from wp_publish import api

QUIZ = "https://app.slptransitions.com/quiz"
APP = "https://app.slptransitions.com/"
SITE = "https://slptransitions.com"

# ---------------------------------------------------------------- data
# salary / timeline: research-facts.md. `caveat` renders as an honest flag.
PATHS = [
    dict(label="Fastest pivot", title="Clinical liaison",
         salary="$84k–135k", timeline="1–3 months",
         fit="Your clinical licence is the qualification. Encompass Health, Select Medical and Lifepoint hire for this constantly."),
    dict(label="Remote-friendly", title="Utilization review",
         salary="$80–88k", timeline="1–3 months",
         fit="Documentation and medical-necessity work is the job. Heavily remote, and one of the two fastest doors out."),
    dict(label="Best odds", title="Customer success",
         salary="$75–120k", timeline="3–6 months",
         fit="The best effort-to-odds ratio of any path here. At speech-tech companies the CCC-SLP itself is the credential."),
    dict(label="Writing path", title="Content marketing",
         salary="See note", timeline="~12 months",
         fit="Documented outcome: corporate marketing after about a year of applying. Ranges vary too widely to quote one number honestly."),
    dict(label="Systems path", title="Clinical informatics",
         salary="$97.8k–154k", timeline="6–12 months",
         fit="Highest ceiling on this list.",
         caveat="Epic certification cannot be self-obtained. Employer sponsorship only, so target sponsor-track analyst roles."),
    dict(label="Research + design", title="UX research",
         salary="$67k–154k", timeline="6–18 months",
         fit="One documented SLP story: rehab director to UXR via bootcamp. Health-tech is the realistic niche.",
         caveat="Heavily oversaturated: 35% more grads in five years against flat openings. The hardest path here."),
]

STORIES = [
    dict(img="meredith-harold-avatar.jpg", name="Meredith Harold",
         role="Founder, The Informed SLP",
         quote="A research-reading hobby reached a 10,000-person email list in a year, while she still wasn't charging for it.",
         href=f"{SITE}/slp-to-founder-meredith-harold-informed-slp/"),
    dict(img="jeannette-roberes-avatar.jpg", name="Jeannette Roberes",
         role="SLP, then software engineer",
         quote="She finished a coding program in three months. What had kept her out for years was believing tech meant maths.",
         href=f"{SITE}/slp-to-software-engineer-jeannette-roberes/"),
    dict(img="rachel-levy-avatar.jpg", name="Dr. Rachel Levy",
         role="Co-founder, The Babel Group",
         quote="Sixteen years clinical, then customer success at a voice-tech startup. She answers the money question honestly.",
         href=f"{SITE}/slp-to-startup-cofounder-rachel-levy/"),
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
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;               /* no-JS and reduced-motion both get the static page */
  home.classList.add('js-anim');

  /* staggered reveals */
  document.querySelectorAll('[data-stagger]').forEach(function(g){
    var i=0;g.querySelectorAll(':scope > .slp-rv, :scope > * > .slp-rv').forEach(function(el){
      el.style.setProperty('--i', i++);});});
  /* reveal sweep: anything at or above the fold line reveals. Runs in the
     scroll loop, so instant jumps (milestone clicks, anchor links) cannot
     strand sections invisible the way a pure IntersectionObserver did. */
  var rvs=[].slice.call(document.querySelectorAll('.slp-rv'));
  function sweep(){
    rvs=rvs.filter(function(el){
      if(el.getBoundingClientRect().top<innerHeight*0.92){el.classList.add('is-in');return false;}
      return true;});}

  /* hero route draws itself on first view */
  var route=document.querySelector('.slp-route path');
  if(route){route.style.strokeDasharray='100';route.style.strokeDashoffset='100';
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){
      route.style.transition='stroke-dashoffset 1.7s cubic-bezier(.45,0,.2,1) .25s';
      route.style.strokeDashoffset='0';o.disconnect();}});},{threshold:.3})
      .observe(route.closest('svg'));}

  /* journey rail */
  var rail=document.querySelector('.slp-rail');
  if(rail){  /* CSS hides the rail <1200px; build it regardless so resizes work */
    var fill=rail.querySelector('.slp-rail-fill'),marker=rail.querySelector('.slp-marker');
    var secs=[].slice.call(document.querySelectorAll('[data-mile]')),miles=[];
    secs.forEach(function(sec){
      var d=document.createElement('div');d.className='slp-mile';
      d.innerHTML='<b>'+sec.getAttribute('data-mile')+'</b>';
      d.addEventListener('click',function(){sec.scrollIntoView({behavior:'smooth'});});
      rail.appendChild(d);miles.push({el:d,sec:sec});});
    function layout(){
      var vh=innerHeight,max=document.documentElement.scrollHeight-vh;
      miles.forEach(function(m){
        var r=m.sec.getBoundingClientRect(),mid=r.top+scrollY+Math.min(r.height,vh)*.5-vh*.5;
        m.pos=Math.min(1,Math.max(0,mid/max));
        m.el.style.top=(m.pos*100)+'%';});
      return max;}
    var max=layout(),done=false;
    function tick(){
      var pr=Math.min(1,Math.max(0,scrollY/max));
      fill.style.height=(pr*100)+'%';marker.style.top=(pr*100)+'%';
      miles.forEach(function(m){m.el.classList.toggle('is-passed',pr>=m.pos-0.002);});
      if(pr>0.985&&!done){done=true;marker.classList.add('is-done');}
      if(pr<0.9)done=false,marker.classList.remove('is-done');}
    addEventListener('scroll',function(){requestAnimationFrame(function(){tick();sweep();});},{passive:true});
    addEventListener('resize',function(){max=layout();tick();});
    tick();sweep();}
  else{addEventListener('scroll',function(){requestAnimationFrame(sweep);},{passive:true});sweep();}
})();
</script>
"""

CSS = """
<style id="slp-home-2026">
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=DM+Sans:wght@400;500;600;700&display=swap');

.slp-home{--cream:#F6F8F4;--paper:#FFFFFF;--forest:#0B6B54;--forest-dark:#0A3D31;
  --brand:#0BA183;--mint:#DDF3EA;--sage:#8FC6B2;--amber:#E6A83A;--line:#DCE5DE;
  --slate:#53655C;
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
.slp-hero{padding:clamp(56px,7vw,96px) 0 clamp(40px,5vw,64px)}
.slp-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr);
  gap:clamp(32px,5vw,72px);align-items:center}
.slp-hero h1{font-size:clamp(2.4rem,5.4vw,4.2rem);line-height:1.04;color:var(--forest-dark)}
.slp-lede{font-size:clamp(1rem,1.5vw,1.18rem);line-height:1.6;color:var(--slate);
  margin-top:1.35rem;max-width:34em}
.slp-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.9rem}
.slp-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;
  min-height:56px;padding:.85rem 1.6rem;border-radius:10px;font-weight:700;font-size:1rem;
  transition:transform .18s ease,background .18s ease}
/* !important because Kadence's .entry-content a color otherwise wins and
   renders near-black text on the forest button */
.slp-home a.slp-btn-primary{background:var(--forest);color:#fff!important}
.slp-home a.slp-btn-primary:hover{background:var(--forest-dark);transform:translateY(-2px)}
.slp-home a.slp-btn-ghost{border:1.5px solid var(--forest);color:var(--forest)!important}
.slp-btn-ghost:hover{background:var(--mint);transform:translateY(-2px)}
.slp-trust{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin-top:1.4rem;
  font-size:.9rem;color:var(--slate)}
.slp-trust b{color:var(--forest);font-weight:600}

/* pathway */
.slp-path{display:grid;gap:12px}
.slp-path-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;
  padding:1.15rem 1.3rem;display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:start;
  box-shadow:0 8px 22px rgba(7,56,46,.05)}
.slp-path-num{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;
  border-radius:50%;border:1px solid var(--brand);color:var(--brand);font-size:.75rem;font-weight:700}
.slp-path-card h3{font-size:1.12rem;line-height:1.25;margin-bottom:.3rem}
.slp-path-card p{font-size:.88rem;line-height:1.5;color:var(--slate)}
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

/* affirmations */
.slp-aff{display:grid;grid-template-columns:repeat(4,1fr);
  border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.slp-aff > div{padding:1.9rem 1.5rem 2rem}
.slp-aff > div + div{border-left:1px solid var(--line)}
.slp-aff h3{font-size:1.22rem;line-height:1.2;margin:1.1rem 0 .7rem}
.slp-aff p{font-size:.88rem;line-height:1.6;color:var(--slate)}
.slp-tick{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;
  border-radius:50%;background:var(--mint);color:var(--forest);font-weight:700;font-size:.8rem}

/* career cards */
.slp-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.slp-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:1.5rem;
  display:flex;flex-direction:column}
.slp-card-label{font-size:.68rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--brand);margin-bottom:.55rem}
.slp-card h3{font-size:1.42rem;line-height:1.15}
.slp-stats{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.15rem 0;
  padding:.9rem 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.slp-stats span{display:flex;flex-direction:column;gap:.25rem}
.slp-stats span + span{border-left:1px solid var(--line);padding-left:1rem}
.slp-stats small{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--slate)}
.slp-stats b{font-size:.95rem;color:var(--forest);font-weight:600}
.slp-card > p{font-size:.88rem;line-height:1.55;color:var(--slate)}
.slp-caveat{margin-top:.85rem;padding:.7rem .85rem;border-radius:9px;background:#FDF3E7;
  border:1px solid #F0D7B4;font-size:.8rem;line-height:1.5;color:#8A5A22}
.slp-caveat b{color:#7A4E1B}

/* stories */
.slp-stories{background:var(--forest-dark);color:var(--paper)}
.slp-stories h2{color:var(--paper)}
.slp-stories .slp-sec-intro p{color:#BDD0C7}
.slp-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.slp-story{background:#F9F5EB;border-radius:16px;padding:1.6rem;display:flex;flex-direction:column;
  transition:transform .18s ease}
.slp-story:hover{transform:translateY(-4px)}
.slp-story-top{display:flex;align-items:center;gap:.85rem}
.slp-story-top img{width:54px;height:54px;border-radius:50%;object-fit:cover;
  border:2px solid var(--sage);display:block}
.slp-story-top b{display:block;color:var(--forest-dark);font-size:.98rem}
.slp-story-top small{color:var(--slate);font-size:.78rem}
.slp-story blockquote{font-size:1.15rem;line-height:1.35;color:var(--forest-dark);margin:1.5rem 0}
.slp-story-link{margin-top:auto;color:var(--forest);font-weight:700;font-size:.88rem}

/* resources */
.slp-res{border-top:1px solid var(--line)}
.slp-res a{display:grid;grid-template-columns:.6fr 1.1fr 1.3fr auto;gap:2rem;align-items:center;
  padding:1.5rem .25rem;border-bottom:1px solid var(--line);transition:background .18s ease,padding .18s ease}
.slp-res a:hover{background:rgba(227,241,232,.6);padding-left:1rem;padding-right:1rem}
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
  .slp-sec-intro{grid-template-columns:1fr;align-items:start;gap:1.1rem}
  .slp-aff{grid-template-columns:1fr 1fr}
  .slp-aff > div:nth-child(3){border-left:0}
  .slp-aff > div:nth-child(n+3){border-top:1px solid var(--line)}
  .slp-cards,.slp-story-grid{grid-template-columns:1fr 1fr}
  .slp-story-grid > a:last-child{grid-column:1/-1}
  .slp-res a{grid-template-columns:1fr auto;gap:.55rem 1.5rem}
  .slp-res .step,.slp-res b,.slp-res p{grid-column:1}
  .slp-res .arrow{grid-column:2;grid-row:1/4}
  .slp-final{grid-template-columns:1fr}
  .slp-final-actions{max-width:420px}
}
@media (max-width:620px){
  .slp-aff,.slp-cards,.slp-story-grid{grid-template-columns:1fr}
  .slp-aff > div + div{border-left:0;border-top:1px solid var(--line)}
  .slp-story-grid > a:last-child{grid-column:auto}
  .slp-actions{flex-direction:column;align-items:stretch}
  .slp-btn{width:100%}
}
/* ---- scroll animation layer (added only when JS runs: .js-anim) ---- */
.slp-home.js-anim .slp-rv{opacity:0;transform:translateY(22px);
  transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1);
  transition-delay:calc(var(--i,0)*80ms)}
.slp-home.js-anim .slp-rv.is-in{opacity:1;transform:none}

/* hero route: draws itself through the three pathway cards */
.slp-path{position:relative}
.slp-route{position:absolute;left:-30px;top:10px;height:calc(100% - 20px);width:34px;
  overflow:visible;pointer-events:none}
.slp-route path{fill:none;stroke:var(--brand);stroke-width:2.5;stroke-linecap:round;
  vector-effect:non-scaling-stroke}
.slp-route circle{fill:var(--paper);stroke:var(--brand);stroke-width:2;vector-effect:non-scaling-stroke}
@media (max-width:1000px){.slp-route{display:none}}

/* journey rail: fixed at the left edge, marker travels with scroll */
.slp-rail{display:none;position:fixed;left:30px;top:8vh;bottom:8vh;width:2px;
  background:var(--line);z-index:60;border-radius:2px}
@media (min-width:1200px){.slp-home.js-anim ~ * .slp-rail,.slp-home.js-anim .slp-rail{display:block}}
.slp-rail-fill{position:absolute;top:0;left:0;width:100%;height:0;background:var(--brand);border-radius:2px}
.slp-marker{position:absolute;left:1px;top:0;width:26px;height:26px;
  transform:translate(-50%,-50%) rotate(45deg);background:#fff;border:2px solid var(--forest);
  border-radius:7px;box-shadow:0 4px 12px rgba(10,61,49,.18);display:flex;align-items:center;justify-content:center}
.slp-marker svg{width:13px;height:13px;transform:rotate(-45deg)}
.slp-marker.is-done{animation:slp-pop .5s ease}
@keyframes slp-pop{50%{transform:translate(-50%,-50%) rotate(45deg) scale(1.35)}}
.slp-mile{position:absolute;left:1px;transform:translate(-50%,-50%);width:9px;height:9px;
  border-radius:50%;background:var(--paper);border:2px solid var(--line);cursor:pointer;
  transition:background .3s,border-color .3s}
.slp-mile.is-passed{background:var(--brand);border-color:var(--brand)}
.slp-mile b{position:absolute;left:18px;top:50%;transform:translateY(-50%);
  font-family:'DM Sans',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:var(--slate);white-space:nowrap;opacity:0;transition:opacity .3s}
.slp-mile.is-passed b,.slp-mile:hover b{opacity:1}

@media (prefers-reduced-motion:reduce){
  .slp-home *{animation:none!important;transition:none!important}
  .slp-home.js-anim .slp-rv{opacity:1;transform:none}
  .slp-rail{display:none!important}
}
</style>
"""


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")


def build():
    p = []
    a = p.append

    a('<div class="slp-home">')

    # ---- hero
    a('<section class="slp-hero"><div class="slp-wrap"><div class="slp-hero-grid"><div>')
    a('<h1>Your SLP skills can take you somewhere new.</h1>')
    a('<p class="slp-lede">Find a non-clinical path that fits your strengths, your timeline and '
      'what you need to earn, with verified salary ranges and stories from SLPs who have already done it.</p>')
    a(f'<div class="slp-actions"><a class="slp-btn slp-btn-primary" href="{QUIZ}">Find my career path →</a>'
      f'<a class="slp-btn slp-btn-ghost" href="{APP}">Translate my resume</a></div>')
    a('<p class="slp-trust"><b>Free</b> · <b>2 minutes</b> · built from '
      f'<a href="{SITE}/ed-health-tech-jobs/" style="border-bottom:1px solid currentColor">126 companies</a> that hire former SLPs</p>')
    a('</div>')

    # pathway
    a('<div class="slp-path" data-stagger>')
    a('<svg class="slp-route" viewBox="0 0 32 100" preserveAspectRatio="none" aria-hidden="true">'
      '<path d="M16 3 C 2 18, 30 32, 16 50 C 2 68, 30 82, 16 97" pathLength="100" />'
      '<circle cx="16" cy="3" r="3.2"/><circle cx="16" cy="50" r="3.2"/><circle cx="16" cy="97" r="3.2"/></svg>')
    for n, (t, d) in enumerate([
        ("Explore your options", "Identify roles that fit your strengths, values and the life you want."),
        ("Build your bridge", "Translate your experience, close one gap, and test it while still employed."),
        ("Land with confidence", "Target real openings, tailor your story, and apply."),
    ], 1):
        a(f'<article class="slp-path-card slp-rv"><span class="slp-path-num">0{n}</span>'
          f'<div><h3>{t}</h3><p>{d}</p></div></article>')
    a('</div></div></div></section>')

    # ---- affirmations
    a('<section class="slp-sec" data-mile="Carries over"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><h2>Your clinical experience has value beyond the clinic.</h2></div>'
      '<p>Years of clinical work build judgment, communication and problem-solving that hold up '
      'across industries. The task now is recognising them and putting them into words a hiring '
      'manager already understands.</p></div>')
    a('<div class="slp-aff" data-stagger>')
    for i, (t, c) in enumerate(AFFIRMATIONS, 1):
        a(f'<div class="slp-rv"><span class="slp-tick">✓</span><h3>{esc(t)}</h3><p>{esc(c)}</p></div>')
    a('</div></div></section>')

    # ---- career paths
    a('<section class="slp-sec" id="career-paths" data-mile="Compare paths" style="padding-top:0"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><p class="slp-kicker">Career paths at a glance</p>'
      '<h2>Compare the paths before you commit.</h2></div>'
      f'<p style="justify-self:start"><a class="slp-quiet" href="{SITE}/alternative-careers-speech-pathologists-slps/">'
      'See all 13 paths →</a></p></div>')
    a('<div class="slp-cards" data-stagger>')
    for c in PATHS:
        a('<article class="slp-card slp-rv">')
        a(f'<p class="slp-card-label">{esc(c["label"])}</p><h3>{esc(c["title"])}</h3>')
        a(f'<div class="slp-stats"><span><small>Salary</small><b>{esc(c["salary"])}</b></span>'
          f'<span><small>Typical timeline</small><b>{esc(c["timeline"])}</b></span></div>')
        a(f'<p>{esc(c["fit"])}</p>')
        if c.get("caveat"):
            a(f'<p class="slp-caveat"><b>Worth knowing:</b> {esc(c["caveat"])}</p>')
        a('</article>')
    a('</div>')
    a('<p style="margin-top:1.5rem;font-size:.82rem;color:var(--slate);max-width:60em">'
      'Ranges come from documented outcomes and posted roles, not averages. Timelines assume you are '
      'working while you transition.</p>')
    a('</div></section>')

    # ---- stories
    a('<section class="slp-sec slp-stories" id="real-stories" data-mile="Real stories"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><p class="slp-kicker" style="color:#7FD6BC">Real transitions</p>'
      '<h2>See what other SLPs built from their clinical experience.</h2></div>'
      '<p>Each of these started while they were still working clinically.</p></div>')
    a('<div class="slp-story-grid" data-stagger>')
    for s in STORIES:
        a(f'<a class="slp-story slp-rv" href="{s["href"]}">'
          f'<div class="slp-story-top">'
          f'<img src="{SITE}/wp-content/uploads/2026/08/{s["img"]}" alt="{esc(s["name"])}" width="54" height="54" loading="lazy" />'
          f'<span><b>{esc(s["name"])}</b><small>{esc(s["role"])}</small></span></div>'
          f'<blockquote>{esc(s["quote"])}</blockquote>'
          f'<span class="slp-story-link">Read the full transition →</span></a>')
    a('</div></div></section>')

    # ---- resources
    a('<section class="slp-sec" id="resources" data-mile="Guides"><div class="slp-wrap">')
    a('<div class="slp-sec-intro"><div><p class="slp-kicker">Guides</p>'
      '<h2>Use the resource that fits your current step.</h2></div>'
      '<p>Each guide answers one decision that comes up during a transition.</p></div>')
    a('<div class="slp-res">')
    for r in RESOURCES:
        a(f'<a class="slp-rv" href="{r["href"]}"><span class="step">{esc(r["step"])}</span>'
          f'<b>{esc(r["title"])}</b><p>{esc(r["copy"])}</p>'
          f'<span class="arrow">↗</span></a>')
    a('</div>')
    a(f'<p style="margin-top:1.8rem"><a class="slp-quiet" href="{SITE}/blog/">Browse every article →</a></p>')
    # companies list gets its own CTA here rather than crowding the final one
    a(f'<div class="slp-band"><div><h3>Know where to look first.</h3>'
      f'<p>126 ed-tech, health-tech and speech companies that hire former SLPs, searchable and free.</p></div>'
      f'<a class="slp-btn slp-btn-ghost" href="{SITE}/ed-health-tech-jobs/">Browse the companies list →</a></div>')
    a('</div></section>')

    # ---- final cta
    a('<div class="slp-wrap"><section class="slp-final" data-mile="Take the quiz">')
    a('<div><h2>Two minutes can make the next six months clearer.</h2>'
      '<p>Answer eight questions. You get your best-fit path, a realistic salary range, '
      'an honest timeline, and one thing to do this week.</p></div>')
    a(f'<div class="slp-final-actions"><a class="slp-btn slp-btn-primary" href="{QUIZ}">Find my career path →</a></div>')
    a('</section></div>')

    # journey rail (populated + driven by the script below; desktop only)
    a('<div class="slp-rail" aria-hidden="true"><div class="slp-rail-fill"></div>'
      '<div class="slp-marker"><svg viewBox="0 0 24 24" fill="none" stroke="#0B6B54" '
      'stroke-width="2.6" stroke-linecap="round"><path d="M12 21 V12 M12 12 L6.5 5 M12 12 L17.5 5"/></svg>'
      '</div></div>')

    a(SCRIPT)
    a('</div>')  # .slp-home

    body = "\n".join(p)
    return "<!-- wp:html -->\n" + CSS + "\n" + body + "\n<!-- /wp:html -->"


if __name__ == "__main__":
    content = build()
    slug = sys.argv[1] if len(sys.argv) > 1 else "zz-preview-redesign"
    existing = api(f"/wp/v2/pages?slug={slug}&status=publish,draft&_fields=id", "GET")
    if isinstance(existing, list) and existing:
        r = api(f"/wp/v2/pages/{existing[0]['id']}", "POST", {"content": content})
        print("updated preview:", r.get("id"), r.get("link"))
    else:
        r = api("/wp/v2/pages", "POST", {
            "title": "zz preview redesign", "slug": slug,
            "status": "publish", "content": content})
        print("created preview:", r.get("id"), r.get("link"))
    print("content chars:", len(content))
