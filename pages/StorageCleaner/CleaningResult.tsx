import { CheckCircle, XCircle } from 'lucide-react';
import type { CleaningResult } from '@/types/storage';
import { formatCleaningResult } from '@/utils/storageCleaner';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface CleaningResultProps {
  result: CleaningResult | null;
}

export default function CleaningResult({ result }: CleaningResultProps) {
  const { t } = useLazyTranslation('storageCleaner');
  if (!result) return null;

  const isSuccess = result.success;

  return (
    <div className="mt-3 animate-in fade-in duration-300">
      <div
        className={`flex items-start gap-3 rounded-lg py-3 px-4 shadow-sm ${
          isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <span
          className={`text-sm font-semibold leading-relaxed ${
            isSuccess ? 'text-green-600' : 'text-red-700'
          }`}
        >
          {isSuccess
            ? formatCleaningResult(result, t)
            : result.error || t('storageCleaner:partialFailure')}
        </span>
      </div>
    </div>
  );
}
