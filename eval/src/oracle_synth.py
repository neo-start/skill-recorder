"""Oracle SKILL.md synthesis for WebArena tasks (A + C mixed strategy).

WebArena, unlike WorkArena, has no built-in `cheat()` function. The benchmark
only verifies the final state, not the path taken. So we build "oracle" two
ways:

  A. **Published reference trajectories.** WebArena ships annotated demos
     for a subset of tasks. We replay (or transcribe) them into our `Skill`
     schema and render via `skill-render` so the output is identical-format
     to anything the CRX produces.

  B. **Hand-authored oracle.** For tasks without a published trace, an expert
     hand-writes the SKILL.md. To keep format parity, the author writes a
     small JSON file in `skills/oracle/_authored/{task_id}.skill.json` using
     the same `Skill` shape, and this script renders it via the same CLI.

Either way the *output* — `skills/oracle/{task_id}.SKILL.md` — is byte-format
identical to what the Chrome extension would produce.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from .render import render_skill

EVAL_ROOT = Path(__file__).resolve().parents[1]
AUTHORED_DIR = EVAL_ROOT / "skills" / "oracle" / "_authored"
REFERENCE_DIR = EVAL_ROOT / "skills" / "oracle" / "_reference"
OUTPUT_DIR = EVAL_ROOT / "skills" / "oracle"


def authored_skill_path(task_id: str) -> Path:
    return AUTHORED_DIR / f"{task_id}.skill.json"


def reference_trace_path(task_id: str) -> Path:
    """Where to look for a published WebArena reference trace for `task_id`.

    The official WebArena repo distributes traces under
    `webarena/visualization/cleaned_logs/` (subject to change). We mirror the
    subset we care about into `_reference/` so the eval doesn't depend on
    upstream layout. Drop a `{task_id}.trace.json` into `_reference/` after
    you've extracted and cleaned it.
    """
    return REFERENCE_DIR / f"{task_id}.trace.json"


def trace_to_skill(trace: dict[str, Any], task_id: str) -> dict[str, Any]:
    """Convert a WebArena reference trace to our `Skill` shape.

    TODO(eval-step-3): implement the mapping. The shape of a WebArena trace
    isn't standardized across releases — the safe bet is to load one example,
    inspect the keys (`actions[]` with `action_type`, `element_id`,
    `text`, ...), and write the conversion in one direction only. Don't try
    to round-trip. Keep this function small; if the trace format diverges
    badly from `Skill`, the right move is to hand-author rather than fight
    the conversion.
    """
    raise NotImplementedError("trace → Skill mapping not yet implemented")


def synth_one(task_id: str, force: bool = False) -> Path:
    """Synthesize one oracle SKILL.md. Prefers authored over reference."""
    out_path = OUTPUT_DIR / f"{task_id}.SKILL.md"
    if out_path.exists() and not force:
        print(f"[oracle_synth] {task_id}: already exists at {out_path}, skip (use --force)")
        return out_path

    authored = authored_skill_path(task_id)
    reference = reference_trace_path(task_id)

    if authored.exists():
        source = "authored"
        skill = json.loads(authored.read_text(encoding="utf-8"))
    elif reference.exists():
        source = "reference"
        trace = json.loads(reference.read_text(encoding="utf-8"))
        skill = trace_to_skill(trace, task_id)
    else:
        raise FileNotFoundError(
            f"no oracle source for {task_id}.\n"
            f"  expected one of:\n"
            f"    {authored}  (hand-authored Skill JSON)\n"
            f"    {reference} (cleaned WebArena reference trace)"
        )

    md = render_skill(skill)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md, encoding="utf-8")
    print(f"[oracle_synth] {task_id}: synthesized from {source} → {out_path} ({len(md)} bytes)")
    return out_path


def main() -> None:
    p = argparse.ArgumentParser(description="Synthesize oracle SKILL.md files.")
    p.add_argument("--task", help="Synthesize a single task_id.")
    p.add_argument(
        "--all",
        action="store_true",
        help="Synthesize for every task that has an authored or reference source.",
    )
    p.add_argument("--force", action="store_true", help="Overwrite existing outputs.")
    args = p.parse_args()

    if args.task:
        synth_one(args.task, force=args.force)
        return

    if args.all:
        task_ids: set[str] = set()
        if AUTHORED_DIR.exists():
            task_ids.update(f.stem.removesuffix(".skill") for f in AUTHORED_DIR.glob("*.skill.json"))
        if REFERENCE_DIR.exists():
            task_ids.update(f.stem.removesuffix(".trace") for f in REFERENCE_DIR.glob("*.trace.json"))
        if not task_ids:
            sys.exit(f"no sources found in {AUTHORED_DIR} or {REFERENCE_DIR}")
        for tid in sorted(task_ids):
            synth_one(tid, force=args.force)
        return

    p.error("pass --task <id> or --all")


if __name__ == "__main__":
    main()
