# Skill Recorder evaluation pipeline

Quantitative evaluation of "Skill Recorder + one human demonstration" vs "cold agent" on a multi-task web automation benchmark.

**Benchmark:** WebArena, **MVP scope = `shopping_admin` (Magento back-office) only** (~180 of the 812 tasks). We pick 10 from this subset.

> This sub-project replaces the original WorkArena plan (see `docs/eval-plan.md` §44-77 for the rationale). The architecture is unchanged; only **task selection** (Step 2) and **oracle synthesis** (Step 3) are WebArena-specific.

### Why single-domain for MVP

Real per-service tar sizes are an order of magnitude larger than the original WebArena README implied (shopping 62.9 GB, gitlab 72.4 GB, postmill 49.8 GB, shopping_admin 9.0 GB; full stack ≈ 390 GB on disk after `docker load`). Local disk constraints make single-service the only safe default. See `docs/webarena-setup.md` for the size table and how to opt the larger services in.

The story narrows from "general web automation" to "Magento back-office workflows" — a legitimate niche (e-commerce ops, merchandisers spending the day in admin panels), but reviewers will ask "why one domain?" The answer is: physical disk, not benchmark scope.

## Status

| Step | What | State |
|---|---|---|
| 1 | WebArena Docker setup (`shopping_admin` only) | script ready — user runs `./docker/setup-webarena.sh up` (~9 GB download) |
| 2 | Pick 10 tasks from `shopping_admin` subset | in progress — filtering WebArena's `test.raw.json` for Magento tasks |
| 3 | Oracle SKILL.md (A + C mixed) | scaffolded — `trace_to_skill()` blocks on a real WebArena trace |
| 4 | Human SKILL.md (10 recordings) | blocked on Step 1 + CRX install |
| 5 | Agent wrapper | scaffolded + dry-run verified |
| 6 | Runner | scaffolded + dry-run verified |
| 7 | Reporter | scaffolded + dry-run verified |
| 8 | Validate (smoke + full 90 runs) | blocked on Steps 1-4 |

## Quickstart (after WebArena is up)

```bash
# 1. Python environment
cd eval
cp .env.example .env && $EDITOR .env
# uv (recommended) or stock pip:
uv venv && source .venv/bin/activate && uv sync
# (or: python3 -m venv .venv && source .venv/bin/activate && pip install -e .)

# 2. Build the renderer CLI (so oracle_synth.py can call it from Python).
pnpm --filter @skill-recorder/render build   # creates packages/skill-render/dist/cli.js

# 3. Bring up WebArena (see docs/webarena-setup.md).
docker compose -f docker/docker-compose.yml up -d
# Wait ~3 minutes for first boot.

# 4. Smoke: one task, one arm, one seed.
python -m src.runner --tasks-limit 1 --seeds 0 --smoke

# 5. Full MVP run (10 tasks × 3 arms × 3 seeds = 90 trials).
python -m src.runner --config tasks/selection.yaml --seeds 0,1,2

# 6. Aggregate + report.
python -m src.reporter --run results/runs/<timestamp>
open results/reports/<timestamp>.md
```

## Three arms

| Arm | What | Source |
|---|---|---|
| **Cold** | Default system prompt, no SKILL.md | Baseline (`src/agents/cold.py`) |
| **Oracle** | Mechanically-synthesized "ideal" SKILL.md | `src/oracle_synth.py` — A + C mixed strategy (see below) |
| **Human** | Skill Recorder–recorded demonstration | Manually placed in `skills/human/{task_id}.SKILL.md` |

Every arm uses the **same** Claude backbone behind AgentLab's `GenericAgent`. The only variable is the SKILL.md content injected into the prompt.

## Oracle strategy on WebArena (A + C mixed)

Unlike WorkArena, **WebArena tasks have no built-in `cheat()` function** — the benchmark only checks final state, not the trajectory taken. So we synthesize "oracle" SKILL.md two ways and combine:

- **A. Published reference trajectories** — WebArena's repo ships a subset of annotated human demonstrations (`.json` traces). For tasks we picked that have a ref trace, we replay it to produce the action sequence, then render it as a SKILL.md via the same Node CLI the CRX uses.
- **C. Hand-authored oracle** — for the remaining tasks (~5 of 10), we write the SKILL.md by hand, modeled on what an expert would record in one perfect take.

Both paths feed `src/oracle_synth.py`, which always emits via `skill-render` so format stays identical to human recordings.

## Repo layout

```
eval/
├── docs/webarena-setup.md       # Docker setup, ports, troubleshooting
├── tasks/selection.yaml         # 10 chosen webarena.* task_ids + metadata
├── skills/
│   ├── oracle/{task_id}.SKILL.md
│   └── human/{task_id}.SKILL.md
├── src/
│   ├── render.py                # Calls dist/cli.js from Python
│   ├── oracle_synth.py          # Reference-trace → SKILL.md (path A); validator for path C
│   ├── agents/
│   │   ├── base.py              # Anthropic-backed AgentLab agent
│   │   ├── cold.py              # arm A
│   │   └── skill_equipped.py    # arms B/C
│   ├── runner.py                # Loop over tasks × arms × seeds
│   ├── scorer.py                # Wraps WebArena reward + adds wall/tokens
│   └── reporter.py              # runs.csv → Markdown report + heatmap
└── results/
    ├── runs/{timestamp}/runs.csv
    └── reports/{timestamp}.md
```

## Constraints worth knowing

- **Sequential, not parallel.** Each WebArena container holds mutable state; running two trials against the same Postmill instance at once breaks reward determinism.
- **Reset between trials.** The runner resets each WebArena service's state before every trial (per WebArena docs; usually a docker container restart or a reset script).
- **API budget.** 10 tasks × 3 arms × 3 seeds × ~6k tokens/trial ≈ \$30–50 with Claude opus-4-7. Sonnet-4-6 cuts that ~4×.
- **No CI.** Experiments are run manually. Reports go in `results/reports/`.

## See also

- `../docs/eval-plan.md` — original plan
- `../docs/design-followups.md` §1 — render CLI design (the Python bridge we depend on)
- `../docs/design-followups.md` §3 — `video-skills × eval` follow-up (procedural vs guidance evaluation)
