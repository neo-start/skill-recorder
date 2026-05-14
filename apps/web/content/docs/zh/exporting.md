---
title: 导出与文件格式
description: Downloads 里到底产出什么、应该放到哪儿。
order: 40
---

# 导出与文件格式

点 **Copy SKILL.md** 或 **Download SKILL.md** 后,弹窗会:

1. 调用 `buildSkill()` 生成新的 `Skill` 对象
2. 写入 IndexedDB 的 `skills` store(以后还能重新渲染)
3. 跑 `renderSkillAsMarkdown(skill)` 拿到字符串
4. 写入剪贴板,同时
5. 通过 `chrome.downloads.download` 自动保存到 `~/Downloads/skill-recorder-skills/<slug>-<ISO 时间戳>.SKILL.md`

`saveAs: false` 这个 flag 绕过了 Chrome 的「每次都问保存位置」,文件总落到同一个可预测目录。外部工具(你的 AI 助手、监控这个目录的脚本)可以放心依赖这个路径。

## SKILL.md 结构

```markdown
---
name: amazon-sg-search
description: Amazon.sg — search and add to cart
allowed-tools: Bash
---

# Amazon.sg — search and add to cart

Domain: `www.amazon.sg`

## Precondition       ← 仅当 auth.required = true 时出现
…browse env remote + --context-id 指令…

## Parameters
- `search_term` — Value for search_term (example: `iphone`)

## Steps

### 1. Navigate to https://www.amazon.sg/
```bash
browse open https://www.amazon.sg/
```
**Expected:** "Search Amazon.sg" becomes interactable

### 2. Fill "Search Amazon.sg"
```bash
browse fill #twotabsearchtextbox '{{search_term}}'
```
…

## On failure
…
```

frontmatter 里的 `allowed-tools: Bash` 告诉 Claude Code 这个 skill 需要执行 shell。

## 安装到哪儿

要让 Claude Code 自动加载,放在以下任一位置:

- `~/.claude/skills/<你的-skill 名>/SKILL.md`——用户级
- `<项目>/.claude/skills/<你的-skill 名>/SKILL.md`——项目级

目录名就是 skill 的标识。

## 重新渲染

改了 skill 不用重新录。原始录制还在 IndexedDB 里,在同一段录制上再次点 **Save as Skill**,弹窗会重新渲染。Draft 里的 skip / 参数名暂时不会跨会话保留——这是路线图上的事。
