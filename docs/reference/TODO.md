# ARTI 待办事项总览

> 最后更新：2026-04-13
> 维护方式：按类型分区，每项标注优先级（P0/P1/P2）、负责人、状态
> 协同约定：领取任务前在负责人列填自己名字，完成后打勾并附 PR 号

---

## Bug 修复

| # | 优先级 | 描述 | 涉及文件 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| B1 | P0 | chat CORS 拦截：`Idempotency-Key` 未加入允许列表 | `_shared/cors.ts`, `chat/index.ts` | Nicole | PR #50 待合并 |
| B2 | P1 | SideNav "账号""设置"按钮无 onClick，点击无反应 | `SideNav.tsx:512-529` | | 待领取 |
| B3 | P2 | 移动端用户 Popover 仅 2 项，桌面端 5 项，功能差异大 | `BottomNav.tsx:106-133` | | 待领取 |

---

## 前端 UI / 体验

| # | 优先级 | 描述 | 涉及文件 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| F1 | P0 | Watchlist 卡片不可点击，无任何下钻路径 | `WatchlistPage.tsx` | | 待领取 |
| F2 | P1 | 统一 L1 容器：Markets 全屏覆盖、News Dialog、Reports 原地展开、Watchlist 不可点 → 统一为 Drawer | `StockDetailView.tsx`, `NewsPage.tsx`, `MarketsPage.tsx` | | 待领取 |
| F3 | P1 | InfoPage "报告" 子 tab 与独立 ReportsPage 入口重复，分类不互斥 | `InfoPage.tsx`, `ReportsPage.tsx` | | 待领取 |
| F4 | P1 | Markets "自选" tab 与 Watchlist "跟踪中" tab 展示相同数据不同 UI | `MarketsPage.tsx`, `WatchlistPage.tsx` | | 待领取 |
| F5 | P1 | Watchlist 统计卡片纯展示不可交互，占据大量 L0 空间不引导下钻 | `WatchlistPage.tsx:175-208` | | 待领取 |
| F6 | P2 | 移除 disabled 的"洞察" tab，减少导航噪音 | `SideNav.tsx:66` | | 待领取 |

> 详细分析见 [前端信息架构审计报告](frontend-ia-audit.md)

---

## 后端 / Edge Functions

| # | 优先级 | 描述 | 涉及文件 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| E1 | P1 | `strategy-summarize` 和 `toggle-subscription` 依赖自动注入的 `SUPABASE_ANON_KEY`，阻塞 legacy key 回收 | `strategy-summarize/index.ts:21`, `toggle-subscription/index.ts:27` | | 待领取 |
| E2 | P1 | `verify_jwt` 全局为 false，Edge Functions 无鉴权，外部可直接调用 | 所有 Edge Functions | | 待领取 |
| E3 | P2 | 429 限流降档重试机制尚未实现（model-strategy.md 提到但未落地） | `_shared/ai-gateway.ts` | | 待领取 |

---

## 基础设施 / DevOps

| # | 优先级 | 描述 | 涉及文件 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| D1 | P1 | master 分支加 Branch Protection（Require PR + Review），防止直接 push | GitHub Settings | | 待领取 |
| D2 | P1 | Dev Supabase 项目 Edge Functions 未同步（dev 分支未触发过部署流水线） | `.github/workflows/deploy-edge-functions.yml` | | 待领取 |
| D3 | P1 | Railway 观察期（至少 1 周）后禁用原 GHA workflow 的 `schedule:` 块 | `.github/workflows/` | | 观察中 |
| D4 | P2 | Revoke 所有 legacy JWT API keys（依赖 E1 完成） | Supabase Dashboard | | 阻塞中 |
| D5 | P2 | 清理团队成员本地可能残留的旧 `.env` 文件 | 团队通知 | | 待领取 |
| D6 | P2 | README 顶部加 environments.md 快速链接 | `README.md` | | 待领取 |

---

## 产品功能

| # | 优先级 | 描述 | 备注 | 负责人 | 状态 |
|---|--------|------|------|--------|------|
| P1 | P1 | 洞察页面功能落地（目前 disabled 占位） | 需要先确定产品定义 | | 待规划 |
| P2 | P1 | 会员订阅完整流程（当前只有页面，无支付接入） | 对接支付网关 | | 待规划 |
| P3 | P1 | 研报中心分类体系：按股票/行业/市场/研报类型等维度筛选和归类，支持搜索 | 当前研报列表为平铺时间线，无分类无筛选，研报量增长后不可用 | | 待规划 |
| P4 | P2 | 研报导出 PDF 格式支持 | 当前仅 HTML | | 待领取 |
| P5 | P2 | 用户设置页面（主题偏好、通知、语言等） | SideNav "设置"按钮的目标页 | | 待规划 |

---

## 技术债务

| # | 优先级 | 描述 | 涉及范围 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| T1 | P1 | ESLint 157 个 error（主要是 `no-explicit-any`），阻碍 CI 卡点生效 | 全局 | | 待领取 |
| T2 | P2 | 部分 Edge Functions 仍用 `serve()` (旧 API)，应统一为 `Deno.serve()` | `discussion-agent`, `fetch-news`, `read-article` 等 | | 待领取 |
| T3 | P2 | 前端缺少 E2E 测试，当前仅有 5 个单元测试文件 | `src/` | | 待领取 |

---

## 协同规则

1. **领取**：在负责人列写自己名字，同时在对应 row 末尾注明预计完成日期
2. **开工**：状态改为 `进行中`，从 master 切 `feat/` 或 `fix/` 分支
3. **完成**：打勾 `[x]`，附 PR 号，状态改为 `已合并` 或 `已部署`
4. **阻塞**：状态标注 `阻塞中`，在描述中说明阻塞原因和依赖项
5. **新增待办**：追加到对应分区末尾，分配编号（B/F/E/D/P/T + 序号）
6. **周同步**：每周一过一遍本文档，清理已完成项、更新优先级
