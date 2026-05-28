# entrypoints/

WXT 框架要求的扩展生命周期入口点，对应 Chrome Extension 的各个上下文。

## 入口文件

| 文件                            | 用途                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `background.ts`                 | Service Worker 入口：注册右键菜单、监听菜单点击、处理消息通信、管理侧边栏状态、注入主环境脚本 |
| `content.ts`                    | Content Script 入口：注入所有页面（`<all_urls>`），在 `document_end` 时初始化消息处理器       |
| `rightClickRestorer.content.ts` | 专用 Content Script：处理右键菜单恢复功能，注入浮动状态徽章                                   |

## 子目录

### popup/

Popup 弹窗页面（点击扩展图标弹出）。

| 文件         | 用途                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `index.html` | HTML 入口                                                                      |
| `main.tsx`   | React 挂载点                                                                   |
| `App.tsx`    | 根组件，组装 `RouterProvider` + `TopBar` + `ErrorBoundary` + `RouterContainer` |

### sidepanel/

侧边栏页面，结构与 popup 类似，额外通知 background 侧边栏开启/关闭状态。

### options/

设置页面，支持：

- 拖拽排序功能顺序（`@dnd-kit`）
- 功能可见性管理（显示/隐藏）
- Popup/Sidepanel/Tab 三种模式独立配置

### content/

Content Script 内部分模块：

| 文件                    | 用途                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| `messageHandler.ts`     | 消息处理器初始化入口                                                |
| `contextMenuHandler.ts` | 右键菜单点击事件处理，执行时间戳转换/文本统计并通过 UI Popover 展示 |
| `uiPopover.ts`          | 在页面中注入浮层 Popover UI，展示右键菜单操作结果                   |

## 架构说明

- `background.ts` 是扩展的核心协调者，处理跨上下文通信
- `content.ts` 注入到所有页面，负责接收和处理来自 background 的消息
- `popup/`、`sidepanel/`、`options/` 共享同一套页面组件（来自 `pages/`），通过 `RouterProvider` 的不同配置实现独立路由
