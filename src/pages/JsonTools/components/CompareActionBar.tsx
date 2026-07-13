import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import DiffNavigator from './DiffNavigator';
import { cn } from '@/lib/utils';

export interface CompareActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  canCompare: boolean;
  onCompare: () => void;
  hasCompared: boolean;
  total: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  resultsVisible?: boolean;
  onShowResults?: () => void;
}

export default function CompareActionBar({
  canCompare,
  onCompare,
  hasCompared,
  total,
  currentIndex,
  onPrev,
  onNext,
  resultsVisible = true,
  onShowResults,
  className,
  ...props
}: CompareActionBarProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center py-0.5', className)} {...props}>
      {hasCompared ? (
        resultsVisible ? (
          <DiffNavigator
            total={total}
            currentIndex={currentIndex}
            onPrev={onPrev}
            onNext={onNext}
          />
        ) : (
          <button
            type="button"
            onClick={onShowResults}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            查看对比结果
          </button>
        )
      ) : (
        <button
          type="button"
          disabled={!canCompare}
          onClick={onCompare}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted',
            canCompare
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed bg-muted text-muted-foreground',
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Compare A &amp; B
        </button>
      )}
    </div>
  );
}
