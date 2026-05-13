---
title: Distilling skills
description: How the Save-as-Skill dialog turns a raw action log into a reusable Claude Code skill.
order: 30
---

# Distilling skills

Click **Save as Skill** in the side panel and the raw `ActionStep[]` becomes a list of editable `DraftStep`s. Each draft has an `action`, an `intent`, a `skipped` toggle, and (for fills) an `isParam`/`paramName` pair.

## Default-skip heuristics

Real users always generate noise. The dialog removes the obvious noise by default — but every step is rendered and you can re-include it with one click.

| Pattern | Why we skip |
|---|---|
| `scroll` events | Almost never intentional in a click-flow |
| `keyUp` events | Replay only needs `keyDown` |
| Backspace / Delete keys | A subsequent `fill` overwrites the value anyway |
| Duplicate consecutive same-key | User holding Enter |
| `keyDown Enter` after a click on a text input with no `change` between | Pure recording artifact |
| `click` on a submit-like button within 3 s of a `change` | `browse fill` already presses Enter — the submit click is redundant |
| `navigate` within 5 s of a click / submit / change / Enter | Side-effect redirect chain, not a user action |

## Parameter detection

Every non-masked `fill` is auto-marked as a parameter. The param name is suggested from the input's `aria-label` or visible label (e.g. `Search Amazon.sg` → `search_amazonsg`). You can untoggle to keep the value literal, or rename the param. All params with the same name are deduped into one `SkillParameter`.

## The ⚠️ dynamic-list warning

When a click's selectors look like a search-result or grid item (top selector contains `:nth-of-type`, or a known container class such as `s-card-container`, `puis-card`, `product-card`, `gridcell`), the renderer inserts a warning into the step body telling the AI agent to **re-pick** rather than reuse the recorded selector verbatim. This prevents the classic "skill was recorded with the search term *X* but replayed with *Y*, so the literal product selector misses" failure mode.

## Auth precondition

The dialog scans the recording for auth signals:

- `change` step on a password input
- `navigate` to a known auth-provider host (`logto.app`, `auth0.com`, `accounts.google.com`, `appleid.apple.com`, `login.microsoftonline.com`, `okta.com`, `clerk.dev`, `firebaseapp.com`, …)
- `navigate` to an auth-style path (`/login`, `/signin`, `/oauth`, `/authorize`, `/register`, …)

If any signal fires, the **Requires authenticated session** checkbox is auto-checked, and the rendered SKILL.md gets a `## Precondition` block telling the agent to load a pre-authed Browserbase context. You can also toggle the box manually for recordings where you were already logged in before recording started — the auto-detection can't see that.

## Expectation derivation

For each kept step the distiller looks at the next step to derive an `Expected:` line:

- If the next step has a different URL → `URL becomes <new-url>`
- Else if the next step has a target selector → `"<target>" becomes interactable`

This becomes both the `**Expected:**` line under each step in the markdown *and* the verifier predicate used during in-extension replay.

## Markdown output shape

The `renderSkillAsMarkdown` function in `@skill-recorder/render` is pure: same `Skill` in, same string out. That's exactly the package the web app imports to render the live SKILL.md preview on the landing page — what you see is what an agent reads.
