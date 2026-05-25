# AGENTS.md

WXT 浏览器扩展项目 (React 19 + TypeScript)。

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

CI 执行顺序: `setup → lint/typecheck/test(并行) → build` (build 依赖前三者)。

Pre-commit hook (`.husky/pre-commit` 调用 `lint-staged`):

- 代码文件 (`*.{ts,tsx,js,jsx,mjs}`): `eslint --fix --max-warnings=0 --no-warn-ignored` → `prettier --write`
- 其他文件 (`*.{json,css,scss,md}`): `prettier --write`

提交前确保 `lint` 和 `typecheck` 通过。

## WXT 生成文件

- `.wxt/` 目录由 `postinstall` 自动执行 `wxt prepare` 生成，包含 TypeScript 类型声明和扩展的 tsconfig。
- 生产构建输出到 `.output/` 目录。
- `tsconfig.json` 继承自 `./.wxt/tsconfig.json`。

## 项目结构

```
config/features.tsx    # 功能定义（路由 + 元数据的单一事实来源）
entrypoints/           # 扩展入口点 (popup/, options/, sidepanel/, background.ts, content.ts)
pages/                 # 功能页面组件 (懒加载)
components/            # 可复用 UI 组件
providers/             # React Context (Router, Theme 等)
hooks/                 # 自定义 React Hooks
utils/                 # 工具函数与服务抽象
types/                 # TypeScript 类型声明
i18n/locales/{zh,en}/  # 国际化资源 (common.json, features.json 及各功能独立 JSON)
```

## 关键架构决策

**路由**: 不使用 React Router。通过 `config/features.tsx` 的 `FEATURES` 数组管理，`RouterProvider` 根据 `PageType`
渲染对应组件。支持三种渲染模式: popup / sidepanel / tab。每种模式有独立的路由和可见页面配置。

**存储**: 所有 Chrome Storage 键必须在 `types/storage.d.ts` 的 `StorageSchema` 中定义。使用 `utils/chromeStorage.ts` 及其
Hook。Router 同时使用 `chrome.storage.local` 和 `localStorage` 做快照以消除首屏闪烁。

**通信**: 使用 `@webext-core/messaging`，协议定义在 `utils/messages.ts`。

**路径别名**: `@/` 映射到项目根目录 (已在 tsconfig 和 vitest.config 中配置)。

**浏览器兼容**: 优先使用 `wxt/browser` 导出的 `browser` 对象，而非原生 `chrome` API。

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

## 新功能开发清单

1. 在 `types/storage.d.ts` 添加 `PageType` 联合类型
2. 在 `config/features.tsx` 的 `FEATURES` 数组添加配置
3. 在 `pages/` 创建页面组件 (懒加载)
4. 在 `i18n/locales/{zh,en}/features.json` 添加翻译（复杂功能可新建独立 JSON）
5. 如需新权限，更新 `wxt.config.ts` 的 `manifest.permissions`
6. 添加对应的单元测试

## 代码规范

- 禁止使用 `any` (测试文件除外)
- 未使用变量/参数: 使用 `_` 前缀 (如 `_unused`)
- 样式: 使用 Tailwind CSS + shadcn/ui (通过 `className` 和 `cn()` 工具)
- UI 组件: 优先使用 `components/ui/` 下的 shadcn/ui 组件 (button, dialog, select 等)
- 图标: 使用 `lucide-react` 图标库
- 格式: Prettier (`.prettierrc`: 100 字符宽, 单引号, 尾逗号 all, LF 换行)
- ESLint 使用 `typescript-eslint` 的 `projectService: true`（无需手动维护 project 路径）

## 技术栈版本

- WXT: ^0.20.26
- React: ^19.2.6
- Tailwind CSS: ^3.4.19
- shadcn/ui (基于 Radix UI + class-variance-authority)
- TypeScript: ^5.9.3
- Vitest: ^4.1.7
- i18next: ^26.2.0
- @dnd-kit (拖拽排序)
- marked (Markdown 解析)
- qrious + qr-scanner (二维码生成与解析)
