"""Main eval loop: tasks × arms × seeds.

This module is the *orchestration* layer. The heavy lifting lives in:
- `agents/`        — builds the GenericAgentArgs (one per arm)
- `oracle_synth`   — produces the oracle SKILL.md if missing
- `scorer`         — wraps reward + records timing/cost
- WebArena         — owns the actual environment + reward (via browsergym-webarena)

Run order per cell of the product matrix is intentionally sequential. WebArena
containers carry mutable state (post counts, issue numbers, ...) and parallel
trials against the same instance would taint the reward signal. If we later
want to parallelize, the right unit is *across docker stacks*, not within one.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv

from .agents.base import AgentConfig
from .agents.cold import build_cold_agent_args
from .agents.skill_equipped import Arm, build_skill_equipped_agent_args
from .render import renderer_version
from .scorer import TrialResult, compute_cost, stopwatch

EVAL_ROOT = Path(__file__).resolve().parents[1]
TASKS_CFG = EVAL_ROOT / "tasks" / "selection.yaml"
SKILLS_ROOT = EVAL_ROOT / "skills"
RESULTS_ROOT = EVAL_ROOT / "results" / "runs"

ARMS: tuple[str, ...] = ("cold", "oracle", "human")


def load_tasks(cfg_path: Path, limit: int | None) -> list[dict[str, Any]]:
    raw = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or []
    if not isinstance(raw, list):
        raise ValueError(f"{cfg_path} must contain a YAML list of task entries")
    tasks = list(raw)
    if limit is not None:
        tasks = tasks[:limit]
    return tasks


def _build_agent_args_for_arm(arm: str, task_id: str, config: AgentConfig):
    if arm == "cold":
        return build_cold_agent_args(config)
    if arm in ("oracle", "human"):
        return build_skill_equipped_agent_args(arm, task_id, SKILLS_ROOT, config)
    raise ValueError(f"unknown arm: {arm!r}")


def run_single_trial(
    task_id: str,
    arm: str,
    seed: int,
    config: AgentConfig,
    trace_dir: Path,
    dry_run: bool = False,
) -> TrialResult:
    """Run one (task, arm, seed) trial end-to-end through AgentLab's loop.

    Reads `summary_info.json` written by `ExpArgs.run()` and rolls the
    interesting bits up into a `TrialResult`.

    `dry_run=True` skips the real env — useful for exercising the reporter
    pipeline before WebArena docker services are up.
    """
    if dry_run:
        return TrialResult(
            task_id=task_id, arm=arm, seed=seed, model=config.model,
            success=False, partial_score=0.0,
            wall_clock_sec=0.0, tokens_in=0, tokens_out=0,
            cost_usd=0.0, n_steps=0, trace_path=None,
            renderer_version=renderer_version(),
            error="dry-run",
            runner="agentlab",
        )

    # Late imports — pulling in agentlab triggers a lot of side effects (model
    # registry, prompts) and we don't want them on a `--help`.
    from agentlab.experiments.loop import EnvArgs, ExpArgs

    agent_args = _build_agent_args_for_arm(arm, task_id, config)
    # browsergym registers WebArena envs as `browsergym/webarena.<N>`; our
    # selection.yaml uses the bare `webarena.<N>` form for readability.
    env_task_name = task_id if task_id.startswith("browsergym/") else f"browsergym/{task_id}"
    env_args = EnvArgs(
        task_name=env_task_name,
        task_seed=seed,
        max_steps=config.max_steps,
        headless=True,
    )
    exp_name = f"{task_id}__{arm}__seed{seed}"
    exp_dir = trace_dir / exp_name
    exp_dir.mkdir(parents=True, exist_ok=True)

    exp_args = ExpArgs(
        agent_args=agent_args,
        env_args=env_args,
        exp_dir=str(exp_dir),
        exp_name=exp_name,
    )

    error: str | None = None
    with stopwatch() as elapsed:
        try:
            exp_args.run()
        except Exception as e:  # noqa: BLE001 — runner must continue
            error = f"{type(e).__name__}: {e}"
        wall = elapsed()

    # Parse the summary written by AgentLab.
    summary_path = exp_dir / "summary_info.json"
    summary: dict[str, Any] = {}
    if summary_path.exists():
        try:
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            error = error or f"summary_info parse error: {e}"

    cum_reward = float(summary.get("cum_reward", 0.0))
    raw_reward = float(summary.get("cum_raw_reward", cum_reward))
    success = cum_reward >= 0.999  # WebArena rewards are binary 0/1
    tokens_in = int(summary.get("stats.cum_input_tokens", 0) or 0)
    tokens_out = int(summary.get("stats.cum_output_tokens", 0) or 0)
    n_steps = int(summary.get("n_steps", 0) or 0)
    if error is None:
        error = summary.get("err_msg") or None

    return TrialResult(
        task_id=task_id,
        arm=arm,
        seed=seed,
        model=config.model,
        success=success,
        partial_score=raw_reward,
        wall_clock_sec=wall,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        cost_usd=compute_cost(config.model, tokens_in, tokens_out),
        n_steps=n_steps,
        trace_path=str(exp_dir),
        renderer_version=renderer_version(),
        error=error,
        runner="agentlab",
    )


def write_csv(results: list[TrialResult], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not results:
        return
    fieldnames = list(results[0].to_dict().keys())
    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow(r.to_dict())


def main() -> None:
    load_dotenv(EVAL_ROOT / ".env")

    p = argparse.ArgumentParser(description="Run the Skill Recorder MVP eval over WebArena tasks.")
    p.add_argument("--config", type=Path, default=TASKS_CFG, help="YAML file with task list.")
    p.add_argument("--tasks-limit", type=int, help="Run only the first N tasks (smoke / debug).")
    p.add_argument(
        "--arms",
        default=",".join(ARMS),
        help=f"Comma-separated arms. Default: {','.join(ARMS)}.",
    )
    p.add_argument("--seeds", default="0,1,2", help="Comma-separated seeds. Default: 0,1,2.")
    p.add_argument(
        "--model",
        default="claude-sonnet-4-6",
        choices=["claude-sonnet-4-6", "claude-opus-4-7", "claude-haiku-4-5"],
        help="Backbone model id.",
    )
    p.add_argument(
        "--smoke",
        action="store_true",
        help="One task, one seed. Real env — requires WebArena docker up.",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Skip the env loop; write stub rows. Useful to exercise the reporter.",
    )
    args = p.parse_args()

    if args.smoke:
        args.tasks_limit = 1
        args.seeds = "0"

    if not args.dry_run and not os.environ.get("ANTHROPIC_API_KEY"):
        print("error: ANTHROPIC_API_KEY not set — set it in eval/.env or environment",
              file=sys.stderr)
        sys.exit(1)

    tasks = load_tasks(args.config, args.tasks_limit)
    if not tasks:
        print(f"error: no tasks in {args.config}. Populate selection.yaml first.", file=sys.stderr)
        sys.exit(1)

    arms = [a.strip() for a in args.arms.split(",") if a.strip()]
    seeds = [int(s) for s in args.seeds.split(",")]
    config = AgentConfig(model=args.model)  # type: ignore[arg-type]

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = RESULTS_ROOT / timestamp
    trace_dir = run_dir / "traces"
    trace_dir.mkdir(parents=True, exist_ok=True)

    total = len(tasks) * len(arms) * len(seeds)
    print(f"[runner] {total} trials → {run_dir}"
          + (" (dry-run)" if args.dry_run else ""))

    results: list[TrialResult] = []
    for task in tasks:
        task_id = task["id"]
        for arm in arms:
            for seed in seeds:
                idx = len(results) + 1
                print(f"[runner] {idx}/{total}  {task_id} / {arm} / seed={seed}")
                try:
                    r = run_single_trial(task_id, arm, seed, config, trace_dir,
                                         dry_run=args.dry_run)
                except Exception as e:  # noqa: BLE001
                    traceback.print_exc()
                    r = TrialResult(
                        task_id=task_id, arm=arm, seed=seed, model=config.model,
                        success=False, partial_score=0.0,
                        wall_clock_sec=0.0, tokens_in=0, tokens_out=0,
                        cost_usd=0.0, n_steps=0, trace_path=None,
                        renderer_version=None,
                        error=f"{type(e).__name__}: {e}",
                        runner="agentlab",
                    )
                results.append(r)

    write_csv(results, run_dir / "runs.csv")
    print(f"[runner] wrote {len(results)} rows → {run_dir / 'runs.csv'}")


if __name__ == "__main__":
    main()
