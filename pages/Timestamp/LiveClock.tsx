import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { useSnackbar } from '@/components/GlobalSnackbar';
import type { UnitType } from '@/config/pageTheme';
import { timestampPageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface LiveClockProps {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

const LiveClock = React.memo(({ unit, onUseNow }: LiveClockProps) => {
  const [now, setNow] = useState(() => Date.now());
  const { t } = useLazyTranslation('timestamp');
  const { showMessage } = useSnackbar();
  const onUseNowRef = useRef(onUseNow);

  useEffect(() => {
    onUseNowRef.current = onUseNow;
  }, [onUseNow]);

  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, []);

  const displayVal = useMemo(
    () => String(Math.floor(now / (unit === 'ms' ? 1 : 1000))),
    [now, unit],
  );

  const handleUseNow = useCallback(() => {
    onUseNowRef.current(now);
    showMessage(t('timestamp:usedSuccess'), { severity: 'success' });
  }, [now, showMessage, t]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 mb-4 bg-primary/10 rounded-lg border border-primary/20">
      <span className="text-primary font-bold text-[0.65rem] uppercase tracking-wider whitespace-nowrap">
        {t('timestamp:currentTs')}
      </span>
      <span className="flex-1 font-mono font-bold text-primary text-sm tracking-tight leading-tight overflow-hidden text-ellipsis">
        {displayVal}
      </span>
      <button
        onClick={handleUseNow}
        title={t('timestamp:useNowTooltip')}
        className="p-1.5 rounded-md bg-background text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Clock className="w-4 h-4" />
      </button>
      <CopyButton
        text={displayVal}
        tooltip={t('timestamp:copyTsTooltip')}
        size="small"
        color={timestampPageStyles.primaryColor}
      />
    </div>
  );
});

LiveClock.displayName = 'LiveClock';

export default LiveClock;
