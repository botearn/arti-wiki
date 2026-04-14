# 协作规范

> 本文档面向 ARTI 开发团队（Nico / Ouyang / KQ），以及所有参与本仓库协作的成员。请在开始工作前完整阅读。

---

## 核心原则

**GitHub 是唯一事实源。** 所有影响产品或代码的决策、需求、Bug，都必须在本仓库中有对应记录。飞书可以用来讨论，但结论必须写回 GitHub。

---

## Issue 规范

### 什么时候开 Issue？

| 场景 | 是否开 Issue |
|------|-------------|
| 发现 Bug | ✅ 必须 |
| 有新功能想法 | ✅ 必须 |
| PRD 有疑问/需要澄清 | ✅ 必须 |
| 飞书讨论得出结论 | ✅ 必须（记录结论） |
| 日常沟通 | ❌ 不需要 |

### 禁止的做法

- ❌ 把 Bug 发在飞书群，不开 Issue
- ❌ 口头讨论功能需求，不留文字记录
- ❌ PRD 有疑问直接改代码，不沟通

### 标签规范

每个 Issue 必须打至少一个 `type:` 标签：

| 标签 | 用途 |
|------|------|
| `type:bug` | Bug 报告 |
| `type:feature` | 新功能请求 |
| `type:prd-clarification` | PRD 内容需要澄清或更新 |
| `type:decision` | 需要团队决策的议题 |
| `priority:high` | 高优先级（当前 Sprint 必须解决） |
| `priority:low` | 低优先级（可延后） |

---

## PR 规范

### PR 必须做的事

1. **关联 Issue 或 PRD**：在 PR 描述中使用以下关键词之一：
   - `refs #123`（关联 Issue，但不自动关闭）
   - `closes #123`（关联并在合并时自动关闭 Issue）
   - 或手动写明关联的 PRD 文件路径

2. **填写 PR 模板**：不要删除模板内容，逐项填写

3. **自检**：提交前确认代码可运行，自测过核心路径

### PR 禁止的做法

- ❌ 无描述的 PR（"fix bug" 不算描述）
- ❌ 不关联任何 Issue 或 PRD 的功能性 PR
- ❌ 一个 PR 混入多个不相关的修改

### 代码 Review

- 所有 PR 需要至少 **1 名** 其他开发人员 Review 后才能合并
- Review 意见必须在 GitHub 上回复，不要在飞书上讨论 PR 细节

---

## 飞书 → GitHub 同步规则

飞书群组可以继续用于日常讨论，但以下情况必须**当天**同步回 GitHub：

| 飞书发生的事 | 需要在 GitHub 做什么 |
|-------------|-------------------|
| 讨论出了产品决策 | 在 `docs/decisions/` 新建决策记录，或更新现有 Issue |
| PRD 在飞书被修改 | 同步修改对应的 `docs/prd/` 文件（走 PR） |
| 发现了 Bug 并讨论了解决方案 | 开 Issue，把讨论结论写进去 |
| 确认了某个功能的实现方式 | 更新对应 Issue 或 PR 描述 |

---

## 分支命名规范

```
feature/简短描述        # 新功能
fix/简短描述            # Bug 修复
docs/简短描述           # 文档更新
refactor/简短描述       # 重构
```

示例：
- `feature/pathfinder-filter`
- `fix/pricing-display-error`
- `docs/update-data-architecture-prd`

---

## Sprint 进度记录

每周进度记录在 `sprint/YYYY-wNN-progress.md`。

- 开发人员：每周五更新自己负责任务的状态
- 格式参考：[本周进度示例](../../sprint/2026-w16-progress.md)

---

## 常见问题

**Q：飞书的 PRD 文档我还能看吗？**  
A：迁移期间可以，但以本仓库 `docs/prd/` 为准。如有冲突，以 GitHub 版本为准，并请通知 Noa/Mars 更新飞书版本。

**Q：我发现 PRD 有问题，应该怎么做？**  
A：开一个 Issue，标签打 `type:prd-clarification`，@相关产品人员。不要直接修改 PRD 文件（除非你就是负责人）。

**Q：紧急 Bug 也要开 Issue 吗？**  
A：可以先修复，但 Issue 必须在修复完成后补开，并在 PR 里关联。

**Q：我不确定某个需求是否在 PRD 范围内？**  
A：先开 Issue 问清楚，不要猜测后直接实现。

---

## 联系方式

- 协作规范问题：@Steve
- PRD 内容问题：@Noa 或 @Mars
- 技术架构问题：@Nico / @Ouyang / @KQ
