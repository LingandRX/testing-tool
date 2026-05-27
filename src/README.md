# src/

源码目录，存放全局样式定义。

## 文件说明

| 文件        | 用途              |
| ----------- | ----------------- |
| `index.css` | 全局 CSS 入口文件 |

## index.css

全局样式入口，包含：

- **Tailwind 指令**：`@tailwind base/components/utilities`
- **shadcn/ui CSS 变量**：定义 `--background`、`--primary`、`--destructive`、`--card`、`--muted`、`--accent`、`--border`、`--ring` 等语义化颜色变量
- **主题色值**：`:root`（亮色）和 `.dark`（暗色）两套完整的颜色定义
- **圆角变量**：`--radius` 定义全局圆角大小

## 修改注意事项

- 修改 CSS 变量会影响所有使用 shadcn/ui 语义化 token 的组件
- 新增颜色变量需同时在 `:root` 和 `.dark` 中定义
- 避免在组件中硬编码颜色值，应使用 CSS 变量或 Tailwind 的语义化类名
