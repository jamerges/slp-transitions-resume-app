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


add(
    "slp-to-software-founder-michelle-boisvert",
    "16-slp-to-software-founder-michelle-boisvert.md",
    "16-slp-to-software-founder-michelle-boisvert",
    "Wondering which non-clinical path fits you?",
    [
        ("Who is Michelle Boisvert?",
         "Michelle Boisvert, PhD, CCC-SLP, is a school-based speech-language pathologist and co-founder of easyReportPRO. She earned her PhD in Communication Disorders from UMass Amherst in 2012, researching telepractice for students with autism, and formerly edited ASHA's <em>Perspectives on Telepractice</em>. She also founded the telepractice service NetSLP, a division of WorldTide, Inc."),
        ("What is easyReportPRO and what does it cost?",
         "easyReportPRO is a report-writing platform that lets clinicians automate their own customisable templates rather than using a vendor's pre-written ones. It serves speech-language pathologists, psychologists, occupational therapists, and special educators. Pricing runs $20 for one month, $50 for three months, or $169 per year per provider with unlimited reports, plus a free trial."),
        ("Does easyReportPRO use AI?",
         "At the time of the 2024 podcast, the platform used generative AI in a narrow role: improving the flow and cohesion of checklist-generated paragraphs without changing clinical content, with AI-generated text highlighted in red for clinician review. As of 2026 the company's public positioning is \"Automation - Not AI,\" emphasising SMART templates for predictable output, and the current FAQ makes no mention of AI."),
        ("Can an SLP start a software company without coding skills or funding?",
         "Boisvert did both. She says plainly that she is not a marketer or a developer, and easyReportPRO took no outside funding, with development she describes as grassroots. What made it possible was a co-founder with the missing technical skill, her husband Stuart Brisson, who had spent two decades building special education software, plus her own willingness to learn HTML, marketing, and social media along the way."),
    ],
    links=[(r"\bburnout\b", f"{SITE_}/should-you-quit-slp/")],
)


add(
    "what-health-tech-founders-need-from-slps",
    "23-what-health-tech-founders-need-from-slps.md",
    "23-what-health-tech-founders-need-from-slps",
    "Curious whether health tech is your path?",
    [
        ("Do you need to be a speech-language pathologist to work in speech therapy technology?",
         "No. Gareth Walkom, the founder of withVR, is a person who stutters with degrees in digital media technology and medical product design, and has never practised as an SLP. What these companies buy from SLPs is clinical judgment: scenario design, protocol input, research collaboration, and implementation inside real services. The company says the product was built alongside more than 100 clinicians and researchers across 30 countries."),
        ("What is virtual reality exposure therapy for stuttering?",
         "Exposure therapy gradually introduces someone to a feared situation, and VR moves that situation into a scene a clinician can build and adjust. In withVR, a therapist runs a dashboard on a laptop, sees what the client sees in the headset, and changes the number of people, their reactions, and the background noise in real time. Walkom's description of why it works: it isn't real, but it feels real, and you can stop it."),
        ("Does VR therapy for stuttering actually work?",
         "The evidence is early and should be described that way. A 2023 pilot randomised trial at Imperial College London with 25 adults did not show VR exposure therapy outperforming a waitlist immediately after treatment, though improvements appeared at one-month follow-up. A 2025 <em>Journal of Voice</em> pilot using withVR for gender-affirming voice training had eleven participants, and its authors called for larger, longer studies. No published work currently supports strong efficacy claims."),
        ("How do SLPs get their first paid work with a health-tech company?",
         "Usually by asking rather than applying. The common entry points are unpaid or low-paid design feedback that becomes a paid advisory retainer, academic research collaboration that produces authorship and a relationship, and implementation work when your own service adopts a tool. Walkom's standing invitation on the podcast was to get in touch and test the software, and he noted you can start without a VR headset at all."),
    ],
    links=[(r"\bnon-clinical\b", f"{SITE_}/alternative-careers-speech-pathologists-slps/")],
)


add(
    "slp-gender-affirming-voice-ruchi-kapila",
    "21-slp-gender-affirming-voice-ruchi-kapila.md",
    "21-slp-gender-affirming-voice-ruchi-kapila",
    "Not sure whether to specialise or step outside the clinic?",
    [
        ("What is gender-affirming voice care?",
         "Gender-affirming voice care is elective, consensual, client-led work on how a person's voice and communication present. It goes beyond pitch to include intonation, resonance, prosody, and articulation, and can extend to gesture and other communicative habits. Many clients want access to more than one voice configuration so they can shift between settings such as work and community spaces. Not every transgender person seeks it, and cisgender clients pursue it too."),
        ("What is a vocologist, and is that different from a speech-language pathologist?",
         "A vocologist studies voice science and voice habilitation, often including the singing voice. The title is not limited to SLPs: voice teachers, voice coaches, voice scientists, laryngologists, and ENTs can all be vocologists, typically working as an interdisciplinary team. Routes into it include the Pan American Vocology Association's PAVA-Recognized Vocologist designation and graduate coursework such as the National Center for Voice and Speech's Summer Vocology Institute."),
        ("Do more transgender people pursue voice therapy or voice surgery?",
         "Voice therapy is far more common. In the 2015 U.S. Transgender Survey of 27,715 respondents, 14% of transgender women reported having had non-surgical voice therapy, compared with 1% who reported having had voice surgery. Surgery is more expensive and more invasive, which is part of why behavioural voice work carries most of the demand."),
        ("Does gender-affirming voice training actually work?",
         "The outcome research is encouraging. In a 2023 study of 74 trans women published in the <em>Journal of Speech, Language, and Hearing Research</em>, Oates and colleagues found that two-thirds increased satisfaction with their voice to a clinically relevant degree after training, and a third of those who had reported restricted social participation beforehand saw that restriction meaningfully reduce. Listeners also rated voices as more female-sounding after training, though not uniformly to a clinically meaningful threshold."),
    ],
    links=[(r"\bprivate practice\b", f"{SITE_}/alternative-careers-speech-pathologists-slps/")],
)

add(
    "neurodivergent-hiring-mentra",
    "22-neurodivergent-hiring-mentra.md",
    "22-neurodivergent-hiring-mentra",
    "Wondering why your applications keep stalling?",
    [
        ("What is Mentra?",
         "Mentra is a hiring platform that matches neurodivergent job seekers with employers, founded in 2021 in Charlotte, North Carolina by Jhillika Kumar, Conner Reinhardt, and Shea Belsky. Instead of ranking resumes by keyword, it builds a profile covering cognitive strengths, environmental needs, communication preferences, and work samples, then matches against roles. It is free for job seekers, and employers pay for access."),
        ("What accommodations do neurodivergent employees request most often?",
         "Per data Kumar cited from roughly 27,000 people on the platform, the most requested were job coaching and mentoring, noise-cancelling headphones, extra time during interviews, flexible scheduling, uninterrupted work time, allowance of fidget devices, closed captioning and recorded materials, written concise instructions, an interviewer experienced with neurodiversity, and email or calendar organisation support. Most carry no additional cost, since they are changes to manager behaviour rather than purchases."),
        ("Is it risky to tell an employer how you work best?",
         "Reinhardt argues the opposite for working-style information, setting medical diagnosis aside as a separate question. Without knowing how someone communicates or what they need, interviewers make judgments off factors irrelevant to the job, which is its own bias. Mentra's design tries to surface that information before the interview so it is not a candidate's job to explain it under pressure."),
        ("Why does neurodivergent hiring matter to an SLP applying to non-clinical jobs?",
         "Mentra's founders describe recruiter incentives directly: recruiters are trying to close roles with candidates a hiring manager will accept quickly. A rejection is more often a throughput decision than a judgment on capability, which means the fix for a career changer is legibility rather than more credentials. The other transferable lesson is that resumes have no field for how you work or what you have built, so career changers need portfolios and work samples the format cannot hide."),
    ],
    links=[(r"\bresume\b", f"{SITE_}/slp-resume-non-clinical/")],
)


add(
    "grow-a-podcast-while-working-full-time-maya-chupkov",
    "24-grow-a-podcast-while-working-full-time-maya-chupkov.md",
    "24-grow-a-podcast-while-working-full-time-maya-chupkov",
    "Building something on the side? See where it could lead.",
    [
        ("Can you really build an audience for a podcast while working a full-time job?",
         "Maya Chupkov did, publishing Proud Stutter every other Friday for roughly two and a half years with a single break, while working full time in local news and media policy. The show earned an Ambie Award nomination and coverage in NPR, The Guardian, ABC7, and USA Today. Her one concession to the schedule: a short bonus episode counts as keeping the slot, so a bad week does not break the streak."),
        ("How do you get press coverage with no budget or media contacts?",
         "Chupkov starts with a reason a reporter should cover this story rather than the one they already ran. She finds reporters by typing keywords into Google's news tab, filtering to roughly the last six months, clicking through to bylines, and keeping a list of people who cover the topic repeatedly. She recommends a press list of 10 to 15 outlets and a calendar of hooks such as awareness weeks. Landing KQED took her over a year of follow-ups with different angles."),
        ("Is Proud Stutter a nonprofit?",
         "Proud Stutter operates as a sponsored project of Independent Arts &amp; Media, a nonprofit arts service organisation, so donations are tax-deductible to the extent permitted by law. Chupkov also formed a small board of three people plus herself. Funding has come through a mix of donations, an annual gala, and a $35,000 California Documentary Project grant from California Humanities awarded in April 2023."),
        ("What did Maya Chupkov's speech therapy experience teach her?",
         "Her mother found an SLP through the Stuttering Foundation's website, and the therapy was fluency shaping with, in Chupkov's words, no talk of acceptance or goal setting. The clinician told her mother that earlier intervention could have stopped the stuttering, which left her mother with lasting guilt. Chupkov also barely stuttered during sessions, which confused the clinician, so the clinical room became one more place to hide."),
    ],
    links=[],
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
