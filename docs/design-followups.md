# 设计补遗：render CLI、评测 sanity、guidance 评测衔接

状态：草稿 v0.1（2026-05-19）
关系：本文档是对 `eval-plan.md` 和 `video-skills-design.md` 的补充，不替代它们。原始两份保持冻结。

---

## 1. `packages/skill-render` 抽 Node CLI 的接口设计

### 目标约束（按优先级）

1. **字节级一致** — CRX 内的渲染、CLI 渲染、未来 Worker 渲染必须输出完全相同的字符串。这是 `eval-plan.md` 三 arm 干净对比的硬前提。
2. **确定性** — 同一份输入 JSON 产出同一份 MD。不能掺入 `Date.now()`、随机 ID、当前路径等。
3. **快** — Python 端 10 任务 × 1 渲染 = 10 次调用，迭代 prompt 时会反复跑，希望 <100ms/次。
4. **可版本锚定** — eval report 必须能记录"这次是用哪个 renderer 版本跑的"，否则三个月后复现不出来。

### CLI 表面

```bash
skill-render --version
# 0.3.1 (commit abc1234)

skill-render render < skill.json > skill.SKILL.md
skill-render render --in skill.json --out skill.SKILL.md
skill-render render --strict < skill.json    # 遇到未知 action 报错而不是跳过
```

只有一个动词 `render`。不做 `validate` / `lint` / `diff` —— 那些是 caller 的事。

### 输入 / 输出契约

- **stdin**：单个 `Skill` JSON 对象，UTF-8。入口处用 `packages/skill-types` 的 zod schema 兜底；schema 失败 → exit `2` + stderr 写结构化错误：

  ```json
  { "error": "schema", "issues": [{"path": "steps.3.action", "message": "..."}] }
  ```

- **stdout**：纯 Markdown，UTF-8，**结尾固定一个换行**（避免不同环境拼接时锯齿）。
- **stderr**：只在错误路径写。正常路径下 stderr 完全空。
- **Exit code**：`0` 成功，`2` schema 错误，`3` 渲染内部异常，`64` CLI 用法错误（仿 sysexits）。

### 确定性条款（写进 README 当不变量）

- 渲染器内部不允许使用 `Date`、`Math.random`、`process.hrtime`、`os.hostname`
- 步骤顺序 = `skill.steps[]` 原始顺序，不二次排序
- selectors 数组顺序 = 输入数组顺序
- 如果未来要在 MD 里加"生成时间"，必须由 caller 通过显式 `--stamp '2026-05-19T10:00:00Z'` 参数注入，不能让渲染器自己拿钟

### 版本锚定

`skill-render --version` 输出 `<pkg.version> (commit <gitsha>)`。这个 sha 在 build 时由 `tsup` 的 `define` 注入：

```ts
// tsup.config.ts
define: {
  __RENDERER_VERSION__: JSON.stringify(pkg.version),
  __RENDERER_COMMIT__: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
}
```

eval runner 在 `runs.csv` 里记录这个 sha。复现实验时直接 `git checkout <sha> && pnpm --filter @skill-recorder/render build`。

### Python 调用方式

**不要走 pnpm**。`pnpm --filter ... exec` 启动 ~500ms，10 次调用 = 5 秒，迭代手感差。直接 node 调本地 dist：

```python
# eval/src/render.py
import json, subprocess
from pathlib import Path

RENDER_BIN = Path(__file__).parents[2] / "packages/skill-render/dist/cli.js"

def render_skill(skill: dict) -> str:
    if not RENDER_BIN.exists():
        raise RuntimeError(
            f"renderer not built: {RENDER_BIN}\n"
            "run: pnpm --filter @skill-recorder/render build"
        )
    p = subprocess.run(
        ["node", str(RENDER_BIN), "render"],
        input=json.dumps(skill).encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if p.returncode != 0:
        raise RuntimeError(f"render failed (exit {p.returncode}): {p.stderr.decode()}")
    return p.stdout.decode("utf-8")
```

冷启动 ~80ms。若之后变瓶颈，再加 `skill-render render-stream` 子命令吃 NDJSON、长进程常驻。v1 不上。

### 一致性测试

在 `packages/skill-render/tests/cli-parity.test.ts` 加一条：

```ts
test('CLI output matches in-process renderer byte-for-byte', () => {
  const skill = loadFixture('fiverr.skill.json');
  const inProc = renderSkillAsMarkdown(skill);
  const viaCli = execSync(`node ${cliPath} render`, { input: JSON.stringify(skill) }).toString();
  expect(viaCli).toBe(inProc);
});
```

这条挂掉 → 立刻知道哪一边漂了。

### 一个需要现在拍板的边界

`video-skills-design.md` 引入 `guidance` 这种 action。如果 CLI 不支持 `guidance` 就发布给 eval 用，未来 video skill 跑 eval 会走另一条渲染路径，破坏"字节一致"的承诺。

两个选择：

- **A. 现在就把 `guidance` 加进 renderer**，eval 用的版本天然兼容。代价：video-skills M1 的 schema 改动得先并掉，eval Step 3 才能开工。
- **B. eval 显式锁定"只支持 procedural action"**，CLI 加 `--strict` 标志，遇到 `guidance` 直接 exit 2。等 video skill 也要进 eval 时再升级。

**倾向 A** —— `guidance` 的渲染逻辑很薄（`notes` + `criteria[]` 的 bullet 列表），现在加比以后两边对齐成本低；而且强迫 video-skills M1 的 schema 改动先落地，反过来给 eval 一个明确的入口依赖。

### 配套小修

`eval/src/oracle_synth.py` 应该加一行 assertion，防止 procedural eval 的 SKILL.md 里意外混进 `guidance` step（否则 CLI `--strict` 模式会拒收）：

```python
assert all(s["action"] != "guidance" for s in steps), \
    "oracle skill must not contain guidance steps (procedural eval only)"
```

---

## 2. 评测 sanity range 越界诊断手册

### 先量化统计功率

MVP 的 **10 任务 × 3 seeds = 30 trials/arm**，二项分布的 95% Wilson CI 大约 ±15pp。意思是哪怕跑出 `cold 10% / human 40%` 这样 30pp 的 gap，两边的置信区间也只是堪堪不重叠 —— 故事讲得通但统计很薄。

**建议**：把 seeds 从 3 提到 **5**（90 → 150 runs，多约 \$15 API），CI 收窄到 ±11pp，故事就硬了一档。

### 每个 sanity 范围越界时该怎么办

#### cold > 30%（任务太简单）

**意味着**：frontier 模型已经能裸跑掉这批任务，"演示价值"的 delta 被压缩。

**诊断**：
- 跑 `agentlab inspect` 看 cold 成功的轨迹平均步数。<5 步说明任务本身就是 atomic，不是 compositional
- 检查任务难度分布：是否过多 `workarena.atomic.*` 漏进来当 L2 用了

**处置**：
- 把 atomic-only 的任务从 `selection.yaml` 剔掉，换 `workarena.l2.compositional-*`
- 退一步：把 model 从 opus-4-7 降到 sonnet-4-6（更现实的产品场景）
- 极端：上 L3

#### cold < 5%（baseline 没信号）

**意味着**：任务本身有结构性障碍，跟"有没有 SKILL.md"无关。

**诊断**：
- 抽 2 个 cold-fail trace 手工看：是 selector 找不到、还是权限不足、还是 reward 函数本身写错了
- 跑一次给定 oracle SKILL.md 是否能上 50% —— 如果连 oracle 都上不去，问题在环境/agent，不在任务难度

**处置**：
- 如果 reward 信号失败：替换该任务，不调 baseline
- 如果是 agent 能力不足：升 model 或换 task
- 千万别为了让 cold "好看"就反向调任务，那等于自我作弊

#### oracle < 70%（最关键 — 演示注入路径坏了）

oracle 是机械合成的"完美演示"，跑不动说明 agent 没真正消费 SKILL.md。这是最高杠杆的诊断。

**诊断**（按优先级）：
- 在 `skill_equipped.py` 里打印 final system prompt，确认 SKILL.md 内容真的进 prompt 了（曾经有 SDK 默默截断 system prompt 的坑）
- 抽 1 个 oracle 失败 trace，对比 agent 前 5 个 action 和 SKILL.md 前 5 步 —— 偏多远
- 检查时间漂移：oracle SKILL.md 是 T0 录的，eval 在 T1 跑，ServiceNow 的动态 sys_id（每次 PDI reset 都变）会让 selector 全部失效
- 检查 `cheat()` 本身是否能在 fresh PDI 上跑通（先于 agent 直接跑 cheat 一遍当 ceiling）

**处置**：
- 时间漂移 → oracle SKILL.md 改成"相对 selector + intent"形式，而不是绝对 `sys_id`。这是产品本身就该做的事
- prompt 注入位置不对 → 试试把 SKILL.md 放在 user message 而不是 system，或加显式 `<recorded_skill>` 标签包裹
- 如果改了都没救 → 说明 SKILL.md 这种格式根本不被 agent 当一回事，这是**比实验结果更坏的发现**，要回到产品定义层面

#### oracle > 95%（疑似 over-fitting）

**意味着**：agent 在严格复刻 SKILL.md，而不是把它当 guidance 用。

**诊断**：
- 跑一个 perturbed seed：把 SKILL.md 里的某个非关键字段值改掉，agent 还能完成任务吗？能 = 真有泛化，不能 = 它只是抄
- 看任务方差：3 个 seed 之间 task 参数有没有真变化？WorkArena 默认 seed 0/1/2 在某些任务上的字段值是一样的，等于没扰动

**处置**：
- 加强 task 间方差（seed 数 ↑、参数 randomization ↑）
- 如果确认是过拟合：这不是 bug 而是 finding —— 报告里点名说"SKILL.md 注入方式让 agent 倾向于复刻而非推理"，这是 follow-up work

#### human 比 oracle 差 > 20pp（人录质量瓶颈）

**意味着**：录制工具/录制者产出的演示对 agent 来说太弱。

**诊断**：
- 同一个任务的 oracle 和 human SKILL.md `diff`：步骤数差多少？selector 谁更稳？intent 描述谁更清？
- 抽 2 个 `oracle 成功 / human 失败` 的同任务对，看 agent 在 human 版本上具体在哪一步偏轨

**处置**：
- 如果 human 步骤过多（人类副动作多）→ 录制后处理需要更激进地去噪
- 如果 selector 弱（`button.btn-primary` 这种）→ rrweb 抓 fingerprint 的策略要改
- 如果 intent 模糊（"点这个"）→ 录制器要在导出时让用户重写 intent，或用 LLM 后处理填 intent

这一条**是产品最直接的迭代信号**，不是"实验设计 bug"。

#### human > oracle（罕见但可能）

**意味着**：人录的演示里有 oracle 漏掉的、agent 真正需要的信号，比如"等右上角 toast 出现"这种 oracle 直接 `click submit` 跳过的等待。

**诊断**：抽两个 human > oracle 的任务，看 human SKILL.md 里多了什么 oracle 没有的 step。

**处置**：这其实是产品最强的卖点 —— "人录比理论上限更好"。把这两个 case 写进 blog 里。

### 关于 "12× 提速" 的度量修正

`eval-plan.md` 的故事目标 `5min vs 60min` 没建模过。直接看 `wall_clock_sec` 比例会被 cold arm 的 step-budget 截断 inflate（cold 跑到上限被 kill 计成 "60 min"，实际可能能继续跑）。

建议在报告里区分两个数：

- `wall_clock_sec_success_only` —— 只统计成功完成那批的耗时
- `wall_clock_sec_all` —— 含失败（含 budget 截断）

故事里用第一项讲提速，第二项放附录。否则会被仔细读的人挑出来。

---

## 3. video-skills × eval 的衔接缝

### 现状的"缝"

`eval-plan.md` 隐含假设了 SKILL.md = 过程型动作序列。oracle 合成器从 `cheat()` 出，只可能产出 `click`/`fill`/`navigate`。WorkArena 的 reward 函数检"记录是否被正确创建"，本质是 deterministic post-condition。

`video-skills-design.md` 引入的 `guidance` step **没有 selector、没有 url、没有 post-condition**。它的价值在于"agent 在自由探索过程中是否做对了判断"，而不是"是否到达了某个终态"。

→ **当前 eval pipeline 没办法评估 guidance skill 的价值**。

### 处理：分轨

视频 skill 的价值要拆成两类来评：

**procedural-heavy 视频 skill（Helium 10）**：
- 可以走类似 WorkArena 的路径，但环境不是 ServiceNow PDI
- 选项：
  - 找一个 SaaS 自己搭 staging（贵、麻烦）
  - 走 WebVoyager / Mind2Web-Live 的 Helium 10 子任务（如果存在）
  - 用 Browserbase 录制 + replay 做半合成 benchmark
- 这条路 video-skills M2/M3 不做，是 M4+

**heuristic-heavy 视频 skill（Fiverr / Upwork）**：
- WorkArena 完全无法测
- 需要**构造判断场景**：手工写 5-10 个 "Fiverr 候选清单 + 一个正确选择" 的合成页面
- agent 在挂上 SKILL.md vs 没挂的情况下，pick accuracy 是多少
- 这本质是回到 LLM eval 而不是 agent eval，pipeline 完全不同

### 修订版三 arm（针对 guidance skill）

| Arm | 内容 | 等价于 |
|---|---|---|
| Cold | 无 SKILL.md | "用户没装扩展" |
| Gold | 领域专家手写的 guidance SKILL.md | "理论上限"（不是 cheat 合成，因为没有 cheat） |
| Distilled | 视频蒸馏出的 SKILL.md | "真实产品体验" |

注意 "gold" 不是机械合成 —— 它是人类标注。这意味着 guidance 评测的 oracle 成本远高于 procedural 评测（procedural 用 `cheat()` 自动合成，guidance 需要专家写）。10 个 guidance skill 的 gold 可能要 1-2 天人力。

### 评测指标也要换

procedural eval 的指标：
- success rate（二元）
- wall clock
- token cost

guidance eval 的指标：
- **pick accuracy** —— 在合成场景上选对的比例
- **rationale quality** —— LLM judge 打分 1-5
- **criteria coverage** —— SKILL.md 里提到的 criteria 有几条实际在 agent 推理里被引用

最后一个最重要。`video-skills-design.md` 的 prompt 写了"`criteria[]` 每条 3-8 个要点"，那 agent 实际用了几条？只有 1-2 条 = guidance 没被吃进去。

### Sanity ranges（提议）

- Cold pick accuracy：取决于合成场景的选项数 N，N=4 时随机 = 25%，cold 应在 [25%, 50%]
- Gold pick accuracy：[75%, 95%]
- Distilled 相对 gold 差距 < 25pp（比 procedural 的 20pp 松，因为 guidance 主观性更高）

### 建议加进 video-skills 的待定问题（不改原文）

video-skills-design.md 是冻结文档，所以不在那边加。但下面这条要在工程开始前回答：

> guidance skill 的评测路径未定。当前 eval pipeline（`eval-plan.md`）只覆盖 procedural skill。video-skills 的 M1-M3 不阻塞评测，但 M4 之前要决定：guidance fixture 走 LLM judge 还是构造判断场景。

---

## 行动项清单

下面这些是上面分析推导出的、可以直接动手的小改动：

| 项 | 位置 | 性质 |
|---|---|---|
| 渲染器加 `guidance` 分支 | `packages/skill-render` | video-skills M1 已计划，提早做 |
| 抽 `skill-render` Node CLI（`render` 子命令） | `packages/skill-render/bin/cli.ts` | 新增 |
| CLI 一致性测试 | `packages/skill-render/tests/cli-parity.test.ts` | 新增 |
| 注入 `__RENDERER_VERSION__` / `__RENDERER_COMMIT__` | `packages/skill-render/tsup.config.ts` | 修改 build 配置 |
| `oracle_synth.py` 加 no-guidance assertion | `eval/src/oracle_synth.py` | 新增（eval 自身就是新建） |
| `runner.py` 默认 seeds 从 3 改 5 | `eval/src/runner.py` | 新增 |
| Reporter 双 wall-clock 列 | `eval/src/reporter.py` | 新增 |
| Runner 记录 renderer commit sha | `eval/src/runner.py` | 新增 |
