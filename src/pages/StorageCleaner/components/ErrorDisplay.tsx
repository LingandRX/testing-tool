import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  error: string;
}

export default function ErrorDisplay({ error, className, ...props }: ErrorDisplayProps) {
  const { t } = useI18n('storageCleaner');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 min-h-[240px] sm:min-h-[360px] p-4 text-center',
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-xs flex flex-col items-center justify-center rounded-xl p-5 border border-destructive/20 bg-destructive/5 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3.5 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>

        <p className="text-sm font-semibold leading-relaxed text-destructive break-all px-1 mb-2">
          {error}
        </p>

        <p className="text-xs font-medium leading-relaxed text-muted-foreground/90 px-2">
          {t('storageCleaner:errorStandardOnly')}
        </p>
      </div>
    </div>
  );
}
