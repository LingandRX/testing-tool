# AGENTS.md

WXT 浏览器扩展项目 (React 19 + TypeScript)。提供时间戳转换、存储清理、JWT 解析、JSON 工具、二维码、Base64、Markdown 等测试效率工具。

## 核心命令

```bash
npm run dev              # Chrome 开发模式 (HMR)
npm run dev:firefox      # Firefox 开发模式
npm run build            # Chrome 生产构建
npm run build:firefox    # Firefox 生产构建
npm run zip              # 打包 Chrome 扩展 (.output/*.zip)
npm run zip:firefox      # 打包 Firefox 扩展
npm run lint             # ESLint (--max-warnings=0)
npm run typecheck        # tsc --noEmit
npm run test             # vitest run (单次执行)
npm run test:watch       # vitest 监视模式
npm run test:coverage    # 带覆盖率的测试
```

运行单个测试: `npx vitest run path/to/file.test.ts`

## 验证流程

CI 步骤（严格顺序，任一步骤失败则停止并标记 CI 失败）：

1. `setup`（安装依赖、`wxt prepare`）
2. 并行运行 `lint`、`typecheck`、`test`（三者全部通过才继续）
3. `build`（仅当步骤 2 全部成功时执行）

Pre-commit hook（`.husky/pre-commit` 调用 `lint-staged`，任一步骤返回非零则终止提交）：

1. 代码文件 (`*.{ts,tsx,js,jsx,mjs}`)：运行 `eslint --fix --max-warnings=0 --no-warn-ignored`；若失败则终止并报告错误
2. 同一代码文件：运行 `prettier --write`
3. 其他文件 (`*.{json,css,scss,md}`)：运行 `prettier --write`

## WXT 生成文件

- `.wxt/` 目录由 `postinstall` 自动执行 `wxt prepare` 生成，包含 TypeScript 类型声明和扩展的 tsconfig。
- 生产构建输出到 `.output/` 目录。
- `tsconfig.json` 继承自 `./.wxt/tsconfig.json`。

## 项目结构

```
src/                   # 源代码根目录
  config/features.tsx    # 功能定义（路由 + 元数据的单一事实来源）
  entrypoints/           # 扩展入口点 (popup/, sidepanel/, background.ts, content.ts)
  pages/                 # 功能页面组件 (懒加载)
  components/            # 可复用 UI 组件
  components/ui/         # shadcn/ui 基础组件 (button, dialog, select 等)
  providers/             # React Context (Router, Theme 等)
  hooks/                 # 自定义 React Hooks
  utils/                 # 工具函数与服务抽象
  types/                 # TypeScript 类型声明
  lib/                   # 通用工具函数（cn、utils）
public/                # 静态资源（图标、_locales 等）
```

### 页面组件模式

典型功能页面遵循 **UI + Hook 分离** 模式：

```
src/pages/FeatureName/
├── index.tsx              # 页面 UI（纯展示，使用 shadcn/ui 组件）
├── useFeatureName.ts      # 业务逻辑 Hook（状态管理 + 转换逻辑）
└── constants.ts           # 常量定义
```

- 页面组件调用 `useLazyTranslation('featureName')` 获取翻译函数
- Hook 负责所有状态管理和业务逻辑，通过返回值暴露给页面
- 子组件可进一步拆分（如 `LiveClock.tsx`、`ResultView.tsx`）

## 关键架构决策

**路由**: 不使用 React Router。通过 `src/config/features.tsx` 的 `FEATURES` 数组管理，`RouterProvider` 根据 `PageType`
渲染对应组件。支持三种渲染模式：popup（弹窗）、sidepanel（侧边栏）和 browser-tab（浏览器新标签页，通过 `open_in_tab` 打开）。
每种模式有独立的路由和可见页面配置（`app/popupRoute`、`app/sidepanelRoute`、`app/tabRoute` 等）。

**存储**: 所有 Chrome Storage 键必须在 `src/types/storage.d.ts` 的 `StorageSchema` 中定义，键名使用 kebab-case 格式（如 `app/currentRoute`）。
使用 `src/utils/chromeStorage.ts` 及其 Hook。Router 同时使用 `chrome.storage.local` 和 `localStorage` 做快照以消除首屏闪烁。
修改 StorageSchema 时，必须在 `src/utils/chromeStorage.ts` 添加版本迁移函数，并在测试中覆盖迁移场景。

**通信**: 使用 `@webext-core/messaging`，协议定义在 `src/utils/messages.ts`。

**路径别名**: `@/` 映射到项目根目录 (已在 tsconfig 和 vitest.config 中配置)。

**浏览器兼容**: 优先使用 `wxt/browser` 导出的 `browser` 对象，而非原生 `chrome` API。

**代码分割**: `wxt.config.ts` 通过 `manualChunksForHtmlOnly()` 自动分组依赖（vendor-react、vendor-i18n、vendor-qr 等），无需手动配置。

## 测试环境

- 环境: jsdom
- 全局变量: `vitest/globals` (describe, it, expect 等无需导入)
- Setup 文件: `vitest.setup.ts` 自动 mock:
  - `chrome.*` / `browser.*` API (storage, tabs, runtime, cookies 等)
  - `react-i18next` (返回 key 作为翻译)
  - `@/utils/useLazyTranslation` (返回 `ns:key` 格式翻译)
  - `window.matchMedia`
- 测试文件命名: `__tests__/*.test.{ts,tsx}` 或 `*.test.{ts,tsx}`
- Mock 模式: 使用 `vi.mock()` 进行模块级 mock，避免在测试文件中重复 mock 代码
- 测试工具: `@testing-library/react` + `@testing-library/user-event` 进行组件测试

## i18n

- 命名空间: `common` (默认), `features`
- 翻译键格式: `namespace:key` (如 `features:timestamp.title`)
- 语言: `zh` (默认), `en`
- 翻译文件结构:
  - `i18n/locales/{zh,en}/common.json` - 全局通用翻译
  - `i18n/locales/{zh,en}/features.json` - 功能模块标题和描述
  - `i18n/locales/{zh,en}/{功能名}.json` - 各功能独立翻译（如 timestamp.json, storageCleaner.json 等）
- 添加新翻译: 编辑 `i18n/locales/{zh,en}/{common,features}.json` 及对应功能独立 JSON
- 使用 `useLazyTranslation` hook 加载功能独立翻译，返回 `ns:key` 格式
- 回退策略: 当翻译 key 在目标语言缺失时，回退到默认语言 `zh`；若默认语言也缺失，返回占位格式 `namespace:key` 并在开发模式下记录 warning

## 新功能开发清单

1. 在 `src/types/storage.d.ts` 添加 `PageType` 联合类型
2. 在 `src/config/features.tsx` 的 `FEATURES` 数组添加配置（指定 key、翻译键、图标、三种渲染模式的组件）
3. 在 `src/pages/` 创建页面组件 (懒加载)：
   - `index.tsx` — UI 组件，使用 `useLazyTranslation` 获取翻译
   - `useFeatureName.ts` — 业务逻辑 Hook
   - `constants.ts` — 常量（可选）
4. 在 `i18n/locales/{zh,en}/features.json` 添加翻译（复杂功能可新建独立 JSON）
5. 如需新权限，更新 `wxt.config.ts` 的 `manifest.permissions`
6. 添加对应的单元测试

## 代码规范

- 禁止使用 `any` (测试文件除外)
- 未使用变量/参数: 使用 `_` 前缀 (如 `_unused`)
- 样式: 使用 Tailwind CSS + shadcn/ui (通过 `className` 和 `cn()` 工具)
- UI 组件: 优先使用 `src/components/ui/` 下的 shadcn/ui 组件 (button, dialog, select 等)
- 图标: 使用 `lucide-react` 图标库
- 格式: Prettier (`.prettierrc`: 100 字符宽, 单引号, 尾逗号 all, LF 换行)
- ESLint 使用 `typescript-eslint` 的 `projectService: true`（无需手动维护 project 路径）

## 关键外部库（非显而易见的）

- `@webext-core/messaging` — 扩展消息通信
- `@dnd-kit` — 拖拽排序（用于页面顺序管理）
- `qrious` + `qr-scanner` — 二维码生成与解析
- `dayjs` — 日期处理（时间戳转换）
- `sonner` — Toast 通知（替代传统 snackbar）
