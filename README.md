# Testing Tools Browser Extension

这是一个基于 WXT 框架的浏览器扩展项目，提供了多种实用的测试工具，包括时间戳转换、用户操作录制与回放等功能。

## 项目概述

Testing Tools 是一个功能丰富的浏览器扩展，旨在帮助开发者和测试人员更高效地进行网页测试工作。项目采用现代化的技术栈，包括 React 19、TypeScript 和 Material UI，并利用 WXT 框架简化浏览器扩展的开发流程。

## 功能特性

### 1. 时间戳转换工具

- 日期与时间戳之间的双向转换
- 支持多种日期格式
- 快速复制转换结果

### 2. 录制与回放功能

- 基于 rrweb 库的用户操作录制
- 完整的会话回放功能
- 支持复杂交互场景的重现

### 3. 测试工具页面

- 提供多种实用的测试功能
- 集成测试库支持

## 技术栈

- **框架**: WXT (Web Extension Toolkit)
- **前端**: React 19 + TypeScript
- **UI 库**: Material UI
- **状态管理**: React Hooks
- **数据库**: Dexie.js (IndexedDB 包装器)
- **录制回放**: rrweb
- **路由**: React Router DOM

## 项目结构

```
├── components/           # 可复用的 UI 组件
├── entrypoints/         # 浏览器扩展入口点
│   ├── popup/           # 扩展弹窗界面
│   ├── options/         # 选项页面
│   ├── offscreen/       # 离屏文档
│   ├── background.ts    # 后台脚本
│   └── content.ts       # 内容脚本
├── assets/              # 静态资源
├── wxt.config.ts        # WXT 配置文件
├── package.json         # 项目依赖和脚本
└── README.md            # 项目说明文档
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

# Firefox 浏览器
npm run zip:firefox
```

## 权限说明

扩展请求以下权限：

- `storage` 和 `unlimitedStorage` - 本地数据存储
- `clipboardWrite` - 剪贴板写入
- `activeTab`, `scripting`, `tabs` - 当前标签页控制
- `offscreen` - 离屏文档处理
- `downloads` - 下载管理
- `<all_urls>` - 访问所有网站内容

## 主要依赖

- `react`, `react-dom` - 前端框架
- `@mui/material` - UI 组件库
- `rrweb`, `rrweb-player` - 录制回放功能
- `dexie`, `dexie-react-hooks` - 数据库操作
- `react-router-dom` - 路由管理
- `@testing-library/*` - 测试工具

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

此项目为私有项目 (private: true)，仅供内部使用。
