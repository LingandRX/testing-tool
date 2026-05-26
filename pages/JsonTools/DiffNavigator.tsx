import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils'; // 1. 引入标准的 shadcn 工具函数

export interface DiffNavigatorProps extends React.HTMLAttributes<HTMLDivElement> {
  total: number;
  /** 0-based index */
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DiffNavigator({
  total,
  currentIndex,
  onPrev,
  onNext,
  className,
  ...props
}: DiffNavigatorProps) {
  const { t } = useLazyTranslation('jsonDiff');

  // 计算当前的边界禁用状态守卫
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  // 2. 空状态面板：对齐 shadcn 规范的中性低调卡片
  if (total === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-3 px-4 py-2 rounded-lg border border-border bg-muted/30 select-none',
          className,
        )}
        {...props}
      >
        <span className="text-xs font-semibold text-muted-foreground/90">
          {t('jsonDiff:noDiffs')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // 3. 完美适配暗黑模式：
        // 废除 bg-primary/10，采用标准的低阻尼中性色 bg-secondary/60 配合 border-border/80，
        // 在任何主题皮肤下都能呈现出高级的暗钛金控制栏质感。
        'inline-flex items-center justify-center gap-3 px-3 h-9 rounded-md border border-border/80 bg-secondary/60 shadow-sm',
        className,
      )}
      {...props}
    >
      {/* 上一处差异按钮 */}
      <button
        type="button"
        disabled={isFirst}
        aria-label={t('jsonDiff:previousDiff')}
        onClick={onPrev}
        className={cn(
          'p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-30', // 4. 边界拦截：触顶时优雅淡化并锁死点击
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* 计数看板：强制等宽防止数字长短不一时产生宽度挤压跳动 */}
      <span className="text-xs font-bold font-mono min-w-[54px] text-center text-foreground/90 tabular-nums select-none">
        {currentIndex + 1} <span className="text-muted-foreground/60 font-sans mx-0.5">/</span>{' '}
        {total}
      </span>

      {/* 下一处差异按钮 */}
      <button
        type="button"
        disabled={isLast}
        aria-label={t('jsonDiff:nextDiff')}
        onClick={onNext}
        className={cn(
          'p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-30', // 4. 边界拦截：触底时优雅淡化并锁死点击
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
