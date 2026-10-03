# src/

源代码根目录，按职责划分为以下子目录。

## 目录说明

| 目录           | 用途                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `config/`      | 功能配置：`features.ts` 导出、`featureMeta.ts` 元数据定义、`pageLoaders/` 懒加载                 |
| `entrypoints/` | 扩展入口点：`popup/`、`background.ts`、`content.ts`、`rightClickRestorer.content.ts`             |
| `layout/`      | 应用壳层布局（FeatureNav 右侧导航、主题切换），详见 [layout/README.md](./layout/README.md)       |
| `pages/`       | 功能页面组件（懒加载），遵循 UI + Hook 分离模式                                                  |
| `components/`  | 可复用 UI 组件，详见 [components/README.md](./components/README.md)                              |
| `providers/`   | React Context Provider（Router、Theme），详见 [providers/README.md](./providers/README.md)       |
| `hooks/`       | 全局自定义 Hooks                                                                                 |
| `utils/`       | 工具函数与服务抽象，详见 [utils/README.md](./utils/README.md)                                    |
| `types/`       | TypeScript 类型声明（`StorageSchema`、`PageType` 等），详见 [types/README.md](./types/README.md) |
| `lib/`         | 通用工具函数（`cn` 等），详见 [lib/README.md](./lib/README.md)                                   |
| `styles/`      | 全局样式：`shell.css`（应用壳层）、`pages.css`（功能页面）                                       |

## styles/

全局样式按 Tailwind 拆分配置组织：

- **`shell.css`** — 应用壳层样式入口（对应 `tailwind.shell.config.js`）：包含 `@tailwind base/components/utilities` 指令，以及 shadcn/ui 语义化 CSS 变量（`--background`、`--primary`、`--muted`、`--border`、`--radius` 等）在 `:root`（亮色）与 `.dark`（暗色）下的两套完整定义
- **`pages.css`** — 功能页面样式入口（对应 `tailwind.pages.config.js`）

根目录的 `tailwind.config.js` 仅转发 `tailwind.shell.config.js`，实际配置拆分为 `tailwind.shell.config.js` / `tailwind.pages.config.js` / `tailwind.shared.js`。

## 修改注意事项

- 修改 CSS 变量会影响所有使用 shadcn/ui 语义化 token 的组件
- 新增颜色变量需同时在 `:root` 和 `.dark` 中定义
- 避免在组件中硬编码颜色值，应使用 CSS 变量或 Tailwind 的语义化类名
