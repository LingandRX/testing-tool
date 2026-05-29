import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from './constants';
import { msToUnit } from './constants';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

export default function LiveClock({ unit, onUseNow, className, ...props }: LiveClockProps) {
  const { t } = useI18n('timestamp');

  const [rawTime, setRawTime] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => {
      setRawTime(Date.now());
    };
    const tickId = setInterval(tick, 200);
    return () => clearInterval(tickId);
  }, [unit]);

  const text = String(msToUnit(rawTime, unit));

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
        {text}
      </span>

      <button
        type="button"
        onClick={() => {
          onUseNow(rawTime);
          toast.success(t('timestamp:usedSuccess'));
        }}
        title={t('timestamp:useNowTooltip')}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>

      <CopyButton
        text={text}
        tooltip={t('timestamp:copyTsTooltip')}
        className="h-7 w-7 rounded-md border"
      />
    </div>
  );
}
