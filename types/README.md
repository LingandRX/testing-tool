# types/

全局共享的 TypeScript 类型声明文件目录。

## 文件说明

### storage.d.ts

核心类型定义文件，包含：

**页面类型：**

- `PageType` — 所有页面类型的联合类型（`dashboard` | `timestamp` | `storageCleaner` | ...）
- `JsonToolsPageMode` — JSON 工具子模式（`diff` | `format` | `yaml` | `toml` | `minify`）
- `Base64ConverterPageMode` — Base64 子模式（`text` | `file` | `image`）
- `Base64ConvertDirection` — 编解码方向（`encode` | `decode`）
- `MarkdownToHtmlPreviewMode` — Markdown 预览模式（`split` | `preview` | `html`）
- `HtmlToMarkdownPreviewMode` — HTML 预览模式（`split` | `preview` | `markdown`）

**存储 Schema：**

- `StorageSchema` — Chrome Storage 完整数据结构定义，所有存储键必须在此声明
  - 键名使用 kebab-case 格式（如 `app/currentRoute`）
  - 包含路由、主题、工具偏好、搜索历史等所有持久化数据

**其他类型：**

- `FormMapEntry` — 表单映射条目定义
- `ContextMenuPendingData` — 右键菜单待处理数据
- `StorageCleanerPreferences` / `StorageCleanerOptions` — 存储清理偏好
- `CleaningResult` / `StorageCleanResult` — 清理结果类型

### qrious.d.ts

`qrious` 库的类型声明，定义 QR 码生成选项和 `QRious` 类。

## 修改 StorageSchema 的注意事项

修改 `StorageSchema` 时，必须：

1. 在 `utils/chromeStorage.ts` 添加版本迁移函数
2. 在测试中覆盖迁移场景
