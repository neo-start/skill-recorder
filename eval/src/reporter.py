"""Aggregate runs.csv into a Markdown report.

Two views per report:
- **Summary** — one row per arm with mean success/wall-clock/cost (+ 95% Wilson CI on success rate).
- **Task breakdown** — one row per task × arm with per-cell success rate.

We also print two wall-clock columns (success-only vs all trials) per the
`design-followups.md` §2 note: cold-arm trials that hit the step budget
inflate the mean if you don't separate them out.
"""

from __future__ import annotations

import argparse
import math
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

EVAL_ROOT = Path(__file__).resolve().parents[1]
REPORTS_ROOT = EVAL_ROOT / "results" / "reports"


def wilson_ci(successes: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """95% Wilson score interval for a binomial proportion."""
    if n == 0:
        return (0.0, 0.0)
    p = successes / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = (z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def fmt_pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def per_arm_summary(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for arm, sub in df.groupby("arm"):
        n = len(sub)
        successes = int(sub["success"].sum())
        rate = successes / n if n else 0.0
        lo, hi = wilson_ci(successes, n)
        wall_all = sub["wall_clock_sec"].mean()
        succ_mask = sub["success"].astype(bool)
        wall_succ = sub.loc[succ_mask, "wall_clock_sec"].mean() if succ_mask.any() else float("nan")
        rows.append({
            "arm": arm,
            "n": n,
            "success_rate": rate,
            "ci_low": lo,
            "ci_high": hi,
            "wall_clock_succ_only_sec": wall_succ,
            "wall_clock_all_sec": wall_all,
            "tokens_in_avg": sub["tokens_in"].mean(),
            "tokens_out_avg": sub["tokens_out"].mean(),
            "cost_usd_total": sub["cost_usd"].sum(),
        })
    # Stable order so the report is reproducible.
    order = {"cold": 0, "oracle": 1, "human": 2}
    rows.sort(key=lambda r: order.get(r["arm"], 99))
    return pd.DataFrame(rows)


def per_task_breakdown(df: pd.DataFrame) -> pd.DataFrame:
    pivot = df.pivot_table(
        index="task_id",
        columns="arm",
        values="success",
        aggfunc="mean",
    )
    pivot.columns.name = None
    return pivot


def render_markdown(summary: pd.DataFrame, breakdown: pd.DataFrame, run_dir: Path) -> str:
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    lines: list[str] = []
    lines.append("# Skill Recorder eval report")
    lines.append("")
    lines.append(f"- **Generated:** {ts}")
    lines.append(f"- **Source:** `{run_dir}`")
    lines.append("")

    lines.append("## Summary by arm")
    lines.append("")
    summary_view = summary.copy()
    summary_view["success_rate"] = summary_view["success_rate"].apply(fmt_pct)
    summary_view["ci_low"] = summary_view["ci_low"].apply(fmt_pct)
    summary_view["ci_high"] = summary_view["ci_high"].apply(fmt_pct)
    summary_view["cost_usd_total"] = summary_view["cost_usd_total"].map(lambda x: f"${x:.2f}")
    summary_view["wall_clock_succ_only_sec"] = summary_view["wall_clock_succ_only_sec"].map(
        lambda x: f"{x:.1f}" if pd.notna(x) else "—"
    )
    summary_view["wall_clock_all_sec"] = summary_view["wall_clock_all_sec"].map(lambda x: f"{x:.1f}")
    lines.append(summary_view.to_markdown(index=False))
    lines.append("")

    lines.append("## Per-task success rate (mean across seeds)")
    lines.append("")
    bd_view = breakdown.copy().fillna(0.0)
    for col in bd_view.columns:
        bd_view[col] = bd_view[col].apply(fmt_pct)
    lines.append(bd_view.to_markdown())
    lines.append("")

    lines.append("## Notes")
    lines.append("")
    lines.append("- `wall_clock_succ_only_sec` excludes failed trials (which often hit the step-budget cap and inflate the mean).")
    lines.append("- `ci_low` / `ci_high` are the 95% Wilson interval on success rate; narrow CI ⇔ statistically meaningful gap.")
    lines.append("- Cost numbers are computed from `tokens_in / tokens_out` and the pricing table in `src/scorer.py`.")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    p = argparse.ArgumentParser(description="Aggregate runs.csv into a Markdown report.")
    p.add_argument("--run", required=True, type=Path, help="Path to results/runs/<timestamp>/")
    p.add_argument("--out", type=Path, help="Output Markdown path. Defaults to results/reports/<timestamp>.md")
    args = p.parse_args()

    csv_path = args.run / "runs.csv"
    if not csv_path.exists():
        raise SystemExit(f"no runs.csv at {csv_path}")
    df = pd.read_csv(csv_path)
    if df.empty:
        raise SystemExit(f"{csv_path} has no rows")

    summary = per_arm_summary(df)
    breakdown = per_task_breakdown(df)
    md = render_markdown(summary, breakdown, args.run)

    out = args.out or REPORTS_ROOT / f"{args.run.name}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(md, encoding="utf-8")
    print(f"[reporter] wrote {out}")


if __name__ == "__main__":
    main()
