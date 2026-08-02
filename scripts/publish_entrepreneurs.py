#!/usr/bin/env python3
"""Publish the Entrepreneurs cluster (podcast-derived posts)."""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import *  # noqa
import day1  # reuse add_links

CAT = 98  # Entrepreneurs
SITE_ = "https://slptransitions.com"

POSTS = {
    "slp-to-startup-cofounder-rachel-levy": dict(
        file="13-slp-to-startup-cofounder-rachel-levy.md",
        cta="Wondering which non-clinical path fits you?",
        faqs=[
            ("Can an SLP work at a tech company without a technical degree?",
             "Yes, and it happens most often through roles that need someone who understands the end user rather than someone who can code. Rachel Levy moved from 16 years of clinical work into a customer success role at a voice-technology startup, and got there through a mentor introduction rather than an application. Health-tech and speech-tech companies in particular treat clinical credibility as a qualification, because their customers are clinicians and the people their products serve are your former clients."),
            ("What is customer success, and why do SLPs do well in it?",
             "Customer success owns the relationship after the sale: onboarding a customer, keeping them using the product, and keeping them from leaving. It maps closely onto clinical work because a caseload is already a portfolio of people you keep engaged in a long program over months. Documented salary ranges for these roles run roughly $75,000&ndash;$120,000, and at AAC and speech-tech companies the CCC-SLP itself is often the qualifying credential."),
            ("Do I need a doctorate to move into non-clinical work?",
             "No. Levy did get a doctorate hoping it would springboard her somewhere new, but she is explicit that it was a mentor conversation, not the credential, that opened the door to tech. Across documented SLP transitions, the pattern is consistent: credentials alone rarely close a deal, while translated experience and referrals decide most successful moves."),
            ("How do I find other clinicians who have made this move?",
             "Clinic to Code is a free community that meets Fridays at noon, founded by Katie Sieber, where allied-health professionals talk about their transitions out of clinical work. It is open to SLPs, OTs, behavior therapists, nurses, and educators. Searching LinkedIn for your target job title alongside \"CCC-SLP\" is the other reliable way to find people who have already made the exact move you are considering."),
        ],
        links=[(r"\bcustomer success\b", f"{SITE_}/slp-to-customer-success/"),
               (r"\btransferable skills\b", f"{SITE_}/slp-transferable-skills/")],
    ),
    "slp-to-software-engineer-jeannette-roberes": dict(
        file="14-slp-to-software-engineer-jeannette-roberes.md",
        cta="Not sure which direction your experience points?",
        faqs=[
            ("Can a speech-language pathologist become a software engineer?",
             "Yes. Jeannette Roberes completed a coding program in three months and then worked as a software engineer for about two and a half years, having previously been a school-based SLP specialising in dyslexia. She is candid that what kept her out of technology for years was not capability but the belief that technology meant maths and engineering and therefore was not for a self-described liberal arts person."),
            ("How long does a coding bootcamp take?",
             "Roberes finished hers in three months. Bootcamps generally run between three and six months full time, or longer part time. The more useful framing from her story is the question she asked before applying: what is the best thing that could happen? Either she got in and learned to build software, or she did not and continued as an SLP &mdash; a floor she was already comfortable with."),
            ("Is it a failure to leave a career you just retrained for?",
             "Not necessarily. Roberes left software engineering after two and a half years because the daily rigour of the work did not suit her temperament, not because she could not do it. She then combined both backgrounds into speaking, consulting, and writing about clinicians and dyslexic thinkers in technology &mdash; work neither credential would have qualified her for alone."),
            ("What is the difference between access and accessibility?",
             "Roberes frames it this way: access invites you to pull a seat up to the table, while accessibility welcomes you to engage in the dialogue at the table. It is a useful filter when evaluating an employer during a transition. Many organisations will offer access &mdash; an interview, an offer, a seat &mdash; but far fewer are built so that your particular way of working is genuinely usable once you are there."),
        ],
        links=[(r"\btransferable skills\b", f"{SITE_}/slp-transferable-skills/"),
               (r"\bresume\b", f"{SITE_}/slp-resume-non-clinical/")],
    ),
    "building-a-startup-without-quitting-alan-vu": dict(
        file="15-building-a-startup-without-quitting-alan-vu.md",
        cta="Still working out which direction to build toward?",
        faqs=[
            ("Can I build a business while working full time as an SLP?",
             "Alan Vu does, though he says plainly that he would not recommend running four things at once. What makes it workable is not extra hours but two decisions: prioritising ruthlessly, and delegating the venture that has matured enough to run without him. He has an executive assistant running his e-commerce business day to day, which is what frees his attention for the app he is building and for his students."),
            ("Should I quit my clinical job before starting something?",
             "Vu's case argues against it. Working daily at a school with non-speaking students who use AAC means he watches the problem he is solving happen in front of him &mdash; including parents struggling with complicated interfaces. That access to real users is worth more than the extra hours quitting would buy, and the job also funds the build."),
            ("What is AAC?",
             "AAC stands for augmentative and alternative communication: the tools non-speaking or minimally speaking people use to communicate. It covers low-tech options such as printed boards and communication books, and high-tech options such as apps and dedicated speech-generating devices. Vu notes that roughly three out of five AAC systems are abandoned within the first year, often because existing systems are complex, rigid, and have a steep learning curve."),
            ("How do you know an idea is worth pursuing?",
             "Vu describes entrepreneurs as calculated risk-takers rather than risk-takers. His process is to identify a pain point users actually experience, validate it with real data where possible, and assess how saturated the market already is. He also waited: he had the idea for years and only moved once generative AI made his approach meaningfully different from what already existed."),
        ],
        links=[(r"\balternative careers\b", f"{SITE_}/alternative-careers-speech-pathologists-slps/")],
    ),
}

ORDER = list(POSTS.keys())


def publish(slug):
    cfg = POSTS[slug]
    fm, body = parse(os.path.join(ROOT, "content/blog", cfg["file"]))
    print(f"\n=== {slug} ===")
    mid = upload_image(cfg["file"].replace(".md", ""), fm["title"])
    print(f"  image id: {mid}")
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
    if mid:
        payload["featured_media"] = mid
    r = api("/wp/v2/posts", "POST", payload)
    if "id" not in r:
        print("  FAILED:", json.dumps(r)[:300]); return None
    print(f"  published id={r['id']}  {r.get('link')}")
    return r["id"]


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    out = {}
    for s in ORDER:
        if only and s != only:
            continue
        pid = publish(s)
        if pid:
            out[s] = pid
    print("\n" + json.dumps(out, indent=2))
