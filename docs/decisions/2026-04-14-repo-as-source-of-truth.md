# 决策：GitHub Repo 作为 ARTI 唯一事实源

**日期**：2026-04-14  
**决策人**：Steve  
**状态**：已确认

---

## 背景

ARTI 团队当前存在四个信息孤岛：

1. **PRD**：存放在飞书文档，开发人员访问不便，版本难以追踪
2. **开发讨论**：分散在各个 PR 注释和个人沟通中
3. **产品讨论**：主要在飞书群组，结论难以检索
4. **用户反馈**：未统一归档，无法与功能开发关联

这导致以下问题：
- 开发人员不确定应以哪份文档为准
- 产品讨论的结论无法追溯
- 新成员上手困难，背景知识靠口口相传
- PRD 变更无法通知到相关开发人员

## 考虑的方案

### 方案 A：继续使用飞书作为主文档平台
- 优点：团队已习惯，飞书支持富文本和协作编辑
- 缺点：与代码割裂，无法与 Issues/PR 联动，版本控制弱

### 方案 B：使用 Notion
- 优点：界面友好，支持多种视图
- 缺点：需要额外付费，与代码仓库仍然割裂

### 方案 C：GitHub Repo 作为唯一事实源（本方案）
- 优点：与代码同仓库管理，PR/Issue 天然联动，版本控制完善，免费
- 缺点：Markdown 编辑体验不如飞书，需要团队适应

## 决策内容

选择**方案 C**：以 `botearn/arti-wiki` GitHub 仓库作为 ARTI 项目的唯一事实源。

具体执行：
- 所有 PRD 迁移至 `docs/prd/`
- 所有重要决策记录至 `docs/decisions/`
- Bug 报告和 Feature 请求通过 GitHub Issues 管理
- 飞书仅用于即时沟通，结论必须当天同步回 repo

## 影响

**开发团队（Nico / Ouyang / KQ）**：
- 需阅读并遵守 [协作规范](../guides/collaboration-guide.md)
- PR 必须关联对应 Issue 或 PRD
- Bug 和需求通过 GitHub Issues 提交

**产品团队（Noa / Mars）**：
- PRD 迁移到本仓库（分阶段完成）
- 飞书讨论结论需当天写回 Issues 或 decisions/

**所有人**：
- 飞书讨论可以继续，但结论必须有仓库记录

## 跟进动作

- [x] 建立仓库初始结构（2026-04-14）
- [ ] 迁移数据架构 PRD（负责人：Noa/Mars）
- [ ] 迁移 Pathfinder PRD（负责人：Noa/Mars）
- [ ] 迁移定价设计 PRD（负责人：Noa/Mars）
- [ ] 团队协作规范培训（负责人：Steve）

## 相关链接

- 协作规范：[docs/guides/collaboration-guide.md](../guides/collaboration-guide.md)
