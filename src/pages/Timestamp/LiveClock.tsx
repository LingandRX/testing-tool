import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { useSnackbar } from '@/components/GlobalSnackbar';
import type { UnitType } from './constants';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

const LiveClock = React.memo(({ unit, onUseNow, className, ...props }: LiveClockProps) => {
  const { t } = useI18n('timestamp');
  const { showMessage } = useSnackbar();
  const onUseNowRef = useRef(onUseNow);

  const [currentDisplay, setCurrentDisplay] = useState(() => {
    const initNow = Date.now();
    return {
      rawTime: initNow,
      text: String(Math.floor(initNow / (unit === 'ms' ? 1 : 1000))),
    };
  });

  useEffect(() => {
    onUseNowRef.current = onUseNow;
  }, [onUseNow]);

  useEffect(() => {
    const tick = () => {
      const rightNow = Date.now();
      const nextText = String(Math.floor(rightNow / (unit === 'ms' ? 1 : 1000)));

      setCurrentDisplay((prev) => {
        if (prev.text === nextText) return prev;
        return { rawTime: rightNow, text: nextText };
      });
    };

    const tickId = setInterval(tick, 200);
    return () => clearInterval(tickId);
  }, [unit]);

  const handleUseNow = useCallback(() => {
    onUseNowRef.current(currentDisplay.rawTime);
    showMessage?.(t('timestamp:usedSuccess'), { severity: 'success' });
  }, [currentDisplay.rawTime, showMessage, t]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 h-10 rounded-lg border border-border/80 bg-secondary/50',
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 selection:bg-transparent select-none">
        {t('timestamp:currentTs')}
      </span>

      <span className="flex-1 font-mono font-bold text-foreground text-sm tracking-tight leading-none truncate tabular-nums">
        {currentDisplay.text}
      </span>

      <button
        type="button"
        onClick={handleUseNow}
        title={t('timestamp:useNowTooltip')}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>

      <CopyButton
        text={currentDisplay.text}
        tooltip={t('timestamp:copyTsTooltip')}
        className="h-7 w-7 rounded-md border"
      />
    </div>
  );
});

LiveClock.displayName = 'LiveClock';

export default LiveClock;
