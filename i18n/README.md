# i18n/

国际化资源目录，管理多语言翻译和 i18next 初始化配置。

## 目录结构

```
i18n/
├── index.ts                    # i18next 初始化配置
└── locales/
    ├── zh/                     # 中文翻译（默认语言）
    │   ├── common.json         # 通用文案
    │   ├── features.json       # 功能模块标题和描述
    │   ├── timestamp.json      # 时间戳工具翻译
    │   ├── storageCleaner.json # 存储清理工具翻译
    │   ├── qrCode.json         # 二维码工具翻译
    │   ├── textStatistics.json # 文本统计工具翻译
    │   ├── jwt.json            # JWT 工具翻译
    │   ├── jsonDiff.json       # JSON 差异工具翻译
    │   ├── jsonFormat.json     # JSON 格式化工具翻译
    │   ├── base64Converter.json
    │   ├── markdownToHtml.json
    │   ├── htmlToMarkdown.json
    │   └── rightClickRestorer.json
    └── en/                     # 英文翻译（结构同上）
        └── ...
```

## index.ts

i18next 初始化配置：

- 同步加载 `common` 和 `features` 核心命名空间
- 自定义 `chromeStorage` 语言检测器，从 Chrome Storage 读取语言偏好
- `normalizeLanguage()` 将任意语言标识归一化为 `zh` 或 `en`
- 语言变更时同步更新 Day.js 本地化和 localStorage 快照

## 翻译键格式

- 命名空间：`common`（默认）、`features`、各功能独立命名空间
- 键格式：`namespace:key`（如 `features:timestamp.title`、`timestamp:unitMs`）

## 使用方式

```tsx
// 页面组件 — 懒加载翻译
import { useLazyTranslation } from '@/utils/useLazyTranslation';
const { t } = useLazyTranslation('timestamp');
t('timestamp:title');

// 全局组件 — 直接使用
import { useTranslation } from 'react-i18next';
const { t } = useTranslation(['common', 'features']);
t('common:settings');
```

## 添加新翻译

1. 在 `locales/{zh,en}/features.json` 添加功能标题和描述
2. 创建 `locales/{zh,en}/{功能名}.json` 添加功能专属翻译
3. 在 `utils/useLazyTranslation.ts` 的 `localeModules` 中注册新命名空间
