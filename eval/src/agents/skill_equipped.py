"""Arms B (oracle) and C (human) — agent with a SKILL.md injected via
`GenericPromptFlags.extra_instructions`, AgentLab's hook for additional
in-context guidance.

The two arms share this code path; the runner decides which SKILL.md to
load by passing `arm='oracle'` or `arm='human'`.
"""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
from typing import Literal

from .base import AgentConfig, build_agent_args

Arm = Literal["oracle", "human"]


def load_skill_markdown(arm: Arm, task_id: str, skills_root: Path) -> str:
    path = skills_root / arm / f"{task_id}.SKILL.md"
    if not path.exists():
        raise FileNotFoundError(
            f"missing {arm} SKILL.md for {task_id}: {path}\n"
            f"  oracle: synthesize via `python -m src.oracle_synth --task {task_id}`\n"
            f"  human:  record with the CRX extension and save to {path}"
        )
    return path.read_text(encoding="utf-8")


def compose_extra_instructions(skill_markdown: str) -> str:
    """Wrap the SKILL.md with a delimiter so it's clearly visible in logs and
    Claude treats it as the most actionable section.

    `<recorded_skill>` is purely a marker — Claude doesn't parse it specially,
    but having it present makes prompt logs much easier to debug ("did the
    SKILL.md actually get injected?").
    """
    return (
        "## Recorded Skill (reference demonstration)\n\n"
        "Below is a SKILL.md captured from one successful run of the task you "
        "are about to do. Treat it as guidance — the page may have shifted "
        "since recording. If a selector misses, re-snapshot and find the "
        "equivalent element rather than insisting on the recorded one.\n\n"
        "<recorded_skill>\n"
        f"{skill_markdown.rstrip()}\n"
        "</recorded_skill>"
    )


def build_skill_equipped_agent_args(
    arm: Arm,
    task_id: str,
    skills_root: Path,
    config: AgentConfig,
):
    skill_md = load_skill_markdown(arm, task_id, skills_root)
    extra = compose_extra_instructions(skill_md)
    return build_agent_args(replace(config, extra_instructions=extra))
