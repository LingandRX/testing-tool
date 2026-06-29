# components/

通用业务组件目录，存放跨页面复用的 UI 组件，与具体工具页面解耦。

## 组件列表

| 组件                    | 用途                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| `RouterContainer.tsx`   | 路由容器，根据当前路由动态渲染对应页面组件，集成错误边界和骨架屏               |
| `SwitchButtonGroup.tsx` | 通用切换按钮组，支持 `small/medium/large` 三种尺寸，用于页面子模式切换         |
| `EmptyPlaceholder.tsx`  | 虚线边框空状态占位，统一工具页「暂无结果」提示样式                             |
| `TextInputArea.tsx`     | 增强文本输入区域，支持校验规则、工具栏操作、字符计数、清空                     |
| `CopyButton.tsx`        | 一键复制按钮：复制成功后 1.5s 内切换为 Check 图标并应用 `text-emerald-500`；空内容/失败时 `toast` 提示 |
| `ImageUploader.tsx`     | 图片上传组件，支持拖拽上传、文件选择和预览                                     |
| `QrCodePreview.tsx`     | 二维码预览组件，展示生成的二维码图片，提供复制和下载操作                       |
| `DecodeResultPaper.tsx` | Base64 解码结果展示面板，显示 MIME 类型、文件大小、文件名输入和下载按钮        |
| `GlobalSnackbar.tsx`    | 全局消息提示组件 + Context Provider，支持受控/Hook/全局单例三种使用方式        |
| `ErrorBoundary.tsx`     | 全局错误边界（类组件），捕获子组件树 JS 错误并展示友好错误页面                 |
| `PageErrorBoundary.tsx` | 页面级错误边界，适配 shadcn 暗黑模式，支持 `resetKey` 自动恢复                 |
| `PageSkeleton.tsx`      | 页面骨架屏，提供 `dashboard` 和 `tool` 两种变体，用于 Suspense fallback        |

## 使用约定

- 优先使用 `components/ui/` 下的 shadcn/ui 基础组件
- 组件使用 `cn()` 合并 Tailwind 类名，支持 `className` 透传
- 需要 memo 优化的组件使用 `React.memo` + `displayName`
- 需要 ref 转发的组件使用 `React.forwardRef` + `displayName`
