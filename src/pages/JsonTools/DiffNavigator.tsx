import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

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
  const { t } = useI18n('jsonDiff');

  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

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
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

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
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
