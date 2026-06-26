# utils/

通用工具函数和 React 自定义 Hooks 目录，与具体页面解耦。

## 工具函数

| 文件                 | 用途                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `chromeStorage.ts`   | Chrome Storage API 封装：类型安全的 `StorageUtils` 类，提供 `get/set/remove` 方法                   |
| `chromeTabs.ts`      | Chrome Tabs API 封装：获取活动标签页、获取域名、在新标签页打开扩展页面                              |
| `clipboard.ts`       | 剪贴板操作：`copyTextToClipboard`（文本）、`copyImageToClipboard`（图片）                           |
| `messages.ts`        | 扩展消息通信：基于 `@webext-core/messaging`，定义 `MessageAction` 枚举和 `ProtocolMap` 类型安全映射 |
| `contextMenu.ts`     | 右键菜单配置与操作：定义菜单项、创建菜单、解析点击事件、ID→PageType 映射                            |
| `base64Converter.ts` | Base64 编解码：文本↔Base64、文件↔Base64、图片预览，定义文件大小限制和图像 MIME 类型                 |
| `jwt.ts`             | JWT 解析：Base64URL 解码、解析 Header/Payload/Signature、JSON 格式化输出                            |
| `jsonFormatter.ts`   | JSON 格式化/压缩：支持缩进、按键排序、minify                                                        |
| `jsonToYaml.ts`      | JSON→YAML 转换                                                                                      |
| `jsonToToml.ts`      | JSON→TOML 转换                                                                                      |
| `qrCodeParser.ts`    | 二维码解析：基于 `qr-scanner` 库从文件中解析二维码                                                  |
| `storageCleaner.ts`  | 存储清理：获取当前标签页、检测受限 URL、计算 Cookie/Storage 大小、清理操作                          |
| `textStatistics.ts`  | 文本统计：使用 `Intl.Segmenter` 计算字符数/单词数/行数/字节大小                                     |
| `format.ts`          | 通用格式化：`formatBytes` 将字节转为可读字符串（B/KB/MB/GB/TB）                                     |
| `dayjs.ts`           | Day.js 初始化：扩展 UTC、Timezone、RelativeTime 插件，加载中文本地化                                |
| `chromeI18n.ts`      | Chrome `chrome.i18n` 包装：提供 `getMessage` 和兼容 React 使用的 `useI18n` Hook                     |
| `ruleStorage.ts`     | 测试数据生成器规则存储：基于 `localStorage` 的 CRUD、搜索、导入/导出和数量限制                      |
| `dataExporter.ts`    | 测试数据导出：JSON/CSV 转换、文件下载和复制到剪贴板                                                 |
| `rightClickInjection.ts` | 右键恢复注入脚本：在页面上下文恢复 contextmenu/copy/paste 等事件默认行为                        |

## 自定义 Hooks

| 文件                    | 用途                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `useStorageState.ts`    | Chrome Storage 状态 Hook：类似 `useState`，值自动同步到 `chrome.storage`，使用 `localStorage` 快照消除首屏闪烁 |
| `useContextMenuData.ts` | 右键菜单数据 Hook：从 storage 读取待处理数据，匹配 featureKey 后消费并触发回调                                 |
| `useDebounce.ts`        | 防抖 Hook：对值进行延迟更新，避免频繁触发                                                                      |

## 使用约定

- 工具函数使用**命名导出**（`export function xxx()`）
- 工具层不直接展示 Toast；可恢复错误返回可判断结果，需要抛出的解析/转换错误由页面 Hook 或 UI 层捕获
- Hook 使用 `use` 前缀命名，定义返回值接口类型
- 存储操作使用 `chromeStorage.ts` 的 `storageUtil` 封装，不要直接调用 `chrome.storage`
- 消息通信使用 `messages.ts` 的 `sendMessage`/`onMessage`，不要使用原生 `chrome.runtime.sendMessage`
