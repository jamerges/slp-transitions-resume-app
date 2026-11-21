#!/usr/bin/env python3
"""The Transition OS sales page on slptransitions.com (/transition-os/).

    python3 scripts/build_course_page.py            build and save to WordPress
    python3 scripts/build_course_page.py --local    print the HTML, save nothing

The page is created as a DRAFT the first time and its status is never changed
by this script, so nothing goes public until James publishes it in wp-admin.
Re-running updates the content in place, whatever the status.

It shares the homepage's design (scripts/build_home.py: the .slp-home rules,
the reveal script) and adds only what this page needs. Edit the settings below,
not the block editor.

Two modes:
  "waitlist"  the program is not for sale yet. Every call to action is an
              email field that adds the address to the MailerLite group
              "Waitlist . Transition OS (opening notice)" through the app's
              /api/os-waitlist. James is filming the lessons first (2026-11-21).
  "open"      the buttons go to CHECKOUT_URL and the price shows. Set PRICE,
              CHECKOUT_URL and, once it plays, VIDEO before switching.

Copy rules that apply here (.claude/skills/product-copy): second person, the
outcome and not the mechanic, no em dashes, no promise of an offer in ninety
days, and nothing about James that he has not confirmed. Every number on the
page is counted from the course itself or already published on the site.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from wp_publish import api  # noqa: E402
import build_home as home  # noqa: E402  (shared CSS, reveal script, COMPANY_COUNT)

SLUG = "transition-os"
TITLE = "Transition OS: the 90-day program for SLPs leaving clinical work"
SITE = home.SITE
APP = "https://app.slptransitions.com"

# ------------------------------------------------------------------ settings
MODE = "waitlist"            # "waitlist" until the videos are up, then "open"
PRICE = None                 # founding price in dollars, e.g. 129. None hides every price line.
FOUNDING_SEATS = None        # e.g. 25. None says nothing about a cap.
CHECKOUT_URL = None          # where the buy button goes in "open" mode
VIDEO = None                 # the two-minute page video: an .mp4 URL, or None for the photo
WAITLIST_API = f"{APP}/api/os-waitlist"
FREE_MODULE = f"{APP}/course?utm_source=slptransitions&utm_medium=course_page&utm_content=free_module"

# Counted from lib/course.ts and components/course/workbook-model.ts on
# 2026-11-21. Re-count after a lesson or a workbook action is added or merged.
LESSONS = 37
HOURS = 8                    # 495 minutes of lessons
ACTIONS = 47
PATHS = 20

# The eight stops and what the reader holds at the end of each. The names and
# weeks are MODULES in lib/course.ts; the outcomes are the course audit's
# "ends in" column (content/audits/course-audit-2026-11-15.md).
STOPS = [
    ("Start here", "Day 1, free", "Your real hourly rate, the pay your next job has to clear, and a date to aim at"),
    ("Ground", "Week 1", "Your reasons for leaving, in writing"),
    ("Explore", "Weeks 2 to 3", "One path chosen, and the hours you can give it"),
    ("Connect", "Weeks 3 to 5", "Three messages sent to people who already made the move"),
    ("Translate", "Weeks 5 to 7", "A r&eacute;sum&eacute; a hiring manager can read, and one application sent properly"),
    ("Test", "Weeks 7 to 9", "One piece of proof that you can do the new job, and your runway worked out"),
    ("Leap", "Weeks 9 to 12", "Your interview answers said out loud, and a way to check an offer"),
    ("After", "Once you&rsquo;re in", "Your first ninety days in the new job, and the next step up"),
]

# Real screens from the course (content/course/sales-page/, uploaded once).
SHOTS = [
    dict(file="transition-os-paths-map.jpg", alt="The paths map from the course: twelve non-clinical paths in three groups by how long the move takes, each with its salary range.",
         title="Which jobs you could move into, and how long each takes",
         line="You see what each path pays and how long the move took the SLPs who made it. Anything under your income floor is flagged."),
    dict(file="transition-os-starting-line.jpg", alt="The starting line lesson: fields for salary, hours in a real week and weeks worked, then three choices for an income floor.",
         title="The salary your next job has to clear",
         line="Count the hours you really work and you get your real hourly rate. Add a month of costs and you get the salary to hold out for."),
    dict(file="transition-os-workbook-page.jpg", alt="A workbook page titled Your reasons for leaving, in writing: six small actions, each with a tick box and a time.",
         title="Everything you decide, kept in one place",
         line=f"Your answers land in a workbook of {ACTIONS} small actions, each with a time on it, so you always know the next small thing to do."),
]

ALSO = [
    "Send messages that get answered: scripts for eleven paths, with the person&rsquo;s name already filled in",
    "Know who is due a follow-up, without keeping a spreadsheet",
    "Practise the five questions every career changer gets, out loud, before a real interview",
    f"Know where to look: {home.COMPANY_COUNT} health and ed-tech companies that value clinical skills, and this week&rsquo;s open roles",
    "Get one email a week with one thing to do. Reply to any of them and James answers",
]

HEADSHOT = f"{SITE}/wp-content/uploads/2026/09/james-berges-headshot-2026.jpg"


def utm(content):
    return f"utm_source=slptransitions&utm_medium=course_page&utm_content={content}"


# ------------------------------------------------------------------ styles
# A raw string, so a backslash in the CSS is a backslash (the homepage's CSS is
# a normal string and needs them doubled).
CSS = r"""
<style id="slp-course-2026">
.slp-course .slp-hero h1{font-size:clamp(2.4rem,5vw,4.3rem)}
.slp-course .slp-hero-grid{grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr)}
.slp-c-kick{font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);margin:0 0 1rem!important}
/* the email field and its button, used in the hero and the closing panel */
.slp-home form.slp-c-form{display:flex;flex-wrap:wrap;gap:.6rem;margin:1.9rem 0 0;max-width:30rem}
.slp-c-form label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.slp-home .slp-c-form input[type=email]{flex:1 1 13rem;min-height:54px;padding:0 1.2rem;border-radius:999px;
  border:1px solid var(--line);background:#fff;font:inherit;font-size:1rem;color:var(--ink);box-shadow:none}
.slp-home .slp-c-form input[type=email]:focus{outline:2px solid var(--forest);outline-offset:2px}
/* Kadence uppercases and squares every <button>. */
.slp-home .slp-c-form button{min-height:54px;padding:0 1.5rem;border-radius:999px!important;border:0;cursor:pointer;
  background:var(--forest)!important;color:#fff!important;font:inherit;font-weight:600;font-size:1rem;
  text-transform:none!important;letter-spacing:0!important;box-shadow:none!important;transition:background .18s ease}
.slp-home .slp-c-form button:hover{background:var(--brand)!important}
.slp-home .slp-c-form button[disabled]{opacity:.6;cursor:default}
.slp-c-hp{position:absolute!important;left:-9999px!important}
.slp-c-msg{flex:1 1 100%;font-size:.9rem;margin:0!important;min-height:1.2em}
.slp-c-msg.err{color:#B42318}
.slp-c-done{margin-top:1.8rem!important;font-size:1.05rem;font-weight:600;color:var(--forest)}
.slp-c-note{font-size:.9rem;color:var(--slate);margin-top:.9rem!important}
.slp-c-note a{color:var(--forest)!important;font-weight:600;border-bottom:1px solid currentColor}
/* the author card beside the hero */
.slp-c-author{background:var(--paper);border:1px solid var(--line);border-radius:28px;overflow:hidden}
.slp-c-author img,.slp-c-author video{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;max-width:none}
.slp-c-author figcaption{padding:16px 20px 18px;font-size:.88rem;line-height:1.45;color:var(--slate)}
.slp-c-author figcaption b{display:block;font-size:1rem;color:var(--ink)}
/* the stops as a trail, inside the forest panel */
.slp-c-trail{position:relative;max-width:58rem;margin:0 auto;text-align:left}
.slp-c-trail::before{content:"";position:absolute;left:50%;top:34px;bottom:34px;margin-left:-1px;border-left:2px dashed rgba(255,255,255,.4)}
.slp-home .slp-c-trail ol{list-style:none!important;margin:0!important;padding:14px 0!important;display:grid;gap:14px}
.slp-home .slp-c-leg{margin:0;display:grid;grid-template-columns:minmax(0,1fr) 64px minmax(0,1fr);align-items:center}
.slp-c-leg i{grid-column:2;grid-row:1;justify-self:center;position:relative;z-index:1;width:46px;height:46px;border-radius:50%;
  display:grid;place-items:center;font-style:normal;font-family:'Fraunces',Georgia,serif;font-size:1.35rem;line-height:1;
  background:var(--glow);color:var(--forest-dark);box-shadow:0 0 0 6px rgba(0,47,21,.55)}
.slp-c-leg .card{grid-column:1;grid-row:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:15px 18px}
.slp-c-leg .when{grid-column:3;grid-row:1;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.72)}
.slp-c-leg:nth-child(even) .card{grid-column:3}
.slp-c-leg:nth-child(even) .when{grid-column:1;text-align:right}
.slp-c-leg .card b{display:block;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:1.3rem;line-height:1.2;color:#fff;margin-bottom:.2rem}
.slp-c-leg .card span{display:block;font-size:.95rem;line-height:1.45;color:rgba(255,255,255,.88)}
.slp-home p.slp-c-cap{position:relative;z-index:1;width:max-content;max-width:100%;margin:0 auto!important;text-align:center;
  background:#fff;color:var(--forest-dark);border-radius:999px;padding:.55rem 1.2rem;font-size:.93rem;line-height:1.3}
.slp-c-cap b{display:inline-block;font-size:.66rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--brand);margin-right:.6rem}
.slp-home p.slp-c-cap.end{background:var(--glow)}
/* three real screens */
.slp-c-shots{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
/* Each screen is shown a third larger than the frame and cropped from its top
   left corner, so the words in it can be read. */
.slp-c-shot .ph{border-radius:20px;overflow:hidden;border:1px solid var(--line);background:#fff;aspect-ratio:1/1;margin-bottom:1rem}
.slp-c-shot .ph img{display:block;width:135%;height:auto;max-width:none}
.slp-home .slp-c-shot h3{font-weight:400;font-size:1.35rem;line-height:1.2;margin:0 0 .4rem}
.slp-c-shot p{font-size:.97rem;line-height:1.55;color:var(--slate)}
.slp-home ul.slp-c-also{list-style:none!important;margin:clamp(28px,4vw,44px) 0 0!important;padding:0!important;
  display:grid;grid-template-columns:1fr 1fr;gap:0 2.5rem;border-top:1px solid var(--line)}
.slp-home ul.slp-c-also li{margin:0;padding:1rem 0 1rem 1.7rem;border-bottom:1px solid var(--line);position:relative;
  font-size:1rem;line-height:1.5;color:var(--ink)}
.slp-c-also li::before{content:"";position:absolute;left:0;top:1.45rem;width:.7rem;height:.7rem;border-radius:50%;background:var(--forest)}
/* two columns of plain talk */
.slp-c-two{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(28px,5vw,72px);align-items:start}
.slp-c-two p{font-size:1.08rem;line-height:1.65;color:var(--slate);margin:0 0 1.1rem!important;max-width:36em}
.slp-c-two p b{color:var(--ink);font-weight:600}
.slp-c-letter{background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:clamp(22px,3vw,34px)}
.slp-c-letter p{font-size:1.05rem;line-height:1.65;color:var(--ink);margin:0 0 1rem!important}
.slp-c-letter .sig{display:flex;align-items:center;gap:12px;margin-top:1.2rem;font-weight:600}
.slp-c-letter .sig img{width:48px;height:48px;border-radius:50%;object-fit:cover}
/* the free module band */
.slp-c-free{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.4rem;
  background:var(--mint);border-radius:24px;padding:clamp(22px,3vw,36px)}
.slp-home .slp-c-free h3{font-weight:400;font-size:1.7rem;line-height:1.15}
.slp-c-free p{font-size:1rem;line-height:1.55;color:var(--ink);margin-top:.5rem!important;max-width:36em}
.slp-home a.slp-btn-out{border:1.5px solid var(--forest);color:var(--forest)!important;background:transparent}
.slp-home a.slp-btn-out:hover{background:var(--forest);color:#fff!important}
/* the closing panel reuses .slp-final; its form sits on forest */
.slp-home .slp-final form.slp-c-form{margin-top:0}
.slp-final .slp-c-form input[type=email]{border-color:transparent}
.slp-home .slp-final .slp-c-form button{background:#fff!important;color:var(--forest-dark)!important}
.slp-home .slp-final .slp-c-form button:hover{background:var(--glow)!important}
.slp-final .slp-c-msg,.slp-final .slp-c-done{color:#fff}
.slp-final .slp-c-msg.err{color:#FFD7D2}
.slp-c-price{font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:3rem;line-height:1;color:#fff;margin:0 0 .6rem!important}
@media (max-width:900px){
  .slp-course .slp-hero-grid{grid-template-columns:1fr}
  .slp-c-author{max-width:24rem}
  .slp-c-trail::before{left:23px}
  .slp-home .slp-c-leg{grid-template-columns:46px minmax(0,1fr);column-gap:14px;align-items:start}
  .slp-c-leg i{grid-column:1;grid-row:1 / span 2;justify-self:start;margin-top:4px}
  .slp-c-leg .when,.slp-c-leg:nth-child(even) .when{grid-column:2;grid-row:1;text-align:left;margin-bottom:.35rem}
  .slp-c-leg .card,.slp-c-leg:nth-child(even) .card{grid-column:2;grid-row:2}
  .slp-home p.slp-c-cap{margin:0!important;text-align:left;border-radius:16px}
  .slp-c-shots{grid-template-columns:1fr;max-width:30rem}
  .slp-home ul.slp-c-also{grid-template-columns:1fr}
  .slp-c-two{grid-template-columns:1fr}
}
@media (max-width:620px){
  .slp-home .slp-c-form button{flex:1 1 100%}
}
</style>
"""

# One script for every form on the page. It posts the address to the app and
# swaps the form for a line of text. No library, no cookies.
FORM_SCRIPT = r"""
<script>
(function(){
  var api = "__API__";
  document.querySelectorAll('.slp-c-form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var input = f.querySelector('input[type=email]'), btn = f.querySelector('button'), msg = f.querySelector('.slp-c-msg');
      var email = (input.value || '').trim();
      msg.className = 'slp-c-msg';
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ msg.className='slp-c-msg err'; msg.textContent='Type your email address, then press the button.'; input.focus(); return; }
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Adding you…';
      fetch(api, {method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({email: email, website: f.querySelector('.slp-c-hp input').value})})
        .then(function(r){ return r.json().then(function(d){ return {ok:r.ok, d:d}; }); })
        .then(function(res){
          if(res.ok){
            var done = document.createElement('p'); done.className='slp-c-done';
            done.textContent = "You're on the list. You'll get one email, the day it opens.";
            f.parentNode.replaceChild(done, f);
            if(window.gtag) gtag('event','generate_lead',{placement: f.getAttribute('data-place') || 'course_page'});
          } else { throw new Error((res.d && res.d.error) || ''); }
        })
        .catch(function(err){
          btn.disabled = false; btn.textContent = label; msg.className='slp-c-msg err';
          msg.textContent = (err && err.message) || "That didn't save. Try again in a minute.";
        });
    });
  });
})();
</script>
"""


def form(place, button="Tell me when it opens"):
    return (f'<form class="slp-c-form" data-place="{place}" novalidate>'
            f'<label for="slp-c-email-{place}">Your email address</label>'
            f'<input id="slp-c-email-{place}" type="email" name="email" autocomplete="email" inputmode="email" placeholder="you@email.com" required>'
            '<span class="slp-c-hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></span>'
            f'<button type="submit">{button} &rarr;</button>'
            '<p class="slp-c-msg" role="status" aria-live="polite"></p></form>')


def cta(place):
    """The page's one call to action, by mode."""
    if MODE == "open":
        assert PRICE and CHECKOUT_URL, "open mode needs PRICE and CHECKOUT_URL"
        return (f'<div class="slp-actions"><a class="slp-btn slp-btn-primary" href="{CHECKOUT_URL}?{utm(place)}">'
                f'Join Transition OS &middot; ${PRICE} &rarr;</a></div>')
    return form(place)


def upload_shots():
    """Upload each screen once; return {file: url}."""
    out = {}
    for s in SHOTS:
        slug = s["file"].rsplit(".", 1)[0]
        found = api(f"/wp/v2/media?slug={slug}&_fields=id,source_url")
        if isinstance(found, list) and found:
            out[s["file"]] = found[0]["source_url"]
            continue
        r = api("/wp/v2/media", "POST", raw=os.path.join(ROOT, "content/course/sales-page", s["file"]), ctype="image/jpeg",
                extra=["-H", f'Content-Disposition: attachment; filename="{s["file"]}"'])
        if not r.get("id"):
            raise SystemExit(f"upload failed for {s['file']}: {str(r)[:200]}")
        api(f"/wp/v2/media/{r['id']}", "POST", {"alt_text": s["alt"], "title": s["title"]})
        out[s["file"]] = r["source_url"]
        print("uploaded", s["file"], r["id"])
    return out


def build(shot_urls):
    p = []
    a = p.append
    waiting = MODE == "waitlist"
    a('<div class="slp-home slp-course">')

    # ---- hero: the promise, one call to action, and the person who made it
    a('<section class="slp-hero"><div class="slp-wrap"><div class="slp-hero-grid"><div>')
    a('<p class="slp-c-kick">Transition OS &middot; 90 days</p>')
    # "to interviewing", never "to an offer": ninety days cannot promise one.
    a('<h1>From wanting out to <em>interviewing outside the clinic.</em></h1>')
    a('<p class="slp-lede">A ninety-day program you do alongside a full caseload. You decide whether to leave and where to go, '
      'talk to people who already made the move, rewrite your r&eacute;sum&eacute; for a real posting, and practise the interview out loud.</p>')
    a(cta("hero"))
    if waiting:
        a('<p class="slp-c-note">Not open yet. You get one email, the day it opens. '
          f'The first module is free today: <a href="{FREE_MODULE}">start the first twenty minutes &rarr;</a></p>')
    else:
        a(f'<p class="slp-c-note">One payment, a 30-day refund. Or <a href="{FREE_MODULE}">try the first twenty minutes free &rarr;</a></p>')
    a('</div>')
    a('<figure class="slp-c-author">')
    if VIDEO:
        a(f'<video src="{VIDEO}" poster="{HEADSHOT}" controls playsinline preload="metadata"></video>')
    else:
        a(f'<img src="{HEADSHOT}" alt="James Berges" fetchpriority="high" class="skip-lazy" data-skip-lazy />')
    a('<figcaption><b>James Berges</b>Former SLP, now a marketing manager at a mental-health-tech company</figcaption></figure>')
    a('</div></div></section>')

    # ---- four numbers, each counted from the course
    nums = [
        (str(LESSONS), "lessons, each ending in one thing to do"),
        (str(HOURS), "hours of lessons, spread across twelve weeks"),
        (str(ACTIONS), "small actions in a workbook you keep"),
        (str(PATHS), "paths compared, with pay and timelines"),
    ]
    a('<section class="slp-nums"><div class="slp-wrap">'
      + "".join(f'<div class="slp-num"><b>{n}</b><span>{l}</span></div>' for n, l in nums)
      + '</div></section>')

    # ---- the eight stops, drawn as a trail: a dashed line down the middle with a
    # numbered marker for each stop, cards alternating either side and the
    # weeks on the other side of the line. On a phone the line runs down the
    # left. (James, 2026-11-21: make it look like a journey.)
    a('<section class="slp-stage-sec" id="program"><div class="slp-wrap"><div class="slp-stage">')
    # The heading names the reader's problem (not knowing where to begin), not the program's shape.
    a('<h2>Know what to do this week, <em>and what can wait.</em></h2>')
    a('<p class="slp-sub">Most SLPs start with the r&eacute;sum&eacute; and stall. You start with the decision and the people, '
      'so the r&eacute;sum&eacute; has somewhere to go.</p>')
    a('<div class="slp-c-trail">')
    a('<p class="slp-c-cap"><b>Today</b>You want out, or you think you might</p>')
    a('<ol>')
    for i, (name, when, ends) in enumerate(STOPS):
        a(f'<li class="slp-c-leg slp-rv"><span class="when">{when}</span><i>{i}</i>'
          f'<div class="card"><b>{name}</b><span>{ends}</span></div></li>')
    a('</ol>')
    a('<p class="slp-c-cap end"><b>Where it leads</b>Interviews for work outside the clinic</p>')
    a('</div></div></div></section>')

    # ---- what it looks like: three real screens, then what else is inside
    a('<section class="slp-sec" id="inside"><div class="slp-wrap">')
    # Was "Short lessons, and tools that do the sums": James, "bullshit
    # metacommentary". A heading says what the reader finds out, never what the
    # lessons are like.
    a('<div class="slp-sec-head"><p class="slp-kicker">What you work out</p>'
      '<h2>What you could do, what it pays, <em>and whether you can afford it.</em></h2></div>')
    a('<div class="slp-c-shots" data-stagger>')
    for s in SHOTS:
        a(f'<div class="slp-c-shot slp-rv"><div class="ph"><img src="{shot_urls[s["file"]]}" alt="{home.esc(s["alt"])}" loading="lazy" /></div>'
          f'<h3>{s["title"]}</h3><p>{s["line"]}</p></div>')
    a('</div>')
    a('<ul class="slp-c-also">' + "".join(f"<li>{x}</li>" for x in ALSO) + '</ul>')
    a('</div></section>')

    # ---- who it is for, said straight, beside a note from James
    a('<section class="slp-sec" style="padding-top:0"><div class="slp-wrap"><div class="slp-c-two">')
    a('<div><div class="slp-sec-head" style="margin-bottom:1.4rem"><p class="slp-kicker">Who it&rsquo;s for</p>'
      '<h2>You can do this <em>with a full caseload.</em></h2></div>'
      '<p>You want out, or you think you might, and you can&rsquo;t yet name what else you could do. '
      'The lessons are short, and each week asks for one or two things you can do after work.</p>'
      '<p><b>Ninety days gets you to interviews.</b> It can&rsquo;t promise an offer, and the transitions on record took six to fifteen months. '
      'Nobody places you in a job, and nobody here promises six figures by fall.</p>'
      '<p>Every figure in the program comes from documented SLP transitions and public salary data, and the source sits under each lesson.</p></div>')
    # Only what James has confirmed: his old and current job, the podcast, the
    # message that started the job he has now, and who he wrote to before it.
    a('<div class="slp-c-letter">'
      '<p>I was a speech-language pathologist. Now I&rsquo;m a marketing manager at a mental-health-tech company, and I host the Xceptional Leaders podcast.</p>'
      '<p>The job I have now started with one message. I congratulated a recruiter on the company&rsquo;s funding round and asked for nothing. '
      'Before that I&rsquo;d joined groups for the work I wanted and written to former SLPs who were already doing it.</p>')
    if waiting:
        a('<p>The written lessons, the tools and the workbook are finished, and the first module is open today. '
          'I&rsquo;m recording a short video for every lesson before the rest opens.</p>')
    else:
        a('<p>Each lesson opens with a short video from me, then the key points and the one thing to do.</p>')
    a(f'<div class="sig"><img src="{HEADSHOT}" alt="" loading="lazy" width="48" height="48" /><span>James</span></div></div>')
    a('</div></div></section>')

    # ---- the free module: try it before anything else
    a('<section class="slp-sec" style="padding-top:0"><div class="slp-wrap"><div class="slp-c-free">'
      '<div><h3>Start with twenty minutes, free.</h3>'
      '<p>Know the number your next job has to clear, the date you&rsquo;re aiming at, and whether it&rsquo;s the workplace, '
      'the work or the season that&rsquo;s wrong. No account, no card.</p></div>'
      f'<a class="slp-btn slp-btn-out" href="{FREE_MODULE}">Start the free module &rarr;</a>'
      '</div></div></section>')

    # ---- closing panel
    a('<div class="slp-wrap"><section class="slp-final">')
    if waiting:
        price_line = (f' People on this list pay the founding price, ${PRICE}.' if PRICE else ' People on this list pay the founding price.')
        a('<div><h2>Hear first <em>when it opens.</em></h2>'
          f'<p>One email, the day it opens.{price_line} '
          'Bought the Getting Started kit? What you paid is credited toward the program.</p></div>')
        a(f'<div>{form("closing")}</div>')
    else:
        seats = f" for the first {FOUNDING_SEATS} people" if FOUNDING_SEATS else ""
        a(f'<div><p class="slp-c-price">${PRICE}</p><h2>The whole program, <em>one payment.</em></h2>'
          f'<p>The founding price{seats}. A refund within 30 days if it doesn&rsquo;t help. '
          'Bought the Getting Started kit? What you paid is credited toward the program.</p></div>')
        a(f'<div><a class="slp-btn slp-btn-light" href="{CHECKOUT_URL}?{utm("closing")}">Join Transition OS &rarr;</a></div>')
    a('</section></div>')

    a(home.SCRIPT)
    if waiting:
        a(FORM_SCRIPT.replace("__API__", WAITLIST_API))
    a('</div>')

    body = "\n".join(p)
    page = "<!-- wp:html -->\n" + home.CSS + "\n" + CSS + "\n" + body + "\n<!-- /wp:html -->"
    assert page.count("<div") == page.count("</div>"), "unbalanced divs"
    assert "—" not in page and "&mdash;" not in page, "em dash on the page"
    return page


if __name__ == "__main__":
    local = "--local" in sys.argv
    extra = [x for x in sys.argv[1:] if x != "--local"]
    assert not extra, f"unknown argument {extra}: this script takes --local or nothing"
    if local:
        urls = {s["file"]: "/zz-course-img/" + s["file"] for s in SHOTS}
        sys.stdout.write(build(urls))
        raise SystemExit
    content = build(upload_shots())
    found = api(f"/wp/v2/pages?slug={SLUG}&status=publish,draft,pending,private&_fields=id,status,link")
    # Same Kadence layout as the homepage: no title band, no boxed white card
    # behind the content (that card showed as a white strip under the header).
    meta = {"_kad_post_title": "hide", "_kad_post_vertical_padding": "hide", "_kad_post_content_style": "unboxed", "_kad_post_layout": "fullwidth"}
    if isinstance(found, list) and found:
        pid = found[0]["id"]
        r = api(f"/wp/v2/pages/{pid}", "POST", {"content": content, "title": TITLE, "meta": meta})
        print(f"updated page {pid} (status stays {r.get('status')})")
    else:
        r = api("/wp/v2/pages", "POST", {"title": TITLE, "slug": SLUG, "status": "draft", "content": content, "meta": meta})
        pid = r.get("id")
        print(f"created DRAFT page {pid}")
    print(f"preview: {SITE}/?page_id={pid}&preview=true")
    print("content chars:", len(content))
