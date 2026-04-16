# ARTI Benchmark 设计方案

> 衡量 ARTI Multi-Agent 投研系统的质量、性能与可靠性。
> 聚焦 5 个核心指标，分 4 个阶段渐进落地。

---

## 一、核心指标（5 个）

### 指标 1：分析可用率 (Analysis Success Rate)

> 用户发起一次分析，能拿到完整结果的概率。

```
可用率 = 成功完成的分析次数 / 总发起次数
```

**"完整"的定义：**
- Layer 1 至少 5/7 个分析师返回有效输出
- Layer 2 至少 2 个大师完成辩论
- 合成器输出最终结论

低于此阈值即判定为失败。

**为什么是核心：** 用户等了 60-90 秒，结果拿到残缺报告，体验直接崩塌。其他指标再好，这个不达标都白搭。

| 目标 | 红线 |
|------|------|
| ≥ 95% | < 90% 需立即排查 |

---

### 指标 2：端到端延迟 P90 (E2E Latency P90)

> 90% 的分析请求在多少秒内完成。看 P90 而非平均值 — 用户记住的是最慢的那几次。

**延迟分解采集点：**

```
T1: Layer 1 并行完成（取决于最慢的 agent）
T2: 路由决策（策略匹配 vs LLM 路由）
T3: Layer 2 辩论（N 个大师串行，逐个累加）
T4: 合成器
─────────────────────────────────────────
E2E = T1 + T2 + T3 + T4
```

**为什么是核心：** Layer 2 是串行架构，大师数量直接乘延迟 — 这是当前最大的性能瓶颈。90 秒可以接受，180 秒用户就走了。

| 目标 | 红线 |
|------|------|
| P90 < 120s（单股分析） | P90 > 180s 需优化 |

---

### 指标 3：单次分析成本 (Cost per Analysis)

> 一次完整分析消耗多少美元。

```
成本 = Σ(input_tokens × 模型单价 + output_tokens × 模型单价)
```

**按层分别统计：**

| 层 | 模型 | 成本敏感度 |
|----|------|-----------|
| Layer 1（7 个分析师并行） | claude-sonnet-4-6 | 低 |
| Layer 2（大师辩论串行） | claude-opus-4-6 | **高（~5x Sonnet）** |
| 合成器 | claude-opus-4-6 | 中 |

**为什么是核心：** Opus 价格是 Sonnet 的 ~5 倍。Layer 2 每增加一个大师、每多塞一段历史发言到 prompt，账单直接上涨。不追踪成本，功能一加就爆预算。

| 目标 | 红线 |
|------|------|
| 建立基线，每次架构变更前后对比 | 无理由 >20% 增长需审批 |

---

### 指标 4：输出结构合规率 (Schema Compliance Rate)

> AI 输出能被前端正确解析和渲染的比例。

```
合规率 = 通过 JSON Schema 校验的输出数 / 总输出数
```

**校验内容：**

| 输出来源 | 必需字段 |
|---------|---------|
| 分析师 (Layer 1) | `rating`, `confidence`, `key_points`, `risks` |
| 大师 (Layer 2) | `stance`, `reasoning`, `references` |
| 合成器 | `verdict`, `score`, `summary` |

**为什么是核心：** LLM 输出不可控，偶尔丢字段、格式错乱。前端拿到不合规的 JSON 要么白屏要么显示残缺。这是自动化程度最高、成本最低的质量指标。

| 目标 | 红线 |
|------|------|
| ≥ 99% | < 95% 说明 prompt 需要修复 |

---

### 指标 5：分析一致性分数 (Consistency Score)

> 同一股票、同一时间点，跑 3 次，核心结论的稳定程度。

```
一致性 = 1 - (3 次评级的标准差 / 评级范围)
```

**具体衡量维度：**

| 维度 | 计算方式 |
|------|---------|
| 评级一致性 | 3 次中至少 2 次相同（强烈看多/看多/中性/看空/强烈看空） |
| 置信度方差 | 3 次置信度分数的标准差 |
| 风险点重合度 | 关键风险点的 Jaccard 相似度 |

**为什么是核心：** 用户如果发现同一只股票隔 5 分钟分析一次结论完全不同，会立刻失去信任。一致性是可信度的基础。

| 目标 | 红线 |
|------|------|
| 评级一致性 ≥ 80% | < 60% 说明 prompt 或 temperature 有问题 |

---

## 二、执行计划（4 个阶段）

### Phase 1：被动采集 — 从现有数据建立基线（1 周）

**不写新代码**，从 `orchestrator_logs` 表中提取历史数据。

**产出：**
- SQL 查询脚本，提取可用率、延迟 P50/P90/P99、agent 成功/失败分布
- 当前 5 个指标的基线数字（部分指标可能数据不全，记录缺口）

**采集范围：**

| 指标 | 数据源 | 可行性 |
|------|--------|--------|
| 可用率 | `orchestrator_logs` 成功/错误记录 | 直接可用 |
| 延迟 P90 | `orchestrator_logs.total_latency_ms` | 直接可用 |
| 成本 | 无（需埋点） | Phase 2 补充 |
| 合规率 | 历史输出结构（如有存储） | 部分可用 |
| 一致性 | 无（需主动测试） | Phase 4 补充 |

---

### Phase 2：主动埋点 — 补全成本和延迟数据（1-2 周）

在两个关键文件中增加轻量级埋点：

**`ai-gateway.ts` 增加：**
- 每次 API 调用的 `input_tokens` / `output_tokens`（Anthropic 响应 `usage` 字段已有）
- 模型名称、单次调用延迟

**`orchestrator/index.ts` 增加：**
- 各阶段时间戳（T1 / T2 / T3 / T4）
- 每个 agent 的成功/失败状态
- 写入 `orchestrator_logs` 的扩展字段

**产出：**
- 成本指标开始实时可观测
- 延迟分解到各阶段，可定位瓶颈

---

### Phase 3：自动化结构校验 — Schema 合规检测（1 周）

**新增文件：**

```
benchmark/
├── schema/
│   ├── analyst_output.json    # Layer 1 输出的 JSON Schema
│   ├── master_output.json     # Layer 2 输出的 JSON Schema
│   └── synthesis_output.json  # 合成器输出的 JSON Schema
├── validator.ts               # 校验逻辑
└── runner.ts                  # 对历史输出批量回溯校验
```

**执行方式：**
- 对 `orchestrator_logs` 中已存储的历史输出做回溯校验，建立合规率基线
- 集成到 CI — 每次 prompt 修改后自动跑校验
- 支持 `--dry-run`（只校验不调用 API）

---

### Phase 4：一致性回归测试（2 周）

**测试集构建：**
- 选取 10 只代表性股票（美股 4 / 港股 3 / A股 3）
- 冻结每只股票的市场数据快照（行情、财报、新闻），不依赖实时 API
- 确保每次跑 benchmark 输入完全一致

**执行流程：**
```
对每只股票：
  ├─ 使用冻结数据运行 3 次完整分析
  ├─ 提取评级、置信度、风险点
  ├─ 计算一致性分数
  └─ 输出对比报告
```

**触发时机：**
- 每次 prompt 修改后自动跑
- 每次模型升级后手动跑
- 支持 `--sample N` 只跑 N 只股票（控制成本）

---

## 三、明确不做的事

| 暂不做 | 原因 |
|--------|------|
| LLM-as-Judge 质量打分 | 需要人工标注 golden answers，等指标 1-4 稳定后再做 |
| 投资回报回测 | ARTI 是研究工具不是交易系统，衡量"分析质量"比"赚没赚钱"更合适 |
| 并发压测 | 当前用户量不需要，等 DAU 上来再考虑 |
| 数据源准确性校验 | 属于数据 pipeline 问题，应在数据层解决，不属于 AI benchmark |

---

## 四、指标看板（目标汇总）

| # | 指标 | 目标 | 红线 | 采集阶段 |
|---|------|------|------|---------|
| 1 | 分析可用率 | ≥ 95% | < 90% | Phase 1 |
| 2 | E2E 延迟 P90 | < 120s | > 180s | Phase 1 + 2 |
| 3 | 单次分析成本 | 基线 ±20% | 无理由超 20% | Phase 2 |
| 4 | 输出结构合规率 | ≥ 99% | < 95% | Phase 3 |
| 5 | 分析一致性 | ≥ 80% | < 60% | Phase 4 |

---

## 五、快速开始

```sh
# Dry Run — 检查 Schema 文件是否就绪（不需要数据库连接）
npx tsx benchmark/scripts/runner.ts --dry-run

# 全量运行（需要 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY）
# 注意：.env.local 中的 key 是 anon key，受 RLS 限制；需真正的 service role key
npx tsx benchmark/scripts/runner.ts

# 只跑指标统计
npx tsx benchmark/scripts/runner.ts --module metrics --sample 100

# 只跑 Schema 校验
npx tsx benchmark/scripts/runner.ts --module validate --sample 50

# SQL 基线采集（在 Supabase SQL Editor 中执行）
# → benchmark/scripts/baseline_metrics.sql
```

---

## 六、目录结构（当前）

```
benchmark/
├── schema/
│   ├── analyst_output.json     # Layer 1 ResearchReport JSON Schema
│   ├── master_output.json      # Layer 2 MasterOpinion JSON Schema
│   └── synthesis_output.json   # 合成器输出 JSON Schema（含内容章节校验）
├── scripts/
│   ├── baseline_metrics.sql    # Phase 1 SQL 基线采集（10 条查询）
│   ├── validator.ts            # Schema 校验器（支持回溯 + 单次校验）
│   └── runner.ts               # 统一入口（--dry-run / --sample / --module）
├── datasets/                   # Phase 4 冻结数据（待填充）
└── results/                    # 运行结果（已 gitignore）
```

---

## 七、进展记录

| 日期 | 内容 | 状态 |
|------|------|------|
| 2026-04-15 | 初版设计方案完成 | 完成 |
| 2026-04-15 | 收敛为 5 个核心指标 + 4 阶段执行计划 | 完成 |
| 2026-04-15 | Phase 1 + 3 代码实现：目录结构、JSON Schema、SQL 脚本、校验器、Runner | 完成 |
| 2026-04-15 | 首次基线采集完成（1 条记录），详见下方基线数据 | 完成 |
| 2026-04-15 | E2E 优化第二档完成：合成器流式输出 + Phase 4 一致性测试脚本 | 完成 |
| 2026-04-15 | E2E 优化第三档完成：Layer 1 按市场精简 + Anthropic Prompt Caching | 完成 |

### 首次基线数据（2026-04-15，样本 = 1）

| 指标 | 实测值 | 目标 | 状态 |
|------|--------|------|------|
| 分析可用率 | 100% (1/1) | ≥ 95% | 达标 |
| E2E 延迟 | 386.2s | P90 < 120s | **超红线 (>180s)** |
| 输出结构合规率 | 100% (8/8) | ≥ 99% | 达标 |
| 单次分析成本 | 待埋点 | 基线 ±20% | — |
| 分析一致性 | 待测试 | ≥ 80% | — |

**详细数据：**
- Layer 1：8 个 agent 全部执行并通过 Schema 校验
- 路由策略："美股科技股"
- 选中大师：growth-hunter / value-guardian / reflexivity-hunter / macro-momentum / business-model（5 位）
- **延迟问题**：386s 远超 120s 目标，主要瓶颈在 Layer 2 串行辩论（5 位大师 × Opus 模型）

**下一步行动：**
- 积累更多使用数据后重新运行，建立有统计意义的基线（目标 ≥ 30 条记录）
- 重点排查延迟问题：分解 T1/T2/T3/T4 各阶段耗时（Phase 2 埋点）

---

## 八、E2E 延迟优化 TODO

> 基线：386.2s（目标 < 120s，红线 180s）
>
> 延迟估算分解：
> | 阶段 | 模型 | 调用方式 | 估算耗时 |
> |------|------|---------|---------|
> | 数据加载 (AKShare) | — | 1 次 | ~5s |
> | Layer 1 (8 agents) | Sonnet, 并行 | `Promise.allSettled` | ~30-60s |
> | 路由器 | Sonnet | 1 次 | ~5s |
> | **Layer 2 (5 masters)** | **Opus, 串行** | **for 循环逐个** | **~250-300s** |
> | 合成器 | Opus | 1 次 | ~30-60s |
>
> **核心瓶颈：Layer 2 串行辩论占总延迟 ~70%**

### 第一档：低侵入，不改架构（目标：386s → ~200s）

- [x] **限制大师输出 max_tokens** ✅ 2026-04-15
  - 位置：`orchestrator/index.ts` → `runLayer2Master` → `callAI` 调用
  - 现状：未设 max_tokens，默认 8192；Opus 倾向长篇输出
  - 改为：`max_tokens: 2048`（~400 字中文足够表达观点）
  - 预期：每位大师减少 10-20s 生成时间

- [x] **压缩 Layer 2 的 input context** ✅ 2026-04-15
  - 位置：`orchestrator/index.ts:403-408` `researchContext` 构建
  - 现状：包含 8 个分析师的完整 `fullReport`，约 2-3 万 tokens
  - 改为：只传 `summary` + `keyPoints`，约 2000 tokens
  - 预期：减少 Opus TTFT（首 token 时间），每位大师省 5-10s

- [x] **减少默认大师数量** ✅ 2026-04-15
  - 位置：`orchestrator_strategies` 表的 `max_masters` 配置
  - 现状：科技股策略选 5 位大师
  - 改为：默认 3 位（正方 + 反方 + 补充），充分辩论不需要 5 人
  - 预期：直接省掉 2 个 Opus 调用，~100s

### 第二档：中度改动（目标：~200s → ~120s）

- [x] **Layer 2 分组并行** ✅ 2026-04-15
  - 现状：5 位大师完全串行 `for` 循环
  - 改为分组回合制：
    ```
    回合 1（并行）：buffett(立论) + lynch(立论)     ~50s
    回合 2（并行）：marks(质疑) + soros(反驳)        ~50s
    回合 3（单独）：dalio(挑战)                      ~50s
    总计：~150s（原 ~250s）
    ```
  - 同回合大师看到上一回合输出，辩论质量轻微下降但用户体验大幅提升

- [x] **合成器流式输出** ✅ 2026-04-15
  - `ai-gateway.ts` 新增 `callAIStream` 异步生成器，解析 Anthropic SSE 逐 chunk 产出
  - `orchestrator/index.ts` 合成器改用 `callAIStream`，逐 chunk 推送 `synthesis_delta` 事件
  - `use-orchestrator.ts` 前端新增 `synthesis_delta` 事件处理，用户立即看到裁定文字

### 第三档：架构级优化（目标：< 90s）

- [x] **Layer 1 按股票类型精简** ✅ 2026-04-15
  - 新增 `getAgentsForMarket(symbol, theme)` 按市场返回分析师子集
  - 美股 7 个（全量核心）、港股/A股 6 个（去 vision）、主题模式 5 个（去 vision+sam）
  - 港股/A股每次省 1 个 Sonnet 调用，主题模式省 2 个

- [x] **Anthropic Prompt Caching** ✅ 2026-04-15
  - `ai-gateway.ts` 新增 `SystemBlock` 类型 + `system_blocks` 参数，支持 `cache_control`
  - Layer 2 大师将共享内容（行情+研报）放在首个 system block 并标记 `cache_control: ephemeral`
  - 第 2+ 个大师复用 cache，降低 TTFT 和 input 成本（cache hit 后价格降 90%）

### 前置依赖

- [x] **Phase 2 埋点** ✅ 2026-04-15：orchestrator 各阶段时间戳 + ai-gateway token 消耗日志 + migration 新增字段

---

## 九、AI 幻觉风险 TODO（2026-04-16 诊断）

> 一致性测试暴露：5 只股票 × 3 次 = 15/15 全部"看多"，系统存在结构性偏向。

### P0 — 立即修复

- [ ] **看多/看空阈值对等性**
  - 位置：`_shared/prompts/layer1/` 所有 agent prompts
  - 问题：看空需极端条件（北向资金单日流出>100亿、跌停>50），看多条件宽松
  - 修复：降低看空/中性触发门槛，确保多空条件对称

- [ ] **数据缺失守护栏**
  - 位置：`orchestrator/index.ts` L147 userContent + 各 Layer 1 prompts
  - 问题：Natasha 等 agent 无数据时仍输出具体数字（"北向资金±X亿"），模型幻觉填充
  - 修复：无实时数据时强制标注 `[推断]`，禁止编造具体数字

- [ ] **Temperature 梯度控制**
  - 位置：`orchestrator/index.ts` 各层 callAI 调用
  - 问题：Layer 1/2 均未设 temperature，系统行为过度确定
  - 修复：Layer 1 = 0.3（稳定）、Layer 2 = 0.7-0.8（增加分歧）、Router = 0（确定性）

### P1 — 一周内修复

- [ ] **辩论去从众化**
  - 位置：`orchestrator/index.ts` L513-557 debateTranscript 构建
  - 问题：后续大师看到前序发言，若前几位看多则跟风收敛
  - 方案 A：后续大师只看 Layer 1 摘要，不看前序发言
  - 方案 B：随机翻转某位大师立场，强制论证相反观点

- [ ] **事实与推断来源标注**
  - 位置：`_shared/prompts/synthesizer.ts` + orchestrator 数据传递
  - 问题：合成器将 Layer 1 的推断与真实数据混合，用户无法区分
  - 修复：合成器输出中明确标注每项结论的数据来源

- [ ] **对抗性 benchmark 数据集**
  - 位置：`benchmark/datasets/`
  - 问题：当前 10 只股票均为蓝筹/成长股，缺乏看空样本
  - 修复：增加近期暴跌股、争议股，验证系统是否能输出看空/中性

### 一致性测试基线（2026-04-16，5 只股票 × 3 次）

| 指标 | 实测值 | 目标 | 状态 |
|------|--------|------|------|
| 可用率 | 100% (15/15) | ≥ 95% | 达标 |
| 评级一致性 | 100% | ≥ 80% | **过高，疑似偏向** |
| E2E 延迟（美股） | ~220s | P90 < 120s | 超红线 |
| E2E 延迟（港股） | ~146s | P90 < 120s | 接近目标 |
| 综合分数 | 65% | — | 风险重合度拉低 |
