# 为懒加载页面组件添加独立 ErrorBoundary 保护 — 设计文档

- 日期：2026-05-13
- 范围：popup / sidepanel / tab / options 入口下的页面错误隔离

## 背景与目标

当前应用通过 `config/features.tsx` 中的 `React.lazy()` 懒加载所有页面组件。`RouterContainer` 使用 `Suspense` 包裹动态组件，而错误边界仅在外层 `entrypoints/popup/App.tsx`、`entrypoints/sidepanel/App.tsx` 中包裹 `RouterContainer`、以及 `entrypoints/options/App.tsx` 顶层。

问题：单个懒加载页面在加载或渲染时一旦抛错，错误会冒泡到全局 `ErrorBoundary`，触发全屏错误 UI，整个路由容器和 TopBar 一起被替换。用户必须刷新页面才能继续使用其他工具，体验受损。

目标：将错误影响范围限制在当前页面区域；其他页面、TopBar、导航、Snackbar 不受影响；用户可在错误状态下切换到其他工具或重试当前页。

## 设计概要

新增 `PageErrorBoundary` 组件，专门用于页面级错误隔离，在 `RouterContainer` 的 `Suspense` 内层使用；`options/App.tsx` 也替换为同款页面级边界。现有全局 `ErrorBoundary` 保留作为兜底，覆盖 TopBar / Snackbar / RouterProvider 等同级组件。

## 组件设计

### `components/PageErrorBoundary.tsx`（新增）

复用现有 `ErrorBoundary` 的错误捕获机制（`getDerivedStateFromError` + `componentDidCatch`），但具备以下差异：

- **轻量内嵌 UI**：使用 `Paper` + 居中文本，去除全屏 `Container` + `mt:8` 布局，适配 popup 400×600 与 sidepanel 等窄屏环境。结构：
  - 图标 (`ErrorOutlineIcon`)
  - 标题："该页面加载失败"
  - 副标题："页面在加载或渲染时遇到错误，您可以重试或切换到其他工具。"
  - 折叠错误信息块（沿用现有错误展示样式，使用 monospace、可滚动）
  - 主操作按钮："重试"（`RefreshIcon`）—— 重置内部 state，让子树重新挂载
- **`resetKey` prop**：可选；当 `resetKey` 在 `componentDidUpdate` 中变化时，自动重置 `hasError` / `error`，无需用户手动操作
- **`componentDidCatch`**：仍使用 `console.error('Uncaught error in page:', error, errorInfo)` 输出，不引入额外上报

接口：
```ts
interface PageErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string | number; // 变化时自动重置
}
```

### `components/ErrorBoundary.tsx`（不变）

保留作为全局兜底。负责捕获 TopBar、SnackbarProvider、RouterProvider 等同级组件中可能出现的错误，沿用全屏 `Container` 样式与"刷新应用"操作。

## 集成点

### `components/RouterContainer.tsx`（修改）

在 `Suspense` 内层插入 `PageErrorBoundary`，传入 `resetKey={currentPage}`：

```tsx
<Suspense fallback={<Spinner />}>
  <PageErrorBoundary resetKey={currentPage}>
    {Component && <Component />}
  </PageErrorBoundary>
</Suspense>
```

说明：
- `PageErrorBoundary` 置于 `Suspense` 内部，可同时捕获懒加载 chunk 加载失败（异步异常）与页面渲染期同步错误
- `resetKey={currentPage}` 使页面切换时自动清除错误状态，无需用户干预
- 保留外层 `Box key={currentPage}` 与动画 className，不改变页面切换语义

### `entrypoints/options/App.tsx`（修改）

将顶层 `<ErrorBoundary>` 替换为 `<PageErrorBoundary>`。options 是单页应用，统一使用页面级错误卡片即可。

### `entrypoints/popup/App.tsx`、`entrypoints/sidepanel/App.tsx`（不变）

保留外层 `<ErrorBoundary>` 包裹 `<RouterContainer />`，作为同级组件（TopBar 等）的兜底。`PageErrorBoundary` 与全局 `ErrorBoundary` 各司其职：

- 页面级（`PageErrorBoundary`）：捕获懒加载页面内部错误，隔离影响范围，仅替换页面区域
- 全局（`ErrorBoundary`）：捕获 RouterContainer 自身、TopBar、Snackbar 等组件错误，作为最后兜底

## 数据流 / 错误处理

### 捕获路径
- 懒加载 chunk 加载失败（网络 / CSP / chunk 缺失） → `Suspense` 内部 promise reject → `PageErrorBoundary` 捕获
- 页面渲染期同步错误（组件抛错、null 引用等） → `PageErrorBoundary` 捕获
- 事件回调或 Promise 中的异步错误 → React 错误边界不捕获（固有行为，本次不处理）

### 恢复路径
- **页面切换自动重置**：用户从错误页切换到其他页面 → `currentPage` 变化 → `resetKey` 变化 → `PageErrorBoundary.componentDidUpdate` 重置 → 新页面正常渲染
- **当前页重试**：用户点击"重试" → 内部 state 重置 → 子树重新挂载 → React 重新触发 `lazy()` 加载（懒加载失败时也会重新发起 `import()`）
- **持续错误**：若 `lazy()` chunk 始终无法加载（例如永久 404），重试会再次显示错误卡片；用户可切换到其他页面继续使用其他工具

### 日志
沿用 `console.error`；不引入 Sentry / 外部上报。

## 测试策略

### 新增 `components/__tests__/PageErrorBoundary.test.tsx`

1. 正常渲染：子组件正常渲染时，输出原始 children
2. 同步错误捕获：子组件抛错时，显示错误卡片（标题"该页面加载失败"、错误信息）
3. 重试按钮恢复：错误状态下，将 children 替换为正常组件，点击"重试"按钮，重置状态并显示正常内容
4. `resetKey` 变化自动重置：错误状态下 `resetKey` 变化时，自动清空错误并渲染新 children
5. `resetKey` 不变保持错误：children 变化但 `resetKey` 未变化时，保持错误状态（避免误重置）
6. 错误信息显示：错误的 `toString()` 内容能在 UI 中可见

### 新增 `components/__tests__/RouterContainer.test.tsx`

- 通过 mock `useRouter` 与 `FEATURES`，注入一个会抛错的懒加载组件，验证 `PageErrorBoundary` 捕获错误且 TopBar / 父容器 DOM 仍存在
- 切换 `currentPage`（重新触发 hook 返回值）后验证错误自动清除、新页面正常渲染

### 不变
- `components/__tests__/ErrorBoundary.test.tsx` 不需改动（全局边界行为未变）

### 风格
遵循现有 `ErrorBoundary.test.tsx` 模式：`vi.spyOn(console, 'error')` 抑制噪声 + `@testing-library/react` 的 `render` + `screen.getByText` 断言。

## 文件清单

**新增：**
- `components/PageErrorBoundary.tsx`
- `components/__tests__/PageErrorBoundary.test.tsx`
- `components/__tests__/RouterContainer.test.tsx`

**修改：**
- `components/RouterContainer.tsx` — 在 `Suspense` 内层包裹 `PageErrorBoundary resetKey={currentPage}`
- `entrypoints/options/App.tsx` — 将 `<ErrorBoundary>` 替换为 `<PageErrorBoundary>`

**不变：**
- `components/ErrorBoundary.tsx`
- `components/__tests__/ErrorBoundary.test.tsx`
- `entrypoints/popup/App.tsx`、`entrypoints/sidepanel/App.tsx`
- `config/features.tsx`

## 验收标准

1. 单页面在懒加载或渲染时抛错，仅当前页面区域显示错误卡片，TopBar 与导航仍可点击
2. 在错误状态下切换到其他工具，新页面能正常加载与显示
3. 点击错误卡片中的"重试"按钮，子树重新挂载并重新触发懒加载
4. 全局 `ErrorBoundary` 仍能捕获 TopBar / Snackbar 等同级组件的错误
5. 所有新增测试通过；现有 `ErrorBoundary` 测试不受影响；`npm run compile`、`npm run lint`、`npm run test` 均通过
