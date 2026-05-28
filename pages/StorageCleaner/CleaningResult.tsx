import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { CleaningResult as CleaningResultType } from '@/types/storage';
import { formatCleaningResult } from '@/utils/storageCleaner';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils'; // 1. 引入 shadcn 核心类名合并工具

interface CleaningResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: CleaningResultType | null;
}

export default function CleaningResult({ result, className, ...props }: CleaningResultProps) {
  const { t } = useI18n('storageCleaner');

  if (!result) return null;

  const isSuccess = result.success;

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* 2. 彻底重构容器类名结构：
        - 成功状态：采用 Tailwind 官方推荐的 emerald 体系，利用 /10 (10% 透明度) 和 /20 (边框)。
        - 失败状态：完全放权给标准的 border-destructive/20 和 bg-destructive/5。
        - 这样在明暗双色模式切换时，色彩会自动与背景完美融为一体。
      */}
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl py-2.5 px-3.5 border shadow-sm',
          isSuccess
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-destructive/5 border-destructive/20 text-destructive',
        )}
      >
        {/* 3. 图标样式向系统语义全面对齐 */}
        {isSuccess ? (
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
        )}

        {/* 4. 文本排版细节微调 */}
        <span className="text-xs sm:text-sm font-semibold leading-relaxed break-all">
          {isSuccess
            ? formatCleaningResult(result, t)
            : result.error || t('storageCleaner:partialFailure')}
        </span>
      </div>
    </div>
  );
}
