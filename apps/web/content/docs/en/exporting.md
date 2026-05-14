---
title: Exporting & file format
description: What ends up in your Downloads folder, and where to put it.
order: 40
---

# Exporting & file format

When you click **Copy SKILL.md** or **Download SKILL.md**, the dialog:

1. Calls `buildSkill()` → fresh `Skill` object
2. Persists it to the `skills` store in IndexedDB (so you can re-render later)
3. Runs `renderSkillAsMarkdown(skill)` to get a string
4. Writes the string to the clipboard AND
5. Calls `chrome.downloads.download` to auto-save the file to `~/Downloads/skill-recorder-skills/<slug>-<ISO-ts>.SKILL.md`

The `saveAs: false` flag bypasses Chrome's "Ask where to save each file" preference so the file always lands in the same predictable folder. External tools (your AI assistant, a script that watches the folder) can rely on the path.

## Anatomy of a SKILL.md

```markdown
---
name: amazon-sg-search
description: Amazon.sg — search and add to cart
allowed-tools: Bash
---

# Amazon.sg — search and add to cart

Domain: `www.amazon.sg`

## Precondition       ← present only if auth.required is true
…browse env remote + --context-id instructions…

## Parameters
- `search_term` — Value for search_term (example: `iphone`)

## Steps

### 1. Navigate to https://www.amazon.sg/
```bash
browse open https://www.amazon.sg/
```
**Expected:** "Search Amazon.sg" becomes interactable

### 2. Fill "Search Amazon.sg"
Target: role searchbox, aria-label "Search Amazon.sg"
```bash
browse fill #twotabsearchtextbox '{{search_term}}'
```
Selector hints: …
**Expected:** URL becomes www.amazon.sg/s

### 3. Click first result
> ⚠️ This appears to click a specific item from a dynamic list…
```bash
browse snapshot
browse click <ref-from-snapshot>
```

…

## On failure
- If a `browse` command misses…
```

The `allowed-tools: Bash` in the frontmatter tells Claude Code that running shell commands is required for this skill.

## Where to install it

For Claude Code to autoload the skill, drop it at one of:

- `~/.claude/skills/<your-skill-name>/SKILL.md` — user-wide
- `<project>/.claude/skills/<your-skill-name>/SKILL.md` — project-scoped

The directory name becomes the skill identifier.

## Re-rendering

If you tweak a saved skill, you don't have to re-record. The original recording is still in IndexedDB; click **Save as Skill** again on the same recording and the dialog re-renders fresh. Drafts (skip toggles, param names) are not persisted across sessions today — that's on the roadmap.
