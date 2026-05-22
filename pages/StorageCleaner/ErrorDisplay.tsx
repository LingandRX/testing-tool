import { AlertCircle } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  error: string;
}

export default function ErrorDisplay({ error, className, ...props }: ErrorDisplayProps) {
  const { t } = useLazyTranslation('storageCleaner');

  return (
    // 1. 精简层级：单层外壳直接搞定居中、响应式高度与外部类名扩展
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 min-h-[240px] sm:min-h-[360px] p-4 text-center animate-in fade-in zoom-in-95 duration-200',
        className,
      )}
      {...props}
    >
      {/* 2. 核心卡片容器：
        - 彻底放弃 bg-red-50，改用标准的 bg-destructive/5（3%~5% 透明度的系统危险色）。
        - 边框改为 border-destructive/20。
        - 这样在黑夜模式下会自动完美混色，绝不刺眼。
      */}
      <div className="w-full max-w-xs flex flex-col items-center justify-center rounded-xl p-5 border border-destructive/20 bg-destructive/5 shadow-sm">
        {/* 3. 图标与主要错误信息全面对接 text-destructive 语义色 */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3.5 shrink-0 animate-bounce [animation-duration:2s]">
          <AlertCircle className="h-5 w-5" />
        </div>

        <p className="text-sm font-semibold leading-relaxed text-destructive break-all px-1 mb-2">
          {error}
        </p>

        {/* 次要提示文本维持柔和的中性高级灰 */}
        <p className="text-xs font-medium leading-relaxed text-muted-foreground/90 px-2">
          {t('storageCleaner:errorStandardOnly')}
        </p>
      </div>
    </div>
  );
}
