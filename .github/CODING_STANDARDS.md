# 代码编写规范

本文档定义了 Testing Tools 浏览器扩展项目的编码规范和最佳实践。所有代码贡献者应遵循这些规范以保持代码库的一致性和可维护性。

## 1. TypeScript 规范

### 1.1 类型定义：`interface` vs `type`

- **`interface`**：用于组件 Props、对象结构、Context 类型等可扩展结构
- **`type`**：用于联合类型、工具类型、不可扩展的类型别名

```typescript
// ✅ interface — 组件 Props / 对象结构
export interface GlobalSnackbarProps {
  message: string;
  open: boolean;
  onClose: () => void;
  severity?: SnackbarSeverity;
}

// ✅ interface — 继承 HTML 属性
interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

// ✅ type — 联合类型
export type ThemeMode = 'light' | 'dark' | 'system';
export type PageType = 'dashboard' | 'timestamp' | 'storageCleaner' | ...;

// ✅ type — 工具类型
export type ResolvedThemeMode = 'light' | 'dark';
```

### 1.2 泛型使用

广泛使用泛型约束，结合 `extends` 进行类型守卫：

```typescript
// ✅ 泛型 + extends 约束
export interface SwitchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
}

// ✅ 泛型 + StorageSchema 键约束
async get<K extends keyof StorageSchema>(
  key: K,
  defaultValue?: StorageSchema[K],
): Promise<StorageSchema[K] | undefined> { ... }

// ✅ 泛型 Hook
export const useStorageState = <K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K],
  validator?: (val: unknown) => val is StorageSchema[K],
) => { ... }
```

### 1.3 类型守卫

优先使用类型守卫函数（`val is Type` 谓词），避免 `as` 强转：

```typescript
// ✅ 类型守卫谓词函数
const isValidMode = (v: unknown): v is ThemeMode => VALID_MODES.includes(v as ThemeMode);

const isValidPage = (page: unknown): page is PageType => {
  return typeof page === 'string' && (getAllFeatureKeys() as string[]).includes(page);
};

// ✅ 安全的 as 断言，仅在类型守卫验证后使用
export function isSupportedImageType(mimeType: string): boolean {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}
```

### 1.4 导出模式

| 场景        | 导出方式                                         | 示例                              |
| ----------- | ------------------------------------------------ | --------------------------------- |
| 页面组件    | `export default function ComponentName()`        | `pages/Timestamp/index.tsx`       |
| 业务组件    | `const X = React.memo(...)` + `export default X` | `LiveClock.tsx`, `ResultView.tsx` |
| UI 原子组件 | `React.forwardRef(...)` + `export { X }`         | `components/ui/button.tsx`        |
| 工具函数    | `export function xxx()`                          | `utils/clipboard.ts`              |
| 自定义 Hook | `export function useXxx()`                       | `utils/useStorageState.ts`        |
| 类型/接口   | `export interface` / `export type`               | `types/storage.d.ts`              |

```typescript
// ✅ 页面组件 — default export
export default function Index() { ... }

// ✅ 需要 memo 的组件 — 箭头函数 + React.memo + displayName
const LiveClock = React.memo(({ ... }: LiveClockProps) => { ... });
LiveClock.displayName = 'LiveClock';
export default LiveClock;

// ✅ UI 组件 — forwardRef + 命名导出
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);
Button.displayName = 'Button';
export { Button, buttonVariants };
```

---

## 2. React 组件规范

### 2.1 组件定义方式

- **标准组件**：使用 `function` 声明
- **需要 memo 的组件**：使用箭头函数 + `React.memo`
- **需要 ref 的组件**：使用 `React.forwardRef`
- **错误边界**：使用 Class 组件（React 要求）

```typescript
// ✅ 标准页面组件
export default function Index() { ... }

// ✅ 需要 memo 的组件
const LiveClock = React.memo(({ unit, onUseNow, className, ...props }: LiveClockProps) => {
  ...
});
LiveClock.displayName = 'LiveClock';
export default LiveClock;

// ✅ 需要 ref 的组件
const TextInputArea = forwardRef<HTMLTextAreaElement, TextInputAreaProps>((props, ref) => {
  ...
});
TextInputArea.displayName = 'TextInputArea';
export default TextInputArea;

// ✅ Class 组件（仅用于 ErrorBoundary）
export class ErrorBoundary extends Component<Props, State> { ... }
```

### 2.2 Props 模式

- 使用 `interface` 定义 Props
- 继承 `React.HTMLAttributes` 以支持原生属性透传
- 使用 `Omit` 排除冲突属性
- 解构 `className` 和 `...rest props`

```typescript
// ✅ 继承 HTML 属性 + className 透传
interface ResultViewProps extends React.HTMLAttributes<HTMLDivElement> {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  showEmptyPlaceholder?: boolean;
}

// 使用时解构 className 和 rest props
const ResultView = React.memo(({
  result, mode, unit, zone,
  showEmptyPlaceholder = false,
  className, ...props
}: ResultViewProps) => {
  return <div className={cn('flex flex-col w-full', className)} {...props}>...</div>;
});

// ✅ Omit 排除冲突属性
export interface TextInputAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'
> { ... }
```

### 2.3 状态管理

- **本地状态**：`useState` + 惰性初始化
- **衍生状态**：`useMemo` 响应式计算管线
- **持久化状态**：Chrome Storage + `localStorage` 快照
- **全局状态**：React Context

```typescript
// ✅ useState + 惰性初始化
const [input, setInput] = useState(() => String(Date.now()));

// ✅ useMemo 响应式计算管线（零延迟，无需手动 convert 按钮）
const conversionPipeline = useMemo(() => {
  const rawInput = input.trim();
  if (!rawInput) return { result: '', error: '' };
  // ... 自动计算结果
}, [input, mode, unit, zone, t]);

// ✅ Chrome Storage 持久化状态
export const useStorageState = <K extends keyof StorageSchema>(
  key: K, defaultValue: StorageSchema[K], validator?: ...
) => { ... }
```

### 2.4 副作用模式

- **取消标志**：防止异步竞态
- **ref 回调指针**：保持回调最新避免依赖膨胀
- **事件监听 cleanup**：始终在 cleanup 中移除监听器
- **定时器 cleanup**：始终在 cleanup 中清除定时器

```typescript
// ✅ 取消标志模式 — 防止异步竞态
useEffect(() => {
  let cancelled = false;
  storageUtil.get(THEME_MODE_KEY, 'system').then((saved) => {
    if (cancelled) return;
    if (isValidMode(saved)) { ... }
  });
  return () => { cancelled = true; };
}, [updateResolved]);

// ✅ ref 回调指针 — 保持回调最新避免依赖膨胀
const onUseNowRef = useRef(onUseNow);
useEffect(() => { onUseNowRef.current = onUseNow; }, [onUseNow]);

// ✅ setInterval + cleanup
useEffect(() => {
  const tickId = setInterval(tick, 200);
  return () => clearInterval(tickId);
}, [unit]);

// ✅ 事件监听 cleanup
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => { ... };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### 2.5 `memo` / `useCallback` / `useMemo` 使用

| 场景                               | 使用方式      |
| ---------------------------------- | ------------- |
| 高频渲染组件（列表子项、实时时钟） | `React.memo`  |
| 事件处理函数、回调引用             | `useCallback` |
| 响应式计算管线、衍生数据           | `useMemo`     |
| 避免重复创建对象/集合              | `useMemo`     |

```typescript
// ✅ React.memo — 高频更新组件
const LiveClock = React.memo(({ ... }) => { ... });
const ResultView = React.memo(({ ... }) => { ... });

// ✅ useCallback — 事件处理
const handleUseNow = useCallback((now: number) => {
  if (mode === 'ts2dt') {
    setInput(String(unit === 'ms' ? now : Math.floor(now / 1000)));
  } else {
    setInput(dayjs(now).tz(zone).format(DATE_FORMAT));
  }
}, [mode, unit, zone]);

// ✅ useMemo — 避免重复创建集合
const visibleSet = useMemo(() => new Set<string>(visiblePages), [visiblePages]);
```

---

## 3. 导入规范

### 3.1 导入顺序

按来源分组，顺序如下：

1. React 核心
2. 第三方库（图标、UI 库等）
3. 业务 Provider / Context
4. 配置 / 存储
5. i18n
6. 本地页面组件
7. UI 组件
8. 工具函数 / Hook
9. 类型
10. 常量

```typescript
// 1. React 核心
import React, { useEffect, useMemo, useRef, useState } from 'react';
// 2. 第三方库
import { ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { toast } from 'sonner';
// 3. 业务 Provider
import { useRouter } from '@/providers/RouterProvider';
import { useThemeMode } from '@/providers/ThemeModeProvider';
// 4. 配置 / 存储
import { FeatureConfig, FEATURES } from '@/config/features';
import { storageUtil } from '@/utils/chromeStorage';
// 5. i18n
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
// 6. 本地组件
import TextMode from './TextMode';
import { ZONES } from './constants';
// 7. UI 组件
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Button } from '@/components/ui/button';
// 8. 工具函数 / Hook
import { cn } from '@/lib/utils';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
// 9. 类型
import type { PageType, StorageSchema } from '@/types/storage';
```

### 3.2 路径别名

- `@/` 映射到项目根目录
- **跨目录导入**：使用 `@/` 绝对别名
- **同目录导入**：使用相对路径 `./`

```typescript
// ✅ 绝对别名导入 — 跨目录
import { cn } from '@/lib/utils';
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageSchema } from '@/types/storage';
import { Button } from '@/components/ui/button';

// ✅ 相对导入 — 仅限同目录
import TextMode from './TextMode';
import { ZONES } from './constants';
import { useTimestampConverter } from './useTimestampConverter';
```

---

## 4. 样式规范

### 4.1 `cn()` 工具函数

统一使用 `cn()` 合并 Tailwind 类名（来自 `clsx` + `tailwind-merge`），导入自 `@/lib/utils`：

```typescript
import { cn } from '@/lib/utils';

// ✅ 条件类名 + 合并外部 className
<div className={cn(
  'flex items-center gap-3 px-3 h-10 rounded-lg border border-border/80 bg-secondary/50',
  className,   // 外部传入的覆盖
)} {...props}>

// ✅ 错误状态变体
<Input className={cn(
  'font-mono font-semibold h-10 shadow-sm placeholder:text-muted-foreground/60',
  error && 'border-destructive focus-visible:ring-destructive',
)} />

// ✅ 选中/未选中状态
className={cn(
  'flex-1 inline-flex items-center justify-center font-medium whitespace-nowrap transition-all',
  sizeClasses[size],
  isSelected
    ? 'bg-background text-foreground shadow-sm font-semibold'
    : 'hover:bg-background/50 hover:text-foreground/80',
  buttonClassName,
)}
```

### 4.2 主题 / 暗色模式

使用 shadcn/ui 的 CSS 变量语义化类名，**禁止硬编码颜色值**：

```typescript
// ✅ 语义化颜色 token — 亮/暗模式自适应
<div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
<div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">

// ✅ 暗色模式特殊处理
'fixed ... bg-white dark:bg-gray-900 p-6 ...'

// ✅ 需要固定颜色的特殊场景（如二维码白色背景保护）
<div className="p-3 bg-white rounded-lg shadow-sm border border-border/40">
```

**常用语义化 token：**

| 用途 | 类名                                                               |
| ---- | ------------------------------------------------------------------ |
| 背景 | `bg-background`, `bg-card`, `bg-muted`, `bg-secondary`             |
| 文字 | `text-foreground`, `text-card-foreground`, `text-muted-foreground` |
| 边框 | `border-border`, `border-border/80`                                |
| 主色 | `text-primary`, `bg-primary`, `border-primary`                     |
| 危险 | `text-destructive`, `bg-destructive`, `border-destructive`         |

### 4.3 响应式设计

移动优先，使用 `sm:` / `md:` / `lg:` 断点：

```typescript
// ✅ Grid 自适应布局
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

// ✅ Dashboard 自动填充网格
<div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] auto-rows-auto gap-3.5 p-3.5 w-full h-auto">

// ✅ 弹性方向切换
<div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">

// ✅ 内边距响应式
<div className="p-4 sm:p-6 space-y-4">
```

---

## 5. 错误处理

### 5.1 工具函数：结果对象模式

工具函数**不抛异常**，返回包含 `hasError` 和 `error` 字段的结果对象：

```typescript
// ✅ 结果对象模式
export function markdownToHtml(markdown: string): MarkdownToHtmlResult {
  try {
    ...
    return { html, originalLength, htmlLength, hasError: false };
  } catch (error) {
    return {
      html: '', ...
      hasError: true,
      error: error instanceof Error ? error.message : 'Markdown 解析失败',
    };
  }
}
```

### 5.2 UI 层：try-catch + Toast

UI 层异步操作使用 try-catch，通过 `sonner` 的 `toast` 显示错误：

```typescript
import { toast } from 'sonner';

const handleCopy = useCallback(async () => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('复制成功');
  } catch {
    toast.error('复制失败');
  }
}, [value]);
```

### 5.3 Promise 异常隔离

对不关心返回值的异步操作，使用 `void` + `.catch()` 隔离异常：

```typescript
// ✅ void + .catch 模式
void storageUtil.set(THEME_MODE_KEY, next).catch((err) => {
  console.error('[Theme Storage Error] Failed to persistent theme state:', err);
});

// ✅ async 函数调用 + .catch
loadConfig().catch(console.error);
```

### 5.4 ErrorBoundary

在应用顶层使用 `ErrorBoundary` 组件捕获子组件树异常：

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <RouterContainer />
</ErrorBoundary>
```

---

## 6. 命名规范

### 6.1 文件命名

| 类型        | 命名模式                   | 示例                                                     |
| ----------- | -------------------------- | -------------------------------------------------------- |
| 页面目录    | PascalCase                 | `Timestamp/`, `Base64Converter/`, `StorageCleaner/`      |
| 页面入口    | `index.tsx`                | `pages/Timestamp/index.tsx`                              |
| 组件文件    | PascalCase `.tsx`          | `TopBar.tsx`, `LiveClock.tsx`, `ResultView.tsx`          |
| 自定义 Hook | camelCase `.ts`            | `useTimestampConverter.ts`, `useStorageCleaner.ts`       |
| 工具函数    | camelCase `.ts`            | `chromeStorage.ts`, `base64Converter.ts`, `clipboard.ts` |
| 测试文件    | 与源文件同名 `.test.ts(x)` | `jwt.test.ts`, `SwitchButtonGroup.test.tsx`              |
| 类型文件    | camelCase `.d.ts`          | `storage.d.ts`                                           |
| 常量文件    | camelCase `.ts`            | `constants.ts`                                           |

### 6.2 变量 / 函数命名

```typescript
// ✅ camelCase — 变量、函数、Hook
const conversionPipeline = useMemo(...);
const handleUseNow = useCallback(...);
export function useTimestampConverter(): UseTimestampConverterReturn { ... }
export function textToBase64(text: string): TextToBase64Result { ... }

// ✅ PascalCase — 组件、类型、接口
const LiveClock = React.memo(...);
export interface GlobalSnackbarProps { ... }
export type ThemeMode = 'light' | 'dark' | 'system';

// ✅ SCREAMING_SNAKE_CASE — 常量
const SEARCH_HISTORY_LIMIT = 10;
const THEME_MODE_KEY = 'app/themeMode' as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = [...] as const;

// ✅ 布尔值 — is/has/should 前缀
const isControlled = controlledValue !== undefined;
const isDashboard = currentPage === 'dashboard';
const hasError = true;
```

### 6.3 事件处理函数

使用 `handle` 前缀命名组件内事件处理函数：

```typescript
const handleUseNow = useCallback((now: number) => { ... }, []);
const handleSelectFeature = (feature: FeatureConfig) => { ... };
const handleFileChange = useCallback((file: File) => { ... }, []);
const handleClean = useCallback(async () => { ... }, []);
```

---

## 7. 测试规范

### 7.1 文件组织

测试文件放在源代码同级的 `__tests__/` 目录下：

```
utils/__tests__/jwt.test.ts
utils/__tests__/base64Converter.test.ts
utils/__tests__/useStorageState.test.ts
components/__tests__/SwitchButtonGroup.test.tsx
components/__tests__/ErrorBoundary.test.tsx
pages/Timestamp/__tests__/index.test.tsx
```

### 7.2 describe / it 命名

`describe` 使用模块/函数名，`it` 使用中文描述行为（"应该..."）：

```typescript
// ✅ 中文 describe + 中文 it
describe('textToBase64', () => {
  it('应该编码 ASCII 文本', () => { ... });
  it('应该编码中文文本', () => { ... });
  it('应该编码空字符串', () => { ... });
});

// ✅ 中文 describe + 中文 it（组件测试）
describe('SwitchButtonGroup 组件', () => {
  it('应渲染所有选项按钮', () => { ... });
  it('应高亮当前选中的按钮', () => { ... });
  it('点击未选中按钮时应触发 onChange 并传入选中值', () => { ... });
});
```

### 7.3 Mock 模式

- 使用 `vi.mock()` 进行模块级 Mock
- 使用 `vi.fn()` 进行函数级 Mock
- 使用 `vi.useFakeTimers()` 控制时间
- **避免重复 mock `vitest.setup.ts` 中已有的内容**（chrome API、i18n、matchMedia 等）

```typescript
// ✅ 模块级 Mock
vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

// ✅ 函数级 Mock + 断言
const handleChange = vi.fn();
render(<SwitchButtonGroup value="a" options={options} onChange={handleChange} />);
fireEvent.click(screen.getByRole('button', { name: /选项B/i }));
expect(handleChange).toHaveBeenCalledTimes(1);
expect(handleChange).toHaveBeenCalledWith('b');

// ✅ 定时器 Mock
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
```

### 7.4 断言模式

使用 Testing Library 的 DOM 查询 + Vitest 匹配器：

```typescript
// ✅ 语义化查询
expect(screen.getByRole('button', { name: /选项A/i })).toBeInTheDocument();
expect(screen.getByTestId('normal-content')).toHaveTextContent('正常内容');
expect(screen.queryByText('糟糕，出了点问题')).not.toBeInTheDocument();

// ✅ CSS 类断言
expect(button).toHaveClass('bg-background', 'text-foreground', 'shadow-sm');

// ✅ 异步断言
await waitFor(() => {
  expect(result.current[0]).toBe(false);
  expect(result.current[2]).toBe(true);
});

// ✅ renderHook 测试自定义 Hook
const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));
expect(result.current[0]).toBe(true);
```

---

## 8. 自定义 Hook 规范

### 8.1 命名和结构

- 使用 `use` 前缀命名
- 定义返回值接口类型
- 添加 JSDoc 注释

```typescript
// ✅ 完整的 Hook 结构
/**
 * 自定义 Hook：处理右键菜单传递的数据
 *
 * @param options - 配置选项
 * @example
 * useContextMenuData({ featureKey: 'jwt', onData: handlePayload });
 */
export function useContextMenuData({ featureKey, onData }: UseContextMenuDataOptions): void {
  const checkAndConsumeData = useCallback(async () => { ... }, [featureKey, onData]);
  useEffect(() => { checkAndConsumeData(); }, [checkAndConsumeData]);
}

// ✅ 返回值接口定义
export interface UseTimestampConverterReturn {
  mode: 'ts2dt' | 'dt2ts';
  input: string;
  result: string;
  error: string;
  setMode: (mode: 'ts2dt' | 'dt2ts') => void;
  setInput: (value: string) => void;
  handleUseNow: (now: number) => void;
}

export function useTimestampConverter(): UseTimestampConverterReturn { ... }
```

### 8.2 Hook 存放位置

- **全局通用 Hook**：放在 `utils/` 目录下
- **页面专属 Hook**：与页面组件同目录

```
utils/useStorageState.ts          — Chrome Storage 状态持久化
utils/useLazyTranslation.ts       — i18n 懒加载
utils/useContextMenuData.ts       — 右键菜单数据
utils/useDebounce.ts              — 防抖
pages/Timestamp/useTimestampConverter.ts    — 页面级 Hook
pages/StorageCleaner/useStorageCleaner.ts  — 页面级 Hook
```

---

## 9. 国际化规范

### 9.1 翻译键格式

- 命名空间：`common`（默认）、`features`
- 翻译键格式：`namespace:key`（如 `features:timestamp.title`）
- 语言：`zh`（默认）、`en`

### 9.2 翻译文件结构

```
i18n/locales/{zh,en}/common.json           — 全局通用翻译
i18n/locales/{zh,en}/features.json         — 功能模块标题和描述
i18n/locales/{zh,en}/{功能名}.json         — 各功能独立翻译
```

### 9.3 使用方式

```typescript
// ✅ 页面组件 — 使用 useLazyTranslation
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { t } = useLazyTranslation('timestamp');
  return <h1>{t('timestamp:title')}</h1>;
}

// ✅ 全局组件 — 使用 useTranslation
import { useTranslation } from 'react-i18next';

export function TopBar() {
  const { t } = useTranslation(['common', 'features']);
  return <span>{t('common:settings')}</span>;
}
```

### 9.4 添加新翻译

1. 在 `i18n/locales/{zh,en}/features.json` 添加功能标题和描述
2. 创建 `i18n/locales/{zh,en}/{功能名}.json` 添加功能专属翻译
3. 在 `utils/useLazyTranslation.ts` 的 `localeModules` 中注册新命名空间

---

## 10. 存储规范

### 10.1 StorageSchema

所有 Chrome Storage 键必须在 `types/storage.d.ts` 的 `StorageSchema` 中声明：

```typescript
export interface StorageSchema {
  'app/currentRoute': PageType;
  'app/popupRoute': PageType;
  'app/theme': string;
  'app/themeMode': 'light' | 'dark' | 'system';
  'storageCleaner/preferences': StorageCleanerPreferences;
  // ...
}
```

### 10.2 存储操作

使用 `utils/chromeStorage.ts` 的类型安全封装：

```typescript
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageSchema } from '@/types/storage';

// ✅ 读取
const theme = await storageUtil.get('app/theme', 'default');

// ✅ 写入
await storageUtil.set('app/theme', 'dark');

// ✅ 删除
await storageUtil.remove('app/theme');
```

### 10.3 持久化状态 Hook

使用 `useStorageState` 自动同步 Chrome Storage：

```typescript
import { useStorageState } from '@/utils/useStorageState';

const [themeMode, setThemeMode, isInitialized] = useStorageState(
  'app/themeMode',
  'system',
  isValidMode, // 可选的类型守卫
);
```

---

## 11. 文件组织

### 11.1 页面组件结构

```
pages/FeatureName/
├── index.tsx              # 页面 UI（纯展示，使用 shadcn/ui 组件）
├── useFeatureName.ts      # 业务逻辑 Hook（状态管理 + 转换逻辑）
├── constants.ts           # 常量定义（可选）
├── LiveClock.tsx          # 子组件（可选）
├── ResultView.tsx         # 子组件（可选）
└── __tests__/             # 测试文件
    └── index.test.tsx
```

### 11.2 目录职责

| 目录             | 职责                                                         |
| ---------------- | ------------------------------------------------------------ |
| `config/`        | 应用配置（功能定义、路由映射）                               |
| `entrypoints/`   | 扩展入口点（popup、options、sidepanel、background、content） |
| `pages/`         | 功能页面组件（懒加载）                                       |
| `components/`    | 可复用 UI 组件                                               |
| `components/ui/` | shadcn/ui 基础组件（button、dialog、select 等）              |
| `providers/`     | React Context（Router、Theme 等）                            |
| `hooks/`         | 自定义 React Hooks                                           |
| `utils/`         | 工具函数与服务抽象                                           |
| `types/`         | TypeScript 类型声明                                          |
| `lib/`           | 通用工具函数（cn、utils）                                    |
| `i18n/`          | 国际化资源                                                   |
| `public/`        | 静态资源                                                     |

---

## 12. 代码风格

### 12.1 Prettier 配置

- 行宽：100 字符
- 引号：单引号
- 尾逗号：all
- 换行符：LF
- 分号：是

### 12.2 ESLint 规则

- 禁止使用 `any`（测试文件除外）
- 未使用变量/参数：使用 `_` 前缀（如 `_unused`）
- React 19 JSX Runtime：无需手动导入 React
- 使用 `typescript-eslint` 的 `projectService: true`

### 12.3 注释规范

- **文件级注释**：使用 JSDoc `@module` 格式（如 `GlobalSnackbar.tsx`）
- **函数注释**：使用 JSDoc，包含 `@param`、`@returns`、`@example`
- **行内注释**：仅在需要澄清复杂逻辑时使用
- **禁止注释显而易见的代码**
