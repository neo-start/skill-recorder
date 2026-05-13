---
title: 录制原理
description: 录什么、怎么录、怎么 opt-out。
order: 20
---

# 录制原理

每段录制由 content script 在单个 tab 上同时采集 **两条并行流**:

1. **rrweb 事件流**——完整的 DOM mutation + 输入事件,用于像素级回放。以 `RecordingChunk` 分块存进 IndexedDB。
2. **语义动作日志**——结构化的 `ActionStep`(`navigate`、`click`、`change`、`keyDown`、`submit`、`scroll`),每条带多策略 selector 和元素指纹。

分两路的原因:rrweb 适合「给我看你做了什么」,但答不出「你想做什么」。蒸馏读动作日志,播放器读 chunk。

## Selector 策略

每个交互目标会生成最多 6 种 selector,按稳定性打分 0-100:

| Kind | Score | 示例 |
|---|---|---|
| testid | 95 | `[data-testid="search-input"]` |
| id | 80 | `#twotabsearchtextbox`(id 看起来是生成的会跳过) |
| aria | 70 | `searchbox:Search Amazon.sg` |
| text | 60 | `Add to cart` |
| css | 45 | 最短稳定 class 链 |
| xpath | 25 | 兜底位置路径 |

导出时取最高分的 selector 写到 bash 命令,其余作为 `Selector hints:` 列在下面,agent 可以在主 selector 失效时回退。

## Opt-out

参考 PostHog 的 session 录制默认值,默认保护隐私:

- **密码总是被打码。** `type="password"` 的 input 会生成一条 `change`,`masked: true`,不带 value。蒸馏不会把 masked 字段做成参数。
- **指定屏蔽元素。** 给任何元素加 class `rec-block` 或属性 `data-rec-block`,rrweb 会跳过它的捕获。
- **采样。** `mousemove` 节流到 50ms,`scroll` 到 150ms;每次 change 只保留最后一次 input 值。

## 限制

- 一次录制对应一个 tab。关掉 tab 或跳到不同域会结束录制。
- 不抓跨 frame 的 iframe——只挂载顶层 frame。
- `chrome://`、`chrome-extension://`、`about:` 这几种 URL 无法录制。
- 不支持跨 tab 流程(popup、target=_blank 链)。

## 数据存哪

全部在 IndexedDB 里,数据库名 `recorder`:

- `recordings`——每段录制的元信息
- `chunks`——追加式 rrweb 事件块
- `actions`——语义动作日志
- `skills`——通过 Save-as-Skill 弹窗蒸馏好的 `Skill`

没有远端存储。在 `chrome://extensions` 清扩展数据就一键删光。
