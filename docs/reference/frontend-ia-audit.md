# 前端信息架构审计报告

> 审计日期：2026-04-13
> 方法论：MECE 原则 + 渐进式披露 + 施耐德曼法则
> 状态：待修复

---

## 一、现状总览

### 页面结构

```
/app
├── /agent        — AI 对话（默认页，核心体验）
├── /markets      — 行情（指数 + 个股列表 + 详情）
├── /info         — 资讯（内含 news / reports 子 tab）
├── /reports      — ARTI 研报（我的研报任务列表）
├── /watchlist    — ARTI 记忆（自选 + AI 提及的股票）
└── /subscription — 会员订阅
```

### 导航入口

| 入口 | 桌面端 SideNav | 移动端 BottomNav |
|------|---------------|-----------------|
| 行情 | ✅ | ✅ |
| 资讯 | ✅ | ✅ |
| ARTI 研报 | ✅ | ❌ **缺失** |
| ARTI 记忆 | ✅ | ✅ |
| 洞察 | ✅ (disabled) | ❌ |
| ARTI 对话 | 新建对话按钮 | ✅ 中心按钮 |
| 会员订阅 | 用户菜单内 | 用户菜单内 |

### 信息深度分布

| 页面 | L0 概览 | L1 聚焦 | L2 管理 | L3 执行 |
|------|---------|---------|---------|---------|
| Markets | 指数卡片 + 个股列表 | 全屏 DetailView | 搜索 + 市场筛选 | — |
| News | 新闻时间线 | Dialog 弹窗 | 市场筛选 | AI 解读（流式） |
| Reports | 研报任务列表 | 原地展开 | — | 一键问 AI / 导出 |
| Watchlist | 统计卡片 + 股票列表 | ❌ **缺失** | 筛选 tab | — |
| Agent | 对话列表 | — | — | AI 对话 |

---

## 二、问题清单

### P0 — 用户感知强，立即修复

| # | 问题类型 | 位置 | 描述 | 涉及文件 |
|---|---------|------|------|---------|
| 1 | 入口缺失 / L1 缺失 | Watchlist | MemoryStockCard **不可点击**，用户看到股票无法查看详情，无任何下钻路径 | `src/pages/WatchlistPage.tsx` |
| 2 | 导航不一致 | BottomNav | 移动端底栏缺少"ARTI 研报"入口，移动用户完全无法直接进入研报页 | `src/components/layout/BottomNav.tsx` |
| 3 | 死按钮 | SideNav 用户菜单 | "账号"和"设置"两个按钮无 onClick 事件，点击无反应 | `src/components/layout/SideNav.tsx:512-529` |

### P1 — 架构层问题，下一版修复

| # | 问题类型 | 位置 | 描述 | 涉及文件 |
|---|---------|------|------|---------|
| 4 | 深度不一致 | 全局 | 5 种列表卡片有 4 种不同的 L1 容器：全屏覆盖（Markets）、Dialog（News）、原地展开（Reports）、不可点击（Watchlist） | 多文件 |
| 5 | 分类不互斥 | InfoPage vs ReportsPage | InfoPage 有 `reports` 子 tab（展示外部研报），同时 SideNav 有独立"ARTI 研报"导航（展示我的研报任务），入口重复且分类不透明 | `src/pages/InfoPage.tsx`, `src/pages/ReportsPage.tsx` |
| 6 | 分类不互斥 | Markets vs Watchlist | Markets 有"自选" tab，Watchlist 有"跟踪中" tab，展示相同数据、不同 UI | `src/pages/MarketsPage.tsx`, `src/pages/WatchlistPage.tsx` |
| 7 | 层级错位 | Watchlist 统计卡片 | 4 个统计卡片（总分析/跟踪中/已验证/平均收益）纯展示不可交互，占据大量 L0 空间但不引导下钻 | `src/pages/WatchlistPage.tsx:175-208` |

### P2 — 体验优化，低优先级

| # | 问题类型 | 位置 | 描述 | 涉及文件 |
|---|---------|------|------|---------|
| 8 | 层级错位 | Markets 详情 | StockDetailView 用 `fixed inset-0 z-50` 全屏覆盖，L2 级容器承载 L1 级内容 | `src/components/stocks/StockDetailView.tsx:90-96` |
| 9 | 一致性 | BottomNav 用户菜单 | 移动端用户 Popover 仅 2 项（订阅/退出），桌面端 5 项（账号/设置/官网/主题/退出），功能差异大 | `src/components/layout/BottomNav.tsx:106-133` |
| 10 | 导航噪音 | SideNav | "洞察" tab disabled 但占据一级导航位，增加认知负担 | `src/components/layout/SideNav.tsx:66` |

---

## 三、一致性矩阵

### 当前状态

| 组件 | 条目可点击? | 点击容器 | 查看全部? | L0 内操作 |
|------|-----------|---------|----------|----------|
| Markets 指数卡片 | ✅ | 全屏 DetailView | — | — |
| Markets StockCard | ✅ | 全屏 DetailView | 搜索 | ⭐ 收藏 |
| News 新闻卡片 | ✅ | Dialog 弹窗 | 市场 tab | "让AI解读" |
| Reports ReportCard | ✅ | 原地展开 | — | — |
| Reports 研报任务 | ✅ | 原地展开 | — | 导出 |
| Watchlist MemoryStockCard | ❌ | — | 筛选 tab | ⭐ / ✕ |

### 目标状态

| 组件 | 条目可点击? | 点击容器 | 查看全部? | L0 内操作 |
|------|-----------|---------|----------|----------|
| Markets 指数卡片 | ✅ | Drawer 侧栏 | — | — |
| Markets StockCard | ✅ | Drawer 侧栏 | 搜索 | ⭐ 收藏 |
| News 新闻卡片 | ✅ | Drawer 侧栏 | 市场 tab | "让AI解读" |
| Reports 研报任务 | ✅ | 原地展开 | — | 导出 |
| Watchlist MemoryStockCard | ✅ | 跳转 Markets | 筛选 tab | ⭐ / ✕ |

---

## 四、修复 TODO

### Sprint 1 — P0 立即修复

- [ ] **#1 Watchlist 卡片加点击跳转**
  - 文件：`src/pages/WatchlistPage.tsx`
  - 方案：MemoryStockCard 接收 `onClick` prop，点击调用 `navigate(/app/markets?symbol=XXX)`
  - 注意：星标和移除按钮保持 `stopPropagation`

- [ ] **#2 BottomNav 补研报入口**
  - 文件：`src/components/layout/BottomNav.tsx`
  - 方案 A：底栏加第 5 个 tab "研报"（行情 / 资讯 / ARTI / 研报 / 记忆）
  - 方案 B：底栏保持 4 tab，将"ARTI记忆"改为"更多"展开菜单（含研报+记忆+订阅）
  - 建议：方案 A，移动端 5 tab 是常见模式

- [ ] **#3 修复 SideNav 死按钮**
  - 文件：`src/components/layout/SideNav.tsx`
  - 方案："账号"跳转 `/app/subscription`（暂时复用），"设置"弹出 toast 提示"功能开发中"或直接隐藏

### Sprint 2 — P1 架构优化

- [ ] **#4 统一 L1 容器**
  - 相关文件：`StockDetailView.tsx`, `NewsPage.tsx`, `MarketsPage.tsx`
  - 方案：Markets 详情从全屏改为右侧 Sheet/Drawer（桌面端分栏，移动端全屏滑入）；News 详情从 Dialog 改为 Sheet/Drawer
  - 收益：所有"点击查看详情"行为一致

- [ ] **#5 清理 InfoPage reports 子 tab**
  - 文件：`src/pages/InfoPage.tsx`
  - 方案：移除"报告"子 tab，InfoPage 仅展示新闻。外部研报内容迁移到 ReportsPage（加 tab 区分"我的研报"和"机构研报"）
  - 结果：研报只有一个入口 → `/app/reports`

- [ ] **#6 统一"自选"入口**
  - 方案：Markets "自选" tab 保留（快速查看行情），Watchlist 定位为"AI 记忆追踪"（侧重 AI 提及、预测准确率）。在 Watchlist 的"跟踪中" tab 头部加"查看行情 →"链接到 Markets?market=WATCHLIST
  - 关键：两个页面角度不同（行情 vs 追踪），不是真正的重复

- [ ] **#7 统计卡片加交互**
  - 文件：`src/pages/WatchlistPage.tsx`
  - 方案：点击"跟踪中"卡片 → setFilter("watching")，点击"已验证" → setFilter("verified")，以此类推

### Sprint 3 — P2 体验优化

- [ ] **#8 StockDetailView 改 Drawer**（与 #4 合并）
- [ ] **#9 BottomNav 用户菜单补全**
  - 补充：主题切换、前往官网
- [ ] **#10 移除 disabled 洞察 tab**
  - 方案：从一级导航移除，放到"即将推出"提示或完全隐藏

---

## 五、响应性能

### 对话响应延迟链路

```
用户按发送 (0ms)
  → 前端 POST /chat SSE (~50-200ms 网络)
  → Edge Function 收到请求
    ├─ resolveStock()         识别股票代码     ~0-2s
    ├─ scanStockData()        Yahoo Finance    ~3-10s ⚠️ 主要瓶颈
    ├─ DB 查 profile           ~50ms
    ├─ getChatModel()         每次查 DB        ~50-100ms
    ├─ 构建 system prompt      ~10ms
    └─ callAIRaw() 流式调用    AI 首字节 ~1-3s
  → 前端收到第一个 token
```

**用户感知等待 ≈ 4-15 秒**（全部串行）

### 优化 TODO

- [ ] **#11 `getChatModel` 内存缓存**
  - 文件：`supabase/functions/chat/index.ts:41-56`
  - 方案：模块级变量缓存 + 5 分钟 TTL，失效重查
  - 收益：省 50-100ms/次
  - 难度：低，几行代码
  - 迁移独立后端：✅ 完全适用，长驻进程缓存更稳定

- [ ] **#12 深思考动画本地化**
  - 文件：`src/hooks/use-deep-thinking.ts`
  - 现状：每次对话额外发请求到 `/chat?mode=thinking` 让 AI 生成思考步骤文案
  - 方案：改为前端本地预设步骤（根据输入关键词匹配），去掉网络请求
  - 收益：省 0-2s + 一次 AI 调用费用
  - 劣势：文案不如 AI 生成精准（"正在分析财务数据" vs "正在分析特斯拉 Q3 财报"）
  - 迁移独立后端：✅ 纯前端改动，无关后端

- [ ] **#13 `scanStockData` 分场景优化**
  - 文件：`supabase/functions/chat/index.ts:598-674`
  - 现状：每条消息都串行调 Yahoo Finance 拉 3 个月 K 线 + 计算技术指标
  - 短期方案：非行情问题跳过 scan（前端判断意图 or AI 路由层判断）
  - 长期方案（独立后端）：热门股票数据 Redis 预缓存，后台每分钟刷新 Top 100
  - 收益：省 3-10s，用户体感飞跃
  - 风险：行情问题如果跳过 scan，AI 回复会缺数据
  - 迁移独立后端：✅ 更好做——连接池复用、Redis 缓存、WebSocket 双向推送

---

## 六、数据准确性

### 数据源时效性

| 数据类型 | 来源 | 延迟 | 风险 |
|----------|------|------|------|
| 美股实时价格 | Yahoo Finance | 15-20 分钟 | 🟡 免费版固有限制 |
| 港股/A 股价格 | Yahoo Finance | 15-20 分钟，偶尔缺失 | 🟡 覆盖不如美股 |
| 前端行情页轮询 | useStockQuotes 60s 轮询 | 最多 ~2 分钟（轮询 + Yahoo 延迟） | 🟠 可接受 |
| 技术指标 (RSI/MACD) | 基于 K 线实时计算 | 依赖 K 线准确性，日内级别不可靠 | 🟠 |
| 英文新闻 | Finnhub | 每 30 分钟刷新 | 🟡 |
| 中文新闻 | AKShare | 交易时段每 30 分钟 | 🟡 |
| 港股公告 | ❌ 无自动数据源 | 完全依赖 yfinance news（严重滞后） | 🔴 可能遗漏重大公告 |
| 盘后/周末数据 | Yahoo Finance | 返回最后交易日收盘价 | 🔴 AI 可能当实时价使用 |

### 已有的准确性保障

| 措施 | 位置 | 覆盖范围 |
|------|------|---------|
| 首次使用免责弹窗 | `DisclaimerDialog.tsx` | "内容可能不准确、不完整或存在滞后" |
| 对话底部小字 | `AgentPage.tsx:256` | "内容由 AI 生成，仅供参考" |
| AI 回复末尾免责 | `chat/index.ts` system prompt | 每条回复自动附加免责声明 |
| 订阅页标注 | `SubscriptionPage.tsx:42` | "免费版行情延迟 15 分钟" |

### 未覆盖的风险

| # | 风险 | 场景 | 后果 |
|---|------|------|------|
| R1 | 盘后/周末无时效标注 | 用户周末问"XX 现在多少钱"，AI 拿到周五收盘价但不说明 | 用户误以为是实时价格 |
| R2 | 数据缺失时静默降级 | `scanStockData` 失败后 try-catch 吞掉错误，AI 拿空数据继续回答 | AI 可能编造数据或给出无依据的分析 |
| R3 | 港股公告盲区 | yfinance news 对港股严重滞后，可能遗漏停牌、配股等重大公告 | 用户基于不完整信息做决策 |
| R4 | 股票识别歧义 | 用户说"比亚迪"，可能解析为 1211.HK 或 002594.SZ | 分析的是错误市场的标的 |

### 数据准确性优化 TODO

- [ ] **#14 盘后/周末数据标注**
  - 文件：`supabase/functions/chat/index.ts`（system prompt 注入）
  - 方案：在 enrichedStockContext 中注入市场状态（`marketOpen: false, lastTradeDate: 2026-04-11`），system prompt 加规则"盘后数据必须标注'以下为 X 月 X 日收盘数据'"
  - 收益：消除用户对数据时效性的误解

- [ ] **#15 数据拉取失败时告知用户**
  - 文件：`supabase/functions/chat/index.ts:598-674`
  - 现状：try-catch 吞掉错误，`enrichedStockContext` 保持空字符串
  - 方案：失败时在 context 中注入 `[数据获取失败] 以下回答未包含实时行情数据，请自行查证`，让 AI 转述给用户
  - 收益：避免 AI 在无数据情况下"编造"分析

- [ ] **#16 港股公告提醒强化**
  - 文件：`supabase/functions/chat/index.ts`（港股专用 system prompt）
  - 现状：CLAUDE.md 写了港股铁律但 system prompt 执行力度不够
  - 方案：当识别到港股代码时，system prompt 强制追加"重要：本平台港股新闻数据可能滞后，涉及公告/停牌/配股等重大事项，请务必查阅港交所披露易 hkexnews.hk"
  - 收益：降低信息遗漏导致的决策风险

- [ ] **#17 股票识别歧义确认**
  - 文件：`supabase/functions/chat/index.ts`（resolveStock 逻辑）
  - 方案：当同名股票存在多个市场（如比亚迪 HK/SZ）时，AI 回复开头主动确认"我理解你问的是比亚迪 (1211.HK)，如需查看 A 股 (002594.SZ) 请告诉我"
  - 收益：减少分析错误标的的概率

---

## 七、设计原则备忘

以下原则在后续新增页面/组件时应遵循：

1. **同类卡片行为一致**：所有列表型卡片要么全部可点击，要么全部不可点击。同一类型的点击容器（Drawer/Dialog/全屏）应统一
2. **桌面/移动导航对等**：SideNav 和 BottomNav 的一级入口必须覆盖相同功能集
3. **L0 只放概览 + 一键操作**：概览层不放复杂表单、不展示过多细节，统计卡片应引导下钻
4. **每层都有入口暗示**：被隐藏的深层功能，上层必须有可见入口。无入口 = 不存在
5. **容器选择遵循决策树**：需要对比上下文→Drawer，简单确认→Modal，全量数据+CRUD→独立页面
