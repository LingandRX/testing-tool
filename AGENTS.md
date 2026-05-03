# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架的浏览器扩展项目，提供多种测试工具功能，包括时间戳转换、存储管理、二维码生成、表单识别与填充等。

## 核心命令

### 开发相关

- `npm run dev` - 启动 Chrome 浏览器的开发模式
- `npm run dev:firefox` - 启动 Firefox 浏览器的开发模式
- `npm run build` - 构建 Chrome 浏览器的生产版本
- `npm run build:firefox` - 构建 Firefox 浏览器的生产版本
- `npm run zip` - 打包 Chrome 扩展
- `npm run zip:firefox` - 打包 Firefox 扩展
- `npm run compile` - TypeScript 类型检查（不生成文件）
- `npm run lint` - 运行 ESLint 检查

### 测试相关

- `npm run test` - 运行所有测试（单次执行）
- `npm run test:watch` - 运行测试并监听文件变化
- `npm run test:coverage` - 运行测试并生成覆盖率报告

**运行单个测试文件：**

```bash
npx vitest run components/__tests__/CopyButton.test.tsx
```

**测试技术栈：**

- Vitest v2 - 测试框架
- @testing-library/react v16 - React 组件测试
- @testing-library/user-event v14 - 用户交互模拟
- jsdom v25 - 浏览器环境模拟

### 依赖与准备

- `npm install` - 安装依赖
- `postinstall` 会自动运行 `wxt prepare` 准备开发环境
- `prepare` 钩子会初始化 Husky Git 钩子

## 项目架构

### 技术栈

- **框架**: WXT v0.20.6 (Web Extension Toolkit) - 浏览器扩展开发框架
- **前端**: React 19 + TypeScript 5
- **UI 库**: Material UI (MUI) v7 + Emotion
- **状态管理**: React Hooks + 自定义 Hooks
- **路由**: 自定义路由系统（支持 popup/sidepanel/detached 三种模式）
- **测试**: Vitest + Testing Library
- **代码质量**: ESLint v9 + Prettier + Husky + lint-staged

### 目录结构

```
├── components/                    # 可复用 UI 组件
│   ├── __tests__/                 # 组件测试文件
│   ├── Button.tsx                 # 按钮组件
│   ├── CopyButton.tsx             # 复制按钮组件
│   ├── DashboardCard.tsx          # 仪表盘卡片组件
│   ├── FieldList.tsx              # 字段列表组件
│   ├── GlobalSnackbar.tsx         # 全局提示消息组件
│   ├── PageHeader.tsx             # 页面头部组件
│   ├── QrCodeToUrlSection.tsx     # 二维码解析为 URL 组件
│   ├── QrCodeUploader.tsx         # 二维码上传组件
│   ├── RouterContainer.tsx        # 路由容器组件
│   ├── StorageCleanerConfirm.tsx  # 存储清理确认组件
│   ├── ToolCard.tsx               # 工具卡片组件
│   ├── TopBar.tsx                 # 顶部导航栏组件
│   └── UrlToQrCodeSection.tsx     # URL 转二维码组件
├── config/                        # 配置文件
│   ├── __tests__/                 # 配置测试文件
│   ├── dashboardCards.tsx         # 仪表盘卡片配置
│   ├── pageTheme.ts               # 页面主题配置
│   ├── routes.ts                  # 路由配置
│   └── theme.ts                   # 全局主题配置
├── entrypoints/                   # 浏览器扩展入口点
│   ├── background.ts              # 后台脚本（主进程）
│   ├── content.ts                 # 内容脚本（注入到页面）
│   ├── content/
│   │   └── messageHandler.ts      # 消息处理器
│   ├── options/                   # 选项页面
│   │   ├── App.tsx                # 选项应用
│   │   ├── index.html             # 选项页面 HTML
│   │   └── main.tsx               # 选项页面入口
│   ├── popup/                     # 扩展弹窗界面
│   │   ├── App.tsx                # 弹窗主应用
│   │   ├── main.tsx               # 弹窗入口
│   │   ├── index.html             # 弹窗 HTML
│   │   ├── pages/                 # 弹窗页面
│   │   │   ├── components/        # 页面级组件
│   │   │   │   ├── AutoRefreshToggle.tsx    # 自动刷新开关
│   │   │   │   ├── CleaningResult.tsx       # 清理结果展示
│   │   │   │   ├── DomainHeader.tsx         # 域名头部
│   │   │   │   ├── ErrorDisplay.tsx         # 错误显示
│   │   │   │   ├── LiveClock.tsx            # 实时时钟
│   │   │   │   ├── OptionItem.tsx           # 选项条目
│   │   │   │   ├── ResultView.tsx           # 结果视图
│   │   │   │   └── StorageOptionsGrid.tsx   # 存储选项网格
│   │   │   ├── hooks/             # 自定义 Hooks
│   │   │   │   ├── useActiveTabDomain.ts    # 当前标签页域名
│   │   │   │   ├── useFormRecognizer.ts     # 表单识别
│   │   │   │   ├── useSidePanelState.ts     # 侧边栏状态
│   │   │   │   └── useTimestampConverter.ts # 时间戳转换
│   │   │   ├── DashboardPage.tsx            # 仪表盘页面
│   │   │   ├── FormFillPage.tsx             # 表单填充页面
│   │   │   ├── FormMappingPage.tsx          # 表单映射页面
│   │   │   ├── FormRecognizerPage.tsx          # 表单识别页面
│   │   │   ├── QrCodePage.tsx               # 二维码页面
│   │   │   ├── StorageCleanerPage.tsx       # 存储清理页面
│   │   │   ├── TimestampPage.tsx            # 时间戳页面
│   │   │   └── useStorageCleaner.ts         # 存储清理 Hook
│   └── sidepanel/                 # 侧边栏界面
│       ├── App.tsx                # 侧边栏应用
│       ├── index.html             # 侧边栏 HTML
│       └── main.tsx               # 侧边栏入口
├── providers/                     # React Providers
│   └── RouterProvider.tsx         # 路由 Provider
├── utils/                         # 工具函数
│   ├── __tests__/                 # 工具测试文件
│   ├── formMapping/               # 表单映射工具
│   │   ├── highlighter.ts         # 表单高亮器
│   │   ├── scanner.ts             # 表单扫描器
│   │   ├── smartInjector.ts       # 智能注入器
│   │   └── ui.ts                  # UI 工具
│   ├── chromeStorage.ts           # Chrome 存储工具
│   ├── chromeTabs.ts              # Chrome 标签页工具
│   ├── clipboard.ts               # 剪贴板工具
│   ├── dataTemplate.ts            # 数据模板
│   ├── dataValidator.ts           # 数据验证器
│   ├── dayjs.ts                   # 日期处理工具
│   ├── dummyDataGenerator.ts      # 虚拟数据生成器（基于 Faker）
│   ├── messages.ts                # 消息通信工具
│   ├── qrCodeParser.ts            # 二维码解析器
│   ├── storageCleaner.ts          # 存储清理工具
│   └── useStorageState.ts         # 存储状态 Hook
├── types/                         # 类型定义
│   └── storage.d.ts               # 存储相关类型
├── docs/                          # 文档
│   └── plans/                     # 计划文档
├── public/                        # 静态资源
│   └── icon/                      # 扩展图标
└── .github/                       # GitHub 配置
    └── workflows/                 # CI/CD 工作流
        ├── ci.yml                 # 持续集成
        └── release.yml            # 发布流程
```

### 核心功能模块

#### 1. 时间戳转换工具

- 位置: `pages/TimestampPage.tsx`
- Hook: `pages/hooks/useTimestampConverter.ts`
- 依赖: dayjs 库进行日期处理
- 功能: 支持日期与时间戳的双向转换，支持多种格式，实时时钟显示

#### 2. 存储清理工具

- 位置: `pages/StorageCleanerPage.tsx`
- Hook: `pages/useStorageCleaner.ts`
- 工具: `utils/storageCleaner.ts`
- 功能: 清理缓存、Cookies、本地存储，支持按域名筛选，自动刷新功能

#### 3. 二维码工具

- 位置: `pages/QrCodePage.tsx`
- 组件: `components/QrCodeUploader.tsx`, `components/QrCodeToUrlSection.tsx`, `components/UrlToQrCodeSection.tsx`
- 工具: `utils/qrCodeParser.ts`
- 依赖: qrcode, jsqr 库
- 功能: URL 转二维码生成，二维码图片解析为 URL

#### 4. 表单工具套件

**表单识别 (Form Recognizer)**

- 位置: `pages/FormRecognizerPage.tsx`
- Hook: `pages/hooks/useFormRecognizer.ts`
- 功能: 智能识别页面表单指纹

**表单映射 (Form Mapping)**

- 位置: `pages/FormMappingPage.tsx`
- 工具: `utils/formMapping/` 目录
- 功能: 表单指纹识别与自定义映射规则配置

**表单填充 (Form Fill)**

- 位置: `pages/FormFillPage.tsx`
- 工具: `utils/dummyDataGenerator.ts` (基于 @faker-js/faker)
- 功能: 根据表单指纹智能填充表单数据

#### 5. 仪表盘系统

- 位置: `pages/DashboardPage.tsx`
- 配置: `config/features.tsx`
- 组件: `components/DashboardCard.tsx`, `components/ToolCard.tsx`
- 功能: 统一工具入口，可自定义显示的工具卡片

#### 6. 多模式显示系统

- 支持三种显示模式:
  - **popup** - 扩展弹窗（点击图标显示）
  - **sidepanel** - 浏览器侧边栏
  - **detached** - 独立窗口模式
- 路由配置: `config/features.tsx`
- 路由容器: `components/RouterContainer.tsx`
- Provider: `providers/RouterProvider.tsx`

#### 7. 通信系统

- 位置: `utils/messages.ts`
- 机制: 使用 `@webext-core/messaging` 库实现
- 内容脚本消息处理: `entrypoints/content/messageHandler.ts`
- 通信通道: 后台脚本 ↔ 内容脚本 ↔ 弹窗/侧边栏

#### 8. 数据存储

- Chrome Storage API: `utils/chromeStorage.ts`
- 存储状态 Hook: `utils/useStorageState.ts`
- 类型定义: `types/storage.d.ts`

### 关键配置文件

#### wxt.config.ts

- 配置 WXT 框架参数
- 启用 React 模块
- 配置浏览器扩展权限（storage, unlimitedStorage, clipboardWrite, activeTab, scripting, tabs, cookies, sidePanel）
- Vite 构建配置（使用 Terser 压缩，强制 ASCII 编码）
- 配置侧边栏和选项页面

#### manifest 权限

```typescript
permissions: [
  'storage',           // 存储权限
  'unlimitedStorage',  // 无限制存储
  'clipboardWrite',    // 剪贴板写入
  'activeTab',         // 当前标签页
  'scripting',         // 脚本注入
  'tabs',              // 标签页管理
  'cookies',           // Cookies 管理
  'sidePanel',         // 侧边栏
],
host_permissions:['<all_urls>']  // 访问所有网站
```

#### CI/CD 配置

- `.github/workflows/ci.yml` - 持续集成工作流
- `.github/workflows/release.yml` - 发布工作流

## 开发注意事项

### 扩展入口点

- **后台脚本**: `entrypoints/background.ts` - 处理扩展生命周期和后台任务
- **内容脚本**: `entrypoints/content.ts` - 注入到网页中，处理 DOM 交互
- **弹窗**: `entrypoints/popup/main.tsx` - 用户点击扩展图标时显示
- **侧边栏**: `entrypoints/sidepanel/main.tsx` - 浏览器侧边栏界面
- **选项页面**: `entrypoints/options/main.tsx` - 扩展设置页面

### 路由系统

- 使用自定义路由系统，支持多种显示模式
- 路由配置在 `config/features.tsx`
- 通过 `getEntryPointType()` 判断当前入口点类型
- 支持页面可见性配置（`defaultVisible`）

### 浏览器兼容性

- 支持 Chrome 和 Firefox 浏览器
- 使用 WXT 框架抽象浏览器差异
- 使用 `@types/chrome` 和 `@types/webextension-polyfill` 提供类型支持

### 代码质量

- 使用 ESLint v9 进行代码检查（基于 typescript-eslint）
- Prettier 进行代码格式化
- Husky v9 用于 Git 钩子管理
- Lint-staged 确保暂存文件符合规范
- GitHub Actions CI/CD 自动化测试和构建

### 测试策略

- 组件测试: `components/__tests__/` 目录
- 工具函数测试: `utils/__tests__/` 目录
- 配置测试: `config/__tests__/` 目录
- 使用 Vitest 作为测试框架
- 使用 Testing Library 进行 React 组件测试
