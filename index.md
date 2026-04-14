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
