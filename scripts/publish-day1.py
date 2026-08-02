#!/usr/bin/env python3
"""Day-1 cluster: 5 interlinked posts. FAQs are authored per post and every
factual claim traces to content/research-facts.md (project rule)."""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import *  # noqa

PILLAR = f"{SITE}/alternative-careers-speech-pathologists-slps/"
BURNOUT = f"{SITE}/slp-burnout/"
FEARS = f"{SITE}/5-hidden-fears-stopping-slps-from-making-a-career-change/"

# slug -> (file, category_id, cta_line, faqs, internal_links[(anchor_regex, url)])
POSTS = {
    "slp-transferable-skills": dict(
        file="03-slp-transferable-skills.md", cat=54,
        cta="Not sure which of these skills to lead with?",
        faqs=[
            ("What are the most valuable transferable skills for an SLP leaving clinical work?",
             "The ones that map to a business outcome, not the ones that sound clinical. Caseload management translates to managing a portfolio of concurrent clients; IEP meetings translate to cross-functional stakeholder alignment; progress monitoring translates to outcome analytics and data-driven decisions; and explaining a diagnosis to a frightened parent translates to plain-language communication for non-expert users. \"Communication skills\" and \"empathy\" are not differentiators — every applicant claims them."),
            ("Do I need a new certification to make my SLP skills count?",
             "Usually not first. Certifications matter in a few specific paths (a Google Project Management certificate or CAPM for project management, CAHIMS for clinical informatics), but they rarely close a deal on their own. One transitioner put it bluntly: \"no one took me seriously with a CAPM.\" What works is a certificate <em>plus</em> translated experience, or in portfolio fields like instructional design, a portfolio instead of a certificate."),
            ("How do I describe my caseload on a non-clinical resume?",
             "Keep the number and change the frame. \"Managed a caseload of 45 students\" becomes \"Managed a portfolio of 45 concurrent clients, each with individual goals, timelines, and documented outcomes.\" The number is your credibility — never drop it. What changes is the vocabulary around it."),
            ("Will hiring managers understand what an SLP does?",
             "Assume not. Most hiring managers outside healthcare have no mental model for the role, so anything left in clinical language is invisible to them. Your resume's job is translation: every bullet should be readable by someone who has never set foot in a school or hospital."),
        ],
        links=[(r"\balternative careers\b", PILLAR)],
    ),
    "slp-resume-non-clinical": dict(
        file="01-slp-resume-non-clinical.md", cat=54,
        cta="Want your actual resume translated, not just advice about it?",
        faqs=[
            ("How do I write a non-clinical resume as an SLP?",
             "Lead with a professional summary written for the target role, translate every clinical bullet into business language while keeping the real numbers, and use a single-column layout with standard headers (Work Experience, Skills, Education). Mirror the vocabulary of the actual job posting rather than keyword-stuffing — modern applicant tracking systems rank semantically, and humans do the rejecting."),
            ("Will an ATS automatically reject my resume?",
             "Auto-rejection purely on a match score is rare — that is largely a myth. Applicant tracking systems mostly rank and sort; people make the reject decision. What genuinely hurts you is a resume the system cannot parse: multi-column layouts, text inside tables or graphics, and non-standard section headers."),
            ("Should I remove my CCC-SLP credential from my resume?",
             "No. It is evidence of a rigorous credential and it is the entire qualification for some roles — clinical liaison, utilization review, and clinical educator positions at device and AAC companies often require exactly that license. Keep it; just stop letting it be the only story your resume tells."),
            ("How long should a non-clinical SLP resume be?",
             "One page if you have under ten years of experience, two at most beyond that. Relevance beats completeness: a hiring manager needs to believe you can do the job you want, not admire everything you have done."),
        ],
        links=[(r"\btransferable skills\b", f"{SITE}/slp-transferable-skills/"),
               (r"\balternative careers\b", PILLAR)],
    ),
    "slp-cover-letter-non-clinical": dict(
        file="09-slp-cover-letter-non-clinical.md", cat=54,
        cta="Want a cover letter built from your actual experience?",
        faqs=[
            ("Do cover letters still matter in 2026?",
             "For career changers, more than for anyone else. A resume shows what you did; a cover letter is where you explain why a clinician is applying for a non-clinical role at all. Without it, a hiring manager has to guess — and the common guess is that you are a flight risk who will return to clinical work."),
            ("How do I explain leaving clinical work without sounding negative?",
             "Convert push into pull. Burnout, paperwork, and caseload sizes are real reasons, but framed as complaints they read as a retention risk. State what you are moving toward — scale, systems, product, business impact — and support it with one concrete accomplishment. Never let burnout language appear in the letter itself, even when it is the honest reason."),
            ("How can I tell if my cover letter sounds AI-generated?",
             "Look for the tells recruiters now pattern-match: em-dash overuse, the \"it's not just X, it's Y\" construction, words like spearheaded, leveraged, adept, and cutting-edge, and openers that state a general truth about an industry. Roughly 62% of employers report rejecting obviously unpersonalized AI output. If a sentence could appear in any applicant's letter, it is costing you."),
            ("How long should a cover letter be?",
             "Under one page — three or four short paragraphs. Open with something concrete and first-person that only you could write, map two or three accomplishments onto the role's first-90-days problems, and close without flourish."),
        ],
        links=[(r"\bresume\b", f"{SITE}/slp-resume-non-clinical/"),
               (r"\btransferable skills\b", f"{SITE}/slp-transferable-skills/")],
    ),
    "slp-linkedin-career-change": dict(
        file="10-slp-linkedin-career-change.md", cat=26,
        cta="Not sure which direction your profile should point?",
        faqs=[
            ("What should my LinkedIn headline say if I am an SLP changing careers?",
             "Point it at where you are going while keeping the credibility of where you have been. \"Speech-Language Pathologist\" alone tells recruiters you are clinical and closed. A headline naming the target function plus your clinical grounding — the credential included — signals both direction and proof."),
            ("Should I say I am open to work?",
             "Yes, using the recruiters-only setting if you are still employed. That setting hides the badge from your network while making you visible in recruiter searches, which is where most inbound actually starts."),
            ("How do recruiters find career changers on LinkedIn?",
             "They search the vocabulary of the role they are filling, not the vocabulary of the role you are leaving. If your profile only contains clinical terms, you are invisible to every search that matters. The About section and skills list are where that language has to appear."),
            ("Does posting on LinkedIn actually help a career change?",
             "It compounds, but it is slower than outreach. Direct messages to people who made the same move produce replies at roughly one in four — that is a normal hit rate, not rejection — and referrals decide more transitions than applications do."),
        ],
        links=[(r"\bresume\b", f"{SITE}/slp-resume-non-clinical/"),
               (r"\balternative careers\b", PILLAR)],
    ),
    "should-you-quit-slp": dict(
        file="07-should-you-quit-slp.md", cat=25,
        cta="Still deciding whether to go?",
        faqs=[
            ("Should I quit being an SLP?",
             "That is the wrong first question, because it is a binary and your situation is not. The useful questions are narrower: is the problem the profession, the setting, or the specific employer? Is the constraint money, time, or identity? People who leave successfully usually answer those before they answer the big one — and some discover the fix is a different job, not a different field."),
            ("Am I wasting my degree if I leave clinical work?",
             "The degree bought you a way of thinking — behavioral science, data-driven decisions, and the ability to explain complex things to people under stress — and none of that expires when you stop billing sessions. Several documented paths pay at or above clinical rates precisely <em>because</em> of the credential, including clinical liaison, utilization review, and clinical educator roles at AAC and device companies."),
            ("How long does it take to leave the SLP field?",
             "Six to fifteen months is the realistic range for a tailored, referral-supported search. Some paths are much faster: clinical liaison and utilization review roles can move in weeks because the license itself is the qualification. Others are long — one SLP moving into data analysis sent more than 500 applications over six months before landing."),
            ("Will I take a pay cut if I leave clinical work?",
             "Not necessarily, and that assumption stops more people than the actual numbers justify. Customer success and implementation roles at health-tech and speech-tech companies commonly run $75,000–$120,000; clinical liaison roles run $80,000–$135,000; clinical informatics runs higher still. Expect a dip in some paths, not all of them."),
        ],
        links=[(r"\bburnout\b", BURNOUT), (r"\balternative careers\b", PILLAR)],
    ),
}

ORDER = ["slp-transferable-skills", "slp-resume-non-clinical",
         "slp-cover-letter-non-clinical", "slp-linkedin-career-change",
         "should-you-quit-slp"]


def add_links(html, links, self_slug):
    """Link the first plain-text occurrence of each anchor, skipping text that
    is already inside a tag or an existing link."""
    for pattern, url in links:
        if self_slug in url:
            continue
        def once(m):
            return f'<a href="{url}">{m.group(0)}</a>'
        # only operate on text outside tags
        parts = re.split(r"(<[^>]+>)", html)
        done = False
        for i, seg in enumerate(parts):
            if done or seg.startswith("<"):
                continue
            new, n = re.subn(pattern, once, seg, count=1, flags=re.I)
            if n:
                parts[i] = new; done = True
        html = "".join(parts)
    return html


def publish(slug, only=None):
    cfg = POSTS[slug]
    if only and slug != only:
        return
    fm, body = parse(os.path.join(ROOT, "content/blog", cfg["file"]))
    print(f"\n=== {slug} ===")

    mid = upload_image(cfg["file"].replace(".md", ""), fm["title"])
    print(f"  image id: {mid}")

    html = to_html(body)
    html = add_links(html, cfg["links"], slug)
    content = "\n\n".join([html, cta_block(cfg["cta"]), faq_block(cfg["faqs"])])

    payload = {
        "title": fm["title"],
        "slug": fm["slug"],
        "content": content,
        "status": "publish",
        "categories": [cfg["cat"]],
        "excerpt": fm.get("metaDescription", ""),
        "author": 1,
        "comment_status": "closed",
        "meta": {
            "_yoast_wpseo_metadesc": fm.get("metaDescription", ""),
            "_yoast_wpseo_focuskw": fm.get("targetKeyword", ""),
        },
    }
    if mid:
        payload["featured_media"] = mid

    r = api("/wp/v2/posts", "POST", payload)
    if "id" not in r:
        print("  FAILED:", json.dumps(r)[:400]); return None
    print(f"  published id={r['id']}  {r.get('link')}")
    return r["id"]


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    ids = {}
    for s in ORDER:
        pid = publish(s, only)
        if pid:
            ids[s] = pid
    print("\n" + json.dumps(ids, indent=2))
