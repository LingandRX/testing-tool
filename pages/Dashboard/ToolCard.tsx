import type { ComponentType } from 'react';
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { PaletteColorKey } from '@/config/features';
import { cn } from '@/lib/utils';

const PALETTE_COLORS: Record<PaletteColorKey, string> = {
  primary: '13, 148, 136', // teal
  success: '22, 163, 74', // green
  warning: '217, 119, 6', // amber (存储清理的橙色轴)
  error: '220, 38, 38', // red
  secondary: '147, 51, 2 purple',
  info: '37, 99, 235', // blue
};

export interface ToolCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  snapshot?: React.ReactNode;
  colorKey: PaletteColorKey;
  icon: ComponentType<LucideProps>;
  onNavigate: () => void;
}

export default function ToolCard({
  title,
  description,
  snapshot,
  colorKey,
  icon: IconComponent,
  onNavigate,
  className,
  ...props
}: ToolCardProps) {
  const rgbValues = PALETTE_COLORS[colorKey];

  return (
    <div
      style={{
        ['--tool-color' as string]: rgbValues,
      }}
      /* 💡 核心修复点：
        - 坚决不用 h-full 或固定高度，锁死 h-auto（高度自适应流），配合 py-4 px-4 牢牢把内容包裹在卡片体内。
        - 废除原先会乱飘的内联 style 属性擦写，全权放权给 Tailwind 的声明式 hover 变体。
      */
      className={cn(
        'group relative rounded-xl border border-border/70 bg-card text-card-foreground p-4 h-auto flex flex-col items-stretch justify-start gap-3 shadow-sm select-none box-border',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'hover:bg-muted/30',
        'hover:border-[rgba(var(--tool-color),0.45)]',
        'hover:shadow-[0_8px_24px_-8px_rgba(var(--tool-color),0.14)] dark:hover:shadow-[0_8px_30px_-10px_rgba(var(--tool-color),0.25)]',
        className,
      )}
      {...props}
    >
      {/* 上半部分：核心信息交互排版轴 */}
      <div className="flex items-center justify-between w-full relative min-w-0 min-h-[44px]">
        <div className="flex gap-3 items-center min-w-0 flex-1 pr-2">
          {/* 左侧圆形图标容器 */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors duration-300',
              'bg-[rgba(var(--tool-color),0.08)] dark:bg-[rgba(var(--tool-color),0.12)]',
              'text-[rgb(var(--tool-color))]',
            )}
          >
            <IconComponent className="h-5 w-5 shrink-0" />
          </div>

          {/* 中间文字描述区：利用 flex-1 min-w-0 防御文本过长发生恶性撑开 */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h4 className="font-bold text-sm tracking-tight text-foreground leading-snug">
              {title}
            </h4>
            {description && (
              <p className="text-[11px] font-medium text-muted-foreground/90 mt-0.5 leading-normal break-words">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* 右侧指示小箭头 */}
        <div className="text-muted-foreground/40 group-hover:text-[rgb(var(--tool-color))] p-1 shrink-0 transition-all duration-300 ease-in-out group-hover:translate-x-0.5">
          <ChevronRight className="h-4 w-4" />
        </div>

        {/* 覆盖整个上半部分的绝对定位隐形跳转层（A11y 无障碍标准合规） */}
        <button
          type="button"
          onClick={onNavigate}
          aria-label={`进入 ${title}`}
          className="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none opacity-0 focus-visible:outline-none"
        />
      </div>

      {/* 下半部分：未来的动态预览沙箱独立承载区 */}
      {snapshot != null && (
        <div className="mt-1 pt-3 border-t border-dashed border-border/80 w-full relative z-10 select-text">
          {snapshot}
        </div>
      )}
    </div>
  );
}

ToolCard.displayName = 'ToolCard';
