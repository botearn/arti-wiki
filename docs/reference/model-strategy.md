# AI 模型分层策略

通过 Anthropic 原生 API (`https://api.anthropic.com/v1/messages`) 调用。

## 分层原则

按任务复杂度分两档：

| 档位 | 模型 | 环境变量 | 适用场景 |
|------|------|----------|----------|
| **标准** | `claude-sonnet-4-6` | `ANTHROPIC_API_KEY` | 分类、提取、路由、摘要、结构化、研报生成 |
| **重型** | `claude-opus-4-6` | `ANTHROPIC_API_KEY` | 核心对话体验（圆桌辩论、大师对话、数据洞察） |

---

## 各 Function 对应模型

| Function | 任务描述 | 档位 | 模型 |
|----------|----------|------|------|
| `resolve-stock` | 从用户输入提取股票代码 | 标准 | `claude-sonnet-4-6` |
| `fetch-news` | 将原始新闻整理为中文结构化 JSON | 标准 | `claude-sonnet-4-6` |
| `strategy-summarize` | 生成投资策略总结 | 标准 | `claude-sonnet-4-6` |
| `product-match` | AI 产品推荐匹配 | 标准 | `claude-sonnet-4-6` |
| `discussion-agent` | 讨论组 AI 助手回复 | 标准 | `claude-sonnet-4-6` |
| `generate-article` | 生成投研文章 | 标准 | `claude-sonnet-4-6` |
| `generate-reports` | 生成研究报告 | 标准 | `claude-sonnet-4-6` |
| `read-article` | 文章抓取与翻译 | 标准 | `claude-sonnet-4-6` |
| `stock-research` 单 agent（7个并行） | 各维度专项研报（宏观/技术/基本面等） | 标准 | `claude-sonnet-4-6` |
| `chat` 全部智能体 | 圆桌辩论、大师对话、数据洞察、通用助手 | 重型 | `claude-opus-4-6` |

---

## AI 网关

| 端点 | 认证 |
|------|------|
| `api.anthropic.com/v1/messages` | `ANTHROPIC_API_KEY` (x-api-key) |

`ai-gateway.ts` 统一封装所有 AI 调用，流式响应自动转换为 OpenAI SSE 格式。

---

## 数据源优先级

### 美股
| 数据类型 | 主数据源 | 备用 |
|----------|---------|------|
| 实时行情 / K线 | Yahoo Finance | — |
| 基本面指标（PE/ROE/毛利率） | Finnhub `/stock/metric` | yfinance `ticker.info` |
| 公司 Profile（行业/主营） | Finnhub `/stock/profile2` | yfinance `ticker.info` |
| 财报日历 | Finnhub `/calendar/earnings` | — |
| 新闻 | Finnhub `/company-news` | — |

### 港股
| 数据类型 | 主数据源 | 备用 |
|----------|---------|------|
| 实时行情 / K线 | Yahoo Finance | — |
| 近3年财务数据 | yfinance financials（封装 hkex 数据） | — |
| 公告 / 重大事项 | 港交所披露易 hkexnews.hk（原始 PDF） | AASTOCKS / 信报 |
| 基本面指标 | yfinance `ticker.info` | — |

> **港股铁律**：yfinance news 对港股严重滞后，可能遗漏重大公告。涉及公告类信息必须提醒用户查阅 hkexnews.hk。

### A股
| 数据类型 | 主数据源 | 备用 |
|----------|---------|------|
| 实时行情 / K线 | Yahoo Finance（.SS/.SZ） | — |
| 日K / 技术面 | AKShare `stock_zh_a_hist` | — |
| 财务报表 | AKShare `stock_financial_report_sina` | Tushare `daily_basic` |
| 宏观指标 | AKShare（GDP/CPI/PMI/M2） | — |
| 北向资金 / 融资融券 | AKShare | — |
| 板块资金流 | AKShare `stock_sector_fund_flow_rank` | — |
| 中文新闻 | AKShare（新浪财经 + 财联社） | — |

### 数据刷新频率
| 数据 | 频率 | 方式 |
|------|------|------|
| 实时行情 | 60s | 前端 hook 轮询 |
| A股日K + 资金流 | 每日 17:00 CST | GitHub Actions |
| 美港股基本面 + Profile | 每日 21:00 CST | GitHub Actions |
| 中文新闻 | 交易时段每 30 分钟 | GitHub Actions |
| 英文新闻 | 每 30 分钟 | Edge Function cron |
| 宏观指标 | 每月 16 日 | GitHub Actions |
| 按需补充（任意股票） | 实时 | scan-stock → Finnhub/Yahoo |

---

## 注意事项

- chat 是产品核心体验，用 Claude Opus 保证输出质量
- 标准档统一使用 Claude Sonnet 4.6，保证准确性
- 如遇 429 限流，可降档重试
