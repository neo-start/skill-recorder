---
title: 快速上手
description: 5 分钟内完成安装、录制、导出。
order: 10
---

# 快速上手

Skill Recorder 是一个 Chrome 扩展,把浏览器演示转成 [Claude Code](https://docs.claude.com/claude-code) 的 `SKILL.md`——一份 AI agent 可以通过 [`browse`](https://github.com/browserbase/skills) CLI 自动重跑的可移植 markdown 文件。

## 安装

我们还没上 Chrome Web Store,先 load unpacked:

```bash
git clone git@github.com:neo-start/skill-recorder.git
cd skill-recorder
pnpm install
pnpm --filter @skill-recorder/crx build
```

然后在 Chrome 里:

1. 打开 `chrome://extensions`
2. 右上角开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `projects/skill-recorder/apps/crx/dist/`
5. 把扩展固定到工具栏,点图标打开 sidepanel

## 录制第一段流程

1. 打开你要演示的网站
2. 点 Skill Recorder 图标 → **Start recording**
3. 正常走一遍流程,sidepanel 会实时显示动作计数
4. 完成后点 **Stop recording**

> 录制中不要跳到不同的域,一次完整页面跳转会让 rrweb 上下文失效。

## 导出 skill

1. 在 sidepanel 找到你的录制
2. 点 **Save as Skill**
3. 弹窗会自动把每个输入值标成参数、剥掉冗余动作、给搜索结果类点击标 ⚠️ 警告
4. 点 **Download SKILL.md**,文件会落到 `~/Downloads/skill-recorder-skills/<slug>-<时间戳>.SKILL.md`

## 交给 Claude Code

把文件挪到 Claude Code 的 skill 目录:

```bash
mkdir -p ~/.claude/skills/<你的-skill-名>
mv ~/Downloads/skill-recorder-skills/*.SKILL.md \
   ~/.claude/skills/<你的-skill-名>/SKILL.md
```

下次 Claude Code 启动会自动加载这个 skill,通过 `browse` CLI 跑完整个流程。

## 下一步

- [录制原理](/zh/docs/recording)——捕获管道、隐私opt-out
- [蒸馏 skill](/zh/docs/distilling)——跳过启发式、参数检测、auth 检测
- [配合 Claude Code](/zh/docs/using-with-claude-code)——端到端 agent 工作流
