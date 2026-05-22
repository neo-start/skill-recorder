"""Common Claude-backed agent factory.

The three arms (cold / oracle / human) share this backbone — only the
SKILL.md injection differs. We build an AgentLab `GenericAgentArgs` instance
per arm because that's what AgentLab's experiment loop (`ExpArgs.run`) takes.

Why the Sonnet 3.5 template?
- AgentLab ships `AGENT_CLAUDE_SONNET_35` with sensible BrowserGym defaults
  (action space, observation flags, etc.). We deep-copy it and swap in our
  chosen model + inject our SKILL.md via `flags.extra_instructions` — that
  one field is AgentLab's official hook for "append guidance to the prompt".
"""

from __future__ import annotations

import copy
from dataclasses import dataclass
from typing import Literal

from agentlab.agents.generic_agent import (
    AGENT_CLAUDE_SONNET_35,
    GenericAgentArgs,
)
from agentlab.llm.chat_api import AnthropicModelArgs

# Our model identifiers map to AnthropicModelArgs we build locally — agentlab's
# pre-defined dict tops out at sonnet-4-20250514, so we wire newer Claude IDs
# ourselves. Keep `model_name` aligned with what the Anthropic SDK accepts.
ClaudeModelId = Literal["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"]

_MODEL_ARGS: dict[str, AnthropicModelArgs] = {
    "claude-opus-4-7": AnthropicModelArgs(
        model_name="claude-opus-4-7",
        max_new_tokens=8192,
        temperature=0.0,
        vision_support=False,
    ),
    "claude-sonnet-4-6": AnthropicModelArgs(
        model_name="claude-sonnet-4-6",
        max_new_tokens=8192,
        temperature=0.0,
        vision_support=False,
    ),
    "claude-haiku-4-5": AnthropicModelArgs(
        model_name="claude-haiku-4-5-20251001",
        max_new_tokens=8192,
        temperature=0.0,
        vision_support=False,
    ),
}


@dataclass(frozen=True)
class AgentConfig:
    model: ClaudeModelId = "claude-sonnet-4-6"
    max_steps: int = 30
    # If non-empty, gets injected into `flags.extra_instructions` — that's
    # AgentLab's documented hook for skill / hint injection.
    extra_instructions: str = ""


def build_agent_args(config: AgentConfig) -> GenericAgentArgs:
    """Build a GenericAgentArgs ready to drop into AgentLab's ExpArgs.

    The returned value is a *config*, not a live agent — AgentLab instantiates
    the agent per trial inside its experiment loop.
    """
    if config.model not in _MODEL_ARGS:
        raise ValueError(
            f"unknown model {config.model!r}; known: {sorted(_MODEL_ARGS)}"
        )

    args = copy.deepcopy(AGENT_CLAUDE_SONNET_35)
    args.chat_model_args = _MODEL_ARGS[config.model]
    # The deep-copied flags object is mutable — override only what we need.
    if config.extra_instructions:
        args.flags.extra_instructions = config.extra_instructions
    return args
