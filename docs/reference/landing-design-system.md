# ARTI 官网（Landing）设计规范

> 本文件只记录**官网/落地页**层面的组合式视觉规则（卡片、tag、按钮、栏位节奏）。
> 颜色、字体、Logo 等底层 token 请看 [DESIGN.md](./DESIGN.md)；业务 App 内部的规则另见该文件。

代码常量位置：`src/components/landing/shared/designSystem.ts`
统一从 `@/components/landing/shared` 导入。

---

## 1. 页面骨架

每个 Section 都应该通过 `SectionShell` 包裹，保持统一的最大宽度、纵向 padding、以及可选的顶部/底部分隔线。

```tsx
<SectionShell id="features">
  {/* 装饰元素（可选） */}
  <DotGrid style={{ top: 48, right: 0 }} />
  <CornerAccent position="top-left" />

  {/* 标题组 */}
  <motion.div ... className="text-center mb-14">
    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">分区小标</p>
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">主标题</h2>
    <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">副标题</p>
  </motion.div>

  {/* 卡片网格 */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> ... </div>
</SectionShell>
```

不变项：
- 标题 eyebrow 用 `uppercase tracking-widest text-primary` + 3px 下间距
- 副标题限宽 `max-w-2xl`、居中
- 卡片网格默认 `gap-4`，1/2/4 列的响应式阶梯

---

## 2. 卡片（Cards）

| 常量 | 外观 | 典型场景 |
|------|------|---------|
| `LANDING_CARD` | 玻璃 + 10% 白边 + **hover 描金** | 所有常规卡片（默认选它） |
| `LANDING_CARD_STATIC` | 玻璃 + 10% 白边，不响应 hover | 输入框壳、消息气泡、展示态 |
| `LANDING_CARD_EMPHASIZED` | 金色实边 + 4% 金底 | 推荐 / 高亮卡（Competitor ARTI 列、Pricing Pro、圆桌总结） |
| `LANDING_CARD_SOLID` | 实色 `#1F1F1F` + `#434343` 边，hover 金 | Figma 指定实色背景的场景（AgentShowcase Agent 卡） |

使用规则：
- `padding` / `flex layout` 由消费侧自己拼接，**不要**把 `p-4 / flex / gap` 塞进常量
- 禁止自定义 `bg / border / hover` 组合 —— 不够用就在 `designSystem.ts` 里补一个新变体
- `LANDING_CARD_EMPHASIZED` 不带 `.glass`（避免 overflow:hidden 裁掉外延的"推荐"徽标）

---

## 3. Tag / Pill

| 常量 | 用途 | 尺寸 |
|------|------|------|
| `TAG_NEUTRAL` | 中性灰特征标签（"技术面""基本面"） | `text-xs / py-[3px] / px-1.5` |
| `TAG_GOLD` | 金色类型标签（流派、身份） | 同上，带边框 |
| `TAG_GOLD_OUTLINE` | 状态 / 推荐提示（"推荐""Beta"） | 圆角胶囊，金边金字 |
| `PILL_SUGGESTION` | Hero 建议问题胶囊 | `rounded-40 / text-sm / py-[5px] / px-[15px]` |

细则：
- 中性 tag 底色走 `--arti-bg-card3`（`#2a2a2a`），文字 `--arti-text-sub`（`#BFBFBF`）
- 金色 tag 不叠加 `--arti-gold` 饱和色，降到 `#31302C / #4F4834 / #FFF2CC` 的**低饱和金**，避免和主 CTA 抢视觉
- Tag 高度统一 22px（`text-xs + py-[3px]`），不要随意改 padding

---

## 4. 按钮 / CTA

| 常量 | 场景 | 要点 |
|------|------|------|
| `CTA_GOLD_LG` | Hero 主按钮 / Footer 主按钮 | `rounded-40 / px-6 / py-2.5 / text-base font-extrabold` |
| `CTA_GOLD_SM` | Navbar 申请内测 | `rounded-full / px-[18px] / py-2 / text-sm` |
| `BUTTON_SECONDARY` | "我有内测码" / "了解更多" | 描边按钮，hover 描金 |

规则：
- **一屏最多一个主 CTA**，不要并列出现两个金色按钮
- 禁止自己写 `linear-gradient(107deg, ...)`，用 `CTA_GOLD_LG` 或 `var(--arti-gold-gradient)` token
- 文字色用 `var(--arti-gold-text)`，**不要**写 `text-black / text-[#111]`

---

## 5. 颜色速查（摘要，详见 DESIGN.md §2）

```
// 文字层级（深色主题）
--arti-text1  #EDE8DF  主文案 / 卡片标题
--arti-text2  #c8c7c2  副标题
--arti-text3  #b0afa8  弱化文案
--arti-text4  #9a9890  辅助文字
--arti-text5  #73726C  极弱 hint
--arti-text-sub #BFBFBF 卡片描述

// 金色
--arti-gold          #FFECB5
--arti-gold-faint    rgba(255,236,181,.08)   selected / hover 底
--arti-gold-faint2   rgba(255,236,181,.04)   EMPHASIZED 卡底
--arti-gold-gradient 270° 渐变（CTA）
--arti-gold-text     #111010  金底反色文字

// 背景层级
--arti-bg         #141414  页面底
--arti-bg-panel   #1e1e1e  面板
--arti-bg-card    #1F1F1F  卡片 / 深胶囊
--arti-bg-card2   #252525  卡片内嵌区块
--arti-bg-card3   #2a2a2a  三级容器 / 中性 tag

// 边框
--arti-border   6%   极弱分隔线
--arti-border2  10%  默认卡片边（最常用）
--arti-border3  9%   输入框边
--arti-border4  12%  稍重的边
```

**禁用**：`text-white / bg-black / #FFF / #000` 这种硬编码。永远走 token。

---

## 6. 间距节奏

| 尺度 | 值 | 用法 |
|------|----|-----|
| 卡片内 gap | `gap-4` (16px) | 卡片各 section 之间 |
| 卡片 header 内 gap | `gap-[14px]` | avatar / 图标 + 标题 |
| 卡片子组 gap | `gap-2` (8px) | role + badge 等子组 |
| Tag 之间 | `gap-1` (4px) | 标签密排 |
| 标题组与内容 | `mb-14` (56px) | Section 标题与卡片网格 |

---

## 7. 动效

| 场景 | 规则 |
|------|------|
| 进入动画 | `framer-motion` + `whileInView={{ opacity: 1, y: 0 }}` / `viewport={{ once: true, margin: "-80px" }}` / `duration: 0.4` |
| 卡片 hover | 仅 `transition-colors duration-300`，hover 时描金；**不要**叠加 scale + 阴影 |
| 按钮 hover | `hover:opacity-90 hover:scale-[1.03]`（仅主 CTA，次要按钮只变色） |
| Dialog / Modal | 只 fade，150ms，不做 slide / zoom（已在 `ui/dialog.tsx` 精简） |

---

## 8. 反模式清单

以下写法在 review 里会被打回，请改用常量：

```tsx
// ❌ 硬编码背景 + 边框 + hover 的卡片
<div className="rounded-2xl bg-[#1F1F1F] border border-[#434343] hover:border-[#FFECB5]/40 ...">

// ✅ 用 SOLID 变体
<div className={cn(LANDING_CARD_SOLID, "p-4 flex flex-col gap-4")}>

// ❌ 自己写金色渐变
<button style={{ background: "linear-gradient(107deg,#FFF2CC,#FFECB5)" }}>

// ✅ 用 CTA 常量
<button className={CTA_GOLD_LG}>

// ❌ 裸色值
<span className="text-[#BFBFBF]">...

// ✅ 用 token
<span className="text-[var(--arti-text-sub)]">...
```

---

## 9. 新增组件 checklist

做新 Section / 新卡片前，按这个顺序确认：

1. 能否用 `LANDING_CARD / _STATIC / _EMPHASIZED / _SOLID` 之一？不能的话，样式上是否确实值得新增一个变体？
2. 卡片里所有 tag 是否都走 `TAG_*` / `PILL_*` 常量？
3. 主 CTA 只有一个，并且用了 `CTA_GOLD_LG` 或 `CTA_GOLD_SM`？
4. 所有颜色都是 `var(--arti-*)` 或常量带出来的值？没有 `#FFF` / `#000` / `rgba(255,255,255,.xx)` 这类裸值？
5. 动画用了 `framer-motion` + `whileInView`？不是自己写 `transition-all`？
6. 新增或修改了视觉变体 → 同步更新本文件和 `designSystem.ts`？
