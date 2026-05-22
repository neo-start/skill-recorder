"""Arm A — cold agent. No SKILL.md, default GenericAgent prompt only."""

from __future__ import annotations

from .base import AgentConfig, build_agent_args


def build_cold_agent_args(config: AgentConfig):
    # `extra_instructions=""` means we leave AGENT_CLAUDE_SONNET_35's
    # default prompt untouched. The experiment isolates SKILL.md as the
    # variable, so we explicitly do NOT leak any task hints here.
    return build_agent_args(config)
