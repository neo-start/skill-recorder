---
title: 配合 Claude Code
description: 端到端的 agent 工作流。
order: 50
---

# 配合 Claude Code

输出的 `SKILL.md` 是为 [Claude Code](https://docs.claude.com/claude-code) + Browserbase 的 [`browse`](https://github.com/browserbase/skills) skill 而设计的。

## 准备

确认 `browse` 已安装且 Claude Code 知道它:

```bash
# 在 Claude Code session 里:
/plugin marketplace add browserbase/skills
/plugin install browse
```

或者直接全局装 CLI:

```bash
npm install -g @browserbasehq/browse-cli
```

## 命令映射

SKILL.md 里的每个 step 都是真实可执行的 shell 命令:

| SKILL.md 步骤 | `browse` 调用 |
|---|---|
| navigate | `browse open <url>` |
| fill | `browse fill <selector> <value>`(自动按 Enter) |
| click | `browse snapshot` + `browse click <ref>` |
| press_key | `browse press <key>` |
| submit | `browse snapshot` + `browse click <submit-ref>` |
| scroll | `browse scroll 0 0 0 <dy>` |

## 通过 Browserbase context 处理登录

如果 skill 有 `## Precondition` 段,先设环境变量:

```bash
# 一次性:建 context、登录、持久化 cookie
export BROWSERBASE_API_KEY=bb_live_xxx
export BROWSERBASE_PROJECT_ID=proj_xxx
curl -sX POST https://api.browserbase.com/v1/contexts \
  -H "X-BB-API-Key: $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$BROWSERBASE_PROJECT_ID\"}"
# 返回 {"id": "ctx_xxx", ...}

export CLIPMIND_CTX=ctx_xxx     # 名字按录制 domain 自动派生
browse env remote
browse open https://clipmind.tech/workspace --context-id "$CLIPMIND_CTX" --persist
# 在 Browserbase live-view 里手动登录
browse stop                     # 持久化 cookie 回 context
```

之后每次用同样的 `--context-id`(不带 `--persist`)都自带登录态。

## 失败处理

生成的 `## On failure` 段会指导 agent:

1. selector 失效时重新 snapshot,按 aria-label / role / 可见文字定位
2. 按顺序试备选 **Selector hints**
3. 看到 `Expected:` 与现状不符就停下,不要盲目继续
4. 对标 ⚠️ 的步骤(动态列表项)重新挑选,而不是死用录制 selector

这套逻辑让 skill 在页面改版或参数变化时优雅退化。

## 完整示例

一份真实导出的 skill——「在 Amazon.sg 搜词然后加购」——已经在[首页](/zh)上实时渲染,用的就是扩展内部同一个 `renderSkillAsMarkdown` 函数。
