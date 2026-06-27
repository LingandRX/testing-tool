import React from 'react';
import { CopyButton } from '@/components/CopyButton';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import { cn } from '@/lib/utils';

interface ResultViewProps extends React.HTMLAttributes<HTMLDivElement> {
  result: string;
  showEmptyPlaceholder?: boolean;
}

export default function ResultView({
  result,
  showEmptyPlaceholder = false,
  className,
  ...props
}: ResultViewProps) {
  if (!result && !showEmptyPlaceholder) return null;

  if (!result) {
    return (
      <EmptyPlaceholder
        className={cn('flex-1 min-h-[320px]', className)}
        messageClassName="text-sm font-medium text-muted-foreground max-w-none"
        {...props}
      >
        请输入并点击转换
      </EmptyPlaceholder>
    );
  }

  return (
    <div className={cn('flex flex-col w-full', className)} {...props}>
      <span className="block text-muted-foreground/90 mb-2.5 text-xs font-semibold tracking-wider uppercase">
        转换结果
      </span>

      <div className="bg-card text-card-foreground border border-border p-4 sm:p-5 rounded-xl relative shadow-sm flex justify-between items-center gap-4 focus-within:ring-1 focus-within:ring-ring">
        <span className="font-mono font-extrabold text-foreground break-all text-xl sm:text-2xl tracking-tight leading-tight select-all tabular-nums">
          {result}
        </span>
        <CopyButton
          text={result}
          tooltip="复制结果"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        />
      </div>
    </div>
  );
}
