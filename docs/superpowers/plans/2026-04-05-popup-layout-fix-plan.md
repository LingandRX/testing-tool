# 实施计划：修复 Popup 布局与滚动条样式

## 1. 目标

按照设计规范实施固定高度布局与极简滚动条，确保扩展弹窗显示稳定且美观。

## 2. 实施步骤

### 2.1 CSS 核心样式更新 (`entrypoints/popup/App.css`)

1. **视口锁定**: 更新 `html`, `body` 样式，固定 `width: 400px`, `height: 600px`。
2. **根容器改造**:
   - 将 `.app` 修改为 Flex 容器：`display: flex; flex-direction: column; height: 100%; overflow: hidden;`。
   - 移除 `margin: 0 auto;` 和 `min-height: 100%;`。
3. **滚动条变量与全局注入**:
   - 在 `:root` 中定义 `--sb-` 开头的滚动条样式变量。
   - 使用 `*::-webkit-scrollbar` 系列伪元素定义全局极简滚动条。

### 2.2 React 结构重构 (`entrypoints/popup/App.tsx`)

1. **注入滚动容器**: 在 `nav-container` 之后，将所有的页面渲染（`TimestampPage`, `StorageCleanerPage`）包裹在一个统一的 `Box` 中。
2. **设置容器样式**: 给该 `Box` 设置 `sx={{ flex: 1, overflowY: 'auto', scrollbarGutter: 'stable' }}`。

### 2.3 质量保障

1. **Lint 检测**: 运行 `npm run lint` 检查样式变量引用和 JSX 结构。
2. **类型检查**: 运行 `npm run compile` 验证 MUI 组件属性。

## 3. 验证计划

- 手动切换导航栏，观察窗口尺寸是否维持在 600px。
- 在“存储清理”页面展开所有选项，观察右侧是否出现极细滚动条，且不会挤压内容。
