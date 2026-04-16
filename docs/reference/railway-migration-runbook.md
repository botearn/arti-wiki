# Railway 后端迁移 Runbook

本文档是 ARTI 从 GitHub Actions 迁移到 Railway 后端的运维手册，给未来处理维护、回滚、下一阶段迁移的人看。

## 迁移完成状态（2026-04-08）

### ✅ 已上线的 Railway Service

| Service | Ref ID | 职责 | 状态 |
|---------|--------|------|------|
| `data-pipeline` | `07d96da2-4d75-4edb-a8cd-830571458b3b` | 定时数据同步（6 个 cron 任务）| 🟢 运行中 |
| `report-worker` | `5f2e18b2-f7f3-4e60-90cb-3c6d97d1dab9` | 研报生成队列消费者 | 🟢 运行中 |

**Railway Project**: `arti-backend` (`a00da061-4430-46d8-98b7-1222c3d1b4db`)
**仓库**: <https://github.com/botearn/ARTI_backend>
**部署区域**: us-west1（无亚洲节点，AKShare 有轻微延迟但稳定）

### ✅ 已验证的功能

- [x] Docker 镜像构建成功
- [x] supercronic 加载 crontab（data-pipeline）
- [x] 时区正确（Asia/Shanghai）
- [x] Supabase `sb_secret_xxx` 新格式 key 兼容
- [x] `cn_news` 任务手动触发成功（写入 `sync_logs` + `news` 表）
- [x] `fetch-news` Edge Function 触发成功
- [x] `report-worker` 队列轮询正常（心跳日志）

---

## 常见运维任务

### 查看日志

```bash
cd /tmp/ARTI_backend/data-pipeline
export RAILWAY_API_TOKEN="<你的 token>"
railway link --project a00da061-4430-46d8-98b7-1222c3d1b4db --service data-pipeline
railway logs

# 或者直接用 Web UI：
# https://railway.com/project/a00da061-4430-46d8-98b7-1222c3d1b4db
```

### 手动触发 data-pipeline 的某个任务

```bash
railway ssh "cd /app && python main.py --task cn_news"
# 或其他 task：stock_info / stock_daily / macro / sector_flow / north_flow /
#                margin / financial / global_fundamentals / company_profile /
#                earnings_calendar / daily_all / global_all / auto_refresh
```

### 手动让 report-worker 处理一个任务

直接在 Supabase 插入一条 pending 任务即可，worker 会在 5 秒内抢占处理：

```sql
-- 在 Supabase SQL Editor 执行
insert into report_tasks (user_id, symbol, report_type, status, analyst_agents)
values (
  '<某个真实 user_id>',
  '0700.HK',
  'stock',
  'pending',
  '["natasha","clint"]'::jsonb
);
```

### 更新环境变量

Web UI 最简单：
- data-pipeline: <https://railway.com/project/a00da061-4430-46d8-98b7-1222c3d1b4db/service/07d96da2-4d75-4edb-a8cd-830571458b3b/variables>
- report-worker: <https://railway.com/project/a00da061-4430-46d8-98b7-1222c3d1b4db/service/5f2e18b2-f7f3-4e60-90cb-3c6d97d1dab9/variables>

更新后 Railway 自动重启服务。

### 部署新代码

```bash
# 1. 在 botearn/ARTI_backend 仓库里改代码 + push
cd /tmp/ARTI_backend
git pull
# 编辑文件 ...
git add -A && git commit -m "..." && git push

# 2. 手动触发 Railway 部署（如果没配 GitHub 自动部署）
# 用 --path-as-root 让 Railway 只打包子目录
railway up --detach --path-as-root --service data-pipeline data-pipeline
railway up --detach --path-as-root --service report-worker report-worker
```

---

## 回滚方案

如果 Railway 服务出问题要立刻回到 GitHub Actions：

### 步骤 1：在原 `iloveopt/arti` 仓库重新启用 GHA

编辑这 3 个文件，把 `schedule:` 块的注释去掉：

- `.github/workflows/akshare-sync.yml`
- `.github/workflows/fetch-news-cron.yml`
- `.github/workflows/report-worker.yml`

commit + push 即可。**无需其他操作**——因为这些 workflow 从未真正删除，只是被暂停。

### 步骤 2：在 Railway Dashboard 暂停服务（避免双跑）

访问 Railway Project → 两个 Service → Settings → Pause Service

或者 CLI：
```bash
railway down --service data-pipeline
railway down --service report-worker
```

### 步骤 3：验证 GHA 恢复后的第一次运行

在 GitHub Actions 页面手动触发一次 `workflow_dispatch`，确认能正常跑完。

**整个回滚过程预计 5-10 分钟**。所有任务幂等（upsert），数据不会丢。

---

## 成本监控

| 服务 | 预估月成本 | 备注 |
|-----|-----------|------|
| data-pipeline | $5-8 | 512MB RAM 常驻容器 |
| report-worker | $8-15 | 1GB RAM 常驻容器（研报生成峰值占用高）|
| **合计** | **$15-25/月** | 比 Fly.io 同规模贵 ~30% |

**监控方式**：Railway Dashboard → Usage 页面看每日账单。**超 $30/月** 就值得调查（通常是 report-worker 的 Anthropic API 调用量异常）。

---

## 下一阶段迁移（Phase 2）

如果未来要把 Supabase Edge Functions 也迁到 Railway/FastAPI：

1. 先看 `docs/environments.md` 的"情况 A / 情况 B"对比
2. 看 `arti-overview.html` 的"新后端仓库接口手册"章节（21 个 Edge Function 的 schema 清单）
3. 预计工期 3-4 周（1 人全职）
4. 关键风险：SSE 流式 + orchestrator 长任务 + prompt 迁移等价性

**不建议提前做**——当前架构（Edge Functions 处理实时请求 + Railway 处理后台任务）已经足够好。

---

## 故障排查

### Railway 容器反复重启

检查顺序：
1. `railway logs` 看启动阶段错误
2. 最常见：环境变量缺失（`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `ANTHROPIC_API_KEY`）
3. 次常见：`supabase-py` 或 `akshare` 包冲突（requirements.txt 版本锁定）

### data-pipeline 任务偶发失败

**已知问题**：
- `cn_news` 任务里的"财联社快讯" fallback 失败：`module 'akshare' has no attribute 'stock_zh_a_alerts_cls'`
  - 原因：AKShare 库移除了该 API
  - 影响：只影响财联社部分，新浪财经主源仍然正常
  - 处理：可以忽略，或者修改 `scripts/akshare-sync/tasks/cn_news.py` 移除该 fallback

- AKShare 偶发 timeout/403（Railway 美西节点访问中国数据源）
  - 原因：网络延迟 + Finnhub/新浪财经的频控
  - 处理：任务层有重试，失败不影响后续任务

### report-worker 不消费任务

检查顺序：
1. `railway logs` 看是否还在打心跳日志（"空闲中，已轮询 XXX 次"）
2. 如果有心跳但任务不处理：检查 `report_tasks` 表的 `status` 值是否真为 `pending`
3. 如果没心跳：容器可能挂了，`railway status` 看状态

### Supabase key 被 rotate 后服务连不上

**症状**：所有写操作返回 `401 Unauthorized` 或 `Invalid API key`

**处理**：
1. 去 Supabase Dashboard → Settings → API Keys 复制新的 `sb_secret_xxx`
2. 立刻更新 Railway 两个 service 的 `SUPABASE_SERVICE_ROLE_KEY`
3. Railway 自动重启后恢复

---

## 密钥管理

### 当前暴露风险

到 2026-04-08 为止，以下 key 出现在 Claude Code 会话历史里（通过 `railway variables` 命令打印）：

- ⚠️ Prod legacy JWT `SUPABASE_SERVICE_ROLE_KEY`（`eyJhbGc...TFwjv8`）
  - **缓解**：已切换到新 `sb_secret_xxx`，legacy key 无活跃服务使用
  - **彻底处理**：Revoke legacy keys（需要先修复 2 个 Edge Function 的依赖）
- ⚠️ Dev legacy JWT `SUPABASE_SERVICE_ROLE_KEY`（dev 环境，影响小）
  - **处理**：可选，dev 环境无生产影响

### 定期 rotate 计划

- **每 90 天**：Rotate prod `sb_secret_xxx`（同时更新 Railway）
- **每 180 天**：Rotate `ANTHROPIC_API_KEY`（从 Anthropic Console 生成新 key）

---

## 维护者

- **Primary**: nicole.chen@sitesfy.ai
- **Railway Account**: nicole.chen@sitesfy.ai
- **Supabase Org**: （在 Supabase Dashboard 查看）
- **Emergency Rollback Window**: GHA workflow 文件暂未删除，可随时回滚
