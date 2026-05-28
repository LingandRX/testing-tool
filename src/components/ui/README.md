# components/ui/

shadcn/ui 基础原子组件目录，基于 Radix UI 原语 + Tailwind CSS 实现。

## 组件列表

| 组件           | 用途                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `button.tsx`   | 按钮组件，支持 `default/destructive/outline/secondary/ghost/link` 变体和 `default/sm/lg/icon` 尺寸 |
| `input.tsx`    | 标准输入框，统一的 ring/focus 样式                                                                 |
| `select.tsx`   | 下拉选择组件，包含 Trigger、Content、Item 等子组件                                                 |
| `dialog.tsx`   | 对话框组件，包含 Overlay、Content、Header、Footer、Title、Description                              |
| `checkbox.tsx` | 复选框组件                                                                                         |
| `label.tsx`    | 标签组件                                                                                           |
| `switch.tsx`   | 开关组件                                                                                           |
| `badge.tsx`    | 徽章组件，支持 `default/secondary/destructive/outline` 变体                                        |

## 使用方式

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

## 添加新组件

使用 shadcn/ui CLI 添加新组件：

```bash
npx shadcn-ui@latest add <component-name>
```

组件配置在项目根目录的 `components.json` 中定义。
