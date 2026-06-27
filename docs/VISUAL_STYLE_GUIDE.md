# Testing Tools — 视觉规范文档

> **版本**: 1.0.0  
> **日期**: 2026-05-29  
> **适用范围**: 所有新页面、新组件、UI 修改  
> **设计系统**: 基于 [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS

---

## 目录

1. [设计原则](#1-设计原则)
2. [色彩系统](#2-色彩系统)
3. [排版规范](#3-排版规范)
4. [间距与布局](#4-间距与布局)
5. [圆角与阴影](#5-圆角与阴影)
6. [组件规范](#6-组件规范)
7. [交互与动效](#7-交互与动效)
8. [暗色模式](#8-暗色模式)
9. [工具色彩标识](#9-工具色彩标识)
10. [代码规范](#10-代码规范)
11. [反模式清单](#11-反模式清单)

---

## 1. 设计原则

### 1.1 核心定位

Testing Tools 是一款**浏览器扩展开发者工具集**，视觉风格遵循：

- **专业克制** — 低饱和度色彩，避免视觉噪音
- **信息密度优先** — 紧凑布局，在 400×600px 的 popup 空间内高效展示
- **开发者友好** — 等宽字体用于代码/数据，清晰的信息层级
- **一致性至上** — 所有页面、组件遵循同一套视觉语言

### 1.2 设计关键词

```
简洁 · 现代 · 功能导向 · 低对比度 · 微圆角 · 微妙阴影
```

### 1.3 与 shadcn/ui 的关系

本项目以 shadcn/ui 为底座，所有基础组件（Button、Input、Select 等）均来自或对齐 shadcn/ui 的默认样式。业务组件在此基础上扩展，**不得破坏底层设计语言的统一性**。

---

## 2. 色彩系统

### 2.1 CSS 变量定义

所有色彩通过 CSS 自定义属性（HSL 格式）管理，定义于 `src/index.css`：

#### 亮色模式 (`:root`)

| 变量名                     | HSL 值              | 用途          | 近似色    |
| -------------------------- | ------------------- | ------------- | --------- |
| `--background`             | `0 0% 100%`         | 页面背景      | `#ffffff` |
| `--foreground`             | `222.2 84% 4.9%`    | 主文字        | `#020617` |
| `--card`                   | `0 0% 100%`         | 卡片背景      | `#ffffff` |
| `--card-foreground`        | `222.2 84% 4.9%`    | 卡片文字      | `#020617` |
| `--popover`                | `0 0% 100%`         | 浮层背景      | `#ffffff` |
| `--popover-foreground`     | `222.2 84% 4.9%`    | 浮层文字      | `#020617` |
| `--primary`                | `222.2 47.4% 11.2%` | 主按钮/强调   | `#0f172a` |
| `--primary-foreground`     | `210 40% 98%`       | 主按钮文字    | `#f8fafc` |
| `--secondary`              | `210 40% 96.1%`     | 次级背景      | `#f1f5f9` |
| `--secondary-foreground`   | `222.2 47.4% 11.2%` | 次级文字      | `#0f172a` |
| `--muted`                  | `210 40% 96.1%`     | 静音/禁用背景 | `#f1f5f9` |
| `--muted-foreground`       | `215.4 16.3% 46.9%` | 次要文字      | `#64748b` |
| `--accent`                 | `210 40% 96.1%`     | 悬停高亮      | `#f1f5f9` |
| `--accent-foreground`      | `222.2 47.4% 11.2%` | 悬停文字      | `#0f172a` |
| `--destructive`            | `0 84.2% 60.2%`     | 错误/删除     | `#ef4444` |
| `--destructive-foreground` | `210 40% 98%`       | 错误文字      | `#f8fafc` |
| `--border`                 | `214.3 31.8% 91.4%` | 边框          | `#e2e8f0` |
| `--input`                  | `214.3 31.8% 91.4%` | 输入框边框    | `#e2e8f0` |
| `--ring`                   | `222.2 84% 4.9%`    | 焦点环        | `#020617` |
| `--radius`                 | `0.5rem`            | 全局圆角      | `8px`     |

#### 暗色模式 (`.dark`)

暗色模式下所有变量自动反转，保持对比度关系：

| 变量名                 | HSL 值              | 近似色    |
| ---------------------- | ------------------- | --------- |
| `--background`         | `222.2 84% 4.9%`    | `#020617` |
| `--foreground`         | `210 40% 98%`       | `#f8fafc` |
| `--primary`            | `210 40% 98%`       | `#f8fafc` |
| `--primary-foreground` | `222.2 47.4% 11.2%` | `#0f172a` |
| `--secondary`          | `217.2 32.6% 17.5%` | `#1e293b` |
| `--muted`              | `217.2 32.6% 17.5%` | `#1e293b` |
| `--border`             | `217.2 32.6% 17.5%` | `#1e293b` |

### 2.2 使用规范

```tsx
// ✅ 正确：使用 CSS 变量
<div className="bg-background text-foreground border-border">

// ✅ 正确：使用语义化色彩名
<Button className="bg-primary text-primary-foreground">
<span className="text-muted-foreground">

// ❌ 错误：硬编码颜色值
<div className="bg-white text-black">
<div className="bg-[#f1f5f9]">
```

### 2.3 语义化色彩使用场景

| 色彩                       | 场景                             |
| -------------------------- | -------------------------------- |
| `background`               | 页面根背景                       |
| `foreground`               | 主标题、正文                     |
| `muted-foreground`         | 描述文字、占位符、次级标签       |
| `border`                   | 卡片边框、分割线、输入框边框     |
| `card` + `card-foreground` | 卡片容器及其内容                 |
| `primary`                  | 主按钮、选中状态、关键操作       |
| `secondary`                | 次级按钮、工具栏背景、标签页背景 |
| `destructive`              | 错误提示、删除操作、验证失败     |
| `accent`                   | 悬停背景、下拉选中项             |

---

## 3. 排版规范

### 3.1 字体栈

项目使用系统默认字体栈（Tailwind 默认），**不引入自定义字体**。

```css
/* Tailwind 默认 sans-serif */
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  'Helvetica Neue',
  Arial,
  sans-serif;

/* 等宽字体用于代码/数据 */
font-family:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
```

### 3.2 字号层级

| 层级      | 类名                                             | 大小 | 字重    | 用途                   |
| --------- | ------------------------------------------------ | ---- | ------- | ---------------------- |
| 页面标题  | `text-base font-bold`                            | 16px | 700     | 页面主标题（极少使用） |
| 卡片标题  | `text-sm font-bold tracking-tight`               | 14px | 700     | 卡片/区块标题          |
| 正文      | `text-sm`                                        | 14px | 400     | 普通正文               |
| 次级文字  | `text-xs`                                        | 12px | 400/500 | 描述、标签             |
| 微标签    | `text-[10px] font-bold uppercase tracking-wider` | 10px | 700     | 区域标签、分类标题     |
| 数据/代码 | `font-mono text-sm`                              | 14px | 400     | 时间戳、JSON、代码     |

### 3.3 排版模式

```tsx
// 区域标签（Section Label）— 最常用
<span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
  输出结果
</span>

// 卡片标题
<h4 className="font-bold text-sm tracking-tight text-foreground leading-snug">
  标题文字
</h4>

// 描述文字
<p className="text-[11px] font-medium text-muted-foreground/90 leading-normal">
  描述内容
</p>

// 数据展示
<span className="font-mono font-bold text-foreground text-sm tracking-tight tabular-nums">
  1716950400000
</span>
```

### 3.4 行高与字间距

| 属性              | 值       | 场景               |
| ----------------- | -------- | ------------------ |
| `leading-none`    | 1        | 单行数据、紧凑布局 |
| `leading-snug`    | 1.375    | 标题、短文本       |
| `leading-relaxed` | 1.625    | 长文本、代码块     |
| `tracking-tight`  | -0.025em | 标题、数据         |
| `tracking-wider`  | 0.05em   | 大写标签           |

---

## 4. 间距与布局

### 4.1 容器尺寸

```tsx
// Popup 模式（默认）
<div className="w-[400px] max-w-[400px] min-w-[400px] h-[600px] min-h-[600px]">

// Tab 模式（全屏自适应）
<div className="sm:w-screen sm:max-w-none sm:min-w-0 sm:h-screen sm:min-h-0">
```

### 4.2 间距节奏

| Token           | 值          | 使用场景           |
| --------------- | ----------- | ------------------ |
| `p-3` / `p-3.5` | 12px / 14px | 页面内边距（紧凑） |
| `p-4`           | 16px        | 标准页面内边距     |
| `p-5`           | 20px        | 卡片内部填充       |
| `gap-2`         | 8px         | 紧凑元素间距       |
| `gap-3`         | 12px        | 标准元素间距       |
| `gap-4`         | 16px        | 区块间距           |
| `gap-6`         | 24px        | 大区块间距         |

### 4.3 布局模式

#### 页面布局

```tsx
// 标准页面结构
<div className="p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none">{/* 页面内容 */}</div>
```

#### 卡片布局

```tsx
// 标准卡片
<div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
  {/* 卡片内容 */}
</div>

// 可聚焦卡片（含焦点环）
<div className="border border-border rounded-xl bg-card ... focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
```

#### 双栏网格

```tsx
// 响应式双栏
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
```

#### 工具卡片网格（Dashboard）

```tsx
// Dashboard 紧凑网格
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
```

---

## 5. 圆角与阴影

### 5.1 圆角体系

| Token          | 值     | 使用元素               |
| -------------- | ------ | ---------------------- |
| `rounded-sm`   | 2px    | Checkbox、小标签       |
| `rounded-md`   | 6px    | 按钮、输入框、Select   |
| `rounded-lg`   | 8px    | 搜索框、小卡片         |
| `rounded-xl`   | 12px   | 大卡片、面板、图标容器 |
| `rounded-full` | 9999px | 标签、Avatar           |

### 5.2 阴影体系

| 级别 | 类名                  | 用途                   |
| ---- | --------------------- | ---------------------- |
| 无   | —                     | 静态元素               |
| 低   | `shadow-sm`           | 卡片、输入框、按钮     |
| 中   | `shadow-lg`           | 下拉菜单、浮层、Dialog |
| 动态 | 自定义 `shadow-[...]` | 卡片悬停时的彩色阴影   |

### 5.3 彩色阴影规范（工具卡片专用）

```tsx
// 工具卡片悬停阴影 — 必须使用 rgba 格式配合 CSS 变量
className="hover:shadow-[0_8px_24px_-8px_rgba(var(--tool-color),0.14)]
           dark:hover:shadow-[0_8px_30px_-10px_rgba(var(--tool-color),0.25)]"
```

---

## 6. 组件规范

### 6.1 Button

来源：`src/components/ui/button.tsx`

#### 变体

| 变体          | 类名                                         | 场景               |
| ------------- | -------------------------------------------- | ------------------ |
| `default`     | `bg-primary text-primary-foreground`         | 主操作             |
| `destructive` | `bg-destructive text-destructive-foreground` | 删除、危险操作     |
| `outline`     | `border border-input bg-background`          | 次级操作、取消     |
| `secondary`   | `bg-secondary text-secondary-foreground`     | 次要操作           |
| `ghost`       | 仅悬停背景                                   | 图标按钮、低优先级 |
| `link`        | 下划线文字                                   | 跳转链接           |

#### 尺寸

| 尺寸      | 高度    | 内边距      | 场景     |
| --------- | ------- | ----------- | -------- |
| `default` | 40px    | `px-4 py-2` | 标准按钮 |
| `sm`      | 36px    | `px-3`      | 紧凑按钮 |
| `lg`      | 44px    | `px-8`      | 突出按钮 |
| `icon`    | 40×40px | —           | 图标按钮 |

#### 使用示例

```tsx
// 主操作
<Button>确认</Button>

// 图标按钮
<Button variant="ghost" size="icon">
  <Copy className="h-4 w-4" />
</Button>

// 危险操作
<Button variant="destructive" size="sm">删除</Button>
```

### 6.2 Input

来源：`src/components/ui/input.tsx`

```tsx
// 标准输入框
<Input
  className="font-mono font-semibold h-10 shadow-sm placeholder:text-muted-foreground/60 focus:bg-background"
/>

// 错误状态
<Input
  className="border-destructive focus-visible:ring-destructive"
/>
```

**规范要点**：

- 高度统一为 `h-10`（40px）
- 等宽字体用于数据输入
- 占位符使用 `text-muted-foreground/60`
- 错误时边框变红并调整焦点环

### 6.3 SwitchButtonGroup

来源：`src/components/ui/switch.tsx`

```tsx
// 分段控制器
<SwitchButtonGroup
  value={mode}
  options={[
    { value: 'ts2dt', label: '转日期' },
    { value: 'dt2ts', label: '转时间戳' },
  ]}
  onChange={setMode}
  size="small"
/>
```

**规范要点**：

- 容器：`rounded-lg bg-muted p-1`
- 选中项：`bg-background text-foreground shadow-sm font-semibold`
- 未选中项：`hover:bg-background/50 hover:text-foreground/80`
- 尺寸：`small`（32px）用于工具页，`medium`（36px）标准

### 6.4 Card（工具卡片）

来源：`src/pages/Dashboard/ToolCard.tsx`

```tsx
// 标准工具卡片结构
<div className="group relative rounded-xl border border-border/70 bg-card p-4 h-auto flex flex-col gap-3 shadow-sm">
  {/* 上半部分：图标 + 标题 + 箭头 */}
  <div className="flex items-center justify-between">
    <div className="flex gap-3 items-center">
      {/* 图标容器 */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(var(--tool-color),0.08)] text-[rgb(var(--tool-color))]">
        <Icon className="h-5 w-5" />
      </div>
      {/* 文字 */}
      <div>
        <h4 className="font-bold text-sm">标题</h4>
        <p className="text-[11px] text-muted-foreground/90">描述</p>
      </div>
    </div>
    <ChevronRight className="h-4 w-4" />
  </div>
  {/* 下半部分：预览区（可选） */}
  <div className="mt-1 pt-3 border-t border-dashed border-border/80">{snapshot}</div>
</div>
```

### 6.5 TextInputArea

来源：`src/components/TextInputArea.tsx`

```tsx
// 多行文本输入区
<TextInputArea
  value={input}
  onChange={setInput}
  placeholder="输入内容..."
  showCount={true}
  showClear={true}
  allowCopy={true}
  minRows={6}
  maxRows={12}
/>
```

**规范要点**：

- 外容器：`rounded-md border border-input bg-background shadow-sm`
- 焦点状态：`focus-within:ring-1 focus-within:ring-ring`
- 错误状态：`border-destructive focus-within:ring-destructive`
- 底部工具栏：`h-10 bg-muted/30 border-t border-border/50`
- 字体：`font-mono text-sm`

### 6.6 Dialog

来源：`src/components/ui/dialog.tsx`

```tsx
// 对话框内容
<DialogContent className="sm:rounded-lg">
  <DialogHeader>
    <DialogTitle>标题</DialogTitle>
    <DialogDescription>描述文字</DialogDescription>
  </DialogHeader>
  {/* 内容 */}
  <DialogFooter>
    <Button variant="outline">取消</Button>
    <Button>确认</Button>
  </DialogFooter>
</DialogContent>
```

### 6.7 Select

来源：`src/components/ui/select.tsx`

```tsx
<Select>
  <SelectTrigger className="h-9 shadow-sm bg-background">
    <SelectValue />
  </SelectTrigger>
  <SelectContent className="max-h-64">
    <SelectItem className="text-xs font-semibold focus:bg-accent cursor-pointer">选项</SelectItem>
  </SelectContent>
</Select>
```

### 6.8 Checkbox

来源：`src/components/ui/checkbox.tsx`

```tsx
// 标准复选框
<Checkbox className="h-4 w-4 rounded-sm border-primary data-[state=checked]:bg-primary" />

// 小型复选框（工具栏内）
<Checkbox className="h-3.5 w-3.5 rounded border-input data-[state=checked]:bg-primary shadow-sm" />
```

### 6.9 Badge

来源：`src/components/ui/badge.tsx`

| 变体          | 场景               |
| ------------- | ------------------ |
| `default`     | 状态标签、分类     |
| `secondary`   | 次要标签           |
| `destructive` | 错误标签           |
| `outline`     | 可点击标签、筛选器 |

### 6.10 CopyButton

来源：`src/components/CopyButton.tsx`

```tsx
// 标准复制按钮
<CopyButton text={content} />

// 小型复制按钮
<CopyButton text={content} size="sm" className="h-7 w-7 rounded-md border" />
```

**规范要点**：

- 默认 `variant="ghost" size="icon"`
- 复制成功后变为绿色背景 + 对勾图标
- 使用 `sonner` toast 提示复制结果

---

## 7. 交互与动效

### 7.1 过渡规范

| 属性                | 值         | 场景                          |
| ------------------- | ---------- | ----------------------------- |
| `transition-colors` | 150ms ease | 色彩变化（悬停、焦点）        |
| `transition-all`    | 150ms ease | 综合变化（SwitchButtonGroup） |
| `duration-200`      | 200ms      | 复制按钮状态切换              |

### 7.2 焦点状态

所有可交互元素必须有可见的焦点指示器：

```tsx
// 标准焦点环
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2

// 紧凑焦点环（图标按钮）
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring

// 输入框焦点
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### 7.3 悬停状态

```tsx
// 按钮悬停
hover:bg-accent hover:text-accent-foreground

// 卡片悬停
hover:bg-muted/30 hover:border-[rgba(var(--tool-color),0.45)]

// 链接/文字悬停
hover:text-foreground hover:underline
```

### 7.4 动画规范

使用 `tailwindcss-animate` 提供的动画：

```tsx
// 淡入
animate-in fade-in duration-150

// 淡入 + 缩放（SwitchButtonGroup 选中项）
animate-in fade-in-50 zoom-in-95 duration-150

// 从顶部滑入（下拉菜单）
animate-in fade-in slide-in-from-top-2 duration-150

// 错误提示出现
animate-in fade-in slide-in-from-top-1 duration-150

// 骨架屏脉冲
animate-pulse
```

### 7.5 禁用状态

```tsx
// 统一禁用样式
disabled:pointer-events-none disabled:opacity-50
```

---

## 8. 暗色模式

### 8.1 实现方式

通过 `darkMode: 'class'`（Tailwind 配置）+ `.dark` 类切换：

```tsx
// ThemeModeProvider 自动处理
document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
```

### 8.2 暗色模式下的特殊处理

```tsx
// 彩色阴影增强（暗色模式下阴影需要更高透明度）
shadow-[0_8px_24px_-8px_rgba(var(--tool-color),0.14)]
dark:shadow-[0_8px_30px_-10px_rgba(var(--tool-color),0.25)]

// 图标容器背景增强
bg-[rgba(var(--tool-color),0.08)]
dark:bg-[rgba(var(--tool-color),0.12)]

// 成功状态文字调整
text-emerald-600 dark:text-emerald-400
```

### 8.3 暗色模式色彩映射原则

| 亮色             | 暗色             | 说明                            |
| ---------------- | ---------------- | ------------------------------- |
| 纯白背景         | 深蓝黑背景       | 避免纯黑 `#000`，使用 `#020617` |
| 浅灰背景         | 深灰背景         | 保持层次关系                    |
| 深文字           | 浅文字           | 反转对比度                      |
| 彩色阴影低透明度 | 彩色阴影高透明度 | 暗色需要更强视觉反馈            |

---

## 9. 工具色彩标识

### 9.1 色板定义

每个工具分配一个主题色，定义于 `src/config/features.tsx`：

```ts
const PALETTE_COLORS: Record<PaletteColorKey, string> = {
  primary: '13, 148, 136', // teal (#0d9488)
  success: '22, 163, 74', // green (#16a34a)
  warning: '217, 119, 6', // amber (#d97706)
  error: '220, 38, 38', // red (#dc2626)
  secondary: '147, 51, 232', // purple (#9333e8)
  info: '37, 99, 235', // blue (#2563eb)
};
```

### 9.2 工具色彩分配

| 工具        | 色彩键      | 色值   |
| ----------- | ----------- | ------ |
| 时间戳转换  | `primary`   | Teal   |
| 存储清理    | `warning`   | Amber  |
| 二维码工具  | `success`   | Green  |
| 文本统计    | `secondary` | Purple |
| JWT 解析    | `info`      | Blue   |
| JSON 对比   | `primary`   | Teal   |
| Base64 转换 | `info`      | Blue   |
| 右键还原    | `success`   | Green  |

### 9.3 工具色彩使用规范

```tsx
// 1. 通过 style 注入 CSS 变量
<div style={{ ['--tool-color' as string]: rgbValues }}>

// 2. 图标容器背景（低透明度）
bg-[rgba(var(--tool-color),0.08)]
dark:bg-[rgba(var(--tool-color),0.12)]

// 3. 图标颜色
 text-[rgb(var(--tool-color))]

// 4. 悬停边框
hover:border-[rgba(var(--tool-color),0.45)]

// 5. 悬停阴影
hover:shadow-[0_8px_24px_-8px_rgba(var(--tool-color),0.14)]

// 6. 箭头悬停色
group-hover:text-[rgb(var(--tool-color))]
```

**注意**：工具色彩仅用于**标识和装饰**，不得用于功能性色彩（如成功/错误状态）。

---

## 10. 代码规范

### 10.1 Tailwind 类名组织顺序

使用 `cn()` 工具函数（`clsx` + `tailwind-merge`）组合类名，按以下顺序排列：

```tsx
className={cn(
  // 1. 布局（display, position, flex, grid）
  'flex items-center justify-between',
  // 2. 尺寸（width, height, padding, margin）
  'w-full h-10 px-4',
  // 3. 外观（background, border, shadow, rounded）
  'rounded-md border border-input bg-background shadow-sm',
  // 4. 文字（color, font, text-align）
  'text-sm font-medium text-foreground',
  // 5. 交互（hover, focus, disabled, cursor）
  'hover:bg-accent focus-visible:ring-2 disabled:opacity-50',
  // 6. 动画（transition, animate）
  'transition-colors duration-150',
  // 7. 条件类
  isActive && 'bg-primary text-primary-foreground',
  // 8. 外部传入
  className,
)}
```

### 10.2 颜色使用检查清单

- [ ] 所有颜色使用 CSS 变量（`bg-background` 而非 `bg-white`）
- [ ] 边框使用 `border-border` 及其透明度变体
- [ ] 文字层级使用 `foreground` → `muted-foreground` → `muted-foreground/60`
- [ ] 错误状态使用 `destructive` 系列
- [ ] 工具色彩仅用于装饰性元素

### 10.3 组件文件组织

```
src/
├── components/ui/          # shadcn 基础组件（只读，不修改）
├── components/             # 业务组件
│   ├── CopyButton.tsx
│   ├── SwitchButtonGroup.tsx
│   ├── TextInputArea.tsx
│   └── ...
├── pages/                  # 页面组件
│   ├── <ToolName>/
│   │   ├── index.tsx       # 页面入口
│   │   ├── use<ToolName>.ts # 业务逻辑 Hook
│   │   └── components/     # 页面私有组件
│   └── ...
└── providers/              # Context Providers
```

### 10.4 新增页面模板

```tsx
// src/pages/NewTool/index.tsx
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { cn } from '@/lib/utils';

export default function Index() {
  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      {/* 页面内容 */}
      <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <h4 className="font-bold text-sm tracking-tight">新工具</h4>
      </div>
    </div>
  );
}
```

---

## 11. 反模式清单

以下模式**禁止**在项目中使用：

### 11.1 色彩反模式

```tsx
// ❌ 硬编码颜色
<div className="bg-white text-black">
<div className="bg-gray-100">
<div className="text-gray-500">

// ❌ 使用非语义化 Tailwind 颜色
<div className="bg-slate-50">
<div className="text-zinc-400">

// ✅ 使用 CSS 变量
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">
```

### 11.2 布局反模式

```tsx
// ❌ 固定高度导致内容截断
<div className="h-[200px]">

// ✅ 使用 min-height 或自适应
<div className="min-h-[200px]">
<div className="h-auto">

// ❌ 使用 margin 做组件间距
<div className="mb-4">

// ✅ 使用 gap
<div className="flex flex-col gap-4">
```

### 11.3 组件反模式

```tsx
// ❌ 修改 shadcn/ui 基础组件样式
// 如需修改，通过 className 覆盖或创建包装组件

// ❌ 内联样式用于颜色（工具色彩除外）
<div style={{ backgroundColor: '#f1f5f9' }}>

// ❌ 混合使用不同圆角体系
<Button className="rounded-lg">  // Button 应为 rounded-md

// ❌ 忽略焦点状态
<button className="...">  // 缺少 focus-visible 样式
```

### 11.4 暗色模式反模式

```tsx
// ❌ 仅适配部分元素
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">

// ✅ 使用 CSS 变量自动适配
<div className="bg-background text-foreground">

// ❌ 暗色模式下使用不合适的透明度
<div className="bg-black/5 dark:bg-white/5">  // 对比度不足

// ✅ 使用语义化变量
<div className="bg-muted">
```

---

## 12. 附录

### 12.1 常用类名速查

```
// 页面容器
p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none

// 标准卡片
p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm

// 工具栏
flex h-10 items-center justify-between px-1.5 bg-secondary/40 rounded-xl border border-border/60

// 区域标签
text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider

// 数据展示
font-mono font-semibold text-foreground text-sm

// 错误提示
text-xs font-medium text-destructive

// 空状态
p-8 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center

// 图标按钮容器
flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background shadow-sm

// 焦点环
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### 12.2 相关文件

| 文件                                  | 说明                    |
| ------------------------------------- | ----------------------- |
| `src/index.css`                       | CSS 变量定义、全局样式  |
| `tailwind.config.js`                  | Tailwind 配置、色彩映射 |
| `src/lib/utils.ts`                    | `cn()` 工具函数         |
| `src/components/ui/*.tsx`             | shadcn/ui 基础组件      |
| `src/config/features.tsx`             | 工具配置、色彩分配      |
| `src/providers/ThemeModeProvider.tsx` | 主题模式管理            |

### 12.3 参考资源

- [shadcn/ui 文档](https://ui.shadcn.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

_本文档随项目迭代更新。新增组件或修改视觉风格时，请同步更新此文档。_
