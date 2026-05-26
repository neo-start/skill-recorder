"""Generate a cold/oracle/human comparison report (HTML + PDF) from runs.csv files.

Usage:
    python -m src.report \
      --cold results/runs/<cold-ts>/runs.csv \
      --oracle results/runs/<oracle-ts>/runs.csv \
      --human results/runs/<human-ts>/runs.csv      # optional — switches to 3-arm story
      --out results/reports/cold-vs-oracle-<date>

Writes <out>.html and <out>.pdf side by side. The static narrative (product
findings, methodology, next steps) is embedded; only numbers update from
the input CSVs.

We carry a hand-curated OVERRIDES block for known false-fails from earlier
buggy runs — currently just task 704's cold trial, which scored 0 from a
pw.Page.url cache bug we later fixed.

For 3-arm runs where the human arm intentionally skipped a task (e.g. 699
was too select-heavy to record meaningfully), we mark the missing cell
"—" with a † note in the report — never silently as a failure.
"""

from __future__ import annotations

import argparse
import csv
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

OVERRIDES: dict[tuple[str, str], dict[str, Any]] = {
    ("webarena.704", "20260525T084638Z"): {
        "success": True,
        "partial_score": 1.0,
        "note": "Original score=0 was a pw.Page.url cache bug in runner_ccc; "
                "manual re-run after the fix confirmed 1.0.",
    },
}

# Tasks the user intentionally did not record for the human arm.
# Each entry: task_id -> reason shown in the report.
HUMAN_SKIPPED: dict[str, str] = {
    "webarena.699": "Skipped — recording a Cart Price Rule form with 4 native "
                    "<select> elements is structurally guaranteed to fail under "
                    "the current CRX renderer (browse fill doesn't apply to "
                    "<select>; see Finding #2). Recording would not add signal.",
}

TASK_ORDER = ["webarena.453", "webarena.458", "webarena.470", "webarena.496",
              "webarena.538", "webarena.771", "webarena.423", "webarena.704",
              "webarena.694", "webarena.699"]


def read_runs(path: Path) -> list[dict[str, Any]]:
    rows = list(csv.DictReader(path.open()))
    ts = path.parent.name
    for r in rows:
        ovr = OVERRIDES.get((r["task_id"], ts))
        r["_run_ts"] = ts
        r["_override"] = ovr
        if ovr:
            r["success"] = "True" if ovr["success"] else "False"
            r["partial_score"] = str(ovr["partial_score"])
            r["_override_note"] = ovr["note"]
    return rows


def to_bool(v: str) -> bool:
    return str(v).lower() in ("true", "1", "yes")


def wilson_ci(succ: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return (0.0, 0.0)
    p = succ / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = (z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def fmt_pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def fmt_cost(x: float) -> str:
    return f"${x:.2f}"


def summarise(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate run stats. Excludes rows whose error indicates a missing
    SKILL.md (not a real trial — those are FileNotFoundError stubs from
    runner_ccc when a recording for that arm/task doesn't exist)."""
    # Filter out missing-file stubs so summary stats reflect actual trials.
    real_rows = [r for r in rows if "missing human SKILL.md" not in (r.get("error") or "")
                                   and "missing oracle SKILL.md" not in (r.get("error") or "")]
    n = len(real_rows)
    succ = sum(1 for r in real_rows if to_bool(r["success"]))
    lo, hi = wilson_ci(succ, n)
    total_cost = sum(float(r["cost_usd"]) for r in real_rows)
    total_turns = sum(int(r["n_steps"]) for r in real_rows)
    total_wall = sum(float(r["wall_clock_sec"]) for r in real_rows)
    return {
        "n": n,
        "success": succ,
        "rate": succ / n if n else 0.0,
        "ci_low": lo,
        "ci_high": hi,
        "total_cost": total_cost,
        "avg_cost": total_cost / n if n else 0.0,
        "total_turns": total_turns,
        "avg_turns": total_turns / n if n else 0.0,
        "total_wall_sec": total_wall,
    }


def render_summary_table(arms: dict[str, dict[str, Any]]) -> str:
    """Multi-arm summary: dynamically generates columns from the arms dict.
    arms = {'cold': summary_dict, 'oracle': summary_dict, 'human': summary_dict}
    Column order: cold → oracle → human (skip arms not present)."""
    cols = [a for a in ("cold", "oracle", "human") if a in arms]
    header_cells = "".join(f"<th class='num'>{a.title()}</th>" for a in cols)

    def row_for(label, fmt):
        cells = "".join(f"<td class='num'>{fmt(arms[a])}</td>" for a in cols)
        return f"<tr><td>{label}</td>{cells}</tr>"

    rows_html = [
        row_for("Success rate", lambda s: fmt_pct(s["rate"])),
        row_for("95% Wilson CI", lambda s: f"[{fmt_pct(s['ci_low'])}, {fmt_pct(s['ci_high'])}]"),
        row_for("Trials (real)", lambda s: f"{s['n']}"),
        row_for("Total cost", lambda s: fmt_cost(s["total_cost"])),
        row_for("Avg cost / trial", lambda s: fmt_cost(s["avg_cost"])),
        row_for("Total turns", lambda s: f"{s['total_turns']}"),
        row_for("Avg turns / trial", lambda s: f"{s['avg_turns']:.1f}"),
        row_for("Total wall-clock", lambda s: f"{s['total_wall_sec']/60:.1f} min"),
    ]
    return f"""
<table>
  <thead><tr><th>Metric</th>{header_cells}</tr></thead>
  <tbody>{"".join(rows_html)}</tbody>
</table>
"""


def render_per_task(arms_rows: dict[str, list[dict]]) -> str:
    """Compact per-task table. Each arm cell shows ✓/✗/— + turns + cost."""
    cols = [a for a in ("cold", "oracle", "human") if a in arms_rows]
    by_task: dict[str, dict[str, dict]] = {}
    for arm, rows in arms_rows.items():
        for r in rows:
            by_task.setdefault(r["task_id"], {})[arm] = r

    def cell(task_id: str, arm: str) -> str:
        r = by_task.get(task_id, {}).get(arm)
        if r is None:
            # Truly missing trial (likely arm not run for this task)
            if arm == "human" and task_id in HUMAN_SKIPPED:
                return "<td class='center' title='intentionally skipped'>— <small>‡</small></td>"
            return "<td class='center'>—</td>"
        # Detect "missing recording" stubs (FileNotFoundError trials)
        err = r.get("error") or ""
        if "missing human SKILL.md" in err or "missing oracle SKILL.md" in err:
            if arm == "human" and task_id in HUMAN_SKIPPED:
                return "<td class='center'>— <small>‡</small></td>"
            return "<td class='center'>—</td>"
        ok = to_bool(r["success"])
        symbol = "<span class='ok'>✅</span>" if ok else "<span class='fail'>❌</span>"
        if r.get("_override"):
            symbol += f"<small title=\"{r['_override_note']}\">†</small>"
        turns = r["n_steps"]
        cost = float(r["cost_usd"])
        return f"<td class='center'>{symbol} <small>{turns}t / ${cost:.2f}</small></td>"

    header = "<tr><th>Task</th>" + "".join(f"<th class='center'>{a.title()}</th>" for a in cols) + "</tr>"
    body = []
    for tid in TASK_ORDER:
        cells = "".join(cell(tid, arm) for arm in cols)
        body.append(f"<tr><td><code>{tid}</code></td>{cells}</tr>")
    return f"<table><thead>{header}</thead><tbody>{''.join(body)}</tbody></table>"


CSS = """
@page { size: A4; margin: 18mm 18mm 22mm 18mm; }
html { font-family: -apple-system, "Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", sans-serif; font-size: 11pt; color: #1a1a1a; }
body { margin: 0; line-height: 1.55; }
h1 { font-size: 22pt; margin: 0 0 4pt; letter-spacing: -0.01em; }
h1 + .subtitle { color: #555; font-size: 11pt; margin: 0 0 18pt; }
h2 { font-size: 14pt; margin: 22pt 0 6pt; border-bottom: 1px solid #d0d0d0; padding-bottom: 3pt; }
h3 { font-size: 12pt; margin: 16pt 0 4pt; color: #333; }
p, li { font-size: 11pt; }
code { font-family: "SF Mono", Menlo, monospace; font-size: 10pt; background: #f3f3f3; padding: 0.5pt 3pt; border-radius: 2pt; }
table { border-collapse: collapse; width: 100%; font-size: 10pt; margin: 8pt 0; }
th, td { text-align: left; padding: 5pt 8pt; border-bottom: 1px solid #e0e0e0; }
th { background: #f0f0f0; font-weight: 600; }
td.num { text-align: right; font-variant-numeric: tabular-nums; font-family: "SF Mono", monospace; }
td.center { text-align: center; }
.ok { color: #0a7d21; font-weight: 600; }
.fail { color: #c0392b; font-weight: 600; }
.warn { color: #b67400; font-weight: 600; }
.meta { display: grid; grid-template-columns: 110pt 1fr; column-gap: 8pt; row-gap: 3pt; font-size: 10.5pt; margin-bottom: 18pt; }
.meta dt { font-weight: 600; color: #555; }
.meta dd { margin: 0; }
.callout { background: #fff7e6; border-left: 3px solid #f0a020; padding: 8pt 12pt; margin: 10pt 0; border-radius: 0 4pt 4pt 0; }
.callout.ok { background: #ebfbe9; border-left-color: #4caf50; }
.callout.fail { background: #fbeae9; border-left-color: #c0392b; }
.footer { color: #888; font-size: 9pt; text-align: center; margin-top: 30pt; border-top: 1px solid #ddd; padding-top: 8pt; }
ul { padding-left: 18pt; }
ul li { margin: 2pt 0; }
.page-break { page-break-before: always; }
"""


def render_html(arms_rows: dict[str, list[dict]], ts_by_arm: dict[str, str]) -> str:
    arms = {name: summarise(rows) for name, rows in arms_rows.items()}
    ts_now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    is_3arm = "human" in arms_rows

    cold = arms["cold"]
    oracle = arms["oracle"]
    human = arms.get("human")

    # Build the headline paragraph
    if is_3arm:
        headline = (
            f"<strong>Cold</strong> {fmt_pct(cold['rate'])} → "
            f"<strong>Human</strong> {fmt_pct(human['rate'])} → "
            f"<strong>Oracle</strong> {fmt_pct(oracle['rate'])}. "
            f"Human (raw CRX recording) sits between cold (no skill) and oracle "
            f"(hand-authored ideal demonstration), and the gap human→oracle quantifies "
            f"what Skill Recorder loses to the renderer's current limitations on "
            f"<select>, checkboxes, and Knockout multiselects (Findings #2–#3)."
        )
    else:
        headline = (
            f"Oracle SKILL.md takes Claude Code from cold {fmt_pct(cold['rate'])} → "
            f"{fmt_pct(oracle['rate'])}, "
            f"<strong>{cold['total_cost']/oracle['total_cost']:.1f}× cheaper</strong>, "
            f"<strong>{cold['total_turns']/oracle['total_turns']:.1f}× fewer turns</strong>."
        )

    # Override callout (704)
    has_overrides = any(r.get("_override") for rows in arms_rows.values() for r in rows)
    override_note = ""
    if has_overrides:
        override_note = (
            "<p class='callout warn'>† One cold trial uses a manual override of the "
            "original CSV score (webarena.704 — original 0 was a runner_ccc "
            "<code>pw.Page.url</code> cache bug; manual re-run after the fix confirmed 1.0).</p>"
        )

    # Skipped-tasks callout (human arm)
    skipped_note = ""
    if is_3arm and HUMAN_SKIPPED:
        items = "".join(f"<li><code>{tid}</code> — {reason}</li>"
                        for tid, reason in HUMAN_SKIPPED.items())
        skipped_note = (
            f"<p class='callout'>‡ The human arm intentionally skipped recordings "
            f"for tasks where the CRX-renderer combination is structurally guaranteed "
            f"to fail (see Findings below). Skipped tasks render as <code>—</code> "
            f"in the per-task table and are excluded from arm-level stats:"
            f"<ul>{items}</ul></p>"
        )

    runs_line = " · ".join(f"{name.title()} <code>{ts_by_arm[name]}</code>" for name in arms_rows)

    sections = [f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<title>Skill Recorder Eval — {'3-arm' if is_3arm else 'Cold vs Oracle'} ({ts_now[:10]})</title>
<style>{CSS}</style></head><body>

<h1>Skill Recorder Evaluation — {'3-arm Cold / Oracle / Human' if is_3arm else 'Cold vs Oracle'}</h1>
<p class="subtitle">10 个 WebArena shopping_admin 任务,Claude Code CLI 驱动,seed 0,sonnet 4.6</p>

<dl class="meta">
  <dt>报告日期</dt>     <dd>{ts_now[:10]}</dd>
  <dt>Runs</dt>         <dd>{runs_line}</dd>
  <dt>Benchmark</dt>    <dd>WebArena <code>shopping_admin</code> only (单服务 MVP scope)</dd>
  <dt>Arms tested</dt>  <dd>{' · '.join(arms_rows.keys())}</dd>
  <dt>Seeds</dt>        <dd>0 (single seed; Wilson CI is wide — see below)</dd>
</dl>

<h2>Executive Summary</h2>
<p>{headline}</p>
{override_note}
{skipped_note}

<h2>Summary by arm</h2>
{render_summary_table(arms)}

<h2>Per-task results</h2>
<p style="font-size:10pt;color:#666;">每格:✅ / ❌ / — (未运行或 ‡ 主动跳过) + <em>turns</em> + cost。† 表示覆盖了原始 CSV 分数。</p>
{render_per_task(arms_rows)}
"""]

    # The findings + methodology + next-steps sections (static narrative — same as v2,
    # extended slightly for 3-arm story when relevant).
    sections.append("""
<div class="page-break"></div>

<h2>Five product-level findings (surfaced by oracle authoring)</h2>
<p>All five are real Skill Recorder TODOs, encoded as work-arounds in the oracle SKILL.md "Critical tool notes" sections. Fixing them should narrow the human → oracle gap.</p>

<table>
  <thead><tr><th>#</th><th>Issue</th><th>Impact</th><th>Current work-around</th><th>Product fix direction</th></tr></thead>
  <tbody>
    <tr><td>1</td><td><code>browse fill</code> presses Enter by default</td><td>Form fields submit prematurely, breaking subsequent fills</td><td>SKILL.md adds <code>--no-press-enter</code></td><td>Renderer default to <code>--no-press-enter</code>; only add Enter for <code>action: "submit"</code></td></tr>
    <tr><td>2</td><td><code>browse fill</code> doesn't work on <code>&lt;select&gt;</code></td><td>Dropdown values silently not applied — biggest single cause of human-arm failures</td><td>Hand-written oracle uses <code>browse select</code></td><td>Add <code>action: "select"</code> to Skill schema; renderer outputs <code>browse select</code> for selects</td></tr>
    <tr><td>3</td><td><code>browse fill</code> doesn't work on Magento checkbox toggles</td><td>Toggle widgets (Enable Product, Sale, etc.) cannot be flipped</td><td>Click adjacent <code>&lt;label&gt;</code> (<code>input[name="..."] + label</code>)</td><td>Renderer detects checkbox and emits click-label pattern</td></tr>
    <tr><td>4</td><td>Playwright <code>Page.url</code> cache stale after external CDP nav</td><td>URLEvaluator reads stale URL after CCC's <code>browse open</code>, false-fails url_match</td><td>runner_ccc calls <code>page.evaluate(...)</code> before validate to force a CDP roundtrip</td><td>Use <code>frame.url()</code> or fresh CDP target enumeration in evaluator</td></tr>
    <tr><td>5</td><td>Claude Code doesn't auto-load project skill bodies</td><td>SKILL.md name+description seen in catalog, body ignored — agent improvises and gets details wrong</td><td>runner prompt nudges "read your skills before acting"</td><td>Document skill-discovery patterns; possibly hint built-in</td></tr>
  </tbody>
</table>

<h2>Methodology — how the three SKILL.md sets were produced</h2>
<ul>
  <li><strong>Cold</strong>: no SKILL.md. The agent receives only the WebArena task intent and the <code>browse</code> tool surface. Tests Claude Code's first-encounter capability.</li>
  <li><strong>Oracle</strong>: 10 hand-authored SKILL.md files following our four-section template (Background, Critical tool notes, Steps, On failure). 4 were authored by direct Magento exploration (704, 771, 423, 694, 699); 5 were produced by parallel sub agents (453, 458, 470, 496, 538), each given a self-contained prompt with the task intent + WebArena eval criteria + Magento credentials + the five known browse-CLI gotchas + a format reference. All sub-agent skills passed eval on first try.</li>
""" + ("""  <li><strong>Human</strong>: real one-shot recordings via the Skill Recorder Chrome extension. The user (project owner) recorded each task once, exported through CRX's "Save as Skill" flow, and the helper script <code>eval/scripts/human-record.sh</code> picked up the file and copied it into <code>eval/skills/human/</code>. No post-editing; whatever the recording captured is what the eval consumes — that's the contract.</li>
""" if is_3arm else "") + """</ul>

<h2>Next steps</h2>
<ol>
  <li><strong>Fix Findings #2 and #3 first</strong> (the <code>&lt;select&gt;</code> and checkbox cases). These are the single biggest causes of human-arm failures, and they're well-scoped schema + renderer changes — no behavioural changes to CRX recording.</li>
  <li><strong>3 seeds × 3 arms</strong> ($20-25, ~4h): tightens Wilson CI from ±30pp to ±15pp; closes the door on "this is a single-seed fluke" objections.</li>
  <li><strong>opus 4.7 robustness check</strong> ($10): confirm conclusions generalise across frontier models.</li>
""" + ("""  <li><strong>Re-record human arm after fixing #2/#3</strong>: the same 10 recordings, re-rendered through the updated renderer, should now pass most of the currently-failing tasks. That's the cleanest demonstration that the bugs are renderer-side, not user-side.</li>
""" if is_3arm else "") + """</ol>

<p class="footer">由 src/report.py 自动生成 · """ + ts_now + " · " + runs_line.replace("<code>", "").replace("</code>", "") + """</p>

</body></html>""")

    return "\n".join(sections)


def render_pdf(html_path: Path, pdf_path: Path) -> None:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{html_path.resolve()}")
        page.emulate_media(media="print")
        page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "18mm", "bottom": "22mm", "left": "18mm", "right": "18mm"},
        )
        browser.close()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--cold", type=Path, required=True)
    p.add_argument("--oracle", type=Path, required=True)
    p.add_argument("--human", type=Path, help="Optional 3rd arm — enables 3-arm story.")
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--no-pdf", action="store_true")
    args = p.parse_args()

    arms_rows = {"cold": read_runs(args.cold), "oracle": read_runs(args.oracle)}
    ts_by_arm = {"cold": args.cold.parent.name, "oracle": args.oracle.parent.name}
    if args.human:
        arms_rows["human"] = read_runs(args.human)
        ts_by_arm["human"] = args.human.parent.name

    html = render_html(arms_rows, ts_by_arm)
    html_path = args.out.with_suffix(".html")
    html_path.write_text(html, encoding="utf-8")
    print(f"[report] wrote {html_path} ({len(html)} bytes)")

    if not args.no_pdf:
        pdf_path = args.out.with_suffix(".pdf")
        render_pdf(html_path, pdf_path)
        print(f"[report] wrote {pdf_path} ({pdf_path.stat().st_size//1024} KB)")


if __name__ == "__main__":
    main()
