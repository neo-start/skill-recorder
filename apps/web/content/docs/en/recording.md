---
title: Recording in depth
description: What gets captured, how, and how to opt out.
order: 20
---

# Recording in depth

A recording is **two parallel streams** captured by the content script on a single tab:

1. **rrweb event stream** — full DOM mutations + input events for pixel-perfect visual replay. Stored as chunked `RecordingChunk`s in IndexedDB.
2. **Semantic action log** — typed `ActionStep`s (`navigate`, `click`, `change`, `keyDown`, `submit`, `scroll`) annotated with multi-strategy selectors and element fingerprints.

The split matters: rrweb is great for "show me what I did" but useless for "what did I *try* to do?". Distillation reads the action log; the player reads the chunks.

## Selector strategy

For every interactive target, Skill Recorder generates up to six selector kinds and scores them 0-100 by stability:

| Kind | Score | Example |
|---|---|---|
| testid | 95 | `[data-testid="search-input"]` |
| id | 80 | `#twotabsearchtextbox` (skipped when id looks generated) |
| aria | 70 | `searchbox:Search Amazon.sg` |
| text | 60 | `Add to cart` |
| css | 45 | shortest stable class chain |
| xpath | 25 | last-resort positional path |

At export time, the renderer picks the highest-scoring selector for the bash command and emits the rest as `Selector hints:` so the agent can fall back when the primary misses.

## Opt-outs

Skill Recorder mirrors PostHog's session-recording defaults for privacy:

- **Passwords are always masked.** An input of `type="password"` produces a `change` step with `masked: true` and no `value`. The distiller will not parameterise masked fills.
- **Block specific elements.** Add the class `rec-block` or the attribute `data-rec-block` to anything you want excluded from rrweb capture entirely.
- **Sampling.** `mousemove` is throttled to 50 ms, `scroll` to 150 ms; only the final `input` value is kept per change.

## Limits

- One recording = one tab. Closing the tab or doing a full-page nav to a different domain ends the recording.
- No cross-frame iframe capture — we attach to the top frame only.
- `chrome://`, `chrome-extension://`, and `about:` URLs cannot be recorded.
- No cross-tab flows (popups, target=_blank chains).

## Storage

Everything lives in IndexedDB under the database `recorder`:

- `recordings` — one row per session
- `chunks` — append-only rrweb event chunks
- `actions` — semantic action log
- `skills` — distilled `Skill` objects saved via the Save-as-Skill dialog

No remote storage. Clearing the extension's data via `chrome://extensions` deletes everything.
