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
- **最近使用工具**：`recentlyUsedTools`（最多 3 项，供 TopBar 搜索历史使用）
- **加载状态**：`isLoaded`

核心特性：

- 通过 `chrome.storage` 持久化路由状态
- 使用 `localStorage` 快照（`snapshot/{key}`）实现首屏 0 闪烁
- 支持 popup/sidepanel/tab 三种入口的独立路由同步（通过 `syncKey`、`visiblePagesKey`、`pageOrderKey` 配置）
- 处理右键菜单待处理数据的路由跳转
- 监听 `chrome.storage.onChanged` 实现跨端同步

### 初始化与防覆盖

异步加载 storage 期间，快照值会作为首屏初始 state。加载完成后：

1. **`canPersistRef`**：仅在 `loadInitialData` 成功后才设为 `true`，在此之前不会向 storage 写入，避免默认值覆盖已有路由
2. **`hasUserNavigatedRef`**：用户调用 `navigateTo` / `goHome` 后设为 `true`，异步加载结果不会覆盖用户已选页面
3. **`mergeWithDefaults`**：将已保存的页面列表与默认列表合并，新增功能会自动出现在列表末尾

导出：

- `RouterProvider` 组件
- `useRouter()` Hook — 获取 `currentPage`、`visiblePages`、`pageOrder`、`recentlyUsedTools`、`navigateTo`、`goHome` 等

## ThemeModeProvider.tsx

主题模式 Provider，管理：

- **主题模式**：`light` / `dark` / `system`
- **解析后的主题**：`resolvedMode`（`light` / `dark`）

核心特性：

- 使用 `themeSnapshot.ts` 读写 `localStorage` 快照，实现首屏 0 闪烁
- 监听系统级暗色模式变化（`matchMedia`）
- 通过 `chrome.storage` 跨端同步主题偏好
- 自动在 `document.documentElement` 上切换 `dark` class
- **`hasUserSetMode`**：用户主动切换主题后，异步 storage 加载不会覆盖用户选择

导出：

- `ThemeModeProvider` 组件
- `useThemeMode()` Hook — 获取 `mode`、`resolvedMode`、`setMode`
