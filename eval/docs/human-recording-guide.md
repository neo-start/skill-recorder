# Human Recording Guide

Skill Recorder Human Arm — recording session guide for the eval pipeline.

## Prerequisites

- Magento `shopping_admin` docker is up and healthy. If not, follow [`webarena-setup.md`](./webarena-setup.md) and run `./eval/docker/setup-webarena.sh up`.
- CRX dist is built at `/Users/neo/Stars/skill-recorder/apps/crx/dist/`. Verify version `0.1.20`:
  ```bash
  jq -r .version /Users/neo/Stars/skill-recorder/apps/crx/dist/manifest.json
  ```
  If missing or stale, rebuild: `pnpm --filter @skill-recorder/crx build`.
- Chrome is your default browser — the helper script uses `open <url>`, which routes to the OS default.
- Budget ~30–50 minutes total for 10 tasks (sanity loop + 9 more, plus modest exploration time).

## One-time CRX setup

1. Open `chrome://extensions` in Chrome.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select the folder `/Users/neo/Stars/skill-recorder/apps/crx/dist/` and confirm.
5. Confirm **Skill Recorder** appears in the Chrome toolbar and reports version `0.1.20` on the extensions page.
6. Open `chrome://settings/downloads` and turn **off** "Ask where to save each file before downloading".
   > Note: the CRX writes with `saveAs: false` into `~/Downloads/skill-recorder-skills/`. On some Chrome configs the global "Ask where to save" setting overrides that, so the helper script ends up not finding the file.
7. Open `http://localhost:7780/admin` and log in once as `admin` / `admin1234`. The session persists across recordings — the helper script's docker resets do not clear Chrome cookies. If Magento becomes unresponsive after a reset, just refresh the tab.

## Recording principles (the "honest test")

The whole point of this arm is to measure what the Skill Recorder product actually produces on first contact. Please keep to these:

- **One-shot.** No dry-runs. Whatever your first take produces is the recording we keep. We are measuring first-encounter quality, not your second-attempt quality.
- **No post-editing.** The CRX output goes straight into the eval. Don't open the `.SKILL.md` and "clean it up" — that contaminates the signal with human polishing.
- **Don't peek at oracle.** `eval/skills/oracle/*.SKILL.md` files contain hand-encoded gotchas (e.g. clicking label siblings for Magento toggles, `browse fill --no-press-enter` for date inputs). Reading them before recording leaks oracle quality into the human arm.
- **Modest exploration is FINE.** Discovering "which product is 1481" or "where the Reports menu lives" reflects real first-time usage and SHOULD be in your recording. Don't try to be artificially fast. A real user pokes around — capture that.

> Note: if you catch yourself thinking "this isn't a fair recording, let me try again", stop. That instinct is exactly the bias we're guarding against.

## Writing skill descriptions for discovery

Claude Code lists every available skill's `name` + `description` in its
catalog but doesn't auto-load the SKILL.md body until it decides the skill
is relevant. So the description you type into the Save dialog is the single
biggest lever for whether your skill gets used.

**Bad** (current default when you leave it blank):
> `Dashboard / Magento Admin`

**Good**:
> `When the task involves approving Magento product reviews in bulk, READ
> this skill's full body — it has the exact filter dropdown sequence, the
> row-text-anchored selectors, and the "Update Status" mass action steps.`

Patterns that nudge discovery:
- Open with **"When the task involves X"** — gives Claude Code a concrete
  trigger condition
- Mention specific **verbs and domain keywords** the user might type
  ("approve", "bulk-edit", "Magento", "product price")
- Tell Claude Code **to read the body** explicitly — e.g. "READ this
  skill's full body for exact selectors"
- Mention any **gotchas** the body covers ("includes the random-id row
  workaround"), so the description hints at unique value

Skip the description field at your peril — a blank one falls back to the
page title, which is almost never specific enough for discovery.

## Per-task workflow

For each of the 10 tasks:

1. In a terminal at the repo root, run:
   ```bash
   ./eval/scripts/human-record.sh <task_id>
   ```
   The script prints the task intent and opens Chrome to the right starting URL.

2. In Chrome, open the **Skill Recorder** side panel, start recording, complete the task, then click **✨ Save as Skill**. Give it a meaningful title — that title becomes the `name:` field in the SKILL.md frontmatter. Save.

3. Return to the terminal and press Enter. The script picks up the newest file from `~/Downloads/skill-recorder-skills/` and copies it to `eval/skills/human/webarena.<id>.SKILL.md`.

Useful flags:

```bash
./eval/scripts/human-record.sh --status   # which task_ids are already recorded
./eval/scripts/human-record.sh --all      # iterate every pending task in turn
```

## Sanity-check loop (DO THIS FIRST)

Before grinding through all 10, validate your setup end-to-end on the easiest task.

Task **458** is the simplest: open product `1481`, change its price from `$32.00` to `$27.00`, save.

```bash
./eval/scripts/human-record.sh 458
```

Then:

- The script should report success with the SKILL.md file size and a captured step count.
- Open `eval/skills/human/webarena.458.SKILL.md` and skim it. There should be a coherent sequence of steps (navigate, search, open product, edit field, save).
- If the file is empty or only has 1–2 steps, recording didn't actually capture — likely the CRX wasn't recording, or you were in the wrong tab. Fix it and re-record before continuing.

Only after this sanity loop passes, record the other 9.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| CRX won't load, toolbar icon missing | dist out of date or Chrome cached old build | rebuild `pnpm --filter @skill-recorder/crx build`, then reload the extension at `chrome://extensions` |
| No file appears in `~/Downloads/skill-recorder-skills/` after Save | Chrome "Ask where to save" setting is overriding the CRX | turn it off at `chrome://settings/downloads` |
| Helper script complains "frontmatter missing name:" | the Save dialog title field was left blank | re-record and provide a title |
| Recording has brittle selectors (e.g. `nth-child(7)`) | clicked on items whose DOM position shifts | re-do the task clicking by stable label/text where possible |
| Helper script can't reset Magento | `shopping_admin` container died | bring it back with `./eval/docker/setup-webarena.sh up` |

## After all 10 are recorded

Hand off — here's what I'll run next:

1. The three-arm trial sweep:
   ```bash
   python -m src.runner_ccc --arms human --seeds 0 --model sonnet
   ```
   ~10 trials, ~15 minutes wall, ~$1.50 in API cost.

2. The v3 report:
   ```bash
   python -m src.report \
     --cold results/runs/<ts>/cold \
     --oracle results/runs/<ts>/oracle \
     --human results/runs/<ts>/human \
     --out results/reports/three-arm-2026-05-26
   ```

3. Expected outcome: human success rate lands between cold (~60%) and oracle (~100%). The gap between **human** and **oracle** is what tells us product quality — the smaller the gap, the better the CRX is capturing what an oracle would have hand-written.

---

See also: [`README.md`](../README.md) (eval pipeline overview) · [`webarena-setup.md`](./webarena-setup.md) (docker setup).
