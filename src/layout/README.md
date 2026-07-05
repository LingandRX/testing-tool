# layout/

应用壳层布局组件目录，存放与扩展入口（popup / sidepanel / tab）绑定的布局 UI，与 `components/` 中的通用可复用组件区分。

## 组件列表

| 目录          | 用途                                       |
| ------------- | ------------------------------------------ |
| `FeatureNav/` | 右侧功能导航栏：工具图标切换、底部主题切换 |

## 目录结构

遵循与 `pages/` 相同的 UI + Hook 分离模式：

```
layout/FeatureNav/
├── index.tsx              # 垂直图标导航 + 底部主题按钮
├── useFeatureNav.ts       # 读路由状态，暴露 navItems / navigateTo
├── useThemeToggle.ts      # 主题模式循环切换逻辑
├── ThemeToggleButton.tsx  # 主题切换按钮
├── resolveNavFeatures.ts  # 功能列表解析
└── __tests__/
    └── index.test.tsx
```
