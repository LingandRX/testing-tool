# lib/

通用库工具目录，存放与业务无关的底层工具函数。

## 文件说明

| 文件       | 用途                                 |
| ---------- | ------------------------------------ |
| `utils.ts` | `cn()` 函数 — shadcn/ui 标准工具函数 |

## cn()

组合 `clsx` + `tailwind-merge`，用于合并和去重 Tailwind CSS 类名：

```typescript
import { cn } from '@/lib/utils';

// 条件类名 + 合并外部 className
<div className={cn(
  'flex items-center gap-3 px-3',
  isActive && 'bg-primary text-primary-foreground',
  className,
)}>
```

所有需要动态合并 Tailwind 类名的场景都应使用 `cn()`，而非手动拼接字符串。
