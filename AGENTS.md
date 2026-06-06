# AGENTS.md

WXT 浏览器扩展项目 (React 19 + TypeScript)。提供时间戳转换、存储清理、JWT 解析、JSON 工具、二维码、Base64、Markdown、测试数据生成器等测试效率工具。

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
  workers/               # Web Worker（数据生成等耗时任务）
public/                # 静态资源（图标、_locales 等）
```

### 页面组件模式

典型功能页面遵循 **UI + Hook 分离** 模式。详见 [CODING_STANDARDS.md § 11](./.github/CODING_STANDARDS.md#11-页面开发规范)。

```
src/pages/FeatureName/
├── index.tsx              # 页面 UI（纯展示，仅负责渲染布局）
├── useFeatureName.ts      # 业务逻辑 Hook（状态管理 + 转换逻辑）
├── constants.ts           # 常量定义（可选，≥3 个常量时创建）
└── __tests__/
    └── index.test.tsx
```

- 页面入口组件统一命名为 `Index`，通过 `export default function Index()` 导出
- Hook 负责所有状态管理和业务逻辑，通过返回值暴露给页面
- 子组件可以独立调用 `useI18n` 等全局 Hook
- 当 `index.tsx` 超过 150 行时，必须拆分为 UI + Hook 模式
- 复杂页面可增加 `contexts/`、`hooks/`、`components/` 子目录

### 测试数据生成器模块

```
src/pages/TestDataGenerator/
├── index.tsx                    # 主页面（字段配置 + 标签页切换）
├── hooks/useGenerator.ts        # Web Worker 管理 Hook（创建、复用、通信、销毁）
└── components/
    ├── FieldList.tsx            # 字段列表（虚拟滚动 + @dnd-kit 拖拽排序 + 规则保存）
    ├── FieldItem.tsx            # 字段卡片展示
    ├── FieldEditor.tsx          # 字段编辑器（名称校验、生成器选择、参数配置）
    ├── GeneratorSelector.tsx    # 生成器选择器（分类 + 搜索）
    ├── GeneratorConfig.tsx      # 生成器参数表单（动态渲染 string/number/boolean/select/array）
    ├── GenerateOptions.tsx      # 生成选项（数量、格式）
    ├── GenerateButton.tsx       # 生成按钮 + 进度条
    ├── DataPreview.tsx          # 示例数据预览（JSON 语法高亮）
    ├── ResultPanel.tsx          # 生成结果状态面板
    ├── ExportPanel.tsx          # 导出面板（复制/下载 JSON/CSV）
    └── RuleManager.tsx          # 规则管理（CRUD、搜索、导入/导出）

src/utils/
├── ruleStorage.ts               # 规则持久化存储（localStorage）
├── dataExporter.ts              # 数据导出工具（JSON/CSV 转换、下载、剪贴板）
└── generators/                  # 内置生成器定义（个人信息、企业、技术、基础类型）

src/workers/
└── generator.worker.ts          # 数据生成 Web Worker

src/types/
└── testDataGenerator.ts         # 类型定义（FieldConfig, DataRule, GeneratorDefinition 等）
```

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

**代码分割**: `wxt.config.ts` 通过 `manualChunksForHtmlOnly()` 自动分组依赖（vendor-react、vendor-qr、vendor-dnd 等），无需手动配置。

## 测试环境

- 环境: jsdom
- 全局变量: `vitest/globals` (describe, it, expect 等无需导入)
- Setup 文件: `vitest.setup.ts` 自动 mock:
  - `chrome.*` / `browser.*` API (storage, tabs, runtime, cookies 等)
  - `@/utils/chromeI18n` (从 `public/_locales/zh/messages.json` 加载真实翻译)
  - `window.matchMedia`
- 测试文件命名: `__tests__/*.test.{ts,tsx}` 或 `*.test.{ts,tsx}`
- Mock 模式: 使用 `vi.mock()` 进行模块级 mock，避免在测试文件中重复 mock 代码
- 测试工具: `@testing-library/react` + `@testing-library/user-event` 进行组件测试

## i18n (chrome.i18n)

项目使用 Chrome 扩展标准的 `chrome.i18n` API 进行本地化，通过 `src/utils/chromeI18n.ts` 提供类型安全的 React Hook 包装。

- **翻译文件**: `public/_locales/{zh,en}/messages.json`（Chrome 扩展标准格式）
- **默认语言**: `zh`（在 `wxt.config.ts` 的 `manifest.default_locale` 中配置）
- **使用方式**: `import { useI18n } from '@/utils/chromeI18n'`
- **翻译键格式**:
  - 直接 key: `t('dashboard_title')` → 查找 `dashboard_title`
  - 命名空间格式（兼容旧用法）: `t('common:buttons.search')` → 查找 `common_buttons_search`
  - 带命名空间参数: `useI18n(['common', 'features'])`，会自动尝试 `common_key`、`features_key`
- **占位符支持**: `t('router_notFoundDescription', { entryPointType: 'popup' })`
- **Hook 返回值**: `{ t, i18n: { language, changeLanguage }, isLoaded }`
- **回退策略**: 当翻译 key 未命中时，返回 key 本身（开发模式下在控制台记录 warning）
- **限制**: `chrome.i18n` 无法动态切换语言，语言跟随浏览器设置，切换后需刷新页面

## 新功能开发清单

1. 在 `src/types/storage.d.ts` 添加 `PageType` 联合类型
2. 在 `src/config/features.tsx` 的 `FEATURES` 数组添加配置（指定 key、翻译键、图标、三种渲染模式的组件）
3. 在 `src/pages/` 创建页面组件 (懒加载)：
   - `index.tsx` — UI 组件，使用 `useI18n` 获取翻译
   - `useFeatureName.ts` — 业务逻辑 Hook
   - `constants.ts` — 常量（可选）
4. 在 `public/_locales/zh/messages.json`（及 `en/messages.json`）添加翻译
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
- **Git Commit**: 必须使用中文描述，遵循 Conventional Commits 规范（如 `fix(组件名): 描述`、`feat(功能名): 描述`）

## 关键外部库（非显而易见的）

- `@webext-core/messaging` — 扩展消息通信
- `@dnd-kit` — 拖拽排序（用于页面顺序管理和字段列表排序）
- `qrious` + `qr-scanner` — 二维码生成与解析
- `dayjs` — 日期处理（时间戳转换）
- `sonner` — Toast 通知（替代传统 snackbar）
- Web Worker — 批量数据生成（`src/workers/generator.worker.ts`），避免阻塞 UI 线程
