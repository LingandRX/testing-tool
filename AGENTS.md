# AGENTS.md

WXT 浏览器扩展项目 (React 19 + TypeScript + MUI v7)。

## 核心命令

```bash
npm run dev              # Chrome 开发模式 (HMR)
npm run dev:firefox      # Firefox 开发模式
npm run build            # Chrome 生产构建
npm run build:firefox    # Firefox 生产构建
npm run lint             # ESLint (--max-warnings=0)
npm run typecheck        # tsc --noEmit
npm run test             # vitest run (单次执行)
npm run test:watch       # vitest 监视模式
npm run test:coverage    # 带覆盖率的测试
```

运行单个测试: `npx vitest run path/to/file.test.ts`

## 验证流程

CI 执行顺序: `lint → typecheck → test → build` (build 依赖前三者)。

Pre-commit hook (lint-staged) 顺序:

1. `prettier --write`
2. `eslint --fix --max-warnings=0`
3. `tsc --noEmit`

提交前确保三者通过。

## 项目结构

```
config/features.tsx    # 功能定义（路由 + 元数据的单一事实来源）
config/pageTheme.ts    # 页面级主题常量
config/theme.ts        # MUI 全局主题
entrypoints/           # 扩展入口点 (popup/, options/, sidepanel/, background.ts, content.ts)
pages/                 # 功能页面组件 (懒加载)
components/            # 可复用 UI 组件
providers/             # React Context (Router, Theme 等)
utils/                 # 工具函数与服务抽象
types/                 # TypeScript 类型声明
i18n/locales/{zh,en}/  # 国际化资源 (common.json, features.json)
```

## 关键架构决策

**路由**: 不使用 React Router。通过 `config/features.tsx` 的 `FEATURES` 数组管理，`RouterProvider` 根据 `PageType` 渲染对应组件。

**存储**: 所有 Chrome Storage 键必须在 `types/storage.d.ts` 的 `StorageSchema` 中定义。使用 `utils/chromeStorage.ts` 及其 Hook。

**通信**: 使用 `@webext-core/messaging`，协议定义在 `utils/messages.ts`。

**路径别名**: `@/` 映射到项目根目录 (已在 tsconfig 和 vitest.config 中配置)。

## 测试环境

- 环境: jsdom
- 全局变量: `vitest/globals` (describe, it, expect 等无需导入)
- Setup 文件: `vitest.setup.ts` 自动 mock:
  - `chrome.*` API (storage, tabs, runtime, cookies 等)
  - `react-i18next` (返回 key 作为翻译)
  - `window.matchMedia`
- 测试文件命名: `__tests__/*.test.{ts,tsx}` 或 `*.test.{ts,tsx}`

## i18n

- 命名空间: `common` (默认), `features`
- 翻译键格式: `namespace:key` (如 `features:timestamp.title`)
- 语言: `zh` (默认), `en`
- 添加新翻译: 编辑 `i18n/locales/{zh,en}/{common,features}.json`

## 新功能开发清单

1. 在 `types/storage.d.ts` 添加 `PageType` 联合类型
2. 在 `config/features.tsx` 的 `FEATURES` 数组添加配置
3. 在 `pages/` 创建页面组件 (懒加载)
4. 在 `i18n/locales/{zh,en}/features.json` 添加翻译
5. 如需新权限，更新 `wxt.config.ts` 的 `manifest.permissions`
6. 添加对应的单元测试

## 代码规范

- 禁止使用 `any` (测试文件除外)
- 未使用变量/参数: 使用 `_` 前缀 (如 `_unused`)
- 样式: 复杂页面样式放 `config/pageTheme.ts`，简单样式用 MUI `sx` prop
- 格式: Prettier (100 字符宽, 单引号, 尾逗号)

## 技术栈版本

- WXT: ^0.20.26
- React: ^19.2.6
- MUI: ^7.3.8
- TypeScript: ^5.9.3
- Vitest: ^4.1.7
- i18next: ^26.2.0
