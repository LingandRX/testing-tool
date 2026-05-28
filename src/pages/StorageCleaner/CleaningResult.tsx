import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { CleaningResult as CleaningResultType } from '@/types/storage';
import { formatCleaningResult } from '@/utils/storageCleaner';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

interface CleaningResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: CleaningResultType | null;
}

export default function CleaningResult({ result, className, ...props }: CleaningResultProps) {
  const { t } = useI18n('storageCleaner');

  if (!result) return null;

  const isSuccess = result.success;

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl py-2.5 px-3.5 border shadow-sm',
          isSuccess
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-destructive/5 border-destructive/20 text-destructive',
        )}
      >
        {isSuccess ? (
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
        )}

        <span className="text-xs sm:text-sm font-semibold leading-relaxed break-all">
          {isSuccess
            ? formatCleaningResult(result, t)
            : result.error || t('storageCleaner:partialFailure')}
        </span>
      </div>
    </div>
  );
}
