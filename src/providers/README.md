# providers/

React Context Provider 目录，为整个应用提供全局共享状态。

## 文件说明

| 文件                    | 用途                   |
| ----------------------- | ---------------------- |
| `AppRoot.tsx`           | 应用根 Provider 组合器 |
| `RouterProvider.tsx`    | 路由 Context Provider  |
| `ThemeModeProvider.tsx` | 主题模式 Provider      |

## AppRoot.tsx

应用根 Provider 组合器，按顺序包裹：

```
React.StrictMode
  └── ThemeModeProvider
        └── RouterProvider
              └── children
```

## RouterProvider.tsx

路由 Context Provider，管理：

- **当前页面**：`currentPage`（`PageType`）
- **可见页面列表**：`visiblePages`
- **页面排序**：`pageOrder`
- **加载状态**：`isLoaded`

核心特性：

- 通过 `chrome.storage` 持久化路由状态
- 使用 `localStorage` 快照实现首屏 0 闪烁
- 支持 popup/sidepanel/tab 三种入口的独立路由同步（通过 `syncKey`、`visiblePagesKey`、`pageOrderKey` 配置）
- 处理右键菜单待处理数据的路由跳转
- 监听 `chrome.storage.onChanged` 实现跨端同步

导出：

- `RouterProvider` 组件
- `useRouter()` Hook — 获取 `currentPage`、`visiblePages`、`pageOrder`、`navigateTo`、`goHome` 等

## ThemeModeProvider.tsx

主题模式 Provider，管理：

- **主题模式**：`light` / `dark` / `system`
- **解析后的主题**：`resolvedTheme`（`light` / `dark`）

核心特性：

- 使用 `localStorage` 快照实现首屏 0 闪烁
- 监听系统级暗色模式变化（`matchMedia`）
- 通过 `chrome.storage` 跨端同步主题偏好
- 自动在 `document.documentElement` 上切换 `dark` class

导出：

- `ThemeModeProvider` 组件
- `useThemeMode()` Hook — 获取 `themeMode`、`resolvedTheme`、`setThemeMode`
