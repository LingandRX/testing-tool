import { ReactNode, useMemo } from 'react';
import { getEntryPointType } from '@/config/features';
import { cn } from '@/lib/utils'; // shadcn 核心类名合并工具

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 要显示的图标组件 */
  icon: ReactNode;
  /**
   * 图标的颜色，支持：
   * 1. Tailwind 颜色类名 (如 'text-blue-500', 'text-primary') -> 推荐
   * 2. 原生颜色值 (如 '#3b82f6')
   */
  iconColor?: string;
  /** 主标题文本 */
  title: string;
  /** 副标题文本（可选） */
  subtitle?: string;
  /** 在标题右侧显示的徽章/标签组件（可选） */
  badge?: ReactNode;
  /** 覆盖图标容器的类名 */
  iconClassName?: string;
  /** 覆盖主标题的类名 */
  titleClassName?: string;
  /** 覆盖副标题的类名 */
  subtitleClassName?: string;
}

export default function PageHeader({
  icon,
  iconColor = 'text-blue-500', // 默认改用类名，若需保持 Hex 可写 "#3b82f6"
  title,
  subtitle,
  badge,
  iconClassName,
  titleClassName,
  subtitleClassName,
  className,
  ...props
}: PageHeaderProps) {
  const entryPointType = useMemo(() => getEntryPointType(), []);

  // 扩展环境判断：如果是 popup 形式则不渲染头部
  if (entryPointType === 'popup') {
    return null;
  }

  // 判断传入的是否是 Hex/RGB 等原生颜色值
  const isRawColor =
    iconColor.startsWith('#') || iconColor.startsWith('rgb') || iconColor.startsWith('hsl');

  return (
    <div className={cn('flex items-center gap-3 mb-6', className)} {...props}>
      {/* 图标容器 */}
      <div
        className={cn(
          'p-2 rounded-lg flex items-center justify-center shrink-0',
          // 如果不是原生颜色，直接当作 Tailwind 类名注入
          !isRawColor && iconColor,
          iconClassName,
        )}
        style={
          isRawColor
            ? {
                color: iconColor,
                // 使用 CSS inline 变量或 color-mix 安全处理透明度，不再暴力拼接 "15"
                backgroundColor: `color-mix(in srgb, ${iconColor} 8%, transparent)`,
              }
            : undefined
        }
      >
        {/* 确保图标大小可控，通过子元素选择器约束 SVG 宽高 */}
        <div className="[&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      </div>

      {/* 标题区域 */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* 标题行（含徽章） */}
        <div className="flex justify-between items-center gap-2">
          <h1
            className={cn(
              'text-base font-extrabold tracking-tight leading-tight text-foreground truncate',
              titleClassName,
            )}
          >
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* 副标题 - 使用 p 标签（block）保证换行 */}
        {subtitle && (
          <p
            className={cn(
              'text-xs font-semibold text-muted-foreground truncate',
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
