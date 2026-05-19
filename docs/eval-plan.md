# Skill Recorder 评测系统 (MVP) — Step-by-Step Plan

## Context / 背景

**问题**：需要量化证明"Skill Recorder + 人类一次演示"能让 Claude Code 在复杂企业工作流上比"裸 agent"完成度更高、速度更快。

**故事目标**：从 "裸 agent 40% 完成 / 60 min" → "skill-equipped 90% 完成 / 5 min"。重点指标是 **12× 速度** + 显著完成率提升。

**为什么用 WorkArena**：
- 真实 ServiceNow 实例，企业 RPA 场景 (ITSM/HR/CMDB)，和产品定位一致
- L2 难度区间 baseline 仅 ~10%，headroom 足够撑出有意义的对比数字
- Deterministic post-condition (走 ServiceNow API 校验)，无 LLM-judge 噪声
- BrowserGym + AgentLab 是成熟开源工具链，复现性强

**三 arm 设计**：
- **A. Cold** — 只给任务描述，agent 从零摸索（对应"用户没装扩展"）
- **B. Oracle-skill** — 从 WorkArena 内置 ground-truth 轨迹**机械合成**的 SKILL.md（**性能上限**）
- **C. Human-skill** — 人工用 Skill Recorder 扩展**真录**的 SKILL.md（**真实产品体验**）

### Oracle skill 是什么？为什么要有？

WorkArena 每个 task class 都有一个 `cheat(env, chat_messages)` 方法 —— 这是 benchmark 作者为了验证任务可解而内置的"作弊脚本"，它知道任务的 ground-truth（正确的字段值、record sys_id、选择器），会直接驱动 Playwright 把任务完成。

**"Oracle SKILL.md"** = 把 `cheat()` 跑一次产生的 action 序列 (`click(selector)`, `fill(selector, value)`, `navigate(url)`...) 渲染成和人工录制完全同格式的 SKILL.md 文件。它代表"理论上最完美的演示" —— 每个 selector 都是稳的、每个值都是对的、没有多余动作。

**具体例子** —— 任务 `workarena.l2.create-incident`：

| Arm | SKILL.md 大概长这样（节选） |
|---|---|
| Oracle | `browse fill '#sys_display.incident.short_description' 'Printer jam in Bldg 4'`<br>`browse select '#incident.priority' '1'`<br>`browse fill '#sys_display.incident.assigned_to' 'Beth Anglin'`<br>`browse click '#sysverb_insert'` |
| Human | "在左侧菜单点 Incidents → New，填 short description… 等下拉框出来选 Beth Anglin… 点 Submit，等右上角绿色 toast"（伴随更多步骤、更软的 selector、可能有 hover/scroll 这类人类副动作） |

**为什么需要 oracle arm**：
1. **天花板锚定**：oracle 完成率告诉你"假设 SKILL.md 内容完美，agent 能跑到多高"。如果 oracle 也只能 60%，说明瓶颈在 agent 或注入方式，不在录制质量
2. **拆解变量**：cold→oracle 差距 = "有演示 vs 没演示"的贡献；oracle→human 差距 = "人录制质量损失"的贡献。两个数字分别对应两个产品命题
3. **零人力**：脚本生成，10 个任务 10 分钟搞定，迭代快

**论文/blog 故事的力量**：cold 10% → human 80% 已经很强；如果 oracle 是 90% 而 human 是 85%，说明"人类一次随手录的 SKILL.md 已经接近理论上限"，这是 Skill Recorder 产品的核心卖点。

**MVP 规模**：10 任务 × 3 runs × 3 arms = **90 次跑**。1-2 周出第一版数据。

---

## 备选 Benchmark 方案

WorkArena 是首选，但根据时间、目标受众、技术约束的不同，也有其他可选。下表是横向对比：

| Benchmark | 任务领域 | 规模 | 部署 | 评估方式 | 何时选它 |
|---|---|---|---|---|---|
| **WorkArena / WorkArena++** (首选) | ServiceNow 企业 RPA (ITSM/HR/CMDB) | L1: 33 / L2-L3: ~680 | 在线 (ServiceNow PDI) | 走 SN API 校验 — deterministic | **首选** — RPA 故事最贴、L2 baseline 低、可信度高 |
| **WebArena** | Reddit / GitLab / 电商后台 (Magento) / OSM / CMS | 812 | 自托管 Docker，全离线 | URL + 文本 + functional checks — deterministic | **离线/无 SaaS 依赖**、想跑大量并行、reviewer 在意"无 SaaS 锁定" |
| **VisualWebArena** | WebArena + Classifieds / 视觉电商 | 910 | 自托管 Docker | 同上 + 图像匹配 | 想强调 SKILL.md 包含**视觉锚点**（screenshot ref）的价值 |
| **WebVoyager** | 15 个真实在线站点 (Amazon/GitHub/Google Maps/BBC...) | 643 | 在线（真实网站） | GPT-4V judge — 有噪声 | 想要"真实公网站点"故事，但要忍受 LLM-judge 的不稳和站点改版 |
| **Mind2Web-Live** | 137 个真实网站（live 版） | ~300 子集 | 在线 | 元素级 + LLM judge | 跨站点泛化论证（同一种 skill 在不同站点能否复用） |
| **OSWorld** | 全桌面 OS (Chrome + LibreOffice + GIMP + VS Code...) | 369 | 自托管 VM | API + 文件 + 文本检查 — deterministic | 想超出浏览器、把故事讲成"通用 RPA"而非"web 自动化" |
| **AssistantBench** | 真实开放式 web 任务 (research-style) | 214 | 在线 | exact match + LLM judge | 想强调 long-horizon information seeking |
| **自建任务集** | 自选目标用户工作流（HubSpot / Notion / Linear / Stripe...） | 10-30 | 在线 | 自写 post-condition 或 LLM judge | 销售/募资 demo 导向，想用**目标客户实际用的工具**讲故事 |
| MiniWoB++ (不推荐) | 104 个小 web 控件任务 | 104 | 自托管 | 内置 reward | 太简单，frontier 模型已饱和 |

### 几条选型 heuristic

- **想 1 周出数据 + 论文级可信度** → WorkArena L2
- **不想绑 SaaS、想跑超多并行** → WebArena (Docker)
- **想覆盖跨站点泛化** → WebArena + WorkArena 各 5 任务（混合）
- **目标是 VC pitch / 产品 demo** → 自建任务集，挑 5 个目标客户日常用的 SaaS，配合 WorkArena 当"客观参考"双轨上
- **想超越浏览器讲通用 RPA** → OSWorld（但工程量翻倍）

### 推荐组合（按野心从小到大）

| 野心 | 组合 | 总任务数 | 预计工时 |
|---|---|---|---|
| **MVP** (本 plan) | WorkArena L2 × 10 | 10 | 1-2 周 |
| **Blog / 内部演示** | WorkArena L2 × 10 + 自建 (HubSpot/Notion) × 5 | 15 | 2-3 周 |
| **公开发布 / 媒体** | WorkArena L2 × 30 + WebArena × 20 | 50 | 1 个月 |
| **论文级** | WorkArena L2/L3 × 50 + WebArena × 50 + OSWorld × 30 | 130 | 2-3 个月 |

本 plan 后续步骤按 **MVP** 假设展开；若选其他组合，Step 2 (任务选择) 和 Step 3 (oracle 合成) 需要按对应 benchmark 的 API 微调，其他步骤架构不变。

---

## 架构总览

```
skill-recorder/
└── eval/                            # 新建，Python 项目（pyproject.toml）
    ├── README.md
    ├── pyproject.toml               # 依赖: browsergym, agentlab, anthropic, pandas
    ├── .env.example                 # SNOW_INSTANCE_*, ANTHROPIC_API_KEY
    ├── tasks/
    │   └── selection.yaml           # 选定的 10 个 workarena task_id + 元信息
    ├── skills/
    │   ├── oracle/                  # B arm — 脚本生成
    │   │   └── {task_id}.SKILL.md
    │   └── human/                   # C arm — 人工录制后手动放入
    │       └── {task_id}.SKILL.md
    ├── src/
    │   ├── agents/
    │   │   ├── base.py              # 包装 AgentLab GenericAgent
    │   │   ├── cold.py              # arm A
    │   │   └── skill_equipped.py    # arm B/C — 注入 SKILL.md 到 system prompt
    │   ├── oracle_synth.py          # 从 WorkArena cheat trajectory → SKILL.md
    │   ├── runner.py                # 主循环: tasks × arms × seeds
    │   ├── scorer.py                # 复用 WorkArena reward + 自己加 wall/tokens
    │   └── reporter.py              # CSV + Markdown 报告
    └── results/
        ├── runs/{timestamp}/        # 每次实验的原始日志
        └── reports/{timestamp}.md   # 最终对比报告
```

设计原则：**Python 子项目，和现有 TS monorepo 共存但不耦合**，根目录的 `pnpm` 命令不触碰 eval/。

---

## Step-by-Step

### Step 1: 基础设施 (~半天)

1. 申请 [ServiceNow Personal Developer Instance](https://developer.servicenow.com)（免费，5 min）
2. 在 `eval/` 起 Python 项目：`uv init` 或 `poetry init`，Python 3.11+
3. 安装依赖：`uv add browsergym workarena agentlab anthropic pandas pyyaml`
4. `workarena-install` 初始化任务数据
5. `.env.example` 写好：
   ```
   SNOW_INSTANCE_URL=https://devXXX.service-now.com
   SNOW_INSTANCE_UNAME=admin
   SNOW_INSTANCE_PWD=...
   ANTHROPIC_API_KEY=sk-ant-...
   ```
6. **冒烟测试**：用 AgentLab 内置 demo agent 跑通 1 个 WorkArena L1 任务，确认环境通畅

**Done 标志**：`python -m agentlab.experiments.launch_exp` 能跑出一条带 reward 的 trace。

### Step 2: 选 10 个任务 (~半天)

1. 浏览 WorkArena++ L2 task catalog (`workarena.atomic.*` + `workarena.l2.*`)
2. 挑选标准：
   - 优先 L2 compositional（多步、有 form fill / list filter / record creation）
   - 跨 3-4 个领域：incident、change、HR、knowledge base、CMDB
   - 避开纯 navigation（太简单）和纯报表（reward 不稳）
3. 把 10 个 task_id 写入 `eval/tasks/selection.yaml`：
   ```yaml
   - id: workarena.l2.create-incident-and-assign
     domain: itsm
     steps_expected: 6
   - ...
   ```
4. 跑每个任务 1 次 cold baseline 做 sanity check，确认 reward signal 工作

**关键文件**：参考 `apps/web/messages/en.json`、`packages/skill-types/src/index.ts` 的命名风格保持一致。

### Step 3: Oracle SKILL.md 合成器 (~1 天)

把 WorkArena 的 `cheat()` 输出转换成和人工录制同格式的 SKILL.md（详见上文"Oracle skill 是什么"）。

**工作流**：

1. **抓 cheat trajectory** — 写 `eval/src/oracle_synth.py`：
   ```python
   from browsergym.workarena import ALL_WORKARENA_TASKS
   from playwright.sync_api import sync_playwright

   task_cls = ALL_WORKARENA_TASKS[task_id]
   task = task_cls(seed=0)
   with sync_playwright() as p:
       page = p.chromium.launch().new_page()
       task.setup(page)
       actions = task.cheat(page, chat_messages=[])  # 返回 action 序列
       # actions ~= [{"type": "fill", "selector": "#...", "value": "..."}, ...]
   ```
2. **映射到 Skill 类型** — 把每条 action 转成 `SkillStep`（intent 从 task 描述+字段名推断，selector 进 `SelectorEntry`，value 进 `valueTemplate`）。复用 `packages/skill-types/src/index.ts` 的类型，不要重新定义。
3. **渲染 Markdown** — **不要** 在 Python 端重新实现渲染逻辑。两个选项：
   - **方案 A (推荐)**：写一个薄 Node CLI `packages/skill-render/bin/render.ts`，读 stdin JSON 吐 stdout Markdown。Python 端 `subprocess.run(['pnpm', '--filter', '@skill-recorder/render', 'exec', ...])` 调用。保证 oracle 和 human 走完全同一渲染管线。
   - **方案 B (备选)**：把 `renderSkillAsMarkdown.ts` 移到 `packages/skill-render/dist/render.js` 编译产物 + Node 直接 invoke。
4. **生成 + spot check** — 跑出 10 份 `eval/skills/oracle/{task_id}.SKILL.md`，人眼对比 1-2 份 oracle vs human，确认两者格式一致、只是内容不同。

**关键质量门禁**：oracle SKILL.md 和 human SKILL.md 必须**字节级同一个渲染器产出**，否则下游对比就不干净（任何格式差异都会被 LLM 当成信号）。

### Step 4: Human SKILL.md 录制 (~1 天人力)

1. 装好本地构建的扩展：`pnpm --filter @skill-recorder/crx build`，Chrome 加载 `apps/crx/dist/`
2. 在 ServiceNow PDI 上人工完成每个任务一次，录制并导出 `SKILL.md`
3. 移动到 `eval/skills/human/{task_id}.SKILL.md`（手动重命名以匹配 task_id）
4. **不要修改 / 美化** —— 这就是测"真实人类一次性录制"的质量

### Step 5: Agent 包装层 (~1 天)

1. `eval/src/agents/base.py`：包一层 `agentlab.agents.GenericAgent`，配置 Claude (sonnet-4-6 或 opus-4-7) 作为 backbone
2. `eval/src/agents/cold.py`：默认 system prompt（来自 AgentLab），不动
3. `eval/src/agents/skill_equipped.py`：
   - 在 system prompt 末尾追加：
     ```
     ## Recorded Skill (reference demonstration)
     <SKILL.md 文件内容原样粘贴>
     ```
   - 读取路径由 arm 决定：`skills/oracle/` or `skills/human/`
4. 关键：**三个 arm 用同一个底层 agent，只换 prompt** —— 唯一变量是 SKILL.md，避免混淆

### Step 6: Runner (~半天)

1. `eval/src/runner.py`：循环 `tasks × arms × seeds(0,1,2)`
2. 每次跑记录：
   - `success`: bool（WorkArena task reward == 1.0）
   - `partial_score`: 0-1（部分完成度，若任务支持）
   - `wall_clock_sec`
   - `tokens_in / tokens_out`
   - `cost_usd`（按 Claude pricing 算）
   - `trace_path`: AgentLab dump 位置
3. 写入 `eval/results/runs/{timestamp}/runs.csv`
4. **顺序跑，不并行**（ServiceNow PDI 单实例，状态会互相污染）
5. 加 retry-on-network-error，但**不要 retry-on-task-failure**（失败就是失败）

### Step 7: Scorer + Reporter (~半天)

1. `eval/src/reporter.py` 从 `runs.csv` 聚合：
   - 按 arm 算 mean success rate + 95% Wilson CI
   - 按 arm 算 mean wall-clock + std
   - 按 arm 算 mean cost
   - 按 task 出一个 heatmap（行=task，列=arm，色=success rate）
2. 输出 `eval/results/reports/{timestamp}.md`，包含：
   - 一张总表（3 行：cold / oracle / human）
   - 任务级别 breakdown
   - 几个 cherry-pick 的失败 trace 链接（cold 失败 vs human 成功的同一任务）

### Step 8: 验收 (~半天)

1. 跑完整 90 runs，预算 ~$30-50 API 费 + 4-8 小时 wall-clock
2. 检查 sanity：
   - cold arm 完成率 ∈ [5%, 30%]（太高说明任务选太简单）
   - oracle arm 完成率 ∈ [70%, 95%]（太低说明 SKILL.md 注入方式有问题）
   - human arm 完成率 vs oracle 的差距 < 20pp（太大说明人类录制质量有问题）
3. 把报告 commit 到 `eval/results/reports/`，跑结果写一段 blog draft

---

## 关键文件 (要新建)

| 文件 | 作用 |
|---|---|
| `eval/pyproject.toml` | Python 项目 manifest |
| `eval/tasks/selection.yaml` | 选定的 10 个 task_id |
| `eval/src/oracle_synth.py` | 从 cheat trajectory → SKILL.md |
| `eval/src/agents/skill_equipped.py` | 注入 SKILL.md 到 prompt |
| `eval/src/runner.py` | 主实验循环 |
| `eval/src/reporter.py` | 聚合 + 报告 |

## 关键文件 (要复用)

| 文件 | 用途 |
|---|---|
| `packages/skill-types/src/index.ts` | `Skill`/`SkillStep`/`SelectorEntry` 数据结构 |
| `packages/skill-render/src/*` | `renderSkillAsMarkdown()` — Oracle 合成时复用，保证和真录一致 |
| `apps/crx` (作为工具) | Step 4 录人工 SKILL.md 用 |

---

## 验证 (End-to-End)

```bash
# 1. 环境
cd eval && cp .env.example .env && $EDITOR .env
uv sync && uv run workarena-install

# 2. 冒烟（1 任务 × 3 arm × 1 run = 3 次跑）
uv run python -m src.runner --tasks-limit 1 --seeds 0 --smoke

# 3. 完整 MVP（90 次跑）
uv run python -m src.runner --config tasks/selection.yaml --seeds 0,1,2

# 4. 出报告
uv run python -m src.reporter --run results/runs/<timestamp>
open results/reports/<timestamp>.md
```

**通过标准**：
- 报告里能看到 3 arm 的完成率、wall-clock、cost 对比表
- cold 和 human-skill 的完成率差距 ≥ 30pp（否则故事讲不动）
- 任意一个任务上能给出 cold 失败 trace + human-skill 成功 trace 的对照截图/日志

---

## 不做的事 (Out of Scope for MVP)

- 不集成 web app 展示 leaderboard（先用静态 Markdown 报告）
- 不跑 WebArena/VisualWebArena（先把 WorkArena 做扎实，下个迭代再扩）
- 不做 selector-level deterministic replay（player 模块本身就是可视化-only，没必要二次造轮子）
- 不并行化 runner（PDI 单实例限制，并行会污染状态）
- 不集成 CI（实验性质，手动跑）
