# Testing Tools Browser Extension

这是一个基于 WXT 框架的浏览器扩展项目，为开发者和测试人员提供实用的效率工具.

## 项目概述

**Testing Tools** 是一个轻量级、功能丰富的浏览器扩展，采用现代化的技术栈构建. 它旨在简化日常开发和测试任务，如时间戳转换、存储管理、JWT 解析等. 项目利用 [WXT (Web Extension Toolkit)](https://wxt.dev/) 框架，提供了卓越的开发体验和跨浏览器支持.

## 功能特性

### 🚀 Dashboard 首页

- **工具导航**: 快速访问所有可用工具.
- **个性化定制**: 支持自定义工具的排序和可见性.
- **实时预览**: 在卡片上直接查看实时数据（如当前时间戳）.

### ⏰ 时间戳转换工具

- **实时显示**: 毫秒级精度显示当前系统时间.
- **双向转换**: 日期字符串与 Unix 时间戳（秒/毫秒）之间的无缝转换.
- **多时区支持**: 预设常用时区（亚洲/上海、美洲/纽约、欧洲/伦敦），支持快速切换.
- **快捷操作**: 一键复制转换结果，支持多种格式.

### 🧹 存储清理工具

- **智能识别**: 自动检测并显示当前活动标签页的域名.
- **全面清理**: 支持一键清理 localStorage、sessionStorage、IndexedDB、Cookies、Cache Storage 和 Service Workers.
- **细粒度控制**: 可根据需要选择特定的清理项.
- **自动刷新**: 提供清理后自动刷新页面的选项，确保状态同步.

### 📝 文本统计工具

- **实时分析**: 键入即统计，无需额外操作.
- **多维指标**: 统计字符数、单词数、行数以及精确的字节大小.
- **性能优化**: 采用高性能分词算法，支持大文本处理.

### 🔑 JWT 解析工具

- **快速解码**: 自动解析 JSON Web Token 的 Header 和 Payload.
- **格式化显示**: 以着色和格式化的 JSON 视图展示数据，方便阅读.
- **安全检查**: 自动去除 `Bearer` 前缀，处理异常输入并提供友好提示.
- **签名查看**: 展示 JWT 签名部分，辅助验证令牌完整性.

### 🖼️ 二维码工具

- **生成器**: 将当前 URL 或自定义文本快速转换为二维码，支持下载.
- **解析器**: 支持通过上传图片或粘贴图片来解析二维码内容.

## 技术栈

- **框架**: [WXT (Web Extension Toolkit)](https://wxt.dev/)
- **前端**: React 19 + TypeScript
- **UI 组件**: Material UI (MUI) @7.x
- **样式**: Emotion (Styled Components)
- **日期处理**: dayjs (集成 UTC 和 Timezone 插件)
- **通信**: @webext-core/messaging
- **存储**: Chrome Storage API (类型安全封装)
- **解析引擎**: qr-scanner (二维码解析), qrious (二维码生成)
- **测试**: Vitest + Testing Library

## 项目结构

```text
├── components/           # 可复用 React 组件
├── config/              # 应用配置（路由、功能元数据、主题）
│   ├── features.tsx     # 功能定义与路由映射
│   └── pageTheme.ts     # 各功能页面的视觉风格配置
├── entrypoints/         # 扩展程序入口点
│   ├── popup/           # 点击图标弹出的主界面
│   ├── options/         # 扩展程序设置页面
│   ├── sidepanel/       # 浏览器侧边栏集成
│   ├── background.ts    # 后台 Service Worker
│   └── content.ts       # 网页注入脚本
├── pages/               # 各功能模块的页面组件
├── providers/           # 全局状态提供者 (Router, Snackbar 等)
├── types/               # TypeScript 类型声明
├── utils/               # 工具函数与服务抽象
├── public/              # 静态资源 (图标、 manifest 资源等)
├── wxt.config.ts        # WXT 框架核心配置
└── package.json         # 项目元数据与依赖管理
```

## 开发与部署

### 开发环境要求

- Node.js >= 18.x
- npm 或 pnpm

### 常用命令

| 命令                    | 说明                             |
| ----------------------- | -------------------------------- |
| `npm run dev`           | 启动 Chrome 开发模式（支持 HMR） |
| `npm run dev:firefox`   | 启动 Firefox 开发模式            |
| `npm run build`         | 构建 Chrome 生产版本             |
| `npm run compile`       | 执行 TypeScript 类型检查         |
| `npm run lint`          | 执行 ESLint 代码规范检查         |
| `npm run test`          | 运行单元测试                     |
| `npm run test:coverage` | 生成测试覆盖率报告               |

### 自动化流程

项目通过 GitHub Actions 实现了完善的 CI/CD 流程：

- **CI**: 每次推送或 PR 都会自动执行 Lint、类型检查、测试和构建验证.
- **Release**: 推送以 `v*` 开头的 Tag 会自动打包并创建 GitHub Release.

## 权限说明

本扩展根据功能需要申请了以下权限：

- `storage`: 存储用户设置和工具配置.
- `activeTab` & `tabs`: 获取当前页面 URL 及其元数据.
- `scripting`: 在网页中执行清理脚本.
- `cookies`: 管理和清理网站 Cookie.
- `sidePanel`: 支持在浏览器侧边栏中运行.
- `clipboardWrite`: 提供一键复制功能.

## 浏览器支持

- Chrome (及其它 Chromium 内核浏览器)
- Firefox

## 许可证

基于 [MIT License](LICENSE) 开源.
