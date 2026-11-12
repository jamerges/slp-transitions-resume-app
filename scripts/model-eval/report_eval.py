# Needs the dev-only route: copy scripts/model-eval/route.ts.txt to app/api/test-eval/route.ts,
# start the dev server, run this, then delete the route before committing.
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GOALS = {"targetRoles": [], "targetIndustries": [], "topSkills": "", "whyLeaving": "", "workPreferences": []}
CASES = [
    {"id": "panic-cs", "quiz": {"a": {"done": [0, 2], "flow": [1], "regret": [0], "stage": [3], "income": [1], "time": [1], "people": [0], "proximity": [1], "tech": [1]}, "top": "customer-success", "ru": "instructional-design", "st": "panic"}},
    {"id": "permission-id", "quiz": {"a": {"done": [1, 3], "flow": [2], "regret": [1], "stage": [2], "income": [0], "time": [2], "people": [2], "proximity": [2], "tech": [0]}, "top": "instructional-design", "ru": "clinical-educator", "st": "permission"}},
]
CONFIGS = [("sonnet-4-6", "claude-sonnet-4-6", None, (3.0, 15.0)), ("opus-5-5 low", "claude-opus-5-5", "low", (4.0, 20.0))]
rows = []
for c in CASES:
    for label, model, effort, (pin, pout) in CONFIGS:
        body = {"kind": "report", "model": model, "effort": effort, "input": {"resumeText": "", "goals": GOALS, "quiz": c["quiz"]}}
        req = os.path.join(HERE, "report_req.json"); json.dump(body, open(req, "w"))
        out = subprocess.run(["curl", "-s", "-m", "300", "-X", "POST", "http://localhost:3000/api/test-eval", "-H", "Content-Type: application/json", "--data-binary", "@" + req], capture_output=True, text=True).stdout
        d = json.loads(out)
        tin = sum(m["inputTokens"] for m in d.get("metas", [])); tout = sum(m["outputTokens"] for m in d.get("metas", []))
        flat = json.dumps(d.get("result", {}), ensure_ascii=False)
        row = {"case": c["id"], "config": label, "ok": d.get("ok"), "wallS": round(d.get("wallMs", 0) / 1000, 1), "in": tin, "out": tout,
               "cost": round(tin / 1e6 * pin + tout / 1e6 * pout, 4), "emDashes": flat.count("—"), "chars": len(flat), "error": d.get("error"),
               "keys": sorted((d.get("result") or {}).keys())}
        print(json.dumps(row), flush=True)
        rows.append({**row, "result": d.get("result")})
json.dump(rows, open(os.path.join(HERE, "eval_report.json"), "w"), indent=1)
for r in rows:
    res = r["result"] or {}
    print("=====", r["case"], r["config"])
    print(" diagnosis:", str(res.get("diagnosis"))[:500])
    for t in (res.get("topRoles") or [])[:3]:
        print("  role:", t.get("role"), "|", t.get("salaryRange"), "|", t.get("timeline"), "|", str(t.get("firstMove") or t.get("entryDoor") or "")[:160])
