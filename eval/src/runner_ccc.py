"""CCC-driven runner: each trial spawns `claude -p` and lets Claude Code
itself drive the browser via the `browse` skill.

Architecture (one trial):

    ┌─────────────────────────────────────────────────────────────────┐
    │ 1. Per-trial workdir (isolated .claude/skills/)                 │
    │      cp skills/<arm>/<task>.SKILL.md                            │
    │        → workdir/.claude/skills/eval-task-<n>/SKILL.md          │
    │      (skipped for the cold arm)                                 │
    │                                                                 │
    │ 2. Playwright launches Chromium with --remote-debugging-port    │
    │    9222, then GenericWebArenaTask.setup() logs in + navigates   │
    │    to the task's start_url. (Reuses webarena's own login flow.) │
    │                                                                 │
    │ 3. `browse env local 9222` points the browse daemon at our      │
    │    Chromium via CDP. Every `browse <cmd>` CCC issues now hits   │
    │    the same browser.                                            │
    │                                                                 │
    │ 4. spawn claude -p --cwd workdir --output-format json with the  │
    │    task intent. CCC discovers our skill (project-level), uses   │
    │    Bash → browse to interact, exits with JSON result.           │
    │                                                                 │
    │ 5. task.validate(page, []) runs webarena's program_html /       │
    │    url_match evaluator against the live page → reward 0/1.      │
    │                                                                 │
    │ 6. Cleanup: browse stop, browser.close, keep workdir for trace. │
    └─────────────────────────────────────────────────────────────────┘

State between trials is NOT auto-reset. For mutation tasks this means trial
N+1 inherits trial N's Magento state. For MVP/smoke that's fine; for the full
90-run we'll wedge a `./docker/setup-webarena.sh reset shopping_admin` in.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
import tempfile
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv

from .agents.skill_equipped import load_skill_markdown
from .render import renderer_version
from .scorer import TrialResult, stopwatch

EVAL_ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = EVAL_ROOT / "skills"
TASKS_CFG = EVAL_ROOT / "tasks" / "selection.yaml"
RESULTS_ROOT = EVAL_ROOT / "results" / "runs"

CDP_PORT = 9222
ARMS: tuple[str, ...] = ("cold", "oracle", "human")
SETUP_SCRIPT = EVAL_ROOT / "docker" / "setup-webarena.sh"
RESET_WAIT_SEC = 25  # Magento needs ~20s after docker run before /admin is responsive


def _task_int(task_id: str) -> int:
    """selection.yaml uses 'webarena.453'; webarena's GenericWebArenaTask wants the int."""
    return int(task_id.removeprefix("webarena."))


def _build_prompt(intent: str) -> str:
    """Prompt for `claude -p`. Identical across arms — the only difference is
    whether a SKILL.md is dropped into workdir/.claude/skills/.

    Note on skill discovery: Claude Code shows the skill name + description
    in its catalog by default, but doesn't auto-load the body. Our pilot run
    on task 704 confirmed that without an explicit nudge, CCC sometimes acts
    on the description alone and gets the details wrong (e.g. used
    `02/01/2023` instead of the `2/1/23` that the skill body specified).

    The 'Skills' paragraph below is the minimum nudge to make the eval
    measure 'SKILL.md content quality' rather than 'skill discovery
    behaviour'. It applies identically to cold arm too (where no relevant
    skill exists) so the wording doesn't introduce arm-specific bias."""
    return f"""\
You are operating a Magento admin panel running locally at http://localhost:7780/admin.

The browser is already navigated to the relevant admin page and you are authenticated as the admin user. Use the `browse` CLI (via Bash) to drive the browser:

  - `browse snapshot` — accessibility tree of the current page with [refs] like [0-12]
  - `browse click <ref>` — click an element by its ref
  - `browse fill <ref> <value>` — type into a textbox / select
  - `browse open <url>` — navigate
  - `browse press <key>` — press a key (e.g. Enter)

`browse --json <cmd>` adds machine-readable output for the same command.

Skills: before you act, check your available skills. If any skill name or description looks relevant to the task below, READ ITS FULL SKILL.md FILE (don't act on description alone) — the body usually contains exact selectors, values, and gotchas that matter.

TASK: {intent}

When you've completed the change, reply with exactly DONE and stop. If you determine the task is impossible, reply FAILED with a one-line reason.
"""


def _frontmatter_name(skill_md: str, fallback: str) -> str:
    """Extract `name:` from SKILL.md frontmatter — that's the slug CCC shows
    in its skill catalog. Using this for the directory name mirrors what a
    real Skill Recorder install would look like (semantic, not opaque
    `eval-task-NNN`), which is the experience we want to evaluate."""
    import re
    m = re.search(r"^name:\s*(\S+)", skill_md, flags=re.MULTILINE)
    return m.group(1) if m else fallback


def install_skill(arm: str, task_id: str, workdir: Path) -> Path | None:
    """Drop the right SKILL.md into workdir/.claude/skills/ so CCC can find it
    as a project-level skill. Returns the install path, or None for cold arm.

    Directory name = SKILL.md's frontmatter `name:` (slugified title from
    the renderer). Falls back to `eval-task-<n>` if frontmatter is missing.
    """
    if arm == "cold":
        return None
    skill_md = load_skill_markdown(arm, task_id, SKILLS_ROOT)  # type: ignore[arg-type]
    dir_name = _frontmatter_name(skill_md, fallback=f"eval-task-{_task_int(task_id)}")
    skill_dir = workdir / ".claude" / "skills" / dir_name
    skill_dir.mkdir(parents=True, exist_ok=True)
    out = skill_dir / "SKILL.md"
    out.write_text(skill_md, encoding="utf-8")
    return out


def spawn_claude(prompt: str, workdir: Path, model: str, max_turns: int,
                 max_budget_usd: float, timeout_sec: int) -> dict[str, Any]:
    """Spawn `claude -p` and return the parsed JSON result.

    On non-zero exit we still try to parse stdout — CCC emits a valid JSON
    error object even on `is_error: true`.

    We strip ANTHROPIC_API_KEY from the subprocess env. .env.example uses a
    placeholder for that var (so the AgentLab runner has *something* to read),
    but CCC interprets the placeholder as a real key and refuses to fall back
    to the user's subscription credentials. Cleaner to just not pass it.
    """
    cmd = [
        "claude", "-p",
        "--output-format", "json",
        "--max-budget-usd", str(max_budget_usd),
        "--max-turns", str(max_turns),
        "--model", model,
        "--allowed-tools", "Bash,Read",
        "--permission-mode", "bypassPermissions",
        prompt,
    ]
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(workdir),
        timeout=timeout_sec,
        env=env,
    )
    out: dict[str, Any] = {"_exit": proc.returncode, "_stderr": proc.stderr[-2000:]}
    if proc.stdout.strip():
        try:
            out.update(json.loads(proc.stdout))
        except json.JSONDecodeError as e:
            out["_json_parse_error"] = str(e)
            out["_stdout_tail"] = proc.stdout[-2000:]
    return out


def reset_shopping_admin() -> None:
    """Bring Magento back to fresh fixture state.

    Mutation tasks (our entire selection.yaml) change Magento DB rows. Without
    reset between trials, trial N+1's evaluator sees trial N's mutations and
    can either spuriously pass (state already matches the target) or fail in
    weird ways (the target product was already disabled, etc.).

    This calls our own setup-webarena.sh, which does `docker rm -f && docker
    run` from the original image. ~25s per call (Magento boot). Total
    overhead at 90 trials ≈ 38 min, which is real but acceptable for a clean
    signal.
    """
    print(f"[runner_ccc] resetting shopping_admin (~{RESET_WAIT_SEC}s)...")
    r = subprocess.run(
        ["bash", str(SETUP_SCRIPT), "reset", "shopping_admin"],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(
            f"shopping_admin reset failed (exit {r.returncode}):\n"
            f"--- stderr ---\n{r.stderr[-1000:]}"
        )


def point_browse_at_chromium() -> None:
    """Tell the browse daemon to attach to our Chromium via CDP."""
    subprocess.run(["browse", "stop"], capture_output=True)
    r = subprocess.run(
        ["browse", "env", "local", str(CDP_PORT)],
        capture_output=True, text=True, check=True,
    )
    # Output is JSON-ish but we don't need to parse it; surface a hint on failure
    if "cdp" not in r.stdout.lower():
        print(f"[runner_ccc] browse env local 9222 said: {r.stdout.strip()}", file=sys.stderr)


def run_one_trial(
    task_id: str,
    arm: str,
    seed: int,
    model: str,
    max_turns: int,
    max_budget_usd: float,
    timeout_sec: int,
    traces_dir: Path,
    dry_run: bool = False,
    reset_state: bool = True,
) -> TrialResult:
    if dry_run:
        return TrialResult(
            task_id=task_id, arm=arm, seed=seed, model=model,
            success=False, partial_score=0.0, wall_clock_sec=0.0,
            tokens_in=0, tokens_out=0, cost_usd=0.0, n_steps=0,
            trace_path=None, renderer_version=renderer_version(),
            error="dry-run",
            runner="ccc",
        )

    # Late imports: pulling browsergym/playwright is heavy, we want --help fast.
    from playwright.sync_api import sync_playwright
    from browsergym.webarena.task import GenericWebArenaTask

    if reset_state:
        reset_shopping_admin()

    task_int = _task_int(task_id)
    workdir = Path(tempfile.mkdtemp(prefix=f"ccc-trial-{task_int}-{arm}-seed{seed}-"))
    error: str | None = None
    claude_out: dict[str, Any] = {}
    score = 0.0

    try:
        install_skill(arm, task_id, workdir)

        with stopwatch() as elapsed:
            with sync_playwright() as pw:
                browser = pw.chromium.launch(
                    headless=True,
                    args=[f"--remote-debugging-port={CDP_PORT}"],
                )
                ctx = browser.new_context(
                    viewport={"width": 1280, "height": 720},
                )
                page = ctx.new_page()
                try:
                    # Login + navigate to start_url
                    task = GenericWebArenaTask(seed=seed, task_id=task_int)
                    intent, _ = task.setup(page)
                    print(f"[runner_ccc] task.setup done, intent: {intent}")

                    # Hand the browser off to CCC
                    point_browse_at_chromium()
                    claude_out = spawn_claude(
                        _build_prompt(intent),
                        workdir, model, max_turns, max_budget_usd, timeout_sec,
                    )
                    print(f"[runner_ccc] claude exit: {claude_out.get('_exit')}, "
                          f"turns: {claude_out.get('num_turns')}, "
                          f"cost: ${claude_out.get('total_cost_usd', 0):.3f}")

                    # Score: webarena's evaluator against the live page.
                    #
                    # Critical: playwright's Page.url is cached. When the browse
                    # daemon navigates the same Chrome target via CDP (outside
                    # pw's control), pw doesn't auto-sync — page.url returns
                    # the URL pw remembers from its own last navigation, NOT
                    # the actual current location. webarena's URLEvaluator
                    # reads page.url and gets the stale value, so url_match
                    # always fails (the gold URL won't be a substring of an
                    # unrelated stale URL).
                    #
                    # Workaround: force a CDP roundtrip via page.evaluate
                    # before validate. That repopulates pw's cached state.
                    try:
                        real_url = page.evaluate("window.location.href")
                        print(f"[runner_ccc] live URL (post-CDP-sync): {real_url}")
                        score, _done, msg, _info = task.validate(page, chat_messages=[])
                        print(f"[runner_ccc] validate score: {score}, msg: {msg[:120] if msg else ''}")
                    except Exception as e:
                        error = f"validate failed: {type(e).__name__}: {e}"
                        score = 0.0
                finally:
                    subprocess.run(["browse", "stop"], capture_output=True)
                    browser.close()
            wall = elapsed()

        # Persist the raw CCC output for debugging
        (workdir / "claude-output.json").write_text(json.dumps(claude_out, indent=2))

        # Error sources, in priority: stopwatched exception > CCC error > validate error
        if error is None and claude_out.get("is_error"):
            error = f"CCC error: {claude_out.get('result', '(no msg)')[:200]}"

        return TrialResult(
            task_id=task_id, arm=arm, seed=seed, model=model,
            success=(score >= 0.999),
            partial_score=float(score),
            wall_clock_sec=wall,
            tokens_in=int(claude_out.get("usage", {}).get("input_tokens", 0) or 0),
            tokens_out=int(claude_out.get("usage", {}).get("output_tokens", 0) or 0),
            cost_usd=float(claude_out.get("total_cost_usd", 0.0)),
            n_steps=int(claude_out.get("num_turns", 0) or 0),
            trace_path=str(workdir),
            renderer_version=renderer_version(),
            error=error,
            runner="ccc",
        )
    except Exception as e:  # noqa: BLE001
        traceback.print_exc()
        return TrialResult(
            task_id=task_id, arm=arm, seed=seed, model=model,
            success=False, partial_score=0.0, wall_clock_sec=0.0,
            tokens_in=0, tokens_out=0, cost_usd=0.0, n_steps=0,
            trace_path=str(workdir),
            renderer_version=None,
            error=f"{type(e).__name__}: {e}",
            runner="ccc",
        )


def write_csv(results: list[TrialResult], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not results:
        return
    fieldnames = list(results[0].to_dict().keys())
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in results:
            w.writerow(r.to_dict())


def load_tasks(cfg_path: Path, limit: int | None) -> list[dict[str, Any]]:
    raw = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or []
    if limit is not None:
        raw = raw[:limit]
    return raw


def main() -> None:
    load_dotenv(EVAL_ROOT / ".env")

    p = argparse.ArgumentParser(description="Run Skill Recorder eval through Claude Code CLI.")
    p.add_argument("--config", type=Path, default=TASKS_CFG)
    p.add_argument("--tasks-limit", type=int)
    p.add_argument("--arms", default=",".join(ARMS))
    p.add_argument("--seeds", default="0")
    p.add_argument("--model", default="sonnet",
                   help="claude alias ('sonnet'/'opus'/'haiku') or full id (e.g. claude-sonnet-4-6)")
    p.add_argument("--max-turns", type=int, default=40,
                   help="Cap CCC turns per trial.")
    p.add_argument("--max-budget-usd", type=float, default=1.0,
                   help="Per-trial cost guardrail; CCC aborts when exceeded.")
    p.add_argument("--timeout-sec", type=int, default=900,
                   help="Per-trial wall-clock timeout (subprocess level).")
    p.add_argument("--smoke", action="store_true",
                   help="One task / one seed / cold arm only.")
    p.add_argument("--dry-run", action="store_true",
                   help="Skip env + CCC; write stub rows.")
    p.add_argument("--no-reset", action="store_true",
                   help="Skip shopping_admin reset before each trial. Use only when "
                        "debugging — without reset, mutations from previous trials "
                        "leak into the next and reward gets noisy.")
    args = p.parse_args()

    if args.smoke:
        args.tasks_limit = 1
        args.seeds = "0"
        args.arms = "cold"

    tasks = load_tasks(args.config, args.tasks_limit)
    if not tasks:
        sys.exit(f"no tasks in {args.config}")
    arms = [a.strip() for a in args.arms.split(",") if a.strip()]
    seeds = [int(s) for s in args.seeds.split(",")]

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = RESULTS_ROOT / timestamp
    traces_dir = run_dir / "traces"
    traces_dir.mkdir(parents=True, exist_ok=True)

    total = len(tasks) * len(arms) * len(seeds)
    print(f"[runner_ccc] {total} trials → {run_dir} (model={args.model})")

    results: list[TrialResult] = []
    for task in tasks:
        task_id = task["id"]
        for arm in arms:
            for seed in seeds:
                idx = len(results) + 1
                print(f"\n[runner_ccc] {idx}/{total}  {task_id} / {arm} / seed={seed}")
                r = run_one_trial(
                    task_id, arm, seed, args.model, args.max_turns,
                    args.max_budget_usd, args.timeout_sec, traces_dir,
                    dry_run=args.dry_run,
                    reset_state=not args.no_reset,
                )
                results.append(r)
                print(f"[runner_ccc]   → success={r.success} score={r.partial_score:.2f} "
                      f"wall={r.wall_clock_sec:.1f}s cost=${r.cost_usd:.3f} "
                      f"err={r.error or '-'}")

    write_csv(results, run_dir / "runs.csv")
    print(f"\n[runner_ccc] wrote {len(results)} rows → {run_dir / 'runs.csv'}")


if __name__ == "__main__":
    main()
