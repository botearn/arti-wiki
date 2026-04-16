---
layout: home

hero:
  name: "ARTI Wiki"
  text: "项目知识库"
  tagline: ARTI 是一个 AI 产品，致力于为用户提供智能化的数据洞察与决策支持。本仓库是 ARTI 项目的唯一事实源。
  actions:
    - theme: brand
      text: 查看 PRD
      link: /docs/prd/
    - theme: alt
      text: 协作规范
      link: /docs/guides/collaboration-guide

features:
  - icon: 📄
    title: 产品需求文档
    details: 所有功能的 PRD 统一归档于此，替代分散在飞书的文档。
    link: /docs/prd/
  - icon: 📋
    title: 决策记录
    details: 每一个影响产品或代码的决策，都有可追溯的记录。
    link: /docs/decisions/
  - icon: 🤝
    title: 协作指南
    details: 团队协作规范，Nico / Ouyang / KQ 必读。
    link: /docs/guides/collaboration-guide
  - icon: 🚀
    title: Sprint 进度
    details: 每周进度追踪，了解当前迭代的目标与进展。
    link: /sprint/2026-w16-progress
  - icon: 📚
    title: 技术参考
    details: ARTI 主仓同步的架构、数据、模型、前端、运维等技术文档。
    link: /docs/reference/
---

## 这个仓库是什么？

| 原来分散在 | 现在统一到 |
|-----------|-----------|
| 飞书文档（PRD） | `docs/prd/` |
| 口头/飞书讨论结论 | `docs/decisions/` |
| 个人笔记/口头对齐 | GitHub Issues + PR |
| 各自理解的协作规则 | `docs/guides/collaboration-guide.md` |

**核心规则：任何影响产品或代码的决策，必须在本仓库中有对应记录。**

## 团队成员

| 成员 | 角色 |
|------|------|
| Steve | 负责人 |
| Noa | 产品 / AI 助手 |
| Mars | 产品讨论 / PRD |
| Nico | 开发 |
| Ouyang | 开发 |
| KQ | 开发 |

## 核心协作规则（摘要）

1. **Bug 和 Feature 请求** → GitHub Issues，不进飞书
2. **每个 PR** → 必须关联 Issue 或 PRD
3. **飞书讨论的结论** → 必须写回本仓库（Issues / decisions/）
4. **PRD 变更** → 走 PR 流程，不直接编辑

详见 [协作规范](/docs/guides/collaboration-guide)。

## 全部文档索引

### PRD 产品需求

- [PRD 目录](/docs/prd/README)
- [数据架构 PRD](/docs/prd/data-architecture)
- [Pathfinder 功能 PRD](/docs/prd/pathfinder)
- [定价设计 PRD](/docs/prd/pricing-design)

### 决策记录

- [决策记录说明](/docs/decisions/README)
- [2026-04-14 Repo 作为事实源](/docs/decisions/2026-04-14-repo-as-source-of-truth)

### 协作指南

- [协作规范](/docs/guides/collaboration-guide)
- [PRD 写作模板](/docs/guides/prd-template)

### Sprint 进度

- [W16 本周进度（2026）](/sprint/2026-w16-progress)

## 技术参考文档

从 ARTI 主仓 `docs/` 同步的技术参考文档，涵盖战略、架构、数据、模型、前端等维度。完整目录见 [技术参考索引](/docs/reference/README)。

### 产品与战略

- [ARTI 商业计划](/docs/reference/ARTI_Business_Plan)
- [ARTI QA Memo](/docs/reference/ARTI_QA_Memo)
- [DESIGN 产品设计总览](/docs/reference/DESIGN)
- [ARTI 系统全景 + 产品规划](/docs/reference/arti-system-overview)
- [AI 时代数据源规划（Exploration 三市版）](/docs/reference/ai-datasource-exploration)

### 架构与实现

- [Benchmark 设计](/docs/reference/benchmark-design)
- [Chat 系统参考](/docs/reference/chat-system-reference)
- [数据 API 说明](/docs/reference/data-api)
- [模型分层策略](/docs/reference/model-strategy)
- [输出模板汇总](/docs/reference/output-templates)
- [Railway 迁移运行手册](/docs/reference/railway-migration-runbook)

### 前端

- [前端 IA 审计](/docs/reference/frontend-ia-audit)
- [Landing 设计系统](/docs/reference/landing-design-system)

### 进度

- [TODO 清单](/docs/reference/TODO)
