"""Per-trial scoring. Wraps WebArena's deterministic reward with timing + cost."""

from __future__ import annotations

import time
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from typing import Any

# Claude pricing (USD per 1M tokens) as of 2026-05.
# Source: https://docs.anthropic.com/en/docs/about-claude/pricing
# Keep this dict updated when pricing changes — runs.csv records the rate used
# so historical reports remain interpretable.
PRICING_PER_MTOK = {
    "claude-opus-4-7":    {"input": 15.0, "output": 75.0},
    "claude-sonnet-4-6":  {"input": 3.0,  "output": 15.0},
    "claude-haiku-4-5":   {"input": 1.0,  "output": 5.0},
}


@dataclass
class TrialResult:
    task_id: str
    arm: str
    seed: int
    model: str
    success: bool
    partial_score: float          # 0..1; 1.0 when fully passed
    wall_clock_sec: float
    tokens_in: int
    tokens_out: int
    cost_usd: float
    n_steps: int                  # agent action count
    trace_path: str | None
    renderer_version: str | None
    error: str | None             # exception message if the trial crashed
    # `runner` distinguishes rows produced by different drivers when results
    # get pooled into one analysis. Default 'unknown' for back-compat with
    # any pre-existing CSVs; runners set it explicitly ('agentlab', 'ccc').
    runner: str = "unknown"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def compute_cost(model: str, tokens_in: int, tokens_out: int) -> float:
    rates = PRICING_PER_MTOK.get(model)
    if not rates:
        return 0.0
    return (tokens_in * rates["input"] + tokens_out * rates["output"]) / 1_000_000


@contextmanager
def stopwatch():
    """`with stopwatch() as elapsed: ...` → `elapsed()` returns seconds since enter."""
    start = time.monotonic()
    yield lambda: time.monotonic() - start
