# Testing Tools Browser Extension

这是一个基于 WXT 框架的浏览器扩展项目，提供实用的测试工具功能.

## 项目概述

Testing Tools 是一个轻量级的浏览器扩展，提供多种实用的测试工具功能. 项目采用现代化的技术栈，包括 React 19、TypeScript 和 Material UI，并利用 WXT 框架简化浏览器扩展的开发流程.

## 功能特性

### Dashboard 首页

- 卡片式工具展示
- 支持自定义工具排序和可见性
- 实时数据预览（时间戳等）

### 时间戳转换工具

- 实时显示当前时间戳（毫秒/秒可切换）
- 日期与时间戳之间的双向转换
- 支持多个时区（亚洲/上海、美洲/纽约、欧洲/伦敦）
- 一键复制转换结果
- 输入验证和错误提示

### 存储清理工具

- 自动读取当前域名
- 支持清理多种存储类型：
  - localStorage
  - sessionStorage
  - IndexedDB
  - Cookies
  - Cache Storage
  - Service Workers
- 可选择的清理类型（默认全选）
- 确认对话框防止误操作
- 清理结果统计
- 自动刷新页面选项

### 二维码工具

- URL 转二维码（生成器）
- 二维码转 URL（解析器）
- 支持上传二维码图片解析
- 生成的二维码可下载
- 一键复制转换结果
- 卡片式布局，节省空间

## 技术栈

- **框架**: WXT (Web Extension Toolkit)
- **前端**: React 19 + TypeScript
- **UI 库**: Material UI
- **日期处理**: dayjs (含 UTC 和时区插件)
- **通信**: @webext-core/messaging
- **存储**: Chrome Storage API (类型安全封装)
- **二维码**: qrcode (生成) + jsqr (解析)
- **测试**: Vitest + Testing Library

## 项目结构

```
├── components/           # 可复用 UI 组件
│   ├── Button.tsx
│   ├── CopyButton.tsx
│   ├── DashboardCard.tsx      # 仪表盘卡片组件（React.memo 优化）
│   ├── GlobalSnackbar.tsx
│   ├── PageHeader.tsx         # 页面标题栏组件
│   ├── RouterContainer.tsx
│   ├── StorageCleanerConfirm.tsx
│   ├── ToolCard.tsx
│   └── TopBar.tsx
├── config/              # 配置文件
│   ├── dashboardCards.tsx    # 仪表盘卡片配置数据
│   └── routes.ts        # 页面路由定义
├── entrypoints/         # 浏览器扩展入口点
│   ├── popup/          # 扩展弹窗界面
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── pages/      # 页面组件
│   │       ├── DashboardPage.tsx
│   │       ├── QrCodePage.tsx
│   │       ├── StorageCleanerPage.tsx
│   │       └── TimestampPage.tsx
│   ├── options/        # 选项页面
│   ├── sidepanel/      # 侧边栏
│   ├── background.ts   # 后台脚本
│   └── content.ts      # 内容脚本
├── providers/           # React Context providers
│   └── RouterProvider.tsx  # 路由状态管理
├── types/               # TypeScript 类型定义
│   └── storage.d.ts
├── utils/               # 工具函数
│   ├── chromeStorage.ts
│   ├── clipboard.ts
│   ├── dayjs.ts
│   ├── messages.tsx
│   └── storageCleaner.ts
├── public/              # 静态资源
├── wxt.config.ts        # WXT 配置文件
├── package.json
└── README.md
```

## 路由系统

项目实现了灵活的路由系统，支持：

- **页面导航**: 在不同工具页面之间切换
- **路由同步**: 通过 Chrome Storage 同步路由状态
- **可见性控制**: 可配置显示哪些页面
- **页面排序**: 自定义工具卡片的显示顺序

### 页面类型 (PageType)

| 页面             | 说明       | 默认可见 |
| ---------------- | ---------- | -------- |
| `dashboard`      | 首页       | ✓        |
| `timestamp`      | 时间戳转换 | ✓        |
| `storageCleaner` | 存储清理   | ✓        |
| `qrCode`         | 二维码工具 | ✓        |

## 扩展入口点

| 入口点         | 说明                     |
| -------------- | ------------------------ |
| **popup**      | 点击扩展图标弹出的界面   |
| **options**    | 扩展选项页面             |
| **sidepanel**  | 浏览器侧边栏             |
| **background** | 后台脚本（生命周期管理） |
| **content**    | 内容脚本（注入到网页）   |

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

### 5. 代码质量

```bash
npm run compile    # TypeScript 类型检查
npm run lint       # ESLint 代码检查
```

### 6. 测试

```bash
npm run test              # 运行所有测试
npm run test:watch        # 运行测试并监听文件变化
npm run test:coverage     # 运行测试并生成覆盖率报告
```

## 持续集成与发布

项目使用 GitHub Actions 实现自动化 CI/CD，无需手动操作.

### CI — 持续集成

在以下场景自动触发：

- push 到 `main` / `develop` / `develop-*` 分支
- 所有 PR（合并到 `main` 或 `develop`）

自动执行：ESLint 检查 → TypeScript 类型检查 → 单元测试 → Chrome & Firefox 构建验证.

### 发布版本

只需推送符合 `v*` 格式的 Git tag，即可自动完成全量 CI 检查、打包并发布到 GitHub Release：

```bash
git tag v1.0.0
git push origin v1.0.0
```

> 含 `-` 的 tag（如 `v1.0.0-beta.1`）会自动标记为预发布版本（prerelease）.

工作流文件位于 `.github/workflows/`：

- `ci.yml` — 持续集成
- `release.yml` — 自动发布

## 权限说明

扩展请求以下权限：

- `storage` 和 `unlimitedStorage` - 本地数据存储
- `clipboardWrite` - 剪贴板写入（复制功能）
- `activeTab`, `scripting`, `tabs` - 当前标签页控制和脚本注入
- `cookies` - Cookie 访问
- `sidePanel` - 侧边栏支持
- `<all_urls>` - 访问所有网站内容（内容脚本注入）

## 主要依赖

- `react`, `react-dom` - 前端框架
- `@mui/material` - UI 组件库
- `dayjs` - 日期处理
- `@webext-core/messaging` - 扩展消息通信
- `vitest` - 测试框架
- `@testing-library/react` - React 组件测试

## 浏览器兼容性

- Chrome (推荐)
- Firefox

## 许可证

此项目采用 MIT 许可证. 详见 [LICENSE](LICENSE) 文件.
