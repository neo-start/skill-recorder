---
title: 蒸馏 skill
description: Save-as-Skill 弹窗如何把原始动作日志蒸馏成可复用 skill。
order: 30
---

# 蒸馏 skill

在 sidepanel 点 **Save as Skill**,原始 `ActionStep[]` 会变成一组可编辑的 `DraftStep`。每条 draft 有 `action`、`intent`、`skipped` 开关,以及(对 fill)`isParam` / `paramName`。

## 默认跳过启发式

真实用户总会产生很多噪音。弹窗默认勾掉这些,但每一条仍然可见,一键就能重新勾回来。

| 模式 | 跳过原因 |
|---|---|
| `scroll` 事件 | 点击流里几乎不是有意的 |
| `keyUp` 事件 | 回放只需 `keyDown` |
| Backspace / Delete | 后面会有 `fill` 覆盖,清空无意义 |
| 连续重复同一键 | 用户长按 Enter |
| `keyDown Enter` 紧跟在文本框 click 之后,中间无 change | 纯录制噪音 |
| `click` 跟在 `change` 后 3 秒内,目标是 submit-like 按钮 | `browse fill` 自带 Enter,这次点击是重复的 |
| `navigate` 跟在 click / submit / change / Enter 后 5 秒内 | 副作用的重定向链 |

## 参数检测

每条非 masked 的 `fill` 默认被标为参数。参数名从 input 的 `aria-label` 或可见 label 推断(`Search Amazon.sg` → `search_amazonsg`)。你可以取消勾选改成字面量,或者直接重命名。同名参数会被合并为同一个 `SkillParameter`。

## ⚠️ 动态列表项警告

当一个 click 的 selector 看起来是搜索结果或网格项(top selector 含 `:nth-of-type`,或选择器链含已知容器类名 `s-card-container` / `puis-card` / `product-card` / `gridcell`),渲染器会在这步前插入警告,提示 AI agent **重新挑选**而不是死用录制 selector。这样可以避免「录制时搜的是 X、回放时搜的是 Y,字面 product selector 直接 miss」的经典失败。

## Auth Precondition

弹窗扫描录制里的登录信号:

- 在密码框上的 `change`
- `navigate` 到已知 auth provider 域(`logto.app`、`auth0.com`、`accounts.google.com`、`appleid.apple.com`、`login.microsoftonline.com`、`okta.com`、`clerk.dev`、`firebaseapp.com`…)
- `navigate` 到 auth 风格的路径(`/login`、`/signin`、`/oauth`、`/authorize`、`/register`…)

任一信号命中,**Requires authenticated session** 复选框会自动勾上,渲染的 SKILL.md 顶部会插入 `## Precondition` 段,告诉 agent 加载预登的 Browserbase context。你也可以手动勾选——录制时本就已经登录的情况自动检测抓不到。

## Expectation 推导

每条留下的步骤会看下一步,推导出一条 `Expected:`:

- 下一步换了 URL → `URL becomes <新 URL>`
- 下一步有 target selector → `"<目标>" becomes interactable`

这条既会作为渲染 markdown 里每步下面的 `**Expected:**`,也会成为扩展内回放的验证条件。

## Markdown 输出

`@skill-recorder/render` 包里的 `renderSkillAsMarkdown` 是个纯函数:同样的 `Skill` 进去,同样的字符串出来。Web 端首页的 SKILL.md 实时预览正是直接调它——你看到的就是 agent 读到的。
