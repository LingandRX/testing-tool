# Testing Tools Browser Extension

这是一个基于 WXT 框架的浏览器扩展项目，为开发者和测试人员提供实用的效率工具.

## 项目概述

**Testing Tools** 是一个轻量级、功能丰富的浏览器扩展，采用现代化的技术栈构建. 它旨在简化日常开发和测试任务，如时间戳转换、存储管理、JWT 解析等. 项目利用 [WXT (Web Extension Toolkit)](https://wxt.dev/) 框架，提供了卓越的开发体验和跨浏览器支持.

## 功能特性

### Dashboard 首页

- **工具导航**: 快速访问所有可用工具.
- **个性化定制**: 支持自定义工具的排序和可见性.
- **实时预览**: 在卡片上直接查看实时数据（如当前时间戳）.

### 时间戳转换工具

- **实时显示**: 毫秒级精度显示当前系统时间.
- **双向转换**: 日期字符串与 Unix 时间戳（秒/毫秒）之间的无缝转换.
- **多时区支持**: 预设常用时区（亚洲/上海、美洲/纽约、欧洲/伦敦），支持快速切换.
- **快捷操作**: 一键复制转换结果，支持多种格式.

### 存储清理工具

- **智能识别**: 自动检测并显示当前活动标签页的域名.
- **全面清理**: 支持一键清理 localStorage、sessionStorage、IndexedDB、Cookies、Cache Storage 和 Service Workers.
- **细粒度控制**: 可根据需要选择特定的清理项.
- **自动刷新**: 提供清理后自动刷新页面的选项，确保状态同步.

### 文本统计工具

- **实时分析**: 键入即统计，无需额外操作.
- **多维指标**: 统计字符数、单词数、行数以及精确的字节大小.
- **性能优化**: 采用高性能分词算法，支持大文本处理.

### JWT 解析工具

- **快速解码**: 自动解析 JSON Web Token 的 Header 和 Payload.
- **格式化显示**: 以着色和格式化的 JSON 视图展示数据，方便阅读.
- **安全检查**: 自动去除 `Bearer` 前缀，处理异常输入并提供友好提示.
- **签名查看**: 展示 JWT 签名部分，辅助验证令牌完整性.

### 右键恢复工具

- **当前页面检测**: 自动识别当前活动标签页的域名.
- **一键恢复**: 解除网站对右键菜单的限制，恢复复制、粘贴等基础操作.
- **状态可视化**: 通过 Badge 组件直观展示当前页面的锁定/解锁状态.

### 二维码工具

- **生成器**: 将当前 URL 或自定义文本快速转换为二维码，支持下载.
- **解析器**: 支持通过上传图片或粘贴图片来解析二维码内容.

### JSON 工具

- **差异比较**: 对比两段 JSON 数据，高亮展示差异.
- **格式化**: 支持 JSON 美化、压缩、转 YAML / TOML.

### Base64 转换器

- **文本编解码**: 支持文本内容的 Base64 编码与解码.
- **文件转换**: 支持文件与 Base64 字符串互转.
- **图像预览**: 支持图片 Base64 编码与实时预览.

### 测试数据生成器

- **可视化字段配置**: 通过 UI 界面定义数据字段，支持拖拽排序、最多 40 个字段.
- **丰富的内置生成器**: 涵盖个人信息（姓名、手机、邮箱）、企业数据（公司名、职位）、技术数据（IP、MAC 地址、UUID）、基础类型（数字、日期、枚举）等多个分类.
- **灵活的参数配置**: 每个生成器支持自定义参数（如数字范围、日期格式、枚举值列表等）.
- **空值率与唯一性**: 可为非必填字段设置空值率，支持字段唯一性约束.
- **规则管理**: 保存、加载、编辑、复制、导入/导出字段配置规则，方便复用.
- **批量生成**: 支持 1 ~ 100,000 条数据生成，通过 Web Worker 异步处理避免阻塞 UI.
- **实时预览**: 配置字段后即时预览示例数据结构.
- **多格式导出**: 支持 JSON 和 CSV 格式，提供复制到剪贴板和下载文件两种导出方式.

## 技术栈

- **框架**: [WXT (Web Extension Toolkit)](https://wxt.dev/)
- **前端**: React 19 + TypeScript
- **UI 组件**: shadcn/ui (基于 Radix UI 的无头组件库)
- **样式**: Tailwind CSS + class-variance-authority + cn() 工具函数
- **日期处理**: dayjs (集成 UTC 和 Timezone 插件)
- **UI 文案**: 组件内直接使用中文字符串；功能名称与描述定义在 `src/config/features.tsx`
- **通信**: @webext-core/messaging
- **存储**: Chrome Storage API (类型安全封装)
- **解析引擎**: qr-scanner (二维码解析), qrious (二维码生成)
- **测试**: Vitest + Testing Library
- **拖拽排序**: @dnd-kit/core + @dnd-kit/sortable
- **异步生成**: Web Worker (批量数据生成)

## 项目结构

```text
├── src/                   # 源代码根目录
│   ├── components/        # 可复用 React 组件
│   ├── config/            # 应用配置
│   │   └── features.tsx   # 功能定义与路由映射
│   ├── entrypoints/       # 扩展程序入口点
│   │   ├── popup/         # 点击图标弹出的主界面
│   │   ├── sidepanel/     # 浏览器侧边栏集成
│   │   ├── background.ts  # 后台 Service Worker
│   │   └── content.ts     # 网页注入脚本
│   ├── pages/             # 各功能模块的页面组件
│   ├── workers/           # Web Worker (数据生成等耗时任务)
│   ├── providers/         # 全局状态提供者 (Router, Theme 等)
│   ├── hooks/             # 自定义 React Hooks
│   ├── utils/             # 工具函数与服务抽象
│   ├── types/             # TypeScript 类型声明
│   └── lib/               # 通用工具函数与生成器库 (cn, utils, generators 等)
├── public/                # 静态资源 (图标等)
├── wxt.config.ts          # WXT 框架核心配置
└── package.json           # 项目元数据与依赖管理
```

## 开发与部署

### 开发环境要求

- Node.js >= 18.x
- npm 或 pnpm

### 常用命令

| 命令                    | 说明                              |
| ----------------------- | --------------------------------- |
| `npm run dev`           | 启动 Chrome 开发模式（支持 HMR）  |
| `npm run dev:firefox`   | 启动 Firefox 开发模式             |
| `npm run build`         | 构建 Chrome 生产版本              |
| `npm run build:firefox` | 构建 Firefox 生产版本             |
| `npm run zip`           | 打包 Chrome 扩展 (.output/\*.zip) |
| `npm run zip:firefox`   | 打包 Firefox 扩展                 |
| `npm run typecheck`     | 执行 TypeScript 类型检查          |
| `npm run lint`          | 执行 ESLint 代码规范检查          |
| `npm run test`          | 运行单元测试                      |
| `npm run test:coverage` | 生成测试覆盖率报告                |

运行单个测试: `npx vitest run path/to/file.test.ts`

### 自动化流程

项目通过 GitHub Actions 实现了完善的 CI/CD 流程：

- **CI**: 每次推送或 PR 都会自动执行 Lint、类型检查、测试和构建验证.
- **Release**: 推送以 `v*` 开头的 Tag 会自动打包并创建 GitHub Release.

## 权限说明

本扩展根据功能需要申请了以下权限：

- `storage` & `unlimitedStorage`: 存储用户设置、工具配置及大量数据.
- `activeTab` & `tabs`: 获取当前页面 URL 及其元数据.
- `scripting`: 在网页中执行清理和右键恢复脚本.
- `cookies`: 管理和清理网站 Cookie.
- `sidePanel`: 支持在浏览器侧边栏中运行.
- `clipboardWrite`: 提供一键复制功能.
- `contextMenus`: 注册右键菜单，支持快捷操作.

## 浏览器支持

- Chrome (及其它 Chromium 内核浏览器)
- Firefox

## 许可证

基于 [MIT License](LICENSE) 开源.
