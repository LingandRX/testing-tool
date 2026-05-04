# AGENTS.md

This file provides guidance to AI agents (such as Gemini, Codex, etc.) when working with the code in this repository.

## 项目概述

**Testing Tools** 是一个基于 WXT (Web Extension Toolkit) 框架的现代化浏览器扩展项目. 它提供了一系列实用的开发和测试工具，包括时间戳转换、存储管理、文本统计、JWT 解析及二维码工具.

## 核心命令

### 开发与构建

- `npm run dev` - 启动 Chrome 浏览器的开发模式（支持 HMR）
- `npm run dev:firefox` - 启动 Firefox 浏览器的开发模式
- `npm run build` - 构建 Chrome 浏览器的生产版本
- `npm run build:firefox` - 构建 Firefox 浏览器的生产版本
- `npm run zip` - 打包 Chrome 扩展为 ZIP 文件
- `npm run zip:firefox` - 打包 Firefox 扩展为 ZIP 文件
- `npm run compile` - 执行 TypeScript 类型检查（`tsc --noEmit`）
- `npm run lint` - 运行 ESLint 静态代码检查

### 测试

- `npm run test` - 运行所有单元测试（单次执行）
- `npm run test:watch` - 启动 Vitest 交互式监视模式
- `npm run test:coverage` - 运行测试并生成代码覆盖率报告

**运行单个测试文件：**

```bash
npx vitest run path/to/your.test.ts
```

### 依赖管理

- `npm install` - 安装项目依赖
- `postinstall` 钩子会自动运行 `wxt prepare` 以生成必要的类型定义和入口点.
- `prepare` 钩子会自动初始化 Husky 以进行 Git 提交前检查.

## 项目架构与目录结构

### 技术栈

- **框架**: WXT v0.20.6 (Web Extension Toolkit)
- **前端**: React 19 + TypeScript 5
- **UI 库**: Material UI (MUI) @7.x + Emotion
- **日期处理**: dayjs (集成 UTC 和 Timezone 插件)
- **通信**: `@webext-core/messaging` (用于 Entrypoints 间通信)
- **测试**: Vitest + Testing Library (jsdom 环境)
- **代码规范**: ESLint v9 + Prettier + Husky + lint-staged

### 目录结构

```text
├── components/           # 原子级 UI 组件
│   ├── __tests__/        # 组件单元测试
│   ├── PageHeader.tsx    # 标准页面头部
│   ├── ToolCard.tsx      # 仪表盘卡片基础
│   └── ...
├── config/               # 核心配置与元数据
│   ├── features.tsx      # 功能特性定义（路由与元数据的单一事实来源）
│   ├── pageTheme.ts      # 页面级主题与样式常量
│   └── theme.ts          # MUI 全局主题配置
├── entrypoints/          # 浏览器扩展入口点
│   ├── background.ts     # 后台 Service Worker (消息中转与生命周期)
│   ├── content.ts        # 注入页面的内容脚本
│   ├── popup/            # 弹窗界面主入口
│   ├── options/          # 选项页面主入口
│   └── sidepanel/        # 侧边栏界面主入口
├── pages/                # 功能模块页面组件
│   ├── DashboardPage.tsx # 仪表盘/首页
│   ├── Jwt/index.tsx       # JWT 解析工具
│   ├── QrCode/index.tsx    # 二维码工具
│   ├── StorageCleaner/index.tsx # 存储清理工具
│   ├── TextStatics/index.tsx # 文本统计工具
│   └── Timestamp/index.tsx # 时间戳转换工具
├── providers/            # React Context Providers (Router, Theme 等)
├── utils/                # 业务逻辑与工具函数
│   ├── chromeStorage.ts  # 类型安全的 Chrome Storage 封装
│   ├── jwt.ts            # JWT 解析逻辑
│   ├── textStatistics.ts # 文本分析逻辑
│   └── ...
├── types/                # 全局 TypeScript 类型声明
└── public/               # 静态资源 (图标等)
```

## 核心功能说明

### 1. 路由与功能发现

项目不使用传统的 React Router，而是通过 `config/features.tsx` 中的 `FEATURES` 数组统一管理.

- 每个功能都有一个唯一的 `PageType` (如 `timestamp`, `jwt`).
- `RouterProvider` 负责维护当前的页面状态，并根据 `FEATURES` 配置渲染对应的组件.

### 2. 存储管理 (Chrome Storage)

- 统一使用 `utils/chromeStorage.ts` 及其对应的 Hook.
- 所有的存储键值必须在 `types/storage.d.ts` 的 `StorageSchema` 中定义，以确保存储的类型安全.

### 3. 消息通信 (Messaging)

- 使用 `@webext-core/messaging` 进行 Popup, Sidepanel, Background 和 Content Script 之间的通信.
- 消息协议定义在 `utils/messages.ts` 中.

### 4. 样式系统

- 基于 MUI v7 的 `Box`, `Stack`, `Paper` 等组件构建.
- 页面特定的复杂样式应在 `config/pageTheme.ts` 中统一定义，以保持视觉一致性.

## AI 代理开发准则

1.  **类型安全**: 始终优先使用 TypeScript 接口和类型. 不要使用 `any`.
2.  **组件化**: 新功能应拆分为 `pages/` 中的页面组件和 `components/` 中的通用组件.
3.  **单元测试**: 每次修改逻辑或添加新功能后，必须在对应的 `__tests__` 目录下增加测试用例.
4.  **单一事实来源**: 功能的添加、修改或删除应首先从 `config/features.tsx` 开始.
5.  **跨浏览器兼容**: WXT 处理了大部分差异，但涉及原生 API (如 `chrome.cookies`) 时，请确保逻辑在 Firefox 和 Chrome 下均有效.
6.  **i18n**: 目前主要使用中文 UI，但在开发时请注意提取硬编码字符串，以便未来国际化.

## 权限管理

所有新申请的浏览器权限必须同步更新至 `wxt.config.ts` 的 `manifest.permissions` 中.
