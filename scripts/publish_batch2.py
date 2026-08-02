#!/usr/bin/env python3
"""Publish the second Entrepreneurs batch (podcast-derived guest posts)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import *  # noqa
import day1

CAT = 98  # Entrepreneurs
SITE_ = "https://slptransitions.com"

# slug -> config. `img` is the basename in content/blog-images (without .png).
POSTS = {}


def add(slug, file, img, cta, faqs, links=None):
    POSTS[slug] = dict(file=file, img=img, cta=cta, faqs=faqs, links=links or [])


add(
    "reinventing-yourself-mattie-murrey-tegels",
    "19-reinventing-yourself-mattie-murrey-tegels.md",
    "19-reinventing-yourself-mattie-murrey-tegels",
    "Not sure whether you're burned out or just tired?",
    [
        ("How do you tell the difference between burnout and being tired?",
         "Mattie Murrey-Tegels uses a vacation as the test. Take a week or two off, then return: if you come back refreshed and ready to go, still aware of the challenges but genuinely restored, you were tired. If you come back dreading the position, that is burnout. The distinction matters because tiredness is a scheduling problem while burnout is a question about whether your underlying reasons for the work have changed."),
        ("Is it too late to change careers as a speech-language pathologist in your 40s or 50s?",
         "Murrey-Tegels reinvented her career in her fifties, after decades as a medical SLP and after raising five children as a single mother. She became an assistant professor, an author, a podcaster, and a coach. Across documented SLP transitions, mid-career changers tend to move faster than new graduates because they already have the clinical credibility and professional network that most non-clinical roles are actually screening for."),
        ("What is the vision board exercise she recommends?",
         "Her coach had her write 300 sticky notes, one wish per note, covering anything she wanted from her life. She then organised them onto a timeline. The volume is the point: past the first several dozen, you exhaust the goals you think you are supposed to have and start recording the ones you actually hold. Her current roles as professor, author, and podcaster all appeared on those notes first."),
        ("What questions should I ask myself before changing careers?",
         "Murrey-Tegels works from four: what's right, what's wrong, what's confusing, and what's missing. The last two do most of the work, because a standard pros-and-cons list only covers the first two. She pairs the questions with a requirement to create thinking space, whether that is a walk, a commute, or anything that quiets the analytical mind long enough for an honest answer."),
    ],
    links=[(r"\bburnout\b", f"{SITE_}/should-you-quit-slp/")],
)

add(
    "slp-to-consultant-rachel-archambault",
    "20-slp-to-consultant-rachel-archambault.md",
    "20-slp-to-consultant-rachel-archambault",
    "Wondering which non-clinical path fits your experience?",
    [
        ("What is trauma-informed care for speech-language pathologists?",
         "Trauma-informed care is a framework for avoiding additional harm, not a treatment for trauma itself. Rachel Archambault teaches six pillars: safety, choice, collaboration, trust, mutuality, and cultural and historical awareness. She is explicit that an SLP's role is never to investigate or treat a client's trauma, which belongs to psychologists and social workers, but to make the setting usable and refer appropriately."),
        ("Can an SLP build a consulting or speaking business?",
         "Yes, and Archambault's route is a common one: she built an audience on a free platform around a specific expertise before there was any product to sell. She created an Instagram account, posted resources other clinicians could not easily find, and the consulting work followed roughly a year later. She now trains SLPs, doctors, PTs, OTs, schools, hospitals, and universities around the country."),
        ("What language should clinicians avoid to be trauma-informed?",
         "Archambault recommends removing violent turns of phrase such as \"shoot me a text\" in favour of direct alternatives like \"send me a message,\" because you rarely know who in the room needs that not to happen. She also suggests replacing \"dear parents\" with \"dear adults\" on school letters, and avoiding dismissive reassurance such as \"other people have it worse,\" which invalidates the feeling rather than helping the person cope."),
        ("How do I find a niche for a consulting practice?",
         "Archambault's niche came from expertise she needed and could not find, then gave away publicly before it was a business. The generalisable version is to notice what colleagues repeatedly ask you about, publish on it consistently and for free, and let demand confirm the market before you build an offer. Staying strictly inside your professional scope is what makes other clinicians trust the result."),
    ],
    links=[(r"\btransferable skills\b", f"{SITE_}/slp-transferable-skills/")],
)


add(
    "slp-content-creator-chris-wenger",
    "17-slp-content-business-chris-wenger.md",
    "17-slp-content-business-chris-wenger",
    "Wondering how your clinical experience translates?",
    [
        ("Who is Chris Wenger, the \"Speech Dude\"?",
         "Chris Wenger is a school-based speech-language pathologist who works with autistic and neurodivergent teens and posts neurodiversity-affirming strategies for clinicians under the name Speech Dude. He has ADHD himself and describes more than 20 years in the field. He is also the creator of the Dynamic Assessment of Social Emotional Learning and an internationally booked speaker."),
        ("Can an SLP build an audience while still working full time?",
         "Wenger did. At the time of this conversation he was carrying a full high school caseload with a commute of more than 90 minutes each way, raising a family, and speaking internationally, all while posting short educational videos. He credits a morning routine built around early starts and cold showers, on the logic that doing something hard first makes the rest of the day easier by comparison."),
        ("What is the DASEL assessment?",
         "The Dynamic Assessment of Social Emotional Learning is an informal, strengths-based assessment Wenger created for autistic students. It covers self-advocacy, perspective-taking, problem-solving, sensory needs, and what students want from friendships and life after high school. Sold as a digital kit with caregiver, teacher, therapist, and student self-report forms, it is designed as a neurodiversity-affirming alternative to relying on standardised testing alone."),
        ("How do you handle criticism when you post clinical opinions online?",
         "Wenger calls his critics \"love teachers,\" arguing that pushback signals a message is travelling beyond the status quo and that people target what is unusual rather than what is ordinary. He pairs that reframe with a practical habit of deleting hostile comments and blocking the accounts behind them. He notes that no account of meaningful size avoids it entirely."),
    ],
    links=[(r"\btransferable skills\b", f"{SITE_}/slp-transferable-skills/")],
)

add(
    "slp-to-founder-meredith-harold-informed-slp",
    "18-slp-to-founder-meredith-harold-informed-slp.md",
    "18-slp-to-founder-meredith-harold-informed-slp",
    "Curious what you could build on your clinical expertise?",
    [
        ("Who founded The Informed SLP?",
         "Meredith Poore Harold, PhD, CCC-SLP, founded The Informed SLP and has owned the company since 2015. She earned her PhD in developmental speech physiology and neuroscience at the University of Kansas in 2011, worked as a school-based SLP in the Shawnee Mission School District, and was an assistant professor at Rockhurst University from 2016 to 2019. She also founded Informed Jobs, an SLP jobs board launched in December 2024."),
        ("How did The Informed SLP start?",
         "Harold started it as an unpaid hobby during a nine-month stretch at home with infant twins, between her school SLP job and a faculty position. She committed to reading 60 to 80 journal articles a month and translating the clinically useful parts into plain language for other SLPs. After a year of doing it free, the email list had passed 10,000 people and she began charging."),
        ("Is The Informed SLP worth paying for?",
         "Individual membership currently runs $12 a month billed annually and includes access to more than 4,000 clinical research reviews plus unlimited ASHA CEUs. The value rests on a figure Harold cites: only about 5 to 10% of the field's research is immediately clinically applicable, and clinicians cannot tell which papers qualify without reading them in full. The company reports 40,000 SLPs using it monthly and 450+ organisations on team plans."),
        ("Can an SLP build a business without leaving clinical work first?",
         "Harold's path suggests yes. She registered The Informed SLP, LLC in 2015 and held a university faculty position until 2019, so the company grew for years alongside a paycheck. Her first hires were funded entirely by subscription revenue rather than outside investment, a pattern she describes as the business bootstrapping itself once she started charging."),
    ],
    links=[(r"\bnon-clinical\b", f"{SITE_}/alternative-careers-speech-pathologists-slps/")],
)


def publish(slug, update_id=None):
    cfg = POSTS[slug]
    fm, body = parse(os.path.join(ROOT, "content/blog", cfg["file"]))
    print(f"\n=== {slug} ===")
    html = day1.add_links(to_html(body), cfg["links"], slug)
    content = "\n\n".join([html, cta_block(cfg["cta"]), faq_block(cfg["faqs"])])
    payload = {
        "title": fm["title"], "slug": fm["slug"], "content": content,
        "status": "publish", "categories": [CAT],
        "excerpt": fm.get("metaDescription", ""), "author": 1,
        "comment_status": "closed",
        "meta": {"_yoast_wpseo_metadesc": fm.get("metaDescription", ""),
                 "_yoast_wpseo_focuskw": fm.get("targetKeyword", "")},
    }
    mid = upload_image(cfg["img"], fm["title"])
    print(f"  image id: {mid}")
    if mid:
        payload["featured_media"] = mid
    path = f"/wp/v2/posts/{update_id}" if update_id else "/wp/v2/posts"
    r = api(path, "POST", payload)
    if "id" not in r:
        print("  FAILED:", json.dumps(r)[:400]); return None
    print(f"  published id={r['id']}  {r.get('link')}")
    return r["id"]


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    out = {}
    for s in POSTS:
        if only and only != s:
            continue
        pid = publish(s)
        if pid:
            out[s] = pid
    print("\n" + json.dumps(out, indent=2))
