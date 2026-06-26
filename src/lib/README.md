# lib/

通用库工具目录，存放与业务无关的底层工具函数。

## 文件说明

| 文件/目录       | 用途                                             |
| --------------- | ------------------------------------------------ |
| `utils.ts`      | `cn()` 函数 — shadcn/ui 标准工具函数             |
| `generators/`   | 测试数据生成器内置生成器库和分类注册表           |

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

## generators/

测试数据生成器的核心生成器库，供 `src/workers/generator.worker.ts` 在后台线程中按字段配置生成数据。

| 文件          | 用途                                             |
| ------------- | ------------------------------------------------ |
| `index.ts`    | 聚合所有生成器，导出分类、查找和搜索函数         |
| `personal.ts` | 个人信息生成器（姓名、邮箱、手机号、身份证等）   |
| `business.ts` | 业务数据生成器（订单号、价格、日期、状态等）     |
| `technical.ts`| 技术数据生成器（UUID、IPv4、URL）                |
| `basic.ts`    | 基础类型生成器（整数、浮点数、布尔值、字符串）   |
| `types.ts`    | 生成器库内部类型与通用选项                       |

使用示例：

```typescript
import { getGeneratorById, searchGenerators } from '@/lib/generators';

const generator = getGeneratorById('chineseName');
const value = generator?.generate({});
const matched = searchGenerators('uuid');
```

约束：

- 新增生成器必须实现 `GeneratorDefinition`，并加入所属分类文件的导出列表。
- 需要唯一值或大批量稳定输出时，优先实现 `generateAtIndex(params, index)`。
- 新增分类时同步更新 `generatorCategories`，并确保 `GeneratorSelector` 能展示该分类。
