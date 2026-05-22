import { AlertCircle } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const { t } = useLazyTranslation('storageCleaner');
  return (
    <div className="py-8 flex justify-center items-center min-h-[200px] sm:min-h-[400px] text-center">
      <div className="w-full max-w-[320px]">
        <div className="flex flex-col items-center justify-center rounded-lg p-6 shadow-lg border border-red-200 bg-red-50">
          <AlertCircle className="h-9 w-9 text-red-500 mb-3" />
          <p className="text-sm font-bold leading-relaxed mb-4 text-red-600">{error}</p>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            {t('storageCleaner:errorStandardOnly')}
          </p>
        </div>
      </div>
    </div>
  );
}
