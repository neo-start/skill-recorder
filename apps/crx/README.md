# Skill Recorder

A Chrome extension (Manifest V3) that records what you do on a webpage and
distills it into a **Claude Code skill** (`SKILL.md`) that an AI agent can
re-run later via the [`browse`](https://github.com/browserbase/skills) CLI.

In one sentence: **demo a flow once, hand the resulting `SKILL.md` to Claude
Code, and it can re-run that flow autonomously with new parameters.**

It does three things:

1. **Record** — captures both an rrweb event stream (for pixel-perfect visual
   replay) and a semantic action log (click / fill / press / navigate /
   submit) with multi-strategy selectors.
2. **Distill** — turns the raw action log into a clean, parameterised Skill via
   the "Save as Skill" dialog, with default-skip heuristics that strip
   recording noise (duplicate keys, redundant submit clicks, redirect chains).
3. **Replay & Export** — replays the rrweb stream in a player tab, replays
   semantic steps live against the page via a content-script verifier, and
   exports `SKILL.md` to the clipboard / `~/Downloads/skill-recorder-skills/`.

---

## Why this exists

LLM agents that can drive a browser (Claude Code with the `browse` skill,
Browserbase agents, etc.) need **reliable step-by-step instructions** more
than they need raw screen recordings. Generic CDP recorders give you brittle
xpath blobs; rrweb gives you a video, not instructions.

Skill Recorder bridges that gap: you click through a flow once, and you get
back a markdown file that reads like documentation but is shell-executable
through the `browse` CLI. The recording stays on-disk for visual
verification, the action log stays in the DB for re-distilling later.

---

## Architecture

```
┌─────────────────────┐                ┌───────────────────────┐
│  Side Panel (React) │ ── runtime ──▶ │  Background SW        │
│  - recordings list  │ ◀── msgs ───── │  - capture lifecycle  │
│  - replay controls  │                │  - port broker        │
│  - Save-as-Skill    │                │  - chunk flushing     │
└─────────────────────┘                └─────────┬─────────────┘
                                                 │ port
                                                 ▼
                                       ┌───────────────────────┐
                                       │  Content Script       │
                                       │  - rrweb capture      │
                                       │  - action-recorder    │
                                       │  - replay-runner      │
                                       └─────────┬─────────────┘
                                                 │
                              ┌──────────────────┴──────────────────┐
                              ▼                                     ▼
                    ┌──────────────────┐                ┌──────────────────┐
                    │   IndexedDB      │                │   Player tab     │
                    │  - recordings    │                │  (rrweb-player)  │
                    │  - chunks        │                │  reads IDB       │
                    │  - actions       │                └──────────────────┘
                    │  - skills        │
                    └──────────────────┘
```

- **Content script** is injected on every page (`<all_urls>`, `document_start`)
  but stays idle until the background opens a long-lived port. This is what
  lets us start capture mid-page without a reload.
- **Background service worker** owns the recording state machine, so closing
  the side panel does **not** stop recording.
- **One recording = one tab.** Closing the tab or doing a full-page navigation
  ends the recording (rrweb context is lost on navigation).
- The player is a regular extension page so users can scrub the timeline,
  share a link, etc.

---

## Data model

All persistence is **IndexedDB-only** (no remote backend). Database name
`recorder`, schema version `3`.

| Store | Purpose |
|---|---|
| `recordings` | One row per recording — `RecordingMeta` (id, url, title, timing, event/action counts, status). |
| `chunks`     | Append-only `RecordingChunk[]` of rrweb events, keyed by `(recordingId, seq)`. Background buffers events and flushes in batches. |
| `actions`    | Semantic `ActionStep[]` — every click / change / keyDown / navigate / submit / scroll, with selectors + fingerprint. |
| `skills`     | Distilled `Skill` objects (saved when you click "Save as Skill"). |

The split between **chunks** (visual) and **actions** (semantic) is the core
idea: rrweb is great for replay-as-video but useless for "what was the user
trying to do here?". The action log is what gets distilled into the Skill;
the chunks are kept for the player.

### `ActionStep`

```ts
interface ActionStep {
  recordingId: string;
  seq: number;
  type: 'navigate' | 'click' | 'change' | 'keyDown' | 'keyUp' | 'scroll' | 'submit';
  timestamp: number;
  url: string;

  selectors?: SelectorEntry[];     // ranked: testid > id > aria > text > css > xpath
  fingerprint?: ElementFingerprint; // tag, role, text, attrs — for fuzzy fallback

  navigateUrl?: string;  // navigate
  value?: string;        // change   (masked if input was a password / data-rec-block)
  key?: string;          // keyDown / keyUp
  scrollX?: number;      // scroll
  scrollY?: number;
}
```

### Selector strategy

`src/common/selector.ts` generates up to six selector kinds per target and
scores them 0–100 by stability. The ranked order:

1. `testid`  — `data-testid`, `data-test`, `data-cy`
2. `id`      — `#elementId` (skipped if id looks generated, e.g. `:r3:` or pure hex)
3. `aria`    — `[aria-label="…"]` or role-based combinators
4. `text`    — `text="visible label"` (when text is short & unique)
5. `css`     — short stable class chain
6. `xpath`   — last-resort positional path

At replay/render time we always pick the highest-scoring selector but the
others are emitted as `Selector hints:` in the markdown so an agent can
fall back when the top selector misses.

### `Skill`

```ts
interface Skill {
  id: string;
  title: string;
  description: string;
  domain: string;
  startUrl: string;
  parameters: { name: string; type: 'string'; description: string; example?: string }[];
  steps: SkillStep[];           // distilled subset of ActionStep[]
  sourceRecordingId: string;    // back-link to the original recording
  createdAt: number;
  updatedAt: number;
}
```

`SkillStep` is `ActionStep` minus the rrweb baggage, plus an `intent`
string (human-readable), a `valueTemplate` (`${paramName}` or literal) and
an optional `expectation` derived from the next step (URL change / element
visible) — used for the `**Expected:**` line in the rendered markdown and
for verifier-style replay inside the extension.

---

## Recording pipeline

```
                  ┌─────────────────────────────────────────────┐
                  │ Content script (recording role)             │
                  │                                             │
[user input] ───▶ │  rrweb.record()  ───────▶ RRWEB_EVENT  ─┐   │
                  │                                          │   │
                  │  action-recorder ───────▶ ACTION        ─┤   │
                  │  (DOM events: click,                    │   │
                  │   beforeinput, keydown,                 │   │
                  │   submit, popstate)                     │   │
                  └─────────────────────────────────────────┼───┘
                                                            │ port
                                                            ▼
                                  ┌──────────────────────────────────┐
                                  │ Background                       │
                                  │  buffers chunks → IDB            │
                                  │  every N ms / N events           │
                                  │  appends actions → IDB           │
                                  └──────────────────────────────────┘
```

Key files:

- `src/modules/content/index.ts` — port lifecycle, role switching
- `src/modules/content/action-recorder.ts` — semantic action capture
- `src/modules/content/replay-runner.ts` — executes one step at a time during replay
- `src/modules/background/index.ts` — recording state machine + IDB writes
- `src/common/selector.ts` — selector generation & scoring

### rrweb options

Mirrors PostHog's session-recording defaults (see
`src/modules/content/index.ts`):

- `maskAllInputs: true` (passwords always masked)
- `blockClass: 'rec-block'`, `blockSelector: '[data-rec-block]'` — opt-out
- Sampling: `mousemove: 50ms`, `scroll: 150ms`, `input: 'last'`
- `checkoutEveryNms: 60_000` so the player can seek anywhere

---

## Distill pipeline (Save as Skill)

`src/modules/sidepanel/components/SaveAsSkillDialog.tsx`

When you click **Save as Skill** on a recording, the raw `ActionStep[]` is
turned into a list of `DraftStep` rows. Each draft has:

- `action` — the mapped `SkillActionType` (`change` → `fill`, `keyDown` → `press_key`, …)
- `intent` — human-readable label, editable inline
- `skipped` — whether to drop the step (default skip below)
- `isParam` — if it's a `fill`, default-true for non-masked values
- `paramName` — auto-suggested from aria-label / nearby text
- `value`    — literal fallback if not parameterised

### Default-skip heuristics

Designed to strip the noise that real users always generate. Codepath:
`shouldDefaultSkip()`.

| Pattern | Why it's skipped |
|---|---|
| `scroll` (any) | Almost never intentional in a click-flow recording. |
| `keyUp` (any) | Replay only needs `keyDown`. |
| `keyDown` Backspace / Delete | A subsequent `fill` overwrites the value anyway. |
| Duplicate consecutive same-key | Common when a user holds Enter. |
| `keyDown Enter` after a click on a text input with **no `change` in between** | Recording artifact: user focused the box and accidentally tapped Enter. |
| `click` on a submit-like button within 3s of a `change` on a text input | `browse fill` already presses Enter — the submit click is redundant. (Submit-like = `type=submit`, aria-label /Search\|Submit\|Go\|Find/, or selector matching `submit-button` / `search-submit`.) |
| `navigate` within 5s of a click / submit / change / Enter | Side-effect navigation chain, not a user action. |

All of these are *defaults* — every step is rendered in the dialog and can
be re-included with one click. The user is always in control.

### Parameter detection

Every non-masked `fill` is marked `isParam = true` by default. The param
name is suggested from the input's `aria-label` or visible label
(`Search Amazon.sg` → `search_amazonsg`). The user can untoggle to keep
the value literal, or rename the param. All params with the same name in
the same recording are deduped into one `SkillParameter`.

### Expectation derivation

For each kept step, `deriveExpectation(cur, next)` looks at the next step:

- If the next step has a different URL → `urlChange` expectation with target URL.
- Else if the next step has selectors → `elementVisible` expectation naming
  the target ("\"Submit\" becomes interactable").

That expectation becomes the `**Expected:**` line under each step in the
rendered `SKILL.md`, and is also what the verifier checks during live
replay.

---

## Replay

Two replay paths:

1. **Visual replay** (rrweb-player tab) — opens the player at
   `src/modules/player/index.html?recording=<id>`. Reads chunks from
   IndexedDB and pipes them straight into `rrweb-player`. Useful for human
   review.

2. **Semantic replay** (live, on a target tab) — `replay-manager` in the
   background drives a real tab through `ActionStep[]`:
   - sends `EXECUTE_STEP` to the content script with the step + expectation
   - content `replay-runner` resolves the selector (top-scored first, then
     hints), performs the action, and reports `STEP_RESULT`
   - on failure the side panel surfaces a `retry / skip / stop` prompt

The point of (2) is sanity-checking a recording before exporting it — not
production automation. For production, you generate `SKILL.md` and let an
AI agent run it via `browse`.

---

## Export

When the user clicks **Copy SKILL.md** or **Download SKILL.md** in the
Save-as-Skill dialog:

1. `buildSkill()` → fresh `Skill` object → persisted to the `skills` store.
2. `renderSkillAsMarkdown(skill)` → markdown string with frontmatter,
   `## Parameters`, `## Steps` (each step has intent, target description,
   one fenced `bash` block of `browse` commands, selector hints,
   expectation), and an `## On failure` recovery guide.
3. **Clipboard copy** (writes text to clipboard) **and**
4. **Auto-save** to `~/Downloads/skill-recorder-skills/<slug>-<ISO-ts>.SKILL.md`
   via `chrome.downloads.download` with `saveAs: false`, so external
   readers (e.g. an AI assistant in your home directory) can grep your
   skills without manual export.

### Rendered output shape

````markdown
---
name: amazon-sg-search
description: Amazon.sg — search and add to cart
allowed-tools: Bash
---

# Amazon.sg — search and add to cart

Domain: `www.amazon.sg`

## Parameters

- `search_amazonsg` — Value for search_amazonsg (example: `iphone`)

## Steps

### 1. Navigate to https://www.amazon.sg/

```bash
browse open https://www.amazon.sg/
```

**Expected:** "Search Amazon.sg" becomes interactable

### 2. Fill "Search Amazon.sg"

Target: role searchbox, aria-label "Search Amazon.sg", tag <input>

```bash
browse fill #twotabsearchtextbox '{{search_amazonsg}}'
```
Selector hints: `aria: searchbox:Search Amazon.sg`, `xpath: …`

**Expected:** URL becomes www.amazon.sg/s

### 3. Click first result

> ⚠️ This appears to click a specific item from a dynamic list (e.g. a
> search result). The exact element will likely be missing when replayed
> with different parameters — re-snapshot the page and pick an appropriate
> item by relevance instead of trusting the recorded selector.

…
````

The `⚠️` annotation is added automatically when the click target
selectors look like a search-result / grid item (`:nth-of-type`,
`s-product-image`, `s-card-container`, `puis-card`, deeply positional
xpath, etc.). Without it, agents tend to faithfully reproduce
`browse click <recorded-css>` against a fresh page and fail.

---

## Setup

```bash
git clone git@github.com:neo-start/skill-recorder.git
cd skill-recorder
pnpm install
pnpm dev          # vite + HMR; writes dist/ on every change
```

Then in Chrome:

1. `chrome://extensions` → toggle **Developer mode** on
2. **Load unpacked** → select the `dist/` folder
3. Pin the extension; the icon opens the **side panel**

For a production zip:

```bash
pnpm build        # tsc -b && vite build → dist/
```

`pnpm typecheck` runs `tsc -b --noEmit` only.

---

## Daily usage

1. Click the extension icon to open the side panel.
2. **Start recording** on the current tab. The action counter ticks as you
   click / type. Avoid navigating to a *different* domain — one tab nav
   away ends the recording.
3. **Stop recording.** The row shows up in the side panel list.
4. (Optional) **▶ Replay** in a player tab to visually confirm the flow.
5. **💾 Save as Skill** — the dialog auto-marks every typed value as a
   parameter, default-skips noise. Edit intents / param names as needed.
6. **📋 Copy SKILL.md** or **⬇ Download** — clipboard + auto-save to
   `~/Downloads/skill-recorder-skills/`.
7. Drop the file at `~/.claude/skills/<name>/SKILL.md` (or a project-local
   `.claude/skills/` dir) and Claude Code picks it up on the next session.

### Recording opt-outs

- Anything inside an element with class `rec-block` or attribute
  `[data-rec-block]` is masked in the rrweb stream.
- Inputs of type `password` are always masked. The action log marks the
  corresponding `change` step with `masked: true`, and the distiller does
  **not** parameterise masked fills (it offers a literal placeholder
  instead so secrets never leak into `SKILL.md`).

### Not supported

- `chrome://`, `chrome-extension://`, `about:` URLs (no content script).
- Cross-frame iframes (we only attach to the top frame).
- Cross-tab flows.
- A single tab close / full-page navigation ends recording.

---

## Integration with Claude Code

Skill Recorder is written assuming the consumer is **Claude Code with the
`browse` skill** (https://github.com/browserbase/skills). That skill
provides exactly the CLI vocabulary used in our rendered markdown:

| `SKILL.md` step | `browse` invocation |
|---|---|
| navigate | `browse open <url>` |
| fill | `browse fill <selector> <value>` (auto-presses Enter) |
| click | `browse snapshot` + `browse click <ref>` |
| press_key | `browse press <key>` |
| submit | `browse snapshot` + `browse click <submit-ref>` |
| scroll | `browse scroll 0 0 0 <dy>` |

The `## On failure` section of every generated skill instructs the agent
to re-snapshot, try alternate selector hints, and bail rather than
blindly continuing when expectations diverge — so the file degrades
gracefully on a slightly-different page.

`SKILL.md` is plain markdown; nothing prevents you from rewriting the
output to target a different browser CLI or a higher-level RPA runtime.
The renderer lives in `src/common/skill-render.ts` and is the *only*
place that emits `browse` commands.

---

## Project layout

```
src/
├─ manifest.ts                  # crxjs manifest definition (MV3)
├─ common/
│   ├─ db.ts                    # IndexedDB schema + accessors
│   ├─ messages.ts              # typed runtime / port messages
│   ├─ selector.ts              # selector generation + scoring
│   ├─ types.ts                 # ActionStep / Skill / ReplayState …
│   ├─ skill-render.ts          # Skill → SKILL.md markdown
│   └─ skill-export.ts          # auto-save to Downloads
├─ stores/
│   ├─ recordings.ts            # MobX store, recordings list
│   └─ skills.ts                # MobX store, distilled skills
└─ modules/
    ├─ background/              # service worker (capture + replay manager)
    ├─ content/                 # content script (rrweb + action recorder + replay runner)
    ├─ sidepanel/               # React UI (recording list, save-as-skill dialog)
    └─ player/                  # rrweb-player tab
```

---

## Roadmap / known gaps

- **List-item clicks are still hard-coded** to the recorded element. The
  ⚠️ annotation surfaces this so an agent can adapt, but a richer fix is
  to detect the *list container* at record time and emit `click <Nth
  result>` instead of a brittle css/xpath. Tracked but unscheduled.
- **No multi-tab capture.** A flow that opens a popup or hops tabs can't
  be recorded today.
- **No iframe capture.** Same-origin iframes would be straightforward;
  cross-origin needs Chrome side-panel + per-frame port wiring.
- **No diff-replay** (run the skill against the live page and surface
  diffs vs. the recorded DOM) — useful for site-watcher / regression use
  cases.
- **No CRX signing / store distribution.** Loaded unpacked from `dist/`.
- **Selectors are scored, not learned.** A regression like a renamed
  `data-testid` will silently demote that selector instead of warning the
  user at record time.

---

## License

MIT.
