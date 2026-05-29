import React from 'react';
import CopyButton from '@/components/CopyButton';
import { useI18n } from '@/utils/chromeI18n';
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
  const { t } = useI18n('timestamp');

  if (!result) {
    if (!showEmptyPlaceholder) return null;
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center text-sm font-medium border border-dashed border-border/60 rounded-xl py-12 px-4 text-center text-muted-foreground bg-muted/20 min-h-[320px]',
          className,
        )}
        {...props}
      >
        {t('timestamp:resultEmpty')}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col w-full', className)} {...props}>
      <span className="block text-muted-foreground/90 mb-2.5 text-xs font-semibold tracking-wider uppercase">
        {t('timestamp:resultLabel')}
      </span>

      <div className="bg-card text-card-foreground border border-border p-4 sm:p-5 rounded-xl relative shadow-sm flex justify-between items-center gap-4 focus-within:ring-1 focus-within:ring-ring">
        <span className="font-mono font-extrabold text-foreground break-all text-xl sm:text-2xl tracking-tight leading-tight select-all tabular-nums">
          {result}
        </span>
        <CopyButton
          text={result}
          tooltip={t('timestamp:copyResultTooltip')}
          className="h-8 w-8 rounded-md shrink-0 border"
        />
      </div>
    </div>
  );
}
