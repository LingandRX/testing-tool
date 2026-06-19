# layout/

应用壳层布局组件目录，存放与扩展入口（popup / sidepanel / tab）绑定的布局 UI，与 `components/` 中的通用可复用组件区分。

## 组件列表

| 目录      | 用途                                                           |
| --------- | -------------------------------------------------------------- |
| `TopBar/` | 顶部导航栏：搜索（含历史记录）、主题切换、返回导航、标签页打开 |

## 目录结构

遵循与 `pages/` 相同的 UI + Hook 分离模式：

```
layout/TopBar/
├── index.tsx       # 布局 UI
├── useTopBar.ts    # 业务逻辑 Hook
├── constants.ts    # 常量
└── __tests__/
    └── index.test.tsx
```
