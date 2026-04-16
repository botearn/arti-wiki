# ARTI 项目知识库

ARTI 是一个 AI 产品，致力于为用户提供智能化的数据洞察与决策支持。本仓库是 ARTI 项目的**唯一事实源**，所有产品决策、PRD、开发规范和讨论结论均在此留存。

---

## 这个仓库是什么？

| 原来分散在 | 现在统一到 |
|-----------|-----------|
| 飞书文档（PRD） | `docs/prd/` |
| 口头/飞书讨论结论 | `docs/decisions/` |
| 个人笔记/口头对齐 | GitHub Issues + PR |
| 各自理解的协作规则 | `docs/guides/collaboration-guide.md` |

**核心规则：任何影响产品或代码的决策，必须在本仓库中有对应记录。**

---

## 快速导航

### 产品文档
- [PRD 目录](docs/prd/index.md) — 所有功能的产品需求文档
  - [数据架构 PRD](docs/prd/data-architecture.md)
  - [Pathfinder 功能 PRD](docs/prd/pathfinder.md)
  - [定价设计 PRD](docs/prd/pricing-design.md)

### 决策记录
- [决策记录说明](docs/decisions/index.md)
  - [2026-04-14 GitHub Repo 作为唯一事实源](docs/decisions/2026-04-14-repo-as-source-of-truth.md)

### 协作指南
- [协作规范（Nico / Ouyang / KQ 必读）](docs/guides/collaboration-guide.md)
- [PRD 写作模板](docs/guides/prd-template.md)

### Sprint 进度
- [本周进度 W16](sprint/2026-w16-progress.md)

---

## 团队成员

| 成员 | 角色 |
|------|------|
| Steve | 负责人 |
| Noa | 产品 / AI 助手 |
| Mars | 产品讨论 / PRD |
| Nico | 开发 |
| Ouyang | 开发 |
| KQ | 开发 |

---

## 核心协作规则（摘要）

1. **Bug 和 Feature 请求** → GitHub Issues，不进飞书
2. **每个 PR** → 必须关联 Issue 或 PRD
3. **飞书讨论的结论** → 必须写回本仓库（Issues / decisions/）
4. **PRD 变更** → 走 PR 流程，不直接编辑

详见 [协作规范](docs/guides/collaboration-guide.md)。
