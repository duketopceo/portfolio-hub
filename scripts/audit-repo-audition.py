#!/usr/bin/env python3
"""Repo audition — score every original repo for catalog inclusion.

Judges by history, not existence (per portfolio-catalog skill):
  files + commits separate sustained work from a scaffold.
Excludes forks and archived repos: they are not original work.
"""
import base64
import json
import re
import subprocess
import sys

OWNER = "duketopceo"


def gh(*a, t=45):
    try:
        r = subprocess.run(["gh", *a], capture_output=True, text=True, timeout=t)
        return r.stdout
    except subprocess.TimeoutExpired:
        return ""


meta = json.load(open("/tmp/repo_meta.json"))
# catalog slugs, for the covered/missing split
import pathlib
HUB = pathlib.Path.home() / "workspace" / "portfolio-hub"


def slugs(d):
    return [json.loads(f.read_text())["slug"] for f in sorted(d.glob("*.json")) if not f.name.startswith("_")] if d.exists() else []


catalog = {s.lower().replace("_", "-") for s in slugs(HUB / "src/data/catalog")}

TEST_RE = re.compile(r"(^|/)(tests?|__tests__|spec)/|(_test|\.test|_spec|\.spec)\.[a-z]+$", re.I)
originals = [r for r in meta if not r.get("isFork") and not r.get("isArchived")]
originals.sort(key=lambda r: (r["stargazerCount"], r["diskUsage"]), reverse=True)

print(f"originals to audition: {len(originals)}  (excluded {len(meta)-len(originals)} forks/archived)\n",
      flush=True)

rows = []
for i, r in enumerate(originals, 1):
    n = r["name"]
    print(f"[{i}/{len(originals)}] {n}", file=sys.stderr, flush=True)

    tree = gh("api", f"repos/{OWNER}/{n}/git/trees/HEAD?recursive=1")
    try:
        blobs = [t["path"] for t in json.loads(tree)["tree"] if t["type"] == "blob"]
    except Exception:
        blobs = []

    files = len(blobs)
    readme = next((b for b in blobs if re.match(r"^(README|readme)(\.md|\.rst|\.txt)?$", b)), None)
    readme_len = 0
    if readme:
        c = gh("api", f"repos/{OWNER}/{n}/contents/{readme}", "--jq", ".content")
        if c.strip():
            try:
                readme_len = len(base64.b64decode(c).decode("utf-8", "replace"))
            except Exception:
                pass

    has_tests = any(TEST_RE.search(b) for b in blobs)
    has_ci = any(b.startswith(".github/workflows/") for b in blobs)

    # commit count via the Link header's last page
    commits = 0
    cj = gh("api", f"repos/{OWNER}/{n}/commits?per_page=1&sha=HEAD")
    try:
        commits = 1
        # count via tree size is unreliable; use the contributors-free approach:
        raw = subprocess.run(
            ["gh", "api", f"repos/{OWNER}/{n}/commits?per_page=100", "--jq", "length"],
            capture_output=True, text=True, timeout=45).stdout.strip()
        commits = int(raw) if raw.isdigit() else 1
    except Exception:
        commits = 1

    # verdict
    if files < 6 and commits <= 2:
        verdict = "SHELL"
    elif not readme or readme_len < 400:
        verdict = "NEEDS-README"
    elif commits <= 3:
        verdict = "SCAFFOLD"
    elif r["stargazerCount"] >= 2 or files >= 200:
        verdict = "FLAGSHIP"
    else:
        verdict = "SHIPPED"

    rows.append({
        "name": n, "stars": r["stargazerCount"], "files": files, "commits": commits,
        "readme": readme_len, "tests": has_tests, "ci": has_ci,
        "desc": bool(r.get("description")), "topics": len(r.get("repositoryTopics") or []),
        "home": bool(r.get("homepageUrl")), "lic": bool(r.get("licenseInfo")),
        "lang": (r.get("primaryLanguage") or {}).get("name") or "-",
        "pushed": r["pushedAt"][:10],
        "covered": n.lower().replace("_", "-") in catalog,
        "verdict": verdict,
    })

json.dump(rows, open("/tmp/audition.json", "w"), indent=1)

order = {"FLAGSHIP": 0, "SHIPPED": 1, "SCAFFOLD": 2, "NEEDS-README": 3, "SHELL": 4}
rows.sort(key=lambda x: (order[x["verdict"]], -x["stars"], -x["files"]))

print("verdict       stars files commit readme tests ci  desc top home lic  in-cat  repo")
for r in rows:
    print(f"{r['verdict']:13s} {r['stars']:5d} {r['files']:5d} {r['commits']:6d} "
          f"{r['readme']:6d} {'Y' if r['tests'] else '-':5s} {'Y' if r['ci'] else '-':3s} "
          f"{'Y' if r['desc'] else '-':5s} {r['topics']:3d} {'Y' if r['home'] else '-':4s} "
          f"{'Y' if r['lic'] else '-':4s} {'YES' if r['covered'] else 'no':6s}  {r['name']}")

from collections import Counter
print("\n=== verdict counts ===")
for k, v in Counter(x["verdict"] for x in rows).most_common():
    print(f"  {k:13s} {v}")
print(f"\nmissing from catalog AND FLAGSHIP/SHIPPED: "
      f"{sum(1 for x in rows if not x['covered'] and x['verdict'] in ('FLAGSHIP','SHIPPED'))}")