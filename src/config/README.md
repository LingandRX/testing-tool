# config/

应用级配置目录，存放功能特性的注册中心。

## 文件说明

| 文件           | 用途                                     |
| -------------- | ---------------------------------------- |
| `features.tsx` | 核心配置文件，定义所有工具功能的注册信息 |

## features.tsx

`FEATURES` 数组是路由和功能元数据的**单一事实来源**，每个功能定义包含：

- `key`：页面类型标识（`PageType`）
- `labelKey` / `descriptionKey`：i18n 翻译键
- `themeColorKey`：主题色（`primary/success/warning/error/secondary/info`）
- `icon`：lucide-react 图标组件
- `defaultVisible`：默认是否可见
- `components`：三种渲染模式的懒加载组件（`popup`、`sidepanel`、`tab`）

## 已注册功能（11 个）

| key                  | 图标              | 说明              |
| -------------------- | ----------------- | ----------------- |
| `dashboard`          | —                 | 仪表盘首页        |
| `timestamp`          | Clock             | 时间戳转换工具    |
| `storageCleaner`     | Database          | 存储清理工具      |
| `qrCode`             | QrCode            | 二维码工具        |
| `textStatistics`     | FileText          | 文本统计工具      |
| `jwt`                | Key               | JWT 解析工具      |
| `jsonDiff`           | GitCompareArrows  | JSON 差异比较工具 |
| `base64Converter`    | ArrowLeftRight    | Base64 转换器     |
| `markdownToHtml`     | Code              | Markdown 转 HTML  |
| `htmlToMarkdown`     | File              | HTML 转 Markdown  |
| `rightClickRestorer` | MousePointerClick | 右键菜单恢复工具  |

## 导出函数

- `getFeatureByKey(key)` — 根据 key 获取功能配置
- `getDefaultVisibleFeatureKeys()` — 获取默认可见的功能 key 列表
- `getAllFeatureKeys()` — 获取所有功能 key 列表
- `getDefaultPageOrder()` — 获取默认页面排序（不含 dashboard）
- `getEntryPointType()` — 判断当前入口类型（popup/sidepanel/tab）
