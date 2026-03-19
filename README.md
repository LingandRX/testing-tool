# Testing Tools Browser Extension

这是一个基于 WXT 框架的浏览器扩展项目，提供时间戳转换工具。

## 项目概述

Testing Tools 是一个轻量级的浏览器扩展，提供实用的时间戳转换功能。项目采用现代化的技术栈，包括 React 19、TypeScript 和 Material UI，并利用 WXT 框架简化浏览器扩展的开发流程。

## 功能特性

### 时间戳转换工具

- 实时显示当前时间戳（毫秒/秒可切换）
- 日期与时间戳之间的双向转换
- 支持多个时区（亚洲/上海、美洲/纽约、欧洲/伦敦）
- 一键复制转换结果
- 输入验证和错误提示

## 技术栈

- **框架**: WXT (Web Extension Toolkit)
- **前端**: React 19 + TypeScript
- **UI 库**: Material UI
- **日期处理**: dayjs (含 UTC 和时区插件)
- **通信**: @webext-core/messaging
- **存储**: Chrome Storage API (类型安全封装)

## 项目结构

```
├── entrypoints/         # 浏览器扩展入口点
│   ├── popup/           # 扩展弹窗界面（时间戳转换页面）
│   ├── options/         # 选项页面
│   ├── background.ts    # 后台脚本
│   └── content.ts       # 内容脚本
├── utils/              # 工具函数（存储、日期处理、消息通信）
├── types/              # TypeScript 类型定义
├── public/             # 静态资源
├── wxt.config.ts       # WXT 配置文件
├── package.json        # 项目依赖和脚本
└── README.md           # 项目说明文档
```

## 开发环境要求

- Node.js >= 18
- npm 或 yarn

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
# Chrome 浏览器
npm run dev

# Firefox 浏览器
npm run dev:firefox
```

### 3. 构建生产版本

```bash
# Chrome 浏览器
npm run build

# Firefox 浏览器
npm run build:firefox
```

### 4. 打包分发

```bash
# Chrome 浏览器
npm run zip

# Firefox
npm run zip:firefox
```

### 5. 其他命令

```bash
npm run compile    # TypeScript 类型检查
npm run lint       # ESLint 代码检查
```

## 权限说明

扩展请求以下权限：

- `storage` 和 `unlimitedStorage` - 本地数据存储
- `clipboardWrite` - 剪贴板写入（复制功能）
- `activeTab`, `scripting`, `tabs` - 当前标签页控制和脚本注入
- `debugger` - 调试器权限
- `<all_urls>` - 访问所有网站内容（内容脚本注入）

## 主要依赖

- `react`, `react-dom` - 前端框架
- `@mui/material` - UI 组件库
- `dayjs` - 日期处理
- `@webext-core/messaging` - 扩展消息通信

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

此项目为私有项目 (private: true)，仅供内部使用。
