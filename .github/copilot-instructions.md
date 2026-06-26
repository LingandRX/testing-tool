# Copilot 指令

基于 WXT 框架的浏览器扩展项目（React 19 + TypeScript），为开发者和测试人员提供效率工具：时间戳转换、存储清理、JWT 解析、JSON 工具、二维码、Base64、测试数据生成器等。

## 核心命令

```bash
npm run dev              # Chrome 开发模式（支持 HMR）
npm run dev:firefox      # Firefox 开发模式
npm run build            # Chrome 生产构建
npm run build:firefox    # Firefox 生产构建
npm run zip              # 打包 Chrome 扩展（.output/*.zip）
npm run zip:firefox      # 打包 Firefox 扩展
npm run lint             # ESLint 检查（--max-warnings=0）
npm run typecheck        # TypeScript 类型检查（tsc --noEmit）
npm run test             # 运行全部单元测试（vitest run）
npm run test:watch       # Vitest 监视模式
npm run test:coverage    # 带覆盖率的测试
```

运行单个测试文件：`npx vitest run path/to/file.test.ts`

修改 `package.json` 后需运行 `npm install`（会自动触发 `postinstall` → `wxt prepare` 重新生成 `.wxt/` 类型声明）。

## CI 流水线（GitHub Actions）

严格顺序门控，任一步骤失败则终止：

1. **setup** — 安装依赖，缓存 `node_modules`
2. **lint**、**typecheck**、**test** — 三者并行运行，全部通过才继续
3. **build** — Chrome + Firefox 矩阵构建（仅当步骤 2 全部通过时执行）

Pre-commit 钩子（`.husky/pre-commit` → `lint-staged`）：

1. 代码文件（`*.{ts,tsx,js,jsx,mjs}`）：运行 `eslint --fix --max-warnings=0`
2. 同一代码文件：运行 `prettier --write`
3. 其他文件（`*.{json,css,scss,md}`）：运行 `prettier --write`

## 项目架构

### 路由（不使用 React Router）

路由完全通过 `config/features.tsx` 中的 `FEATURES` 数组管理。每个功能定义一个 `key`（类型为 `types/storage.d.ts` 中的 `PageType`）和三个懒加载组件，分别对应 `popup`、`sidepanel`、`tab` 三种渲染模式。`providers/RouterProvider.tsx` 中的 `RouterProvider` 根据存储状态渲染当前页面。

存在三套独立的路由作用域：`app/popupRoute`、`app/sidepanelRoute`、`app/tabRoute`，各自维护独立的可见页面列表和页面排序。

### 存储

所有 Chrome Storage 键必须在 `types/storage.d.ts` 的 `StorageSchema` 中声明，键名使用 kebab-case 格式（如 `app/currentRoute`）。使用 `utils/chromeStorage.ts` 中的类型安全封装（`storageUtil.get/set/remove`）。

Router 同时使用 `chrome.storage.local` 持久化和 `localStorage` 快照来消除首屏闪烁。

### 扩展通信

使用 `@webext-core/messaging`。通信协议在 `utils/messages.ts` 中通过 `ProtocolMap` 定义。使用该模块导出的 `sendMessage` / `onMessage`，不要直接使用原生 `chrome.runtime.sendMessage`。

### 页面组件模式

功能页面遵循 **UI + Hook 分离** 模式，详见 [CODING_STANDARDS.md § 11](./CODING_STANDARDS.md#11-页面开发规范)：

```
pages/FeatureName/
├── index.tsx              # UI 组件（纯展示，使用 shadcn/ui 组件）
├── useFeatureName.ts      # 业务逻辑 Hook（状态管理 + 转换逻辑）
└── constants.ts           # 常量定义（可选）
```

- 页面组件调用 `useI18n('featureName')` 获取翻译函数
- Hook 负责所有状态管理，通过返回值暴露给页面
- 子组件可进一步拆分（如 `LiveClock.tsx`、`ResultView.tsx`）

### 新功能开发清单

1. 在 `types/storage.d.ts` 的 `PageType` 联合类型中添加新成员
2. 在 `config/features.tsx` 的 `FEATURES` 数组中添加配置（key、翻译键、图标、三种渲染模式组件）
3. 在 `pages/` 目录创建页面组件（懒加载）：
   - `index.tsx` — 使用 `useI18n` 的 UI 组件
   - `useFeatureName.ts` — 业务逻辑 Hook
   - `constants.ts` — 常量（可选）
4. 在 `public/_locales/zh_CN/messages.json` 添加 Chrome i18n 翻译
5. 如需新权限，更新 `wxt.config.ts` 的 `manifest.permissions`
6. 添加对应的单元测试

## 关键规范

> 完整的代码编写规范详见 [CODING_STANDARDS.md](./CODING_STANDARDS.md)。

### 浏览器 API

始终使用 `wxt/browser` 导出的 `browser` 对象，而非原生 `chrome` API，以确保跨浏览器兼容性。

### 路径别名

`@/` 映射到项目根目录（已在 tsconfig 和 vitest.config 中配置）。跨目录导入使用 `@/` 绝对别名，同目录导入使用 `./` 相对路径。

### UI 组件

- 使用 `components/ui/` 下的 shadcn/ui 组件（button、dialog、select、input 等）
- 图标：`lucide-react`
- 样式：Tailwind CSS + `@/lib/utils` 中的 `cn()` 工具函数（clsx + tailwind-merge）
- 主题：使用 shadcn/ui 语义化 token（`bg-background`、`text-foreground`、`border-border` 等），禁止硬编码颜色

### 代码分割

`wxt.config.ts` 通过 `manualChunksForHtmlOnly()` 自动分组 vendor 依赖（vendor-react、vendor-qr、vendor-dnd），无需手动配置。

### 代码风格

- 禁止使用 `any`（测试文件除外）
- 未使用的变量/参数：使用 `_` 前缀（如 `_unused`）
- Prettier：100 字符宽、单引号、尾逗号 all、LF 换行
- ESLint 使用 `typescript-eslint` 的 `projectService: true`
- 导出模式：页面组件 default export，工具函数/Hook 命名导出，UI 组件 forwardRef + 命名导出

### 测试

- 环境：jsdom
- 全局变量：`vitest/globals`（describe、it、expect 等无需导入）
- Setup 文件：`vitest.setup.ts` 自动 mock 以下内容：
  - `chrome.*` / `browser.*` API（storage、tabs、runtime、cookies 等）
  - `@/utils/chromeI18n`（从 `public/_locales/zh_CN/messages.json` 加载真实翻译）
  - `window.matchMedia`
- 测试文件命名：`__tests__/*.test.{ts,tsx}` 或 `*.test.{ts,tsx}`
- 使用 `vi.mock()` 进行模块级 mock；避免重复 mock `vitest.setup.ts` 中已有的内容
- 测试工具：`@testing-library/react` + `@testing-library/user-event`

### 国际化（i18n）

- 使用 Chrome 扩展标准 `chrome.i18n`
- 默认语言目录：`public/_locales/zh_CN/messages.json`
- 使用方式：`import { useI18n } from '@/utils/chromeI18n'`
- 翻译键格式：直接 key（如 `timestamp_title`）；兼容 `namespace:key.path` 并转换为下划线
- 回退策略：缺失翻译返回 key 本身，并在开发模式下记录 warning
- 限制：`chrome.i18n` 跟随浏览器语言，不能在运行时动态切换语言

### WXT 生成文件

- `.wxt/` 目录由 `postinstall`（`wxt prepare`）自动生成，包含 TypeScript 类型声明和扩展 tsconfig
- 生产构建输出到 `.output/` 目录
- `tsconfig.json` 继承自 `./.wxt/tsconfig.json`
