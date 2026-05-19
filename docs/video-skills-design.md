# 视频转 Skill：工程设计文档

状态：草稿 v0.1（2026-05-15）
作者：在写任何代码之前先做一轮设计

## 问题

目前一个 Skill 是这样产生的：用 rrweb 录制一段浏览器操作，把动作日志蒸馏成可重放的脚本（输出给 `browse` CLI 用的 `SKILL.md`）。这套流程能覆盖目标 UI 明确的过程型教程，但是有相当大一部分有用的"技能"只以 YouTube 教程的形式存在——而且其中很多根本就不是过程型的。

种子样本：[《How to find best freelancers on Fiverr》](https://www.youtube.com/watch?v=Bx6BVxP8Uog)。这种视频里没什么可"点"的东西。它教的其实是用户在浏览的时候在脑子里跑的一套**评估准则**：评论数阈值、徽章信号、回复时长经验值、以及一些红旗，比如卖家不主动提澄清问题就要警惕。

我们想要的：粘贴一个 YouTube 链接 → 拿到一份能被 Claude Code 加载并直接套用的 `SKILL.md`。

## 不做（v1）

- 多语言字幕（v1 只做英文；v2 再做创作者上传的非英文字幕）。
- 没有字幕的视频（不接 Whisper/STT 兜底，没字幕就直接报错，附上原视频链接让用户去看）。
- 视频画面里的幻灯片/示意图 OCR。
- 超长视频（>45 分钟）——免费档跑不起，直接报"过长"。
- 频道维度的聚合（"把这位 up 主的 top 10 蒸馏成一个 skill 包"）。

## 视频技能的两种形态

渲染器要同时处理这两种：

| 形态 | 来源信号 | 输出结构 | 例子 |
|---|---|---|---|
| **过程型** | 讲解者一步步念 UI 操作（"点设置齿轮，然后……"） | 沿用现有的动作步骤（`navigate`/`click`/`fill`/…），但 selector 是从口述目标里推断出来的，会比录制版的弱 | "如何在 GitHub 启用 MFA" |
| **启发式** | 讲解者描述判断标准 / 心智模型 | 新增 `guidance` 步骤类型，带 `criteria[]` 和 `notes`——没有 selector，没有 url | "如何挑选 Fiverr 自由职业者" |

实际上一条视频里两种形态经常混合出现。蒸馏器必须能产出异构的 `steps[]`，比如一条视频可能产出 `[navigate, guidance, guidance, click, guidance]`。

## 整体架构

```
┌─────────────┐   POST /distill   ┌──────────────────────┐
│  CRX 面板   │ ────────────────▶ │  Cloudflare Worker   │
│ "从视频导入" │  { videoUrl }     │  (skill-distill-api) │
└─────────────┘                   │                      │
                                  │  1. oEmbed → 标题    │
                                  │  2. youtube-transcript│
                                  │  3. Anthropic SDK    │
                                  │     (Claude 4.6/4.7) │
                                  │  4. Skill 校验       │
                                  └──────────┬───────────┘
                                             │  Skill JSON
                                             ▼
                                  ┌──────────────────────┐
                                  │   CRX skills 存储    │
                                  │   + autoSaveSkillMd  │
                                  └──────────────────────┘
```

核心逻辑放在一个新的 workspace 包里，Worker 和 CLI 都调用它。

### 为什么是独立 Worker，而不是 apps/web 的 API 路由

`apps/web/next.config.js` 在生产环境用 `output: 'export'`（静态导出到 Cloudflare Pages）。静态导出下 API 路由不会生效。要承载服务端逻辑只有两条路：

1. **放弃静态导出**，把 apps/web 切到 `@cloudflare/next-on-pages` 的 Functions。改动很大：整个部署模型变了，营销站不再是一个纯静态站。
2. **新增一个独立的 Cloudflare Worker**（`apps/api`、`wrangler.toml`、单个 `fetch` handler）。面积很小，独立部署，对营销站零影响。

**决定：选方案 2。** Worker 大概 100 行代码，自己一套密钥（`ANTHROPIC_API_KEY`）、自己一套限流（Cloudflare KV 或 Durable Object）、域名挂在 `api.skill-recorder.dev` 即可。营销站保持静态不变。

## 仓库结构（新增部分）

```
skill-recorder/
├── packages/
│   ├── skill-types/                            # 扩展（见 Schema 章节）
│   ├── skill-render/                           # 扩展（渲染器增加 guidance 分支）
│   └── skill-from-video/                       # 新增
│       ├── src/
│       │   ├── index.ts                        # 对外公开 API
│       │   ├── transcript.ts                   # youtube-transcript 封装
│       │   ├── oembed.ts                       # 标题/频道/时长抓取
│       │   ├── distill.ts                      # Anthropic 调用 + prompt
│       │   ├── prompt.ts                       # 系统 prompt（开启 caching）
│       │   ├── schema.ts                       # 用 zod 校验 LLM 返回的 JSON
│       │   └── errors.ts
│       ├── bin/
│       │   └── skill-from-video.ts             # CLI 入口（`npx skill-from-video <url>`）
│       └── package.json
└── apps/
    ├── api/                                    # 新增的 Cloudflare Worker
    │   ├── src/index.ts                        # POST /distill、GET /health
    │   ├── wrangler.toml
    │   └── package.json
    ├── crx/                                    # 新增 UI："从视频导入" Tab
    └── web/                                    # 不动（继续静态）
```

`packages/skill-from-video` 对外暴露：

```ts
export interface DistillOptions {
  videoUrl: string;
  apiKey: string;                  // 注入的 Anthropic key
  model?: string;                  // 默认 claude-sonnet-4-6
  maxTranscriptChars?: number;     // 保险阈值，默认 60_000（≈45 分钟）
  signal?: AbortSignal;
}

export interface DistillResult {
  skill: Skill;                    // 直接可保存
  videoMeta: { videoId: string; title: string; channel: string; durationSec: number };
  transcriptCharCount: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitTokens: number;
}

export async function distillVideoToSkill(opts: DistillOptions): Promise<DistillResult>;
```

## Schema 变更——`@skill-recorder/types`

相对当前 `src/index.ts` 的 diff：

```diff
-export type SkillActionType = 'navigate' | 'click' | 'fill' | 'press_key' | 'scroll' | 'submit';
+export type SkillActionType =
+  | 'navigate'
+  | 'click'
+  | 'fill'
+  | 'press_key'
+  | 'scroll'
+  | 'submit'
+  | 'guidance';

 export interface SkillStep {
   id: string;
   intent: string;
   action: SkillActionType;

   selectors?: SelectorEntry[];
   fingerprint?: ElementFingerprint;

   url?: string;
   valueTemplate?: string;
   key?: string;
   scrollX?: number;
   scrollY?: number;

+  // ── guidance 专属字段 ──
+  /** 要点列表：好信号 / 红旗 / 要在当前页面上核查的项 */
+  criteria?: string[];
+  /** 自由文本说明（例如"用 Top Rated Seller 过滤，按评论数倒序"） */
+  notes?: string;
+
   expectation?: {
     description: string;
     urlMatch?: string;
     elementVisible?: SelectorEntry[];
   };
 }

+export interface SkillVideoSource {
+  url: string;
+  videoId: string;
+  title: string;
+  channel?: string;
+  durationSec?: number;
+  /** ISO 8601，抓字幕的时间 */
+  fetchedAt: string;
+}

 export interface Skill {
   id: string;
   title: string;
   description: string;
   domain: string;
-  startUrl: string;
+  /** 视频蒸馏出来的 skill 可能没有固定起始页，故改为可选 */
+  startUrl?: string;
   parameters: SkillParameter[];
   steps: SkillStep[];
   auth?: SkillAuthHint;
-  sourceRecordingId: string;
+  /** 由 rrweb 录制蒸馏出来时设置。与 sourceVideo 互斥。 */
+  sourceRecordingId?: string;
+  /** 由 YouTube 视频蒸馏出来时设置。 */
+  sourceVideo?: SkillVideoSource;
   createdAt: number;
   updatedAt: number;
 }
```

**迁移：** 现有 IndexedDB 里的老 skill 都有 `sourceRecordingId: string` 和 `startUrl: string`。录制路径仍然会同时填这两个字段。不需要数据迁移；老消费者继续可用。

## 渲染器变更——`@skill-recorder/render`

加两块：

1. `renderStepBody` 新增 `guidance` 分支：

   ```ts
   case 'guidance': {
     const out: string[] = [];
     if (step.notes) {
       out.push(step.notes);
       out.push('');
     }
     if (step.criteria?.length) {
       out.push('**核查清单：**');
       out.push('');
       for (const c of step.criteria) out.push(`- ${c}`);
       out.push('');
     }
     return out;
   }
   ```

2. 文档头：当 `skill.sourceVideo` 存在时，在标题下方加一行 `Source: video — <title> by <channel>`（带 YouTube 链接），并且跳过 `browse open <startUrl>` 那段前置说明。

3. "On failure" 尾部针对偏 guidance 的 skill 略调一句："如果这一步没有具体 UI 操作，把它当作核对当前页面的清单来用，不要当指令去跑。" 两段尾注互不冲突，可以共存。

## 蒸馏 prompt

系统 prompt（开启 Anthropic prompt caching，每次请求都是同一份）：

> 你正在从一段 YouTube 教程字幕中提取一个可复用的"技能"。这个技能会被加载到一个自主编码 Agent（Claude Code）里，用来帮用户完成视频里演示的同一件事。
>
> 返回一个符合下面 `Skill` schema 的 JSON 对象。除 JSON 之外不要任何额外文字。当一步描述的是**要评估/核查的内容**而不是具体 UI 操作时，使用 `action: "guidance"`。只有当讲解者明确指向了某个网站上某个目标的具体 UI 操作时，才使用 `navigate`/`click`/`fill` 等。
>
> 规则：
> - `title`：祈使句、简短，例如"找到一位高质量的 Fiverr 自由职业者"。
> - `description`：1–2 句话，说明这个 skill 实现什么、什么时候用。
> - `domain`：如果视频针对某个具体网站，填该网站；否则留空。
> - `startUrl`：如果适用就填。
> - `parameters`：Agent 应该向用户索取的输入（例如 `query`、`budget_usd`），没有就省略。
> - `steps`：有序，3–12 条。宁可少但高信号，也不要多而稀。
>   - `guidance` 步骤要填 `intent`、`notes` 和 `criteria[]`（每条 3–8 个要点）。selector / url 留空。
>   - 动作步骤要填 `intent` 和该动作相关的字段。selector 列表留空 `[]`——Agent 运行时会通过 snapshot 自己解析。
> - 不要把视频里的具体数字、价格、卖家名称当作规则——那只是讲解者的举例。
> - 如果字幕过于稀疏或离题以至于产不出有用的 skill，返回 `{ "error": "insufficient_content", "reason": "..." }`。

用户 prompt（每次请求都变）：

```
视频：<title> by <channel>  (<duration>, <videoId>)
URL：<videoUrl>

字幕（已轻度清洗，时间戳已去除）：
"""
<截到 60_000 字符内的字幕>
"""

现在请产出 Skill JSON。
```

**输出约束：** 用 Anthropic SDK 的 `tool_choice: { type: "tool", name: "emit_skill" }`，工具的 input schema 就是从 Zod 推出来的严格 JSON Schema。收到 `tool_use` 之后用 Zod 校验；校验失败则把校验错误作为 user message 喂回去重试一次。

**模型选择：** 默认 `claude-sonnet-4-6`——便宜、快，做"字幕→JSON 提取"绰绰有余。API 允许 `?model=opus` 覆盖，留给 Sonnet 处理不来的少数 case。系统 prompt + schema 那一块开启 prompt caching，每次请求只有用户消息是新的。

## API 契约——`apps/api`

```
POST https://api.skill-recorder.dev/distill
Content-Type: application/json
Origin: chrome-extension://<id>  | https://skill-recorder.dev

{
  "videoUrl": "https://www.youtube.com/watch?v=Bx6BVxP8Uog",
  "model": "claude-sonnet-4-6"             // 可选
}

200 OK
{
  "skill": { ... Skill JSON ... },
  "videoMeta": { "videoId": "Bx6BVxP8Uog", "title": "...", "channel": "...", "durationSec": 612 },
  "usage": { "inputTokens": 14200, "outputTokens": 1850, "cacheHitTokens": 13100 }
}

422 Unprocessable Entity
{ "error": "no_transcript", "reason": "Video has no captions enabled." }

429 Too Many Requests
{ "error": "rate_limited", "retryAfterSec": 60 }
```

**CORS：** 白名单 `chrome-extension://<我们的扩展 id>` 和 `https://skill-recorder.dev`（以及 Pages 预览的通配符域名）。其他来源一律拒绝——这不是公开 API。

**限流：** Cloudflare KV，key 用 `cf-connecting-ip`——10 分钟 5 次、每天 20 次。CRX 可以用 `Authorization: Bearer <签名 token>` 旁路（token 在我们上线 Pro 之后由登录流程下发）。

**结果缓存：** KV key = `distill:v1:<model>:<videoId>`，TTL 30 天。同一个视频再次蒸馏既省钱又快。

**幂等绕过：** `?refresh=1` 跳过缓存。

## CRX 集成（v2，不在 v1 里）

侧边栏加第二个 Tab "从视频导入"。一个 textarea 粘贴 URL，"开始蒸馏"按钮。成功后复用录制流程已有的预览页，用户可改名、删步骤；"保存"走 IndexedDB skills 存储，并触发 `autoSaveSkillMarkdown`（已有，零改动）。

不需要新的 `host_permissions`（`<all_urls>` 已经覆盖 Worker 域名）。manifest 不动。

## CLI（v1 里程碑）

```bash
ANTHROPIC_API_KEY=sk-... pnpm --filter @skill-recorder/from-video skill-from-video \
  https://www.youtube.com/watch?v=Bx6BVxP8Uog \
  --out ./skills/find-fiverr-freelancer.SKILL.md
```

- 从环境变量读 `ANTHROPIC_API_KEY`。
- 直接调用包本身，不走 Worker（v1 阶段 Worker 还没有）。
- 同时写出原始 `Skill` JSON（`.skill.json`）和渲染好的 markdown（`.SKILL.md`），方便我们在迭代 prompt 时做 diff。

## 错误与边缘情况

| 情况 | 检测方式 | 处理 |
|---|---|---|
| 视频没有字幕 | `youtube-transcript` 抛错 / 返回空 | 422 `no_transcript` |
| 视频被年龄限制 / 私密 | oEmbed 401/403 | 422 `inaccessible` |
| 字幕 > 60k 字符 | 抓完做长度检查 | 422 `too_long`（提示 v1 仅支持 ≤45 分钟）。后续：分块 + map-reduce。 |
| 字幕非英文 | 简单启发式（采样的 ASCII 比例 + 迷你 langdetect） | v1：依然尝试，response 里附 warning。v2：自动翻译或拒绝。 |
| LLM 输出非法 JSON / schema 不匹配 | Zod 解析失败 | 把错误喂回去重试 1 次；二次仍失败 → 502 `distill_failed`。 |
| LLM 主动返回 `{error: "insufficient_content"}` | 模型自己判定 | 422 `insufficient_content`，附模型给的 `reason`。 |
| 触发限流 | KV 计数器 | 429，带 `retryAfterSec`。 |
| 非 YouTube URL | URL 解析 | 400 `unsupported_source`（给 Vimeo/Bilibili 留扩展位）。 |

## 成本与防滥用

- Sonnet 输入：约 $3/M tokens；命中缓存：$0.30/M。30 分钟视频字幕大约 25k 输入 tokens。系统 prompt（~2k tokens）被缓存 → 每次冷调用约 25k 未缓存 tokens × $3 ≈ **每次 ~$0.075**；命中缓存的复跑 ≈ $0.01。
- 输出：约 2k tokens × $15/M ≈ **$0.03**。
- 合计：**冷调用 ~$0.10，复跑 ~$0.04**。
- 因为按 videoId 在 KV 里缓存结果，热门视频几乎零成本。
- 单 IP 限流（10 分钟 5 次、每天 20 次）把单 IP 损失上限锁在 ~$2/天。上线后看真实分布再决定要不要做免费公共服务。

## 用于 fixture / prompt 迭代的样本

挑选标准：选 **video skill 才能解的 RPA 场景**——无公共 API、UI 重、操作链长 / 判断密集。开发者类教程（Stripe、Vercel、Custom GPT）一律剔除，因为这些场景 Claude Code 直接打 API 更快，是它的强项而非 video skill 的差异化。

固定在 `packages/skill-from-video/__fixtures__/`：

| Skill 形态 | 视频 | 期望产出 |
|---|---|---|
| **启发式**（雇主侧判断） | `Bx6BVxP8Uog`——[Fiverr 挑自由职业者](https://www.youtube.com/watch?v=Bx6BVxP8Uog) | 1 个 navigate + 5–7 个 guidance；parameters = `query`/`budget` |
| **混合 / RPA 重度**（dashboard 操作链 + 判断） | [2025 Helium 10 Product Research For Beginners](https://www.youtube.com/watch?v=63hsD7k3Q2U) | 多个 navigate/click（Blackbox 过滤器、Cerebro、X-ray 扩展）+ 多个 guidance（价格区间、月销、评论数、季节性、niche 竞争评估）；parameters = `niche`/`budget_range` |
| **启发式偏重 + 表单**（与 Fiverr 镜像配对） | [How to Send Winning Upwork Proposals (Step-By-Step)](https://www.youtube.com/watch?v=cv5jmkICqBg) | 1–2 个 navigate + 1 个 fill（proposal 编辑器）+ 5–8 个 guidance（hook 开头、定价、附件、措辞红线）；parameters = `job_url`/`my_skills` |

选择理由：
- **Helium 10** —— 个人用户拿不到 Helium 10 公共 API，必须 UI 操作。三个工具切换（Blackbox / Cerebro / X-ray）+ 判断标准密集，最能拷打蒸馏 prompt 是否分得清"操作"和"判断"。
- **Upwork** —— 与 Fiverr 形成"雇主侧 vs 接活侧"的对称配对，覆盖同一领域的两端。Upwork 申请没有开放 API。UI 极简（textarea + 几个字段），价值几乎全在判断上，能测出 prompt 对"高 guidance / 低 action"场景的处理能力。
- **Airbnb host 优化** 留作 M3 跑通后的真实测试素材，不进 fixture（避免 fixture 过载）。

每个 fixture 存 `{ url, expectedTitle, expectedActionsCounts: {navigate, click, fill, guidance, ...}, knownGoodSkill: Skill }`，集成测试只在 `RUN_LLM_TESTS=1` 时打真实 Anthropic API（默认回放录好的响应）。

## 里程碑拆分

### M1——基础设施（这份文档 + types/render + CLI）

范围：
1. `@skill-recorder/types` 的 schema 改动（guidance action、sourceVideo、startUrl 改可选）。
2. `@skill-recorder/render` 增加 guidance 分支和 sourceVideo 标题块。
3. 新建 `packages/skill-from-video`，含 `distillVideoToSkill()` 和 CLI bin。
4. 在 Fiverr 样本上跑通；把产出的 `SKILL.md` 提交进仓库作为肉眼检查样本。
5. 迭代 prompt，直到 Fiverr 的输出过 linxin 的眼检。

不在范围：Worker、CRX UI、web app 改动。

### M2——线上 endpoint

范围：
1. `apps/api` Cloudflare Worker、`wrangler.toml`、GitHub Actions 部署任务。
2. CORS、限流（KV）、结果缓存（KV）。
3. 直接复用 `packages/skill-from-video`——Worker 只是个薄薄的传输层。

### M3——CRX 表面

范围：
1. 侧边栏 "从视频导入" Tab。
2. 预览/编辑页复用已有的 skill 编辑组件。
3. 走同一条 `autoSaveSkillMarkdown` 保存路径。
4. 手动跑 5–10 个真实视频。

### M4（更远）

- 无字幕视频走 Whisper STT 兜底（看成本决定上不上）。
- 多语言字幕。
- 长视频走 map-reduce。
- 用更新的模型重新蒸馏已存在的视频 skill。
- 频道级别的"技能包"（top-N 视频打包）。

## 待定问题

1. ~~**过程型 fixture 选哪个。**~~ 已敲定（2026-05-15）：Helium 10 选品（混合型 RPA）+ Upwork 写提案（启发式 RPA），与 Fiverr 启发式形成三角覆盖。剔除了 Stripe / Vercel / GPT 这类 Claude Code 走 API 更快的开发者教程。
2. **可信度标记** —— 视频蒸馏出来的 skill 是否在渲染里加一条"AI 蒸馏，未经人工核验"的提示？倾向加。
3. **Worker 域名挂哪里？** `api.skill-recorder.dev` 需要 DNS 配合。备选：等以后放弃静态导出后，挂在 Pages 自身的路由上。M2 阶段独立 Worker 子域最干净。
4. **CLI 是否支持读取本地字幕文件？** 对调 prompt 时很有用；也方便用户拿 Whisper 输出来喂。代价不大,建议加。
5. **遥测。** videoId 是敏感信息,是否往 PostHog（web app 已经接好的）上报视频 URL 和 token 用量？倾向只记 `model` + `tokens` + `duration_ms`,不记 URL。

## 进入编码前要拍板的事

- ~~敲定过程型 fixture 视频。~~ ✅ 已敲定（见上）。
- 敲定 DNS / Worker 子域方案。
- 确定渲染器里的"AI 蒸馏"标记文案（例如 frontmatter 加一行 `source: video`）。
