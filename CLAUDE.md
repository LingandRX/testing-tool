# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架的浏览器扩展项目，提供时间戳转换工具。项目已精简为核心功能，移除了录制回放等复杂功能。

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

### 依赖与准备

- `npm install` - 安装依赖
- `postinstall` 会自动运行 `wxt prepare` 准备开发环境
- `prepare` 钩子会初始化 Husky Git 钩子

## 项目架构

### 技术栈

- **框架**: WXT (Web Extension Toolkit) - 浏览器扩展开发框架
- **前端**: React 19 + TypeScript
- **UI 库**: Material UI (MUI)
- **日期处理**: dayjs (含 UTC 和时区插件)
- **通信**: @webext-core/messaging

### 目录结构

```
├── entrypoints/          # 浏览器扩展入口点
│   ├── background.ts     # 后台脚本（处理扩展安装/更新，注入内容脚本）
│   ├── content.ts        # 内容内容脚本（注入到页面，当前为空占位）
│   ├── popup/            # 扩展弹窗界面
│   │   ├── App.tsx       # 弹窗主应用
│   │   ├── main.tsx      # 弹窗入口
│   │   ├── index.html    # 弹窗 HTML
│   │   └── pages/       # 弹窗页面
│   │       └── TimestampPage.tsx  # 时间戳转换页面（核心功能）
│   └── options/         # 选项页面（当前为静态 HTML）
│       └── index.html    # 选项页 HTML
├── utils/                # 工具函数
│   ├── chromeStorage.ts  # Chrome Storage 工具（类型安全封装）
│   ├── dayjs.ts          # dayjs 配置（UTC + 时区插件）
│   └── messages.tsx     # 扩展消息通信工具（@webext-core/messaging）
├── types/                # 类型定义
│   └── storage.d.ts      # StorageSchema 类型定义
├── constants/            # 常量定义（当前为空）
└── public/               # 静态资源
```

### 核心功能

#### 时间戳转换工具 (entrypoints/popup/pages/TimestampPage.tsx)

- 实时显示当前时间戳（毫秒/秒可切换）
- 时间戳 → 日期时间转换
- 日期时间 → 时间戳转换
- 支持多个时区（亚洲/上海、美洲/纽约、欧洲/伦敦）
- 一键复制功能
- 输入验证和错误提示

### 扩展入口点

- **后台脚本** (`entrypoints/background.ts`):
  - 监听扩展安装/更新事件
  - 自动向所有有效标签页注入内容脚本
  - 过滤受限协议（chrome://, about:// 等）

- **内容脚本** (`entrypoints/content.ts`):
  - 匹配所有 URL (`<all_urls>`)
  - 在文档开始时运行
  - 当前为占位符，无实际逻辑

- **弹窗** (`entrypoints/popup/`):
  - 主入口显示 TimestampPage
  - 提供时间戳转换的完整功能

- **选项页** (`entrypoints/options/`):
  - 当前为静态 HTML 页面
  - 可扩展为设置界面

### 数据存储

使用 Chrome Storage API 进行持久化存储：

- 类型安全的封装 (`utils/chromeStorage.ts`)
- 基于接口定义的 Schema (`types/storage.d.ts`)
- 当前支持的存储键：
  - `app/lastRoute`: 上次访问的路由
  - `app/theme`: 主题设置

### 消息通信

使用 `@webext-core/messaging` 库实现类型安全的扩展内通信：

- 定义在 `utils/messages.tsx`
- 当前 ProtocolMap 为空（预留接口）

### 关键配置文件

#### wxt.config.ts

- 启用 React 模块 (`@wxt-dev/module-react`)
- 配置 manifest 权限和 host_permissions
- 使用 Terser 压缩（强制 ASCII 编码）
- 配置图标和选项页

#### manifest 权限

```typescript
permissions: [
  'storage',           // Chrome Storage
  'unlimitedStorage',  // 无限制存储
  'clipboardWrite',    // 剪贴板写入（复制功能）
  'activeTab',         // 当前标签页访问
  'scripting',         // 脚本注入
  'tabs',              // 标签页管理
  'debugger',          // 调试器权限
],
host_permissions: ['<all_urls>']  // 访问所有网站
```

## 开发注意事项

### 浏览器兼容性

- 支持 Chrome 和 Firefox 浏览器
- 使用 WXT 框架抽象浏览器差异

### 代码质量

- 使用 ESLint 进行代码检查（零警告）
- Husky 用于 Git 钩子管理
- Lint-staged 确保暂存文件符合规范
- Prettier 用于代码格式化

### TypeScript 配置

- 严格模式开启（`strict: true`）
- 不允许隐式 any（可配置，当前关闭）
- 未使用变量/参数会报错
- 模块解析模式：Bundler

### 项目历史

近期重构（根据 git 历史）：

- 移除了录制回放功能
- 移除了测试页面
- 精简为单页面时间戳工具
- 将 storage 工具类重命名为 storageUtil
