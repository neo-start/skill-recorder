#!/usr/bin/env python3
"""Re-export the user's 9 recorded skills from Chrome's IndexedDB through
our LATEST local skill-build + skill-render pipeline.

The point: the CRX bundled renderer is older than what we just shipped
locally (Bug #1 no-press-enter fix, Bug #2 select, Bug #3 rowContext).
Rather than asking the user to reload the extension and re-export 9 files
by hand, we parse Chrome Canary's IndexedDB LevelDB files directly and
pipe each saved-skill recording through the current
`apps/crx/scripts/cli-buildSkill.ts` + skill-render CLI 0.1.5.

Requirements
------------
* Chrome Canary must be fully quit (Cmd+Q) — LevelDB files are locked
  while Chrome is running.
* ccl-chromium-reader installed:
    uv pip install --python eval/.venv/bin/python \
        git+https://github.com/cclgroupltd/ccl_chrome_indexeddb

Usage
-----
    eval/.venv/bin/python eval/scripts/reexport-from-chrome.py
        [--dry-run]               # show mapping, don't write
        [--profile NAME]          # default: "Profile 1"
        [--out DIR]               # default: eval/skills/human

Flow
----
    1. Verify Chrome Canary is closed.
    2. Open the extension's IndexedDB LevelDB via ccl_chromium_reader.
    3. Iterate all live records, dedupe per (object_store, IDB key) by
       LDB seq number, keep the newest version of each.
    4. For each saved skill (recorder.skills store), fetch its source
       recording's actions, pipe through cli-buildSkill → skill-render.
    5. Match each rendered output to an eval task ID by token overlap
       against the existing eval/skills/human/webarena.<id>.SKILL.md.
    6. With --dry-run, print mapping and stop. Otherwise overwrite the
       human-arm files.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CLI_BUILD_SKILL = REPO / "apps/crx/scripts/cli-buildSkill.ts"
TSX = REPO / "node_modules/.pnpm/node_modules/.bin/tsx"
RENDER_CLI = REPO / "packages/skill-render/dist/cli.js"
HUMAN_DIR = REPO / "eval/skills/human"
TMP_DIR = Path("/tmp/skill-recorder-reexport")

CANARY_ROOT = Path.home() / "Library/Application Support/Google/Chrome Canary"
EXTENSION_ID = "kebkpchnjimanbfipjbgbnmlhcjpoboo"
EXTENSION_HOST = f"chrome-extension_{EXTENSION_ID}_0"
DB_NAME = "recorder"


# ─── Canary process check ─────────────────────────────────────────────────

def canary_is_running() -> bool:
    try:
        subprocess.check_output(
            ["pgrep", "-fx", "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"],
            text=True,
        )
        return True
    except subprocess.CalledProcessError:
        return False


# ─── LevelDB → typed dicts ────────────────────────────────────────────────

def _raw_key(rec) -> str:
    """Stable string repr of an IDB key for dedup bucketing."""
    return repr(rec.key.raw_key if hasattr(rec.key, "raw_key") else rec.key)


def load_indexeddb(profile: str) -> dict:
    """Open the extension's IndexedDB and return {
        'recordings': [...completed...],
        'skills':     [...all saved skills...],
        'actions_by_recording': { recording_id: [actions sorted by seq] },
    }"""
    from ccl_chromium_reader import ChromiumProfileFolder

    prof_path = CANARY_ROOT / profile
    if not prof_path.exists():
        raise FileNotFoundError(f"Canary profile not found: {prof_path}")

    pf = ChromiumProfileFolder(prof_path)
    try:
        # Latest version per (store, raw_key).
        latest = {}
        bad_keys = 0
        def on_bad(k, d):
            nonlocal bad_keys
            bad_keys += 1
            return None
        for rec in pf.iter_indexeddb_records(EXTENSION_HOST, bad_deserializer_data_handler=on_bad):
            if rec.value is None: continue
            if rec.database_name != DB_NAME: continue
            bucket = (rec.object_store_name, _raw_key(rec))
            prev = latest.get(bucket)
            if prev is None or rec.ldb_seq_no > prev.ldb_seq_no:
                latest[bucket] = rec

        recordings: list[dict] = []
        skills: list[dict] = []
        actions_by_rid: dict[str, list[dict]] = defaultdict(list)
        for (store, _), rec in latest.items():
            v = rec.value
            if store == "recordings":
                if v.get("status") == "completed":
                    recordings.append(v)
            elif store == "skills":
                skills.append(v)
            elif store == "actions":
                rid = v.get("recordingId")
                if rid: actions_by_rid[rid].append(v)

        for rid, acts in actions_by_rid.items():
            acts.sort(key=lambda a: a.get("seq", 0))

        if bad_keys:
            print(f"[info] skipped {bad_keys} records with bad deserialization (older versions / partial writes)", file=sys.stderr)

        return {
            "recordings": recordings,
            "skills": skills,
            "actions_by_recording": dict(actions_by_rid),
        }
    finally:
        pf.close()


# ─── Re-render via Node ────────────────────────────────────────────────────

def render_recording(recording: dict, actions: list, title: str, description: str) -> str:
    """Pipe raw recording through cli-buildSkill → skill-render, return MD."""
    cli_input = {
        "actions": actions,
        "recording": recording,
        "title": title,
        "description": description,
    }
    build = subprocess.run(
        [str(TSX), str(CLI_BUILD_SKILL)],
        input=json.dumps(cli_input),
        capture_output=True, text=True, check=False, cwd=str(REPO),
    )
    if build.returncode != 0:
        raise RuntimeError(f"cli-buildSkill failed: {build.stderr}")

    render = subprocess.run(
        ["node", str(RENDER_CLI), "render"],
        input=build.stdout, capture_output=True, text=True, check=False,
    )
    if render.returncode != 0:
        raise RuntimeError(f"skill-render failed: {render.stderr}")
    return render.stdout


# ─── Task-ID matching ──────────────────────────────────────────────────────

EVAL_TASK_IDS = ["423", "453", "458", "470", "496", "538", "694", "704", "771"]

_TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{2,}")
_NOISE = {
    "admin", "dashboard", "magento", "localhost", "http", "https",
    "browse", "click", "fill", "snapshot", "ref", "expected", "open",
    "select", "false", "true", "tab", "key", "page", "form", "id", "value",
    "name", "type", "button", "input", "div", "span", "section", "the",
    "and", "with", "for", "from", "into", "this", "that", "step", "steps",
    "task", "skill", "url", "domain", "param", "params", "parameter",
    "expected", "failure", "snapshot", "fingerprint", "selector", "selectors",
    "block", "bash",
}

def tokens(text: str) -> set:
    out = set()
    for t in _TOKEN_RE.findall(text.lower()):
        if t in _NOISE: continue
        if t.isdigit() and len(t) <= 2: continue
        out.add(t)
    return out


# ─── Main ──────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="print mapping without writing to eval/skills/human/")
    ap.add_argument("--profile", default="Profile 1",
                    help='Canary profile directory name (default: "Profile 1")')
    ap.add_argument("--out", default=str(HUMAN_DIR),
                    help="output directory (default: eval/skills/human/)")
    args = ap.parse_args()

    if canary_is_running():
        print("Chrome Canary is currently running. Cmd+Q Canary and re-run.", file=sys.stderr)
        print("(LevelDB locks the IndexedDB files while Canary is open.)", file=sys.stderr)
        return 2

    print(f"[1/4] Reading IndexedDB from {CANARY_ROOT / args.profile} ...", file=sys.stderr)
    payload = load_indexeddb(args.profile)
    print(f"      → {len(payload['recordings'])} completed recordings, "
          f"{len(payload['skills'])} saved skills, "
          f"{sum(len(v) for v in payload['actions_by_recording'].values())} actions",
          file=sys.stderr)

    TMP_DIR.mkdir(parents=True, exist_ok=True)
    (TMP_DIR / "indexeddb-dump.json").write_text(json.dumps(payload, indent=2, default=str))

    # Recording lookup.
    rec_by_id = {r["id"]: r for r in payload["recordings"]}

    # Pick the LATEST saved skill per source recording.
    skill_by_recording: dict[str, dict] = {}
    for sk in payload["skills"]:
        rid = sk.get("sourceRecordingId")
        if not rid: continue
        prev = skill_by_recording.get(rid)
        if prev is None or sk.get("createdAt", 0) > prev.get("createdAt", 0):
            skill_by_recording[rid] = sk

    print(f"[2/4] Re-rendering {len(skill_by_recording)} recordings through current pipeline ...", file=sys.stderr)
    rendered: dict[str, dict] = {}
    for rid, sk in skill_by_recording.items():
        rec = rec_by_id.get(rid)
        if rec is None:
            print(f"      [skip] {rid[:12]}: no completed recording", file=sys.stderr)
            continue
        actions = payload["actions_by_recording"].get(rid, [])
        if not actions:
            print(f"      [skip] {rid[:12]}: no actions", file=sys.stderr)
            continue
        try:
            md = render_recording(rec, actions, sk["title"], sk["description"])
        except Exception as e:
            print(f"      [fail] {rid[:12]}: {e}", file=sys.stderr)
            continue
        out = TMP_DIR / f"{rid}.SKILL.md"
        out.write_text(md)
        rendered[rid] = {
            "path": out, "md": md,
            "title": sk["title"], "description": sk["description"],
            "startUrl": rec.get("url"),
            "createdAt": sk.get("createdAt", 0),
            "actionCount": len(actions),
        }
        print(f"      → {rid[:12]}  ac={len(actions):>3}  {sk['title'][:55]}",
              file=sys.stderr)

    if not rendered:
        print("No recordings produced output. Stopping.", file=sys.stderr)
        return 1

    print(f"[3/4] Matching against existing eval/skills/human/webarena.<id>.SKILL.md ...", file=sys.stderr)
    existing_tokens: dict[str, set] = {}
    for tid in EVAL_TASK_IDS:
        p = HUMAN_DIR / f"webarena.{tid}.SKILL.md"
        existing_tokens[tid] = tokens(p.read_text()) if p.exists() else set()

    pairs = []
    for rid, info in rendered.items():
        rtoks = tokens(info["md"])
        for tid in EVAL_TASK_IDS:
            etoks = existing_tokens[tid]
            if not etoks: continue
            overlap = len(rtoks & etoks)
            score = overlap / (1 + len(etoks))
            pairs.append((score, rid, tid))
    pairs.sort(reverse=True)

    rid_to_tid: dict[str, str] = {}
    final_scores: dict[str, tuple[str, float]] = {}
    used_tids: set[str] = set()
    for score, rid, tid in pairs:
        if rid in rid_to_tid or tid in used_tids: continue
        rid_to_tid[rid] = tid
        final_scores[rid] = (tid, score)
        used_tids.add(tid)

    print("\nProposed mapping:")
    for rid, info in sorted(rendered.items(), key=lambda kv: -kv[1]["createdAt"]):
        tid, score = final_scores.get(rid, ("??", 0.0))
        marker = "" if score > 0.05 else "  ← low confidence"
        print(f"  {rid[:12]} ac={info['actionCount']:>3} → webarena.{tid}.SKILL.md  (score={score:.3f}){marker}")
        print(f"      title: {info['title'][:80]}")
    unmatched = [tid for tid in EVAL_TASK_IDS if tid not in used_tids]
    if unmatched:
        print(f"\n[warn] no recording matched these task IDs: {unmatched}", file=sys.stderr)

    if args.dry_run:
        print(f"\n[4/4] --dry-run: not writing. Rendered files: {TMP_DIR}/", file=sys.stderr)
        print(f"To inspect one diff:", file=sys.stderr)
        for rid, (tid, _) in list(final_scores.items())[:1]:
            print(f"  diff -u {HUMAN_DIR}/webarena.{tid}.SKILL.md {rendered[rid]['path']}", file=sys.stderr)
        return 0

    print(f"\n[4/4] Writing {len(final_scores)} files to {args.out} ...", file=sys.stderr)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    for rid, (tid, _) in final_scores.items():
        dest = out_dir / f"webarena.{tid}.SKILL.md"
        dest.write_text(rendered[rid]["md"])
        print(f"      wrote {dest}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
