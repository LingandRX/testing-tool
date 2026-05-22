import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface DiffNavigatorProps {
  total: number;
  /** 0-based index */
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DiffNavigator({ total, currentIndex, onPrev, onNext }: DiffNavigatorProps) {
  const { t } = useLazyTranslation('jsonDiff');

  if (total === 0) {
    return (
      <div className="flex items-center justify-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/30">
        <span className="text-sm font-bold text-muted-foreground">{t('jsonDiff:noDiffs')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/30">
      <button
        type="button"
        aria-label={t('jsonDiff:previousDiff')}
        onClick={onPrev}
        className="p-1 rounded-md hover:bg-blue-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-extrabold font-mono min-w-[60px] text-center">
        {currentIndex + 1} / {total}
      </span>
      <button
        type="button"
        aria-label={t('jsonDiff:nextDiff')}
        onClick={onNext}
        className="p-1 rounded-md hover:bg-blue-100 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export type { DiffNavigatorProps };
