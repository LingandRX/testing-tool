# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架的浏览器扩展项目，提供测试工具功能，包括时间戳转换等。

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

- Vitest - 测试框架
- @testing-library/react - React 组件测试
- @testing-library/user-event v13 - 用户交互模拟（注意：v13 不支持 setup()，使用 fireEvent）
- jsdom - 浏览器环境模拟

### 依赖与准备

- `npm install` - 安装依赖
- `postinstall` 会自动运行 `wxt prepare` 准备开发环境
- `prepare` 钩子会初始化 Husky Git 钩子

## 项目架构

### 技术栈

- **框架**: WXT (Web Extension Toolkit) - 浏览器扩展开发框架
- **前端**: React 19 + TypeScript
- **UI 库**: Material UI (MUI)
- **状态管理**: React Hooks
- **路由**: React Router DOM

### 目录结构

```
├── components/           # 可复用 UI 组件
│   ├── CopyButton.tsx           # 复制按钮组件
│   ├── DatetimeToTimestamp.tsx   # 日期转时间戳组件
│   ├── Navbar.tsx                # 导航栏组件
│   ├── RoutePersistence.tsx      # 路由持久化组件
│   ├── TimestampExecution.tsx    # 时间戳执行组件
│   └── TimestampToDatetime.tsx   # 时间戳转日期组件
├── entrypoints/          # 浏览器扩展入口点
│   ├── background.ts     # 后台脚本（主进程）
│   ├── content.ts        # 内容脚本（注入到页面）
│   └── popup/            # 扩展弹窗界面
│       ├── App.tsx       # 弹窗主应用
│       ├── main.tsx      # 弹窗入口
│       └── pages/        # 弹窗页面
│           ├── TestPage.tsx      # 测试页面
│           └── TimestampPage.tsx # 时间戳工具页面
├── utils/                # 工具函数
│   ├── chromeStorage.ts  # Chrome 存储工具
│   ├── dayjs.ts          # 日期处理工具
│   └── messages.tsx      # 消息通信工具
├── types/                # 类型定义
│   └── storage.d.ts      # 存储相关类型
```

### 核心功能实现

#### 1. 时间戳转换工具

- 位置: `components/` 目录下的时间戳相关组件
- 依赖: dayjs 库进行日期处理
- 功能: 支持日期与时间戳的双向转换，支持多种格式

#### 2. 通信系统

- 位置: `utils/messages.tsx`
- 机制: 使用 `@webext-core/messaging` 库实现
- 通信通道: 后台脚本 ↔ 内容脚本 ↔ 弹窗

#### 3. 数据存储

- Chrome Storage API: `utils/chromeStorage.ts` (用于配置等小数据)

### 关键配置文件

#### wxt.config.ts

- 配置 WXT 框架参数
- 启用 React 模块
- 配置浏览器扩展权限
- Vite 构建配置（使用 Terser 压缩，强制 ASCII 编码）

#### manifest 权限

```typescript
permissions: [
  'storage',           // 存储权限
  'unlimitedStorage',  // 无限制存储
  'clipboardWrite',    // 剪贴板写入
  'activeTab',         // 当前标签页
  'scripting',         // 脚本注入
  'tabs',              // 标签页管理
  'debugger',          // 调试器
],
host_permissions: ['<all_urls>']  // 访问所有网站
```

## 开发注意事项

### 扩展入口点

- **后台脚本**: `entrypoints/background.ts` - 处理扩展生命周期和后台任务
- **内容脚本**: `entrypoints/content.ts` - 注入到网页中，处理 DOM 交互
- **弹窗**: `entrypoints/popup/main.tsx` - 用户点击扩展图标时显示

### 浏览器兼容性

- 支持 Chrome 和 Firefox 浏览器
- 使用 WXT 框架抽象浏览器差异

### 代码质量

- 使用 ESLint 进行代码检查
- Husky 用于 Git 钩子管理
- Lint-staged 确保暂存文件符合规范
