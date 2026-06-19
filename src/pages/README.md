# pages/

功能页面组件目录，每个子目录对应一个工具页面。

## 目录结构约定

典型页面遵循 **UI + Hook 分离** 模式：

```
pages/FeatureName/
├── index.tsx              # 页面 UI（纯展示，使用 shadcn/ui 组件）
├── useFeatureName.ts      # 业务逻辑 Hook（状态管理 + 转换逻辑）
├── constants.ts           # 常量定义（可选）
├── SubComponent.tsx       # 子组件（可选）
└── __tests__/             # 测试文件
    └── index.test.tsx
```

## 页面列表

### Dashboard/

仪表盘首页，以卡片网格展示所有可见工具，支持点击导航。

| 文件        | 用途                       |
| ----------- | -------------------------- |
| `index.tsx` | 页面组件，渲染工具卡片网格 |

### Timestamp/

时间戳转换工具，支持秒/毫秒级互转、多时区选择、实时时钟。

| 文件                       | 用途                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| `index.tsx`                | 页面 UI                                                           |
| `useTimestampConverter.ts` | 业务逻辑 Hook，包含转换模式、输入、单位、时区状态和响应式计算管线 |
| `LiveClock.tsx`            | 实时时钟子组件，`React.memo` 优化                                 |
| `ResultView.tsx`           | 转换结果展示子组件                                                |
| `constants.ts`             | 时区列表等常量                                                    |

### StorageCleaner/

浏览器存储清理工具，支持 Cookie/LocalStorage/SessionStorage/IndexedDB/Cache/SW 清理。

| 文件                        | 用途           |
| --------------------------- | -------------- |
| `index.tsx`                 | 页面 UI        |
| `useStorageCleaner.ts`      | 业务逻辑 Hook  |
| `StorageOptionsGrid.tsx`    | 清理选项网格   |
| `StorageCleanerConfirm.tsx` | 清理确认对话框 |
| `AutoRefreshToggle.tsx`     | 自动刷新开关   |
| `ErrorDisplay.tsx`          | 错误展示组件   |
| `CleaningResult.tsx`        | 清理结果展示   |
| `OptionItem.tsx`            | 单个选项组件   |

### QrCode/

二维码工具，支持生成（URL→QR）和解析（QR→URL）。

| 文件/目录     | 用途             |
| ------------- | ---------------- |
| `index.tsx`   | 页面 UI          |
| `types.ts`    | 类型定义         |
| `contexts/`   | Context Provider |
| `hooks/`      | 业务逻辑 Hooks   |
| `components/` | 子组件           |

### TextStatistics/

文本统计工具，实时计算字符数、单词数、行数、字节大小。

| 文件        | 用途                                          |
| ----------- | --------------------------------------------- |
| `index.tsx` | 页面组件，集成 `TextInputArea` 和统计结果展示 |

### Jwt/

JWT 解析工具，解码 Header/Payload/Signature。

| 文件/目录     | 用途             |
| ------------- | ---------------- |
| `index.tsx`   | 页面 UI          |
| `types.ts`    | 类型定义         |
| `contexts/`   | Context Provider |
| `hooks/`      | 业务逻辑 Hooks   |
| `components/` | 子组件           |

### JsonTools/

JSON 工具集：差异比较、格式化、YAML/TOML/Minify 转换。

| 文件                     | 用途                         |
| ------------------------ | ---------------------------- |
| `index.tsx`              | 页面入口，子模式切换         |
| `types.ts`               | 类型定义                     |
| `diffEngine.ts`          | 差异比较引擎                 |
| `JsonDiffInput.tsx`      | JSON 输入组件                |
| `DiffResult.tsx`         | 差异结果展示                 |
| `DiffNavigator.tsx`      | 差异导航器                   |
| `JsonFormatSection.tsx`  | 格式化区域                   |
| `JsonConvertSection.tsx` | 转换区域（YAML/TOML/Minify） |
| `JsonTree.tsx`           | JSON 树形展示                |

### Base64Converter/

Base64 编解码工具，支持文本/文件/图片三种模式。

| 文件                         | 用途                  |
| ---------------------------- | --------------------- |
| `index.tsx`                  | 页面入口，子模式切换  |
| `useBase64Converter.ts`      | 业务逻辑 Hook         |
| `TextMode.tsx`               | 文本模式              |
| `Base64ConverterSection.tsx` | 文件/图片通用转换区域 |

### MarkdownToHtml/

Markdown 转 HTML 工具，支持分栏/预览/源码三种视图模式。

### HtmlToMarkdown/

HTML 转 Markdown 工具，支持分栏/预览/Markdown 三种视图模式。

### RightClickRestorer/

右键菜单恢复工具，解除网站对右键的限制。

| 文件                       | 用途          |
| -------------------------- | ------------- |
| `index.tsx`                | 页面 UI       |
| `useRightClickRestorer.ts` | 业务逻辑 Hook |

## 新增页面

1. 在 `types/storage.d.ts` 添加 `PageType` 联合类型成员
2. 在 `config/features.tsx` 的 `FEATURES` 数组添加配置
3. 在 `pages/` 创建页面目录（遵循上述结构）
4. 在 `i18n/locales/{zh,en}/features.json` 添加翻译
5. 如需新权限，更新 `wxt.config.ts`
6. 添加对应的单元测试
