#!/usr/bin/env python3
"""Check the course's module files against content/course/LESSON_SPEC.md.

    python3 scripts/check_lessons.py            every module
    python3 scripts/check_lessons.py 3          module 3 only

Reports, per lesson: block-shape errors, em dashes, a missing or malformed
`check`, prose over the limit, and anything a rewrite lost compared with the
last commit (a tool, a script, an example, an `ask`, a stat value). Exits 1 if
there is an ERROR; warnings do not fail it.
"""
import glob
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROSE = {"p", "list", "quote"}
MAX_PROSE = 700
SHAPES = {
    "p": ["text"], "h": ["text"], "list": ["items"], "steps": ["items"], "numbers": ["items"],
    "quote": ["text"], "callout": ["text"], "example": ["before", "after"], "script": ["text"],
    "story": ["name", "text"], "paths": [], "bypath": ["items"], "ask": ["prompt"], "tool": ["name"],
    "compare": ["left", "right"], "flow": ["items"], "cards": ["items"], "check": ["items"],
}
BANNED = ["delve", "leverage", "unlock", "empower", "seamless", "robust", "tapestry", "landscape", "journey"]


def words(v):
    if isinstance(v, str):
        return len(v.split())
    if isinstance(v, list):
        return sum(words(x) for x in v)
    if isinstance(v, dict):
        return sum(words(x) for x in v.values())
    return 0


def prose_words(blocks):
    n = 0
    for b in blocks:
        if b.get("type") in PROSE or (b.get("type") == "callout" and b.get("tone") != "warm"):
            n += words({k: v for k, v in b.items() if k not in ("type", "tone", "from")})
    return n


def inventory(blocks):
    """What a rewrite must not lose."""
    inv = {"tools": [], "scripts": 0, "examples": 0, "asks": 0, "numbers": [], "bypath": 0, "quotes": 0}
    for b in blocks:
        t = b.get("type")
        if t == "tool":
            inv["tools"].append(b.get("name"))
        elif t == "script":
            inv["scripts"] += 1
        elif t == "example":
            inv["examples"] += 1
        elif t == "ask":
            inv["asks"] += 1
        elif t == "bypath":
            inv["bypath"] += 1
        elif t == "quote":
            inv["quotes"] += 1
        elif t == "numbers":
            inv["numbers"] += [i.get("value") for i in b.get("items", [])]
    return inv


def load_head(rel):
    try:
        out = subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
        return {l["id"]: l for l in json.loads(out)}
    except Exception:
        return {}


def check_file(path):
    rel = os.path.relpath(path, ROOT)
    errors, warns = [], []
    try:
        lessons = json.load(open(path))
    except Exception as e:
        return [f"{rel}: does not parse as JSON: {e}"], []
    head = load_head(rel)
    for L in lessons:
        lid = L.get("id", "?")
        E = lambda m: errors.append(f"{lid}: {m}")
        W = lambda m: warns.append(f"{lid}: {m}")
        for k in ("id", "tldr", "blocks", "takeaways"):
            if not L.get(k):
                E(f"missing `{k}`")
        blocks = L.get("blocks") or []
        if not 3 <= len(L.get("takeaways") or []) <= 5:
            E(f"{len(L.get('takeaways') or [])} takeaways (3 to 5)")
        text = json.dumps(L, ensure_ascii=False)
        if "—" in text:
            E(f"{text.count(chr(0x2014))} em dash(es)")
        for wd in BANNED:
            if re.search(rf"\b{wd}\b", text, re.I):
                W(f"uses `{wd}`")
        checks = 0
        for i, b in enumerate(blocks):
            t = b.get("type")
            if t not in SHAPES:
                E(f"block {i}: unknown type `{t}`")
                continue
            for k in SHAPES[t]:
                if b.get(k) in (None, "", [], {}):
                    E(f"block {i} ({t}): missing `{k}`")
            if t == "check":
                checks += 1
                items = b.get("items") or []
                if not 1 <= len(items) <= 2:
                    E(f"block {i} (check): {len(items)} questions (1 or 2)")
                for q in items:
                    opts = q.get("options") or []
                    if not q.get("q") or not q.get("why"):
                        E(f"block {i} (check): a question needs `q` and `why`")
                    if len(opts) != 3:
                        E(f"block {i} (check): {len(opts)} options (3)")
                    if not isinstance(q.get("answer"), int) or not 0 <= q.get("answer", -1) < len(opts):
                        E(f"block {i} (check): `answer` is not an option index")
            if t == "compare":
                for side in ("left", "right"):
                    sd = b.get(side) or {}
                    if not sd.get("label") or not 2 <= len(sd.get("items") or []) <= 4:
                        E(f"block {i} (compare): `{side}` needs a label and 2 to 4 items")
            if t == "flow" and not 3 <= len(b.get("items") or []) <= 5:
                E(f"block {i} (flow): {len(b.get('items') or [])} items (3 to 5)")
            if t == "flow":
                for it in b.get("items") or []:
                    if not isinstance(it, dict) or not it.get("label"):
                        E(f"block {i} (flow): each item needs a `label`")
            if t == "cards":
                items = b.get("items") or []
                if not 2 <= len(items) <= 4:
                    E(f"block {i} (cards): {len(items)} cards (2 to 4)")
                for it in items:
                    if not isinstance(it, dict) or not it.get("title") or not it.get("text"):
                        E(f"block {i} (cards): each card needs `title` and `text`")
        if checks != 1:
            E(f"{checks} `check` blocks (exactly 1)")
        pw = prose_words(blocks)
        if pw > MAX_PROSE:
            W(f"{pw} words of prose (limit {MAX_PROSE})")
        if lid in head:
            was, now = inventory(head[lid].get("blocks") or []), inventory(blocks)
            for tool in was["tools"]:
                if tool not in now["tools"]:
                    E(f"lost tool `{tool}`")
            for k in ("scripts", "examples", "asks", "bypath"):
                if now[k] < was[k]:
                    E(f"lost {was[k] - now[k]} {k}")
            for v in was["numbers"]:
                if v not in now["numbers"] and v not in text:
                    W(f"stat value `{v}` no longer appears")
            before = prose_words(head[lid].get("blocks") or [])
            warns.append(f"{lid}: prose {before} -> {pw} words")
    return errors, warns


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    files = sorted(glob.glob(os.path.join(ROOT, "content/course/modules/module-*.json")))
    if only:
        files = [f for f in files if f.endswith(f"module-{only}.json")]
    bad = 0
    for f in files:
        errors, warns = check_file(f)
        print(f"\n== {os.path.basename(f)}: {len(errors)} error(s)")
        for e in errors:
            print("  ERROR", e)
        for w in warns:
            print("  note ", w)
        bad += len(errors)
    sys.exit(1 if bad else 0)
