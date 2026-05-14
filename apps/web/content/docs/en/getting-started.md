---
title: Getting started
description: Install, record, export — in under five minutes.
order: 10
---

# Getting started

Skill Recorder is a Chrome extension that turns a browser demo into a [Claude Code](https://docs.claude.com/claude-code) `SKILL.md`. The output is a portable markdown file an AI agent can re-run autonomously via the [`browse`](https://github.com/browserbase/skills) CLI.

## Install

Until we ship to the Chrome Web Store, you need to load the unpacked extension:

```bash
git clone git@github.com:neo-start/skill-recorder.git
cd skill-recorder
pnpm install
pnpm --filter @skill-recorder/crx build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** on
3. Click **Load unpacked**
4. Select `apps/crx/dist/`
5. Pin the extension; click the icon to open the side panel

## Record your first flow

1. Navigate to the site you want to demo
2. Click the Skill Recorder icon → **Start recording**
3. Do the flow once. The side panel shows a live action counter
4. **Stop recording** when you're done

> Avoid navigating to a *different* domain mid-recording — one full-page nav away ends the rrweb context.

## Export a Skill

1. Find your recording in the side panel
2. Click **Save as Skill**
3. The dialog auto-detects every typed value as a parameter, strips noise (redundant submit clicks, extra Enter presses), and flags clicks on dynamic-list items
4. Click **Download SKILL.md** — the file lands in `~/Downloads/skill-recorder-skills/<slug>-<timestamp>.SKILL.md`

## Hand it to Claude Code

Move the file into a Claude Code skill directory:

```bash
mkdir -p ~/.claude/skills/<your-skill-name>
mv ~/Downloads/skill-recorder-skills/*.SKILL.md \
   ~/.claude/skills/<your-skill-name>/SKILL.md
```

In your next Claude Code session, the agent will autoload it and can run the flow via the `browse` CLI.

## Next steps

- Read [Recording in depth](/docs/recording) to learn the capture pipeline and how to opt parts of a page out of recording
- Read [Distilling skills](/docs/distilling) to understand the skip heuristics and parameter detection
- Read [Using with Claude Code](/docs/using-with-claude-code) for the full end-to-end agent workflow
