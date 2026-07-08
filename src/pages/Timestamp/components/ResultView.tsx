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

      <div className="bg-card border p-4 rounded-lg flex items-center gap-3 justify-between">
        <span className="break-all text-lg select-all flex-1">{result}</span>

        <CopyButton
          text={result}
          tooltip="复制结果"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
        />
      </div>
    </div>
  );
}
