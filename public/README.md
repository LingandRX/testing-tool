# public/

静态资源目录，存放无需构建处理的文件，会被直接复制到输出目录。

## 文件说明

| 文件/目录      | 用途                             |
| -------------- | -------------------------------- |
| `icon/`        | 扩展图标，提供多种尺寸           |
| `icon/16.png`  | 16×16 图标（工具栏）             |
| `icon/32.png`  | 32×32 图标                       |
| `icon/48.png`  | 48×48 图标（扩展管理页）         |
| `icon/96.png`  | 96×96 图标                       |
| `icon/128.png` | 128×128 图标（Chrome Web Store） |
| `_locales/`    | Chrome 扩展本地化资源            |

## 本地化资源

项目使用 Chrome 扩展标准 `chrome.i18n`，默认语言在 `wxt.config.ts` 中配置为 `zh_CN`。

| 文件/目录                      | 用途                                               |
| ------------------------------ | -------------------------------------------------- |
| `_locales/zh_CN/messages.json` | 默认中文语言包，包含功能名、描述、按钮、提示等翻译 |

添加或修改文案时：

- 使用 Chrome 扩展消息格式：`"key": { "message": "文本" }`
- key 使用下划线分隔，例如 `testDataGenerator_title`
- 代码中通过 `useI18n` 或 `getMessage` 读取，不要新增 `i18n/locales` 目录

## 注意事项

- 修改图标后需同步更新 `wxt.config.ts` 中的 manifest 配置
- 图标格式推荐使用 PNG，确保透明背景
- 修改 `_locales` 后需确认 `manifest.default_locale` 与语言目录名一致
