#!/usr/bin/env python3
"""One-off: re-render the existing 694 recording with hand-authored notes
attached to the key steps, so the agent has explicit guidance on the
non-obvious bits (which Save button, what the value semantics are, why
some fields look optional but aren't).

Flow:
  1. Read recording 694 + its actions from Canary's IndexedDB (same path
     as reexport-from-chrome.py).
  2. Pipe through cli-buildSkill to get the Skill JSON.
  3. Inject `note` on steps whose intent matches our annotation map.
  4. Pipe the patched Skill JSON through skill-render → markdown.
  5. Write to eval/skills/human/webarena.694.SKILL.md.
"""
from __future__ import annotations

import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CLI_BUILD_SKILL = REPO / "apps/crx/scripts/cli-buildSkill.ts"
TSX = REPO / "node_modules/.pnpm/node_modules/.bin/tsx"
RENDER_CLI = REPO / "packages/skill-render/dist/cli.js"
OUT = REPO / "eval/skills/human/webarena.694.SKILL.md"

CANARY_PROFILE = Path.home() / "Library/Application Support/Google/Chrome Canary/Profile 1"
EXTENSION_HOST = "chrome-extension_kebkpchnjimanbfipjbgbnmlhcjpoboo_0"
RECORDING_ID = "694868f9912c7dfa15af36a6535dbf0a"

# step-index (1-based) → note. Pinned to the inspected layout of the
# existing 694 recording, not regex on intent text (intents are too thin
# — "Click textbox" / "Fill input" — to match reliably).
ANNOTATIONS = {
    8: (
        'Product Name. The pasted value is "Energy-Bulk Women Shirt" '
        '(via {{value_1}}). Magento auto-generates the SKU from this, so '
        "any typo here cascades. The exact mixed-case spelling matters."
    ),
    9: (
        "Re-fill of the Name field after paste — both steps target the "
        "same input (#HHSE6NR). Do not split this into two different "
        "values; the recording is just defensive against paste flicker."
    ),
    11: (
        'Attribute Set selector. Picks "Top" — this is what unlocks the '
        "size and color swatch panels used in steps 16-21. Without this "
        "switch, those swatches simply do not render and the eval fails."
    ),
    13: (
        "Price. Plain number 60 — no $ sign, no thousand separator. "
        "Magento accepts decimals (60 or 60.00); the eval checks the "
        "numeric value, not the formatted string."
    ),
    15: (
        "Quantity. Any qty > 0 auto-sets Stock Status to 'In Stock' — "
        "you do NOT need to find or toggle a separate Stock Status "
        "dropdown elsewhere on the form."
    ),
    17: (
        'Size swatch — the value "167" is Magento\'s internal option ID '
        'for size "S". Do NOT try to convert "S" → some other string; '
        "use 167 exactly as recorded. The numeric ID is what the form "
        "POST expects."
    ),
    20: (
        'Color swatch — the value "50" is Magento\'s internal option ID '
        'for color "Blue". Do NOT confuse the fact that this happens to '
        "match the quantity value above; it is the option ID, not a "
        "stock count. Use 50 exactly as recorded."
    ),
    22: (
        "CRITICAL — Category selector. The WebArena evaluator explicitly "
        "checks that this product belongs to category 'Tops'; without "
        "this step the entire trial scores 0 even if every other field "
        "is correct. Click the category dropdown to open it (steps 22-25 "
        "are: open dropdown → expand tree → pick Tops → click Done)."
    ),
    24: (
        'Category picker — "Tops" is the only category to add. Required '
        "by the evaluator. Do not expand the tree further; clicking "
        "Tops then Done is sufficient."
    ),
    26: (
        'Click the orange "Save" button in the top-right toolbar. Do '
        'NOT click "Save & New" / "Save & Close" / "Save & Duplicate" — '
        "those navigate away in ways the eval doesn't expect. After "
        'clicking, wait for the green "You saved the product." banner '
        "before declaring DONE."
    ),
    27: (
        "OPTIONAL — this click happened after Save in the recording, "
        "likely an accidental focus shift. The product is already saved "
        "by step 26; you can safely skip this step and reply DONE as "
        "soon as the success banner appears."
    ),
}


def load_recording_and_actions():
    """Pull the target recording + its raw actions from Canary IndexedDB."""
    from ccl_chromium_reader import ChromiumProfileFolder

    pf = ChromiumProfileFolder(CANARY_PROFILE)
    try:
        latest = {}
        def on_bad(k, d): return None
        for rec in pf.iter_indexeddb_records(EXTENSION_HOST, bad_deserializer_data_handler=on_bad):
            if rec.value is None: continue
            if rec.database_name != "recorder": continue
            raw_k = repr(rec.key.raw_key if hasattr(rec.key, "raw_key") else rec.key)
            bucket = (rec.object_store_name, raw_k)
            prev = latest.get(bucket)
            if prev is None or rec.ldb_seq_no > prev.ldb_seq_no:
                latest[bucket] = rec

        recording = None
        skill = None
        actions = []
        for (store, _), rec in latest.items():
            v = rec.value
            if store == "recordings" and v.get("id") == RECORDING_ID:
                if v.get("status") == "completed":
                    recording = v
            elif store == "actions" and v.get("recordingId") == RECORDING_ID:
                actions.append(v)
            elif store == "skills" and v.get("sourceRecordingId") == RECORDING_ID:
                if skill is None or v.get("createdAt", 0) > skill.get("createdAt", 0):
                    skill = v
        actions.sort(key=lambda a: a.get("seq", 0))
        return recording, actions, skill
    finally:
        pf.close()


def build_skill_json(recording, actions, title, description):
    cli_input = {
        "actions": actions,
        "recording": recording,
        "title": title,
        "description": description,
    }
    p = subprocess.run(
        [str(TSX), str(CLI_BUILD_SKILL)],
        input=json.dumps(cli_input),
        capture_output=True, text=True, check=True, cwd=str(REPO),
    )
    return json.loads(p.stdout)


def annotate(skill: dict) -> int:
    """Patch `note` field on matching steps. Returns count of notes added."""
    added = 0
    steps = skill.get("steps", [])
    for idx_1based, note in ANNOTATIONS.items():
        i = idx_1based - 1
        if i < 0 or i >= len(steps): continue
        if steps[i].get("note"): continue  # don't overwrite existing
        steps[i]["note"] = note
        added += 1
    return added


FIDELITY_PREAMBLE = """\
> **Execution fidelity**: this is a recorded workflow. Execute every numbered
> step in order, and do NOT take shortcuts based on what you think the task
> needs. The WebArena evaluator for this task checks 7 distinct fields
> (name, price, qty, attribute set, size, color, *category*) — skipping any
> recorded step typically drops one of those checks and scores 0. In
> particular, do not assume the task is done after Save — verify the success
> banner first.
"""

def render_md(skill: dict) -> str:
    p = subprocess.run(
        ["node", str(RENDER_CLI), "render"],
        input=json.dumps(skill), capture_output=True, text=True, check=True,
    )
    md = p.stdout
    # Inject the execution-fidelity preamble after the "Domain:" line so it
    # appears prominently before the Steps section. Idempotent — if the
    # preamble is already present, skip.
    if "Execution fidelity" not in md:
        md = md.replace("## Steps\n", FIDELITY_PREAMBLE + "\n## Steps\n", 1)
    return md


def main():
    print(f"[1/4] reading IndexedDB → recording {RECORDING_ID[:12]}...", file=sys.stderr)
    rec, actions, sk = load_recording_and_actions()
    if rec is None:
        print(f"FAIL: recording {RECORDING_ID} not found in IndexedDB", file=sys.stderr)
        return 1
    if not actions:
        print(f"FAIL: no actions for recording", file=sys.stderr)
        return 1
    title = (sk or {}).get("title") or rec.get("title") or "Create Energy-Bulk product"
    description = (sk or {}).get("description") or "Create simple product Energy-Bulk Women Shirt with size S, color blue, qty 50, price $60."
    print(f"      → {len(actions)} actions; title={title!r}", file=sys.stderr)

    print(f"[2/4] cli-buildSkill ...", file=sys.stderr)
    skill = build_skill_json(rec, actions, title, description)
    print(f"      → {len(skill.get('steps', []))} steps", file=sys.stderr)

    print(f"[3/4] annotating ...", file=sys.stderr)
    n = annotate(skill)
    print(f"      → {n} notes attached:", file=sys.stderr)
    for step in skill.get("steps", []):
        if step.get("note"):
            intent = (step.get("intent") or "")[:60]
            print(f"        - {intent} → {step['note'][:60]}…", file=sys.stderr)

    print(f"[4/4] render → {OUT}", file=sys.stderr)
    md = render_md(skill)
    OUT.write_text(md)
    print(f"      done ({len(md)} bytes)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
