# Needs the dev-only route: copy scripts/model-eval/route.ts.txt to app/api/test-eval/route.ts,
# start the dev server, run this, then delete the route before committing.
"""Compare models on the app's own prompts through the dev-only /api/test-eval route.

    python3 model_eval.py preview|full <out.json>

Deterministic checks only: did it parse, how long, how many tokens, em dashes,
banned words, burnout language, numbers that are in neither the resume nor the
posting, and the reader's name used in the third person.
"""
import json
import os
import re
import subprocess
import sys
import time

KIND = sys.argv[1]
OUT = sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "http://localhost:3000/api/test-eval"

CONFIGS = [
    ("sonnet-4-6", "claude-sonnet-4-6", None, (3.0, 15.0)),
    ("opus-5-5 low", "claude-opus-5-5", "low", (4.0, 20.0)),
    ("opus-5-5 medium", "claude-opus-5-5", "medium", (4.0, 20.0)),
]

GOALS = {"targetIndustries": [], "topSkills": "", "whyLeaving": "", "workPreferences": []}
CASES = [
    {
        "id": "hospital-to-csm", "name": "Dana", "jobTitle": "Customer Success Manager",
        "goals": {**GOALS, "targetRoles": ["Customer Success / Implementation"], "whyLeaving": "burned out on productivity targets"},
        "resume": """Dana Whitfield, M.S., CCC-SLP
Sacramento, CA
EXPERIENCE
Speech-Language Pathologist, Mercy General Hospital, Sacramento, CA (2020 to present)
- Manage a caseload of 12 to 14 inpatients a day across neuro, cardiac and med-surg units
- Complete about 600 swallowing and cognitive evaluations a year, including 150 modified barium swallow studies
- Trained 40 nurses on aspiration precautions and a bedside swallow screen; screens completed within 24 hours of admission rose from 62% to 91%
- Lead weekly interdisciplinary rounds with physicians, nursing, PT, OT and case management to plan discharge
- Document in Epic; built a smart phrase library the rehab team of 9 now uses
- Supervise 2 graduate student clinicians each year
Speech-Language Pathologist, Sutter Outpatient Rehab, Roseville, CA (2017 to 2020)
- Treated 9 to 11 adults a day with aphasia, dysarthria and cognitive-communication disorders
- Educated patients and families on home programs; 85% of patients met their discharge goals
- Ran a monthly stroke support group of about 20 members
EDUCATION
M.S. Speech-Language Pathology, California State University, Sacramento, 2017
CERTIFICATIONS
CCC-SLP (ASHA), California state license, MBSImP certified""",
        "job": """Customer Success Manager, Clinical Programs. Northwind Health (remote, US).
You will own a book of 25 to 30 hospital and health-system customers using our care-coordination platform. You are the main point of contact after implementation and are accountable for adoption, renewal and expansion.
- Lead onboarding and training for clinical teams, including nurses, therapists and case managers
- Run quarterly business reviews with director-level and VP-level stakeholders, using usage data to show outcomes
- Track adoption and health scores in Gainsight and Salesforce, and act on at-risk accounts
- Partner with Product and Support to resolve issues and bring customer feedback into the roadmap
- Own renewals with a gross retention target of 92%
Looking for: 3+ years in customer success, account management or implementation in healthcare SaaS, or clinical experience in a hospital setting with a record of training and change management. Comfort with EHR workflows (Epic or Cerner). Strong presentation skills with executive audiences. Experience using data to tell a story. Salesforce or Gainsight is a plus.
Compensation: $95,000 to $115,000 base plus bonus.""",
    },
    {
        "id": "school-to-id", "name": "Priya", "jobTitle": "Instructional Designer",
        "goals": {**GOALS, "targetRoles": ["Instructional Design"]},
        "resume": """Priya Raman, M.A., CCC-SLP
Austin, TX
School-Based Speech-Language Pathologist, Round Rock ISD (2018 to present)
- Carry a caseload of 58 students in grades K to 5 across 2 campuses
- Write and manage about 60 IEPs a year and lead annual review meetings with parents, teachers and administrators
- Built a library of 35 short video lessons for articulation home practice; parents of 41 students used them in the first semester
- Delivered 6 professional development sessions a year to groups of 20 to 30 teachers on language supports in the classroom
- Collect weekly progress data on every goal and report it each grading period
- Mentored 3 clinical fellows
Speech-Language Pathology Assistant, Hill Country Therapy, Austin, TX (2015 to 2016)
- Ran therapy sessions for 8 to 10 children a day under supervision
EDUCATION
M.A. Communication Sciences and Disorders, University of Texas at Austin, 2018
CCC-SLP, Texas state license""",
        "job": """Instructional Designer, Brightpath Learning (remote).
We build K-8 literacy software used by 1,200 schools. You will design and build online courses and short videos that teach teachers how to use it.
Responsibilities: write learning objectives and storyboards; build e-learning modules in Articulate Rise and Storyline; script and edit short training videos; work with subject matter experts and product managers; measure course completion and learner feedback and revise.
Requirements: 2+ years designing learning for adults or K-12; a portfolio of e-learning samples; working knowledge of Articulate 360; experience with an LMS; clear writing; comfort with data on learner outcomes. Classroom or school experience is a plus. Salary $72,000 to $88,000.""",
    },
    {
        "id": "snf-to-liaison", "name": "Marcus", "jobTitle": "Clinical Liaison",
        "goals": {**GOALS, "targetRoles": ["Clinical Liaison / Utilization Review"]},
        "resume": """Marcus Bell, M.S., CCC-SLP
Columbus, OH
Speech-Language Pathologist, Arbor Glen Skilled Nursing and Rehab (2016 to present)
- Evaluate and treat 10 to 12 residents a day for dysphagia, cognition and communication
- Screen every new admission within 48 hours, about 25 a month
- Complete MDS Section K and contribute to care plan meetings each week with nursing, dietary, social work and families
- Brought the facility's rate of unplanned diet downgrades from 18% to 7% over two years by starting a mealtime rounding program
- Explain plans of care and discharge options to families; average 5 family meetings a week
- Maintained 88% productivity against an 85% target
Per diem SLP, Riverside Methodist Hospital (2019 to 2021)
- Covered acute care weekends, 6 to 8 evaluations a shift
EDUCATION
M.S. Speech-Language Pathology, Ohio State University, 2016
CCC-SLP, Ohio state license""",
        "job": """Clinical Liaison, Summit Rehabilitation Hospital (Columbus, OH).
The Clinical Liaison builds referral relationships with acute care hospitals, physicians and case managers, evaluates patients for admission to our inpatient rehabilitation hospital, and educates families about our programs.
Duties: complete pre-admission clinical assessments on site at referring hospitals; determine medical necessity against CMS inpatient rehab criteria; meet with patients and families; maintain a territory of 4 to 6 referral sources and hit monthly admission targets; document in our CRM and Meditech.
Qualifications: licensed clinician (RN, PT, OT or SLP); 2+ years of clinical experience in acute or post-acute care; strong communication with physicians and families; comfort with sales goals; valid driver's license. Knowledge of Medicare criteria preferred. Base $84,000 to $98,000 plus quarterly bonus.""",
    },
]

BANNED = ["spearheaded", "leverag", "adept", "cutting-edge", "dynamic", "synergy", "passionate about", "proven track record",
          "results-driven", "tech-savvy", "i am excited to apply", "fast-paced world", "genuinely", "truly", "deeply", "incredibly", "remarkably"]
BURNOUT = ["burnout", "burned out", "burnt out", "exhaust"]


def nums(text):
    return set(re.sub(r"[,$]", "", n).rstrip(".") for n in re.findall(r"\$?\d[\d,]*(?:\.\d+)?", text))


def walk(v, path=""):
    if isinstance(v, str):
        yield path, v
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from walk(x, f"{path}[{i}]")
    elif isinstance(v, dict):
        for k, x in v.items():
            yield from walk(x, f"{path}.{k}" if path else k)


def check(case, result):
    flat = json.dumps(result, ensure_ascii=False)
    low = flat.lower()
    source = nums(case["resume"]) | nums(case["job"]) | {str(y) for y in range(1, 13)} | {"30", "60", "90", "24", "100"}
    invented = []
    # Only the documents a buyer sends: bullets, summary, cover letter, LinkedIn, pitch.
    for path, text in walk(result):
        if not re.search(r"translat|summary|coverLetter|linkedin|elevator|snapshot|bridge", path, re.I):
            continue
        if path.endswith(".original"):
            continue
        for n in nums(text) - source:
            if len(n) == 4 and n.startswith(("19", "20")):
                continue
            invented.append(f"{n} @ {path}: ...{text[max(0, text.find(n) - 50): text.find(n) + 40]}...")
    return {
        "emDashes": flat.count("—"),
        "banned": sorted({w for w in BANNED if w in low}),
        "burnout": sorted({w for w in BURNOUT if w in low}),
        "thirdPerson": len(re.findall(r"\b" + case["name"] + r"\b(?!')", flat)) + len(re.findall(case["name"] + "'s", flat)),
        "placeholders": len(re.findall(r"\[[^\]]{2,40}\]", flat)),
        "invented": invented,
        "chars": len(flat),
    }


rows = []
cases = CASES if KIND == "preview" else CASES[:2]
for case in cases:
    for label, model, effort, (pin, pout) in CONFIGS:
        body = {"kind": KIND, "model": model, "effort": effort,
                "input": {"resumeText": case["resume"], "jobTitle": case["jobTitle"], "jobDesc": case["job"], "goals": case["goals"]}}
        req = os.path.join(HERE, "eval_req.json")
        json.dump(body, open(req, "w"))
        t = time.time()
        out = subprocess.run(["curl", "-s", "-m", "400", "-X", "POST", BASE, "-H", "Content-Type: application/json", "--data-binary", "@" + req],
                             capture_output=True, text=True).stdout
        try:
            d = json.loads(out)
        except Exception:
            d = {"ok": False, "error": "not json: " + out[:200], "metas": []}
        tin = sum(m["inputTokens"] for m in d.get("metas", []))
        tout = sum(m["outputTokens"] for m in d.get("metas", []))
        row = {"case": case["id"], "config": label, "ok": d.get("ok"), "wallS": round(d.get("wallMs", (time.time() - t) * 1000) / 1000, 1),
               "attempts": sum(m["attempts"] for m in d.get("metas", [])), "stops": [m["stop"] for m in d.get("metas", [])],
               "in": tin, "out": tout, "cost": round(tin / 1e6 * pin + tout / 1e6 * pout, 4), "error": d.get("error")}
        if d.get("ok"):
            row.update(check(case, d["result"]))
            row["result"] = d["result"]
        rows.append(row)
        json.dump(rows, open(OUT, "w"), indent=1)
        brief = {k: v for k, v in row.items() if k not in ("result", "invented")}
        print(json.dumps(brief), flush=True)
        for x in row.get("invented", []):
            print("    INVENTED?", x[:200], flush=True)
print("DONE", flush=True)
