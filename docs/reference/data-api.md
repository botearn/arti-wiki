# ARTI 数据接口文档

> 本文档覆盖 `supabase/functions/` 下全部 22 个 Edge Functions 的对外契约（入参 / 返回 / 依赖），用于前端联调、自动化脚本接入、排障定位。
>
> 源码位置：`supabase/functions/<name>/index.ts`
> 运行时：Supabase Edge Functions（Deno runtime）
> 更新依据：源码扫描，与代码存在偏差时以源码为准。

---

## 通用规范

- **Base URL**：`https://<project-ref>.functions.supabase.co/<function-name>` 或本地 `http://localhost:54321/functions/v1/<function-name>`
- **Content-Type**：`application/json`
- **CORS**：所有响应统一带 `_shared/cors.ts` 中的 headers
- **JWT**：项目级 `verify_jwt = false`，Edge Function 默认可匿名调用；`admin-users` / `toggle-subscription` / `strategy-summarize` / `generate-report` 等在代码内部显式校验 `Authorization` Bearer Token
- **错误响应**：统一 `{ error: string }` + HTTP 状态码
- **AI 调用**：全部通过 `_shared/ai-gateway.ts`，模型档位见 [`docs/model-strategy.md`](./model-strategy.md)
- **SSE**：仅 `orchestrator` 返回 `text/event-stream`，其他 function 为普通 JSON

### 通用错误码

| 状态码 | 含义 |
|--------|------|
| 400 | 缺少必填参数 / 参数格式错误 |
| 401 | 未携带 Bearer Token 或 token 无效 |
| 403 | 无管理员权限 |
| 404 | 资源不存在（如无法获取某只股票） |
| 429 | 上游限流（常见于 AI 网关） |
| 500 | 内部错误（AI 调用失败 / DB 写入失败） |
| 502 | 外部 API 抓取失败（Yahoo / Finnhub / Firecrawl） |

---

## 功能分类索引

| 类别 | 函数 |
|------|------|
| [AI 对话分析](#ai-对话分析类) | orchestrator · chat · analyst-agent · discussion-agent · master-agent |
| [研报生成](#研报生成类) | generate-report · generate-reports · generate-article |
| [股票数据](#股票数据与扫描类) | stock-quotes · scan-stock · stock-research · resolve-stock · predict-stock |
| [新闻内容](#新闻与内容类) | fetch-news · read-article |
| [路由与匹配](#路由与匹配类) | route · product-match |
| [用户与策略](#用户与策略类) | strategy-summarize · toggle-subscription |
| [管理配置](#管理配置类) | admin-users |

---

## AI 对话分析类

### orchestrator

- **方法**：POST
- **认证**：Bearer Token（可选）
- **功能**：两层多智能体圆桌辩论编排 —— Layer 1 并行分析师 → 路由器 → Layer 2 大师顺序辩论 → 综合裁定
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | symbol | string | 否 | 股票代码（`NVDA` / `0700.HK` / `600519.SS`） |
  | stockData | string | 否 | 前端预加载的行情数据 |
  | mode | `"full" \| "layer1-only" \| "council-only"` | 否 | 默认 `full` |
  | layer1Agents | string[] | 否 | 指定 Layer 1 分析师子集，默认全量 |
  | theme | string | 否 | 主题 / 板块（无 symbol 时使用） |
  | routeReasoning | boolean | 否 | 是否返回路由推理 |

- **返回**：`text/event-stream`（SSE）

  | 事件 | Payload |
  |------|---------|
  | `route_info` | `{ layer1Agents, theme, reasoning }` |
  | `layer1_start` | `{ agents: string[] }` |
  | `layer1_agent_done` | `{ agent, label, report \| error }` |
  | `layer1_complete` | `{ count }` |
  | `router_done` | `{ rule, condition, selectedMasters, reasoning }` |
  | `layer2_start` | `{ masters: string[] }` |
  | `layer2_master_done` | `{ master, role, stance, content }` |
  | `layer2_complete` | `{ count }` |
  | `synthesis` | `{ role, stance, content }` |
  | `error` | `{ message }` |

- **依赖**：`callAI(claude-opus-4-6 / claude-sonnet-4-6)`, DB `orchestrator_strategies` / `orchestrator_logs`, Supabase Auth
- **错误**：401（无认证）· 500（AI 调用失败）

---

### chat

- **方法**：POST
- **认证**：Bearer Token（可选，登录用户会记录到 `chat_sessions`）
- **功能**：实时 AI 投研对话，多种人格（圆桌 / 巴菲特 / 索罗斯 / 彼得林奇 / 数据洞察）
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | message | string | 是 | 用户输入 |
  | symbol | string | 否 | 股票代码 |
  | mode | `"council" \| "buffett" \| "soros" \| "lynch" \| "data-insights"` | 否 | 默认 `council` |
  | chatHistory | `{ role, content }[]` | 否 | 多轮上下文 |
  | stockContext | string | 否 | 预加载行情 |
  | researchContext | string | 否 | 预加载研报（council 模式专用） |

- **返回**：JSON

  ```jsonc
  {
    "content": "string (Markdown)",
    "conversations": [{ "role": "...", "content": "..." }] // council 模式返回
  }
  ```

- **依赖**：`callAI(claude-sonnet-4-6 / claude-opus-4-6)`, DB `chat_sessions` / `agent_data`, Supabase Auth
- **错误**：400（缺失 `message`）· 500（AI 调用失败）

---

### analyst-agent

- **方法**：POST · **认证**：无
- **功能**：Layer 1 单个分析师（共 8 人）的单维度研报生成
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | symbol | string | 是 | 股票代码 |
  | agentType | `"natasha" \| "steve" \| "tony" \| "thor" \| "clint" \| "sam" \| "vision" \| "wanda"` | 是 | 分析师类型 |
  | stockData | string | 否 | 行情数据，缺省会从 DB/外部 API 回退获取 |

- **返回**：`ResearchReport`

  ```jsonc
  {
    "title": "string",
    "summary": "50 字内核心结论",
    "keyPoints": ["要点1", "要点2"],
    "sentiment": "看多 | 看空 | 中性",
    "confidence": 0.85,
    "fullReport": "Markdown",
    "score": 8.5,
    "shortAction": "...", "midAction": "...", "longAction": "...",
    "shortTarget": "...", "midTarget": "...", "longTarget": "..."
  }
  ```

- **依赖**：`callAI(claude-sonnet-4-6)`, DB `agent_data` / `report_config`
- **错误**：429（限流）· 500（AI 调用失败）

---

### discussion-agent

- **方法**：POST · **认证**：无
- **功能**：讨论群内 AI 投顾发言（150–250 字）
- **入参**

  | 字段 | 类型 | 必填 |
  |------|------|------|
  | group_id | string | 是 |
  | agent_id | `"council" \| "buffett" \| "soros" \| "lynch"` | 是 |
  | context_messages | `{ agent_id?, content, role }[]` | 是 |

- **返回**：`{ content: string, message_id?: string }`
- **依赖**：`callAI(claude-sonnet-4-6)`, DB `discussion_messages` / `discussion_groups`
- **错误**：500（DB 写入 / AI 失败）

---

### master-agent

- **方法**：POST · **认证**：无
- **功能**：Layer 2 大师单次发言（立论 / 补充 / 质疑 / 反驳 / 挑战）
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | symbol | string | 是 | 股票代码 |
  | masterType | `"value-guardian" \| "growth-hunter" \| "cycle-judge" \| "reflexivity-hunter" \| "all-weather-architect" \| "macro-momentum" \| "business-model"` | 是 | 大师类型 |
  | researchContext | string | 是 | Layer 1 研报聚合 |
  | debateTranscript | string | 是 | 前序大师发言 |
  | stockContext | string | 否 | 行情数据 |

- **返回**：`MasterOpinion`

  ```jsonc
  { "role": "string", "stance": "立论|补充|质疑|反驳|挑战", "content": "Markdown" }
  ```

- **依赖**：`callAI(claude-opus-4-6)`，无 DB 写入
- **错误**：500（AI 调用失败）

---

## 研报生成类

### generate-report

- **方法**：POST · **认证**：Bearer Token（推荐）
- **功能**：分阶段（phase 0–5）聚合多位分析师的深度研报，支持 worker（GitHub Actions）和 edge 两种执行引擎
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | taskId | string | 是 | 任务 ID，用于追踪进度 |
  | symbol | string | 是 | 股票代码 |
  | stockData | string | 否 | 前端补充行情 |
  | reportType | `"stock" \| "premarket" \| "postmarket" \| "panorama"` | 否 | 默认 `stock` |
  | overrideAgents | string[] | 否 | 覆盖配置的分析师列表 |
  | phase | number | 否 | 执行阶段序号 |
  | phaseState | object | 否 | 上一阶段状态（用于链式调用） |

- **返回**：`{ ok, message?, count?, engine?: "worker"|"edge", error? }`
- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `report_tasks` / `report_config` / `agent_data`, GitHub Actions API
- **错误**：400（缺失参数）· 500（AI / DB 失败）

---

### generate-reports

- **方法**：POST · **认证**：无
- **功能**：批量生成多只股票的快速简明研报（评级 + 摘要）
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | count | number | 否 | 生成数量，默认 3，最大 10 |

- **返回**：`{ success: boolean, count: number, error? }`
- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `reports`
- **错误**：500（AI / DB 失败）

---

### generate-article

- **方法**：POST · **认证**：无
- **功能**：按分类轮转生成投研洞察文章（市场分析 / AI 方法论 / 资产配置 / 行业研究 / 产品更新）
- **入参**：无（服务端自动决定分类）
- **返回**：`{ success: boolean, slug: string, category: string, error? }`
- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `articles`
- **错误**：500（AI / DB 失败）

---

## 股票数据与扫描类

### stock-quotes

- **方法**：GET / POST · **认证**：无
- **功能**：实时报价（美股 / 港股 / A 股）+ 指数快照（Yahoo Finance）
- **入参**（GET query 或 POST body）

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | symbols | string (CSV) | 否 | 缺省返回 36 只热门股 |
  | detail | `"true" \| "false"` | 否 | 是否返回 K 线 + 基本面 |
  | range | `"1d" \| "5d" \| "1mo" \| "3mo" \| "6mo" \| "1y" \| "5y"` | 否 | detail 模式下，默认 `1mo` |
  | indices | `"true" \| "false"` | 否 | 是否返回主要指数，默认 `true` |

- **返回**：JSON

  ```jsonc
  {
    "quotes": [
      {
        "symbol": "NVDA",
        "nameZh": "英伟达",
        "price": 0, "change": 0, "changePercent": 0,
        "volume": "1.2B",
        "market": "US | HK | CN",
        "sparkline": [/* 迷你 K 线, list 模式 */],
        "open": 0, "prevClose": 0, "dayHigh": 0, "dayLow": 0, "amplitude": 0, // detail=true
        "candles": [/* detail=true */]
      }
    ],
    "indices": [/* list 且 indices=true */],
    "timestamp": "ISO"
  }
  ```

- **依赖**：Yahoo Finance API
- **错误**：400（缺 symbol）· 502（Yahoo 失败）

---

### scan-stock

- **方法**：POST · **认证**：无
- **功能**：个股快速诊断 —— 技术面 + 基本面 + AI 解读
- **入参**：`{ symbol: string }`（必填）
- **返回**：JSON

  ```jsonc
  {
    "scan": {
      "code": "...", "name": "...", "price": 0, "pct": 0,
      "ma5": 0, "ma10": 0, "ma20": 0, "ma60": 0,
      "rsi": 0, "macd": 0, "atr_stop": 0, "atr_pct": 0, "bb_pos": 0,
      "vol_ratio": 0, "support": 0, "resist": 0, "drawdown": 0,
      "trend_signal": "...", "rsi_signal": "...", "volume_signal": "...",
      "bb_signal": "...", "overall_signal": "...",
      "interpretation": "LLM 诊断文本",
      "diagnosis": { "natasha_score": 0, "tony_entry": "...", "steve": "...", "verdict": "..." },
      "fundamentals": { "pe": 0, "pb": 0, "marketCap": 0 },
      "profile": { "industry": "...", "name": "..." }
    }
  }
  ```

- **依赖**：`callAI(claude-sonnet-4-6)`, DB `agent_data`, Tushare / Yahoo / Finnhub
- **错误**：404（数据缺失）· 500（外部 API 失败）

---

### stock-research

- **方法**：POST · **认证**：无
- **功能**：与 `analyst-agent` 同形的快速研报（7 个维度），结构字段一致
- **入参**：`{ symbol: string, agentType: string, stockData?: string }`
- **返回**：`ResearchReport`（结构见 `analyst-agent`）
- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `agent_data`
- **错误**：500（AI 调用失败）

---

### resolve-stock

- **方法**：POST · **认证**：无
- **功能**：自然语言 → 股票代码（本地词库 → DB → AI 兜底）
- **入参**：`{ text: string }`（必填）
- **返回**：`{ symbol: string | null, error? }`
- **依赖**：内存词库 → DB `stock_meta` → `callAI(claude-sonnet-4-6)`
- **错误**：500（内部错误）

---

### predict-stock

- **方法**：POST · **认证**：无
- **功能**：生成短 / 中 / 长期（1 周 / 1 月 / 3 月）走势预测，写入 `stock_prediction`
- **入参**

  | 字段 | 类型 | 必填 |
  |------|------|------|
  | mention_id | string | 是 |
  | user_id | string | 是 |
  | symbol | string | 是 |
  | price | number | 是 |
  | change_percent | number | 否 |
  | user_input | string | 否 |

- **返回**

  ```jsonc
  {
    "ok": true,
    "predictions": {
      "short":  { "direction": "看多|看空|中性", "confidence": 0, "target_price": 0, "reasoning": "..." },
      "medium": { /* 同上 */ },
      "long":   { /* 同上 */ }
    }
  }
  ```

- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `stock_prediction`
- **错误**：400（缺参数）· 500（AI / DB 失败）

---

## 新闻与内容类

### fetch-news

- **方法**：GET / POST · **认证**：无
- **功能**：Finnhub 抓取 → AI 结构化中文 JSON → 可选入库
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | market | `"US" \| "HK" \| "CN" \| "ALL"` | 否 | 默认 `ALL` |
  | cron | boolean | 否 | `true` 时写 `news` 表 |

- **返回**

  ```jsonc
  {
    "news": [
      { "id": "...", "title": "...", "summary": "...", "source": "...",
        "time": "...", "market": "US", "category": "...", "url": "..." }
    ],
    "inserted": 0,          // cron=true 时返回
    "timestamp": "ISO",
    "warning": "string?"    // 无 FINNHUB_API_KEY 时
  }
  ```

- **依赖**：Finnhub API, `callAI(claude-sonnet-4-6)`, DB `news`
- **错误**：500（上游失败 / DB 失败）

---

### read-article

- **方法**：GET / POST · **认证**：无
- **功能**：Firecrawl 抓取 → AI 结构化为中文精读（要点 / 背景 / 详细内容 / 市场影响）
- **入参**：`{ url: string }`（必填）
- **返回**：`{ content: string (Markdown), url: string, error? }`
- **依赖**：Firecrawl API, `callAI(claude-sonnet-4-6)`
- **错误**：400（缺 url）· 502（Firecrawl 失败）

---

## 路由与匹配类

### route

- **方法**：POST · **认证**：无
- **功能**：LLM 意图路由 —— 决定走 `chat` / `light` / `deep` 哪条路径，并选定分析师集合
- **入参**

  | 字段 | 类型 | 必填 |
  |------|------|------|
  | input | string | 是 |
  | chatHistory | `{ role, content }[]` | 否 |
  | watchlistSymbols | string[] | 否 |

- **返回**：`RouteDecision`

  ```jsonc
  {
    "path": "chat | light | deep",
    "symbol": "NVDA | null",
    "theme": "半导体 | null",
    "layer1Agents": ["natasha", "steve"],
    "needDebate": true,
    "reasoning": "..."
  }
  ```

- **依赖**：`callAIWithTools(claude-sonnet-4-6)`, DB `orchestrator_logs`
- **错误**：400（缺 input）· 500（AI 失败）

---

### product-match

- **方法**：POST · **认证**：无
- **功能**：根据辩论上下文匹配 2–3 个相关投资产品（股票 / ETF / 期权 / 反向 ETF）
- **入参**：`{ context: string }`（必填，服务端截取前 800 字）
- **返回**

  ```jsonc
  {
    "matches": [
      {
        "symbol": "...", "nameZh": "...", "reason": "逻辑链", "direction": "看多|看空|观望",
        "confidence": 0.85,
        "type": "股票|ETF|杠杆ETF|反向ETF|期权策略|商品ETF",
        "risk": "低|中|高|极高",
        "timeframe": "短线|波段|中线"
      }
    ]
  }
  ```

- **依赖**：`callAI(claude-sonnet-4-6, temperature=0.3)`
- **错误**：匹配失败返回 `matches: []`，不抛错

---

## 用户与策略类

### strategy-summarize

- **方法**：POST · **认证**：Bearer Token（推荐）
- **功能**：extract 模式提取策略标题 / 代码；summarize 模式生成策略操作建议文档
- **入参**

  | 字段 | 类型 | 必填 | 说明 |
  |------|------|------|------|
  | strategy_id | string | 是 | 策略 ID |
  | mode | `"extract" \| "summarize"` | 是 | 执行模式 |
  | first_message | string | 否 | extract 模式的初始策略描述 |

- **返回**（字段因 mode 而异）

  ```jsonc
  // extract
  { "ok": true, "title": "...", "symbol": "NVDA | null" }
  // summarize
  { "summary": "Markdown 格式的操作建议" }
  ```

- **依赖**：`callAI(claude-sonnet-4-6)`, DB `strategies` / `strategy_messages`
- **错误**：400（缺参数）· 500（AI / DB 失败）

---

### toggle-subscription

- **方法**：POST · **认证**：Bearer Token（必需）
- **功能**：用户订阅 / 退订切换
- **入参**：`{ action: "subscribe" | "unsubscribe" }`
- **返回**

  ```jsonc
  {
    "success": true,
    "subscribed": true,
    "subscription_end": "ISO 日期"  // subscribe 时返回
  }
  ```

- **依赖**：Supabase Auth (`getUser`), DB `subscribers`
- **错误**：401（未认证）· 400（无效 action）· 500（DB 失败）

---

## 管理配置类

### admin-users

- **方法**：POST · **认证**：Bearer Token + 管理员身份校验
- **功能**：后台管理总入口 —— 用户 / credit / 订阅 / 功能开关 / 策略 / 内容 / 日志 / 数据源等全部管理动作均通过此接口
- **入参**：`{ action: string, ...rest }`

  支持的 `action`（20+ 种，参数因 action 不同）：

  | 分组 | action |
  |------|--------|
  | 用户 | `list_users`, `adjust_credits`, `update_subscription`, `list_tiers`, `update_tier`, `get_user_usage`, `reset_user_usage` |
  | 计费 | `update_pricing`, `delete_pricing`, `list_transactions` |
  | 内容 | `list_articles`, `update_article_status`, `delete_article`, `list_reports`, `update_report_status` |
  | 讨论群 | `list_groups`, `delete_group`, `list_group_messages`, `delete_message` |
  | 路由/编排 | `list_rules`, `update_rule`, `list_orchestrator_logs`, `list_report_tasks` |
  | 配置 | `list_flags`, `update_flag`, `list_config`, `update_config`, `list_prompts`, `update_prompt` |
  | 数据源 | `list_data_sources`, `update_data_source` |
  | 仪表盘 | `dashboard_stats` |

- **返回**：结构因 action 而异，普遍形如 `{ ok: true, data: ... }` 或 `{ error }`
- **依赖**：Supabase Auth（管理员身份校验），DB 全表访问（20+ 张表）
- **错误**：401（未认证）· 403（非管理员）· 400（缺参数）· 500（DB 失败）

---

## 汇总

| 类别 | 函数数 |
|------|--------|
| AI 对话分析 | 5 |
| 研报生成 | 3 |
| 股票数据 | 5 |
| 新闻内容 | 2 |
| 路由匹配 | 2 |
| 用户策略 | 2 |
| 管理配置 | 1 |
| **合计** | **22** |

**关键特性**

1. **模型双档位**：`claude-sonnet-4-6` 处理标准任务（研报 / 摘要 / 路由），`claude-opus-4-6` 处理核心对话（圆桌辩论 / 大师发言）
2. **流式与非流式**：仅 `orchestrator` 返回 SSE，其余均为 JSON
3. **认证分层**：多数匿名可调；`admin-users` / `toggle-subscription` 强制 Bearer Token；`strategy-summarize` / `generate-report` 推荐携带
4. **数据源多元**：内部 DB（20+ 张表）+ 外部 API（Yahoo Finance / Finnhub / Tushare / AKShare / Firecrawl）
5. **性能约束**：所有无依赖查询用 `Promise.all` 并行；Edge Function 内部默认 45s 超时

---

## 快速调用示例（curl）

约定：
- `$BASE`：`https://<project-ref>.functions.supabase.co` 或本地 `http://localhost:54321/functions/v1`
- `$TOKEN`：Supabase 用户 access token（需要 Bearer 的接口）

```sh
# AI 对话分析类
# orchestrator（SSE 流式）
curl -N -X POST "$BASE/orchestrator" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symbol":"NVDA","mode":"full","routeReasoning":true}'

# chat
curl -X POST "$BASE/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"帮我分析一下英伟达最近的风险","mode":"council","symbol":"NVDA"}'

# analyst-agent
curl -X POST "$BASE/analyst-agent" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"NVDA","agentType":"natasha"}'

# discussion-agent
curl -X POST "$BASE/discussion-agent" \
  -H "Content-Type: application/json" \
  -d '{"group_id":"grp_123","agent_id":"buffett","context_messages":[{"role":"user","content":"大家觉得苹果还能持有吗"}]}'

# master-agent
curl -X POST "$BASE/master-agent" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"NVDA","masterType":"value-guardian","researchContext":"...","debateTranscript":""}'

# 研报生成类
# generate-report
curl -X POST "$BASE/generate-report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"taskId":"task_001","symbol":"NVDA","reportType":"stock","phase":0}'

# generate-reports
curl -X POST "$BASE/generate-reports" \
  -H "Content-Type: application/json" \
  -d '{"count":3}'

# generate-article
curl -X POST "$BASE/generate-article" -H "Content-Type: application/json" -d '{}'

# 股票数据类
# stock-quotes（GET 列表模式）
curl "$BASE/stock-quotes?symbols=NVDA,AAPL,0700.HK&indices=true"

# stock-quotes（POST 详细模式）
curl -X POST "$BASE/stock-quotes" \
  -H "Content-Type: application/json" \
  -d '{"symbols":"NVDA","detail":"true","range":"3mo"}'

# scan-stock
curl -X POST "$BASE/scan-stock" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"NVDA"}'

# stock-research
curl -X POST "$BASE/stock-research" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"NVDA","agentType":"steve"}'

# resolve-stock
curl -X POST "$BASE/resolve-stock" \
  -H "Content-Type: application/json" \
  -d '{"text":"贵州茅台"}'

# predict-stock
curl -X POST "$BASE/predict-stock" \
  -H "Content-Type: application/json" \
  -d '{"mention_id":"m_001","user_id":"u_001","symbol":"NVDA","price":950.5,"change_percent":1.2}'

# 新闻内容类
# fetch-news
curl "$BASE/fetch-news?market=US"

# read-article
curl -X POST "$BASE/read-article" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.bloomberg.com/news/articles/xxx"}'

# 路由匹配类
# route
curl -X POST "$BASE/route" \
  -H "Content-Type: application/json" \
  -d '{"input":"帮我看看半导体板块"}'

# product-match
curl -X POST "$BASE/product-match" \
  -H "Content-Type: application/json" \
  -d '{"context":"我们认为 AI 算力短期过热，需要对冲..."}'

# 用户策略类
# strategy-summarize（extract）
curl -X POST "$BASE/strategy-summarize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"strategy_id":"s_001","mode":"extract","first_message":"我想长期持有英伟达"}'

# strategy-summarize（summarize）
curl -X POST "$BASE/strategy-summarize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"strategy_id":"s_001","mode":"summarize"}'

# toggle-subscription
curl -X POST "$BASE/toggle-subscription" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"subscribe"}'

# 管理类
# admin-users（仅管理员）
curl -X POST "$BASE/admin-users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"list_users"}'
```

> TypeScript 类型定义：所有接口的 `Request` / `Response` 类型见 [`src/types/api.ts`](../src/types/api.ts)。
