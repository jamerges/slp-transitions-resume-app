#!/usr/bin/env python3
"""Publish the five-stages mindset post (2026-09-03). Same shape as
publish-day1.py: authored FAQs, quiz CTA, header image from
content/blog-images. Every claim traces to research-facts.md /
voice-of-customer.md."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wp_publish import *  # noqa
sys.argv = [sys.argv[0]]  # keep day1's argv parsing quiet
import importlib.util
spec = importlib.util.spec_from_file_location("day1", os.path.join(os.path.dirname(os.path.abspath(__file__)), "publish-day1.py"))
day1 = importlib.util.module_from_spec(spec); spec.loader.exec_module(day1)

day1.POSTS["youre-allowed-to-want-out"] = dict(
    file="26-youre-allowed-to-want-out.md", cat=25,  # Mindset
    cta="Not sure which stage you're in, or which path fits it?",
    faqs=[
        ("Is it normal to feel guilty about leaving speech-language pathology?",
         "Very. Guilt and the identity question (\"who am I if I'm not an SLP?\") are the stage most clinicians stall in longest, and the two beliefs underneath it are that leaving wastes the degree and that wanting out means caring less. Neither holds up: every documented non-clinical path SLPs land in runs on the clinical credential and judgment, and the people who leave are overwhelmingly people who cared about the work and could not keep doing it inside its conditions."),
        ("Do I have to start over at entry level if I leave clinical work?",
         "No. That is the false binary that costs people the most money. Lateral moves exist, and several pay more than clinical work from day one: clinical liaison roles run roughly $84,000 to $135,000, customer success at health-tech and speech-tech companies $75,000 to $120,000, and clinical informatics higher still. These are documented outcomes for former SLPs, not aspirational ones, and none required going back to school first."),
        ("How long does it take to leave clinical SLP work?",
         "Documented transitions take six to fifteen months, with some running longer. One SLP sent 113 tailored applications over eleven months, had seven interviews, and took one offer; another sent more than 500 before landing a data analyst role. Fast exits that use the licence directly (clinical liaison, utilization review) can take weeks. Knowing the real timeline in advance is what lets people pace themselves instead of quitting in month four."),
        ("Why am I not getting interviews for non-clinical jobs?",
         "Usually because the resume still reads clinical. A recruiter spends about seven seconds on a first pass, and a bullet like \"managed a caseload of 62 students with IEPs\" gets sorted into the clinical pile regardless of how strong the clinician was. Translating the same experience into the language of the target role (a portfolio of 62 concurrent accounts with individual goals and quarterly reviews) is the fix, and it comes before sending more applications."),
    ],
    links=[],
)

if __name__ == "__main__":
    pid = day1.publish("youre-allowed-to-want-out")
    print(json.dumps({"id": pid}))
