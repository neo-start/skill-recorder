---
title: Using with Claude Code
description: End-to-end workflow with the browse skill.
order: 50
---

# Using with Claude Code

The output `SKILL.md` is designed for [Claude Code](https://docs.claude.com/claude-code) running the [`browse`](https://github.com/browserbase/skills) skill from the Browserbase skill marketplace.

## Prerequisites

Make sure `browse` is installed and Claude Code knows about it:

```bash
# in your Claude Code session:
/plugin marketplace add browserbase/skills
/plugin install browse
```

Or install the CLI globally:

```bash
npm install -g @browserbasehq/browse-cli
```

## The mapping

Each line in your generated SKILL.md is a real shell command Claude Code can run:

| SKILL.md step | `browse` invocation |
|---|---|
| navigate | `browse open <url>` |
| fill | `browse fill <selector> <value>` (auto-presses Enter) |
| click | `browse snapshot` + `browse click <ref>` |
| press_key | `browse press <key>` |
| submit | `browse snapshot` + `browse click <submit-ref>` |
| scroll | `browse scroll 0 0 0 <dy>` |

## Auth via Browserbase context

If your skill has a `## Precondition` block, set the env var first:

```bash
# one-off: create a context, sign in, persist the cookies
export BROWSERBASE_API_KEY=bb_live_xxx
export BROWSERBASE_PROJECT_ID=proj_xxx
curl -sX POST https://api.browserbase.com/v1/contexts \
  -H "X-BB-API-Key: $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$BROWSERBASE_PROJECT_ID\"}"
# returns {"id": "ctx_xxx", ...}

export CLIPMIND_CTX=ctx_xxx     # name derived from the recording's domain
browse env remote
browse open https://clipmind.tech/workspace --context-id "$CLIPMIND_CTX" --persist
# (manually sign in via the Browserbase live-view tab)
browse stop                     # persists cookies back to the context
```

After that, every replay with the same `--context-id` (no `--persist`) arrives already logged in.

## On failure

The generated `## On failure` section instructs the agent to:

1. Re-snapshot when a selector misses, and re-locate by aria-label / role / visible text
2. Try alternate **Selector hints** in order
3. Stop rather than blindly continue when an `Expected:` line diverges from observed state
4. Re-pick rather than reuse the recorded selector on steps marked ⚠️ (dynamic-list items)

This is what makes the file degrade gracefully across page redesigns and parameter changes.

## A complete example

A real exported skill — search Amazon.sg for a keyword and add the first result to cart — is rendered live on the [landing page](/) using the same `renderSkillAsMarkdown` function the extension uses.
