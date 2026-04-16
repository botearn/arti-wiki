# ARTI 设计系统 & 前端规范

> 供 AI Agent（Claude / OpenClaw 等）及团队成员在开发前端页面时参考，确保风格一致。

---

## 1. 技术栈

| 项目     | 版本/工具                        |
| -------- | ------------------------------- |
| 框架     | React 18 + TypeScript            |
| 构建     | Vite + @tailwindcss/vite         |
| CSS      | Tailwind CSS v4 + CSS 自定义属性  |
| 组件库   | 基于 Radix UI 的自定义组件 (`src/app/components/ui/`) |
| 图标库   | **Ant Design Icons** (`@ant-design/icons`) — 项目统一图标来源 |
| 字体     | Noto Serif SC / Noto Sans SC / Inter |
| 路径别名 | `@` → `/src`                     |

### 1.1 图标使用规范（Ant Design Icons）

项目统一使用 [`@ant-design/icons`](https://ant.design/components/icon) 作为图标库，**禁止**再引入 lucide-react、heroicons、自定义 SVG paths 等其它来源（历史遗留除外）。这样团队成员直接按 Ant Design 图标名调用，无需维护自定义 SVG。

```tsx
import {
  PlusCircleOutlined,
  FundProjectionScreenOutlined,
  ReadOutlined,
  ZoomInOutlined,
  FileTextOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";

<PlusCircleOutlined style={{ fontSize: 18, color: "var(--arti-gold)" }} />
```

侧边栏导航当前使用的图标：

| 导航项   | 图标组件                          |
| -------- | -------------------------------- |
| 新建对话 | `PlusCircleOutlined`             |
| 行情     | `FundProjectionScreenOutlined`   |
| 资讯     | `ReadOutlined`                   |
| 洞察     | `ZoomInOutlined`                 |
| 研报中心 | `FileTextOutlined`               |
| ARTI记忆 | `CloudServerOutlined`            |

约定：
- **尺寸**：通过 `style={{ fontSize }}` 控制。侧边栏导航 = `18px`；正文内联 = `14-16px`；按钮 icon = `16px`。
- **颜色**：通过 `color` 继承 `currentColor`，使用 `var(--arti-*)` 变量，禁止硬编码。
- **变体**：优先使用 `*Outlined`（线性）风格；`*Filled` 仅用于强调/选中态；`*TwoTone` 慎用（需配合品牌色）。
- **侧边栏导航图标与文字间距**：`10px`（见 §5 导航组件 & Figma node 103-266）。

### 1.2 Logo 使用规范

源文件在 `arti logo/` 目录，代码组件为 `ArtiWordmark`（`src/app/components/ArtiAvatar.tsx`）。

| 文件 | `theme` 值 | 视觉 | 说明 |
| ---- | ---------- | ---- | ---- |
| `logo-primary-dark.svg` | `"dark"` | 金色 mark + `#FFF9E7` 字（无背景） | 用于暗色背景 |
| `logo-primary-light.svg` | `"light"` | 暗色圆角方块 + 金色 mark + `#201E1A` 字 | 用于亮色背景 |

```tsx
<ArtiWordmark height={28} theme="dark" />   // 暗色背景
<ArtiWordmark height={28} theme="light" />  // 亮色背景
```

- viewBox = `0 0 309 100`，宽高比 3.09:1
- Mark 渐变固定 `#E8C88A → #FDE9C4`
- 修改 logo 时直接替换 SVG 文件并同步更新 `ArtiWordmark` 组件中的 path d 值
- 所有使用场景必须传 `theme` prop，**禁止硬编码颜色**

---

## 2. 色彩系统

所有颜色通过 CSS 自定义属性定义在 `src/styles/theme.css`，**禁止硬编码颜色值**。

> Token 来源：Figma 《ARTI design system》 file `N5utEutpMAwieIQVOzdhhE`，frame `Frame 39`（377:3300）。
> 代码层 token 仍以 `src/styles/theme.css` 中的 `--arti-*` 变量为准；下表第三列给出对应的 Figma variable 名，便于跨工具核对。

### 2.1 ARTI 品牌色（金色）

金色是 ARTI 唯一的 brand palette —— 不存在 creamsicle 红、黑金等其它配色变体。

| 变量                 | 暗色值                 | 亮色值                 | 用途                       |
| -------------------- | ---------------------- | ---------------------- | -------------------------- |
| `--arti-gold`        | `#FFECB5`              | `#946B1A`              | 品牌主色、高亮文字         |
| `--arti-gold-faint`  | `rgba(255,236,181,0.08)` | `rgba(180,135,40,0.10)` | 金色淡底（hover、tag）   |
| `--arti-gold-faint2` | `rgba(255,236,181,0.04)` | `rgba(180,135,40,0.05)` | 金色极淡底               |
| `--arti-gold-gradient` | `linear-gradient(270deg, #FFECB5, #FFF6DC)` | `linear-gradient(135deg, #D4A74A, #C0912E)` | 金色渐变按钮 |
| `--arti-gold-text`   | `#111010`              | `#2A2010`              | 金色按钮上的文字色         |
| `--arti-heading-hero` | `#FFFDF0`             | `#1a1a1a`              | Hero 大标题色              |
| `--arti-gradient-from` | `#FFE395`            | `#b6872d`              | 渐变文字起点               |
| `--arti-gradient-to`   | `#FFF2CC`            | `#966d1c`              | 渐变文字终点               |

> **亮色金色设计原则**：亮色模式的金色参考 mustard/amber 色调（温暖、饱满），而非简单地将暗色金色反转变暗。按钮渐变 `#D4A74A → #C0912E` 保持温暖的 mustard 感；文字金 `#946B1A` 确保可读性。

### 2.1b 红色点缀（Accent）

亮色模式使用红色 `#d43d2e` 作为视觉点缀，暗色模式降级为金色。用于步骤标签、pill 圆点、箭头连接线、section 分隔线等装饰元素。

| 变量                   | 暗色值                         | 亮色值                     | 用途                     |
| ---------------------- | ------------------------------ | -------------------------- | ------------------------ |
| `--arti-cta-bg`        | `var(--arti-gold-gradient)`    | `#d43d2e`                  | 主 CTA 按钮背景           |
| `--arti-cta-text`      | `#111010`                      | `#ffffff`                  | 主 CTA 按钮文字           |
| `--arti-accent`        | `var(--arti-gold)`             | `#d43d2e`                  | 点缀色（步骤、圆点、箭头）|
| `--arti-accent-text`   | `#111010`                      | `#ffffff`                  | 点缀色上的文字            |
| `--arti-accent-faint`  | `rgba(255,236,181,0.08)`       | `rgba(212,61,46,0.08)`     | 点缀色淡底               |
| `--arti-accent-faint2` | `rgba(255,236,181,0.04)`       | `rgba(212,61,46,0.04)`     | 点缀色极淡底             |

> **红色使用原则**：红色仅作为"不经意的视觉点缀"，出现在装饰性元素上（步骤标签、圆点、分隔线菱形、箭头连接线），**不用于功能色**（涨跌、成功/失败仍使用 §2.5 功能色）。

### 2.2 背景层级

| 变量              | 暗色值     | 亮色值     | 用途            |
| ----------------- | ---------- | ---------- | --------------- |
| `--arti-bg`       | `#1a1a1a`  | `#F6F4F1`  | 页面主背景（暖纸色）|
| `--arti-bg-panel` | `#1e1e1e`  | `#EBE7DF`  | 侧边栏/面板     |
| `--arti-bg-card`  | `#222222`  | `#FFFFFF`  | 卡片第一层       |
| `--arti-bg-card2` | `#252525`  | `#F8F5EE`  | 卡片第二层       |
| `--arti-bg-card3` | `#2a2a2a`  | `#F0ECE4`  | 卡片第三层       |
| `--arti-bg-hover` | `rgba(255,255,255,0.04)` | `rgba(148,107,26,0.05)` | hover 背景 |
| `--arti-bg-hover2`| `rgba(255,255,255,0.05)` | `rgba(148,107,26,0.07)` | hover 背景（强）|
| `--arti-bg-input` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.03)`      | 输入框背景 |

> **亮色背景设计原则**：所有背景使用暖色调 cream/paper，避免冷灰。`--arti-bg` 的 `#F6F4F1` 偏暖但不过于偏黄。

### 2.3 文字层级（6 级）

| 变量           | 暗色值     | 亮色值     | 用途                       |
| -------------- | ---------- | ---------- | -------------------------- |
| `--arti-text1` | `#EDE8DF`  | `#1A1710`  | 标题、核心信息              |
| `--arti-text2` | `#c8c7c2`  | `#2E2A22`  | 正文                       |
| `--arti-text3` | `#b0afa8`  | `#4A4538`  | 次要正文、说明              |
| `--arti-text4` | `#9a9890`  | `#6B665A`  | 辅助信息                   |
| `--arti-text5` | `#73726C`  | `#8A857A`  | 淡化文字、时间戳            |
| `--arti-text6` | `#6b6b68`  | `#A8A49A`  | 最淡文字、placeholder      |

> **亮色文字设计原则**：文字色使用暖 charcoal（带棕调），**禁止纯黑 `#000`**。最深 `#1A1710` 也带有暖意。

### 2.4 边框层级（4 级）

| 变量              | 暗色值                       | 亮色值                       | 用途           |
| ----------------- | ---------------------------- | ---------------------------- | -------------- |
| `--arti-border`   | `rgba(255,255,255,0.06)`     | `rgba(60,50,30,0.08)`        | 最淡分隔线     |
| `--arti-border2`  | `rgba(255,255,255,0.08)`     | `rgba(60,50,30,0.12)`        | 卡片默认边框   |
| `--arti-border3`  | `rgba(255,255,255,0.09)`     | `rgba(60,50,30,0.14)`        | 输入框边框     |
| `--arti-border4`  | `rgba(255,255,255,0.12)`     | `rgba(60,50,30,0.20)`        | 强调边框       |

> **亮色边框设计原则**：使用暖棕 `rgba(60,50,30,*)` 而非冷灰 `rgba(0,0,0,*)`，与整体暖色调一致。

### 2.4b 官网专用 Token（LandingPage）

以下变量仅用于官网 Hero 区域，暗色模式降级为通用 token：

| 变量                    | 暗色值                    | 亮色值       | 用途                  |
| ----------------------- | ------------------------- | ------------ | --------------------- |
| `--arti-hero-subtitle`  | `var(--arti-text4)`       | `#332d1e`    | Hero 副标题色          |
| `--arti-hero-trust`     | `var(--arti-text4)`       | `#4f4834`    | 信任文案色             |
| `--arti-pill-bg`        | `var(--arti-bg-hover)`    | `#f1ebe0`    | Pill badge 背景        |
| `--arti-avatar-border`  | `#161618`                 | `#fffdf0`    | 社交头像边框           |
| `--arti-scroll-label`   | `var(--arti-text5)`       | `#c4af75`    | "SCROLL" 标签色        |

### 2.5 功能色

| 颜色   | 值         | Figma variable      | 用途              |
| ------ | ---------- | ------------------- | ----------------- |
| 绿色   | `#00E096`  | success/6 ❖         | 正收益、成功       |
| 红色   | `#FF4245`  | Danger/6 ❖          | 负收益、风险（主） |
| 红色淡 | `#FF6E6B`  | Danger/5            | 负收益（次级）     |
| 红色深 | `#D92E36`  | Danger/7            | 危险（按下/强调）  |
| 蓝色   | `#6EC6FF`  | —                   | 信息、新闻         |
| 紫色   | `#B09EDF`  | —                   | 行业、分类         |
| 橙色   | `#F5A623`  | —                   | 警告、风险         |

> 注意：Figma 的 success/danger 比代码层更鲜艳（饱和度更高）。在涉及收益涨跌、风险预警等关键指标时，**优先使用 Figma 的 `#00E096` / `#FF4245` / `#D92E36`**，与设计稿对齐；非关键装饰仍可沿用 `#4ED87A`/`#E87070` 等更柔和的暗色值。

### 2.6 主题切换

- 暗色（默认）：`:root` 中的变量
- 亮色：`[data-theme="light"]` 覆盖
- 切换通过 `data-theme` 属性控制在根元素上
- 所有组件必须使用 CSS 变量，**禁止硬编码 hex/rgb/rgba**
- 仅保留金色品牌主题（暗色 + 亮色两个变体）。禁止引入新的 brand palette。

**亮色模式设计语言（核心原则）：**

1. **暖色调优先**：背景用 cream/paper，文字用 warm charcoal，边框用暖棕 rgba — 整体避免冷灰
2. **金色适配**：亮色模式的金色采用 mustard/amber 调，按钮渐变 `#D4A74A → #C0912E`，而非简单反转暗色金
3. **红色点缀**：亮色模式用 `#d43d2e` 红作为 CTA 和装饰点缀（`--arti-accent`），暗色模式降级为金色
4. **对比度保证**：文字金 `#946B1A` 在浅底上可读；渐变文字 `#b6872d → #966d1c` 保持辨识度
5. **不要用纯黑/纯白**：最深文字 `#1A1710`（暖），最浅背景 `#F6F4F1`（暖）

---

## 3. 字体排版

### 3.1 字体家族

```css
/* 中文标题 — 衬线（品牌主标题） */
font-family: 'Noto Serif SC', serif;
/* 用于：Hero/Section H1-H3、品牌文案、Wordmark */

/* 中文正文 + 中等级标题 — 无衬线 */
font-family: 'Noto Sans SC', sans-serif;
/* 用于：H4-H5、正文段落、按钮、标签、说明文字 */
/* Figma 设计稿中字体系统区域所有 64/44/32/24/16/14 示例均采用 Noto Sans SC */

/* 英文/数字 — 等比例 */
font-family: Inter, sans-serif;
/* 用于：价格、百分比、股票代码、时间、Latin metadata */
```

> Figma 中的「标题（S）/H5」token = `Noto Serif SC SemiBold 22 / lineHeight 32`，对应代码层 `--arti-h5` 用法（卡片标题）。

### 3.2 字号规范

| 场景          | 大小    | 字重  | 行高  |
| ------------- | ------- | ----- | ----- |
| 页面大标题     | 28-48px | 700   | 1.25  |
| 区域标题       | 20-24px | 700   | 1.35  |
| 卡片标题       | 15-17px | 600   | 1.45  |
| 正文          | 14-15px | 400   | 1.6-1.7 |
| 辅助文字       | 12-13px | 400   | 1.5   |
| 微小标签       | 11px    | 400-500 | 1.4  |

### 3.3 字体加载

```css
/* src/styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&family=Noto+Sans+SC:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap');
```

---

## 4. 间距与布局

### 4.1 间距基数

基于 **4px** 倍数系统（与 Tailwind 默认一致）。

| Tailwind 类  | 像素值  | 常用场景           |
| ------------ | ------- | ------------------ |
| `gap-1`      | 4px     | 紧凑元素间         |
| `gap-2`      | 8px     | 同级元素间         |
| `gap-3`      | 12px    | 卡片内部间距       |
| `gap-4`      | 16px    | 段落间、对话间距   |
| `gap-6`      | 24px    | 区域间距           |
| `p-6`        | 24px    | 卡片内边距         |
| `px-4`       | 16px    | 按钮水平内边距     |

### 4.2 圆角

| 变量          | 值     | 用途          |
| ------------- | ------ | ------------- |
| `--radius-sm` | 6px    | 小标签、badge |
| `--radius-md` | 8px    | 按钮、输入框  |
| `--radius-lg` | 10px   | 卡片         |
| `--radius-xl` | 14px   | 大卡片、弹窗  |
| 自定义 16px   | 16px   | 主要卡片      |
| 自定义 18px   | 18px   | 流光边框容器   |

### 4.3 页面布局

```
┌─ Sidebar (256px / 可折叠) ──────────────────────────────────────────┐
│  Logo + 导航 + 最近对话 + 用户菜单                                    │
├────────────────────────────────────────────────────────────────────────┤
│  Main Content Area (flex: 1)                                          │
│  ├─ 聊天页 / 行情页 / 资讯页 / 研报页 / ...                           │
│  └─ 最大宽度由各页面自行控制                                           │
└────────────────────────────────────────────────────────────────────────┘
```

官网（LandingPage）独立全屏，不含侧边栏。内容区 `maxWidth: 1120px, margin: 0 auto`。

---

## 5. 组件规范

### 5.1 卡片 (Card)

```tsx
// 基础卡片样式
{
  background: "var(--arti-bg-card)",
  border: "1px solid var(--arti-border2)",
  borderRadius: 16,
}

// Hover 效果（可选）
onMouseEnter → borderColor: "var(--arti-gold)", boxShadow: "0 0 24px rgba(232,200,138,0.12)"
onMouseLeave → 恢复默认
```

### 5.2 按钮

**主按钮（金色）：**
```tsx
{
  background: "var(--arti-gold)",
  color: "#111010",
  borderRadius: 10,
  fontWeight: 600,
  border: "none",
  padding: "10px 24px",
  fontSize: 15,
}
```

**幽灵按钮：**
```tsx
{
  background: "transparent",
  color: "var(--arti-gold)",
  border: "1px solid var(--arti-gold)",
  borderRadius: 10,
}
```

**文本按钮/导航链接：**
```tsx
{
  background: "none",
  border: "none",
  color: "var(--arti-text3)",
  // hover → color: "var(--arti-text1)"
}
```

### 5.3 输入框

- 背景: `var(--arti-bg-input)` 或 `rgba(255,255,255,0.04)`
- 边框: `1px solid var(--arti-border3)`
- 聚焦边框: `var(--arti-gold)` 或 `rgba(232,200,138,0.5)`
- 圆角: 16px（聊天输入框）/ 10px（普通输入框）
- 空状态带流光边框效果（`.arti-comet-border`）

### 5.4 标签/Badge

```tsx
// 胶囊标签
{
  padding: "5px 14px",
  fontSize: 13,
  borderRadius: 20,  // 全圆角胶囊
  background: "var(--arti-bg-card)",
  border: "1px solid var(--arti-border2)",
  color: "var(--arti-text2)",
}

// 色彩标签（如大师风格标签）
{
  fontSize: 11,
  padding: "1px 8px",
  borderRadius: 4,
  background: `${color}18`,    // 颜色 10% 透明度
  color: color,
  border: `1px solid ${color}30`,  // 颜色 19% 透明度
}
```

---

## 6. 动效系统

### 6.1 过渡

| 场景          | 时长     | 缓动         |
| ------------- | -------- | ------------ |
| Hover 效果     | 0.15s    | ease         |
| 主题切换       | 0.25s    | ease         |
| 卡片浮起       | 0.25s    | ease         |
| 数据淡入       | 0.3-0.4s | ease         |
| 胶囊轮播       | 0.8s     | ease (opacity only) |

### 6.2 品牌动效

**流光边框** (`arti-comet-border`)：
- 使用 `conic-gradient` + CSS `@property --comet-angle` 实现单光源旋转
- 6s 周期, `ease-in-out`（转角自然减速）
- 叠加模糊光斑 (`::before`, 120px, blur 25px)
- 聚焦状态: 4.5s 更快周期，更亮

**玻璃效果** (`arti-glass`)：
- `backdrop-filter: blur(16px)`
- 半透明背景 + 渐变光泽叠加层

**浮动动画** (`arti-float`)：上下 6px 浮动
**脉冲光晕** (`arti-pulse-glow`)：透明度 0.4↔0.7 + 缩放 1↔1.08

### 6.3 深度分析动画

四阶段进度动画 (`AnalysisAnimation`)：
1. **搜索**：关键词逐个出现（每个 1.2s）
2. **分析师调研**：7 位分析师逐个亮灯（每个 3s）
3. **大师圆桌**：7 位大师逐个发言（每个 4s）
4. **汇总生成**：非线性进度条（前快后慢，总计约 30s）

总时长约 90s，匹配真实 2-5 分钟深度分析的预期。

---

## 7. 装饰元素系统

官网使用以下装饰元素增加视觉质感：

### 7.1 可用装饰组件

| 组件            | 用途               | 参数                        |
| --------------- | ------------------ | --------------------------- |
| `DotGrid`       | 5×5 金色点阵       | `className`, `style`        |
| `Crosshair`     | 十字准星 SVG       | `className`, `color`, `style` |
| `CornerAccent`  | L 形角落装饰       | `position`, `color`         |
| `SectionDivider`| 菱形分段线         | `variant: gold/red/subtle`  |

### 7.2 使用原则

- 装饰元素一律 `position: absolute` + `pointer-events: none`
- 透明度控制在 0.04~0.2 之间，不喧宾夺主
- 大屏才显示：`className="hidden md:block"` 或 `hidden lg:block`
- 红色点缀极少使用（仅风险相关内容旁）
- 背景辉光使用 `radial-gradient(ellipse, rgba(232,200,138,0.04~0.06), transparent 70%)`

---

## 8. 七位投资大师

| 字  | 姓名       | 颜色      | 风格   |
| --- | ---------- | --------- | ------ |
| 格  | 格雷厄姆   | `#4DD4C8` | 看价值 |
| 索  | 索罗斯     | `#B09EDF` | 看大势 |
| 达  | 达利欧     | `#7AADEA` | 看周期 |
| 巴  | 巴菲特     | `#E8C88A` | 看长期 |
| 林  | 林奇       | `#4ED87A` | 看成长 |
| 西  | 西蒙斯     | `#E87070` | 看数据 |
| 利  | 利弗莫尔   | `#D4A855` | 看趋势 |

头像统一为彩色圆形 + 白色中文单字，size 按上下文调整（22-48px）。

---

## 9. 七位分析师

| 标签 | 颜色      | 图标含义 |
| ---- | --------- | -------- |
| 新闻 | `#6EC6FF` | 报纸     |
| 行业 | `#B09EDF` | 建筑     |
| 走势 | `#E87070` | 折线图   |
| 风险 | `#F5A623` | 警告三角 |
| 财务 | `#4ED87A` | 文档     |
| 收益 | `#E8C88A` | 美元符号 |
| 数据 | `#7AADEA` | 柱状图   |

头像为**圆角方块**（borderRadius: 5-10px），背景为颜色 10% 透明度 + 描边 SVG 图标。

---

## 10. 文件结构

```
src/
├── styles/
│   ├── index.css          # 入口，导入顺序: fonts → tailwind → theme
│   ├── fonts.css          # Google Fonts 引入
│   ├── tailwind.css       # Tailwind @source 配置
│   └── theme.css          # 设计令牌、动画、特效（核心文件）
├── app/
│   ├── App.tsx            # 路由 & 主题控制
│   └── components/
│       ├── ui/            # 基础 UI 组件库（50+ 组件，基于 Radix）
│       ├── ChatPage.tsx   # 聊天页（含情感化设计、流光边框）
│       ├── LandingPage.tsx # 官网（含装饰元素系统）
│       ├── Sidebar.tsx    # 侧边栏导航
│       ├── UserMenu.tsx   # 用户菜单 & 用量展示
│       ├── ArtiAvatar.tsx # ARTI 品牌头像组件
│       └── ...
└── imports/               # SVG 路径数据
```

---

## 11. 编码规范

1. **颜色**：必须使用 `var(--arti-*)` 变量，禁止硬编码 hex/rgb
2. **字体**：中文标题用 Noto Serif SC，正文用 Noto Sans SC，数字用 Inter
3. **间距**：遵循 4px 基数，使用 Tailwind 类或对应的像素值
4. **主题**：所有视觉元素必须同时适配暗色/亮色主题
5. **响应式**：移动端优先，装饰元素在小屏隐藏
6. **动效**：保持克制，过渡 0.15-0.25s，避免花哨动画
7. **组件**：优先使用 `src/app/components/ui/` 中已有的组件
8. **样式方式**：Tailwind 类优先；复杂 inline style 用 `React.CSSProperties` 对象
9. **无障碍**：交互元素需有 focus-visible 状态，使用语义化 HTML
10. **中文排版**：标点不换行，数字与中文间自动加空格（CSS `text-autospace`）
