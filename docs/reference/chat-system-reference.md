# 对话系统参考文档

## 意图检测触发词

用户自然语言输入经过 `src/hooks/use-intent-detect.ts` 的 `detectIntent()` 函数路由到对应命令。

### 纯触发词（需要 lastSymbol 上下文）

| 触发词 | 路由命令 | Handler |
|--------|---------|---------|
| 完整研报 / 深度研报 / 做一版完整的 | `/full {symbol}` | handleAsyncTask("full") |
| 全景扫描 / 四维分析 / 出个报告 / 快速研报 / 分析一下 / 深入分析 / 详细分析一下 / 详细分析 | `/quick {symbol}` | handleQuick |
| 看看 / 扫一眼 / 看一下 | `/scan {symbol}` | handleScan |
| 想买 / 考虑建仓 / 值不值得买 | `/roundtable {symbol} L2` | handleRoundtable |
| 全圆桌 / 7位大师 / 最终决策 | `/roundtable {symbol} L3` | handleRoundtable |

### 带股票名的关键词

| 关键词模式 | 路由命令 | 示例 |
|-----------|---------|------|
| 完整/全面 + 分析/报告/研报 | `/full` | "完整分析苹果" |
| 全景扫描 / 四维分析 / 出个报告 | `/quick` | "全景扫描 TSLA" |
| 诊断/快诊/深度/深入/详细 + 分析/研究 | `/quick` | "详细分析腾讯" |
| 想买 / 值不值得买 | `/roundtable L2` | "TSLA 想买" |
| 出个/生成/做个 + 研报/报告 | `/full` | "出个研报 002475" |

### 短句触发（无需股票）

| 触发词 | 路由命令 |
|--------|---------|
| 盘前 / 开盘前 / 早报 | `/premarket` |
| 盘后 / 复盘 / 收盘 | `/postmarket` |

### 特殊规则

- 长文本 (>200字) → 跳过意图检测，走普通对话
- 触发词匹配但无股票 → `/need-symbol` → toast 提示用户补充代码
- 首次提及股票且无深度触发词 → 自动 `/scan`
- 已 scan 过的股票 → 后续问题走普通对话

## 分析师（Layer 1）

| Agent ID | 代号 | 职责 | Phase | 模型 |
|----------|------|------|-------|------|
| natasha | 📡 Two Sigma | 宏观环境分析 | 1（先行） | claude-sonnet-4-6 |
| steve | 🛡 Citadel | 板块轮动分析 | 2（并行） | claude-sonnet-4-6 |
| tony | 🦾 Morgan Stanley | 技术面分析 | 2（并行） | claude-sonnet-4-6 |
| clint | 🎯 Goldman Sachs | 基本面分析 | 2（并行） | claude-sonnet-4-6 |
| sam | 🦅 JPMorgan | 收益分析 | 2（并行） | claude-sonnet-4-6 |
| vision | 🤖 Renaissance | 量化验证 | 2（并行） | claude-sonnet-4-6 |
| thor | ⚙️ Bridgewater | 风控评估 | 3（依赖上游） | claude-sonnet-4-6 |
| wanda | 🔮 Millennium | 组合策略整合 | 4（依赖所有） | claude-sonnet-4-6 |

Prompt 文件：`supabase/functions/_shared/prompts/layer1/{agent}.ts`

## 投资大师（Layer 2）

| Master ID | 名称 | 流派 | 关注维度 |
|-----------|------|------|---------|
| buffett | 巴菲特 | 价值/成长派 | 护城河、ROE、安全边际 |
| lynch | 彼得·林奇 | 成长股/PEG派 | PEG、十倍股、行业景气 |
| marks | 霍华德·马克斯 | 风险/周期派 | 估值分位、安全边际、下行保护 |
| soros | 索罗斯 | 宏观/反身性派 | 反身性、预期差、做空逻辑 |
| dalio | 达里奥 | 宏观/全天候派 | 债务周期、通胀、全天候配置 |
| druckenmiller | 德鲁肯米勒 | 宏观动量派 | 流动性、趋势、板块轮动 |
| duan | 段永平 | 生意模式派 | 商业模式、管理层、长期复利 |

大师定义：`supabase/functions/_shared/masters.ts`
深度档案：`supabase/functions/_shared/prompts/layer2/{master}.ts`

### Sector 路由（Level 2）

| 行业关键词 | 路由大师 |
|-----------|---------|
| 消费/品牌/白酒/食品 | buffett + duan |
| 科技/AI/芯片/半导体 | lynch + soros |
| 有色/能源/军工/大宗 | dalio + druckenmiller |
| 中概/A股/内资 | duan + buffett |
| 周期/底部/低估/钢铁 | marks + buffett |
| 默认 | marks + dalio |

## 报告类型与执行链路

| 报告类型 | report_type | 分析师 | 大师 | HTML 模板 | Worker |
|---------|------------|--------|------|----------|--------|
| 全景扫描 | panorama | 4 位（natasha/steve/tony/clint） | Level 2（2-3 位） | `build_panorama_html` | panorama.py |
| 完整研报 | stock | 8 位全部 | Level 3（7 位） | `build_report_html` | main.py |
| 盘前诊断 | premarket | 配置（默认 natasha+steve） | — | — | main.py |
| 盘后复盘 | postmarket | 配置（默认 natasha+steve+tony） | — | — | main.py |

## 核心文件索引

### 前端

| 文件 | 职责 |
|------|------|
| `src/hooks/use-intent-detect.ts` | 自然语言 → 命令路由 |
| `src/hooks/use-agent-chat.ts` | 对话主调度（handleScan/Quick/AsyncTask/Deep） |
| `src/hooks/use-report-task.ts` | 异步报告任务创建 + 轮询 |
| `src/lib/chat-commands.ts` | 命令定义 + parseCommand |
| `src/lib/chat-helpers.ts` | AGENT_COMMANDS 映射 |
| `src/lib/scan-formatter.ts` | scan-stock 结果格式化（前后台共用） |
| `src/lib/symbol-extractor.ts` | 股票代码提取 |
| `src/components/agents/ReportCard.tsx` | 对话内报告卡片（iframe + 导出） |
| `src/components/agents/ReportCenter.tsx` | ARTI研报侧栏 |
| `src/components/agents/ChatMessage.tsx` | 消息渲染（按 type 分发） |

### Edge Functions

| 文件 | 职责 |
|------|------|
| `supabase/functions/generate-report/index.ts` | 报告生成入口（edge/worker 分发） |
| `supabase/functions/scan-stock/index.ts` | 快速诊断（技术面+基本面+诊断） |
| `supabase/functions/chat/index.ts` | 流式对话 |
| `supabase/functions/_shared/masters.ts` | 大师定义 + sector 路由 |
| `supabase/functions/_shared/ai-gateway.ts` | AI 调用统一网关 |

### Worker（Python）

| 文件 | 职责 |
|------|------|
| `scripts/report-worker/panorama.py` | 全景扫描 Worker + `build_panorama_html`（HTML 模板 single source of truth） |
| `scripts/report-worker/main.py` | 完整研报 Worker |
| `scripts/report-worker/report_html_builder.py` | 完整研报 HTML 构建器（13 章节） |
| `scripts/report-worker/roundtable.py` | 大师圆桌调用 |
| `scripts/report-worker/data_fetcher.py` | 数据获取（yfinance + hkexnews + ddgr） |
| `scripts/report-worker/html_template.py` | ArtiHtmlDoc 基础模板引擎 |

### 数据库

| 表 | 用途 |
|----|------|
| `report_tasks` | 报告任务（status/result/progress） |
| `report_config` | 报告配置（execution_engine/analyst_agents） |
| `agent_data` | 缓存数据（stock_/profile_/fundamentals_/macro_env） |
| `intent_logs` | 意图路由日志 |
| `chat_messages` | 消息（message_type/metadata） |

### GitHub Actions

| 文件 | 职责 |
|------|------|
| `.github/workflows/report-worker.yml` | 研报 Worker 触发（支持 mock 参数） |
