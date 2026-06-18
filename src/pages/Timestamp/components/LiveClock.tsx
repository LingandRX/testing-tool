import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { CopyButton } from '@/components/CopyButton';
import type { UnitType } from '../constants';
import { msToUnit } from '../constants';
import { cn } from '@/lib/utils';

interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

export default function LiveClock({ unit, onUseNow, className, ...props }: LiveClockProps) {
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
        {'当前时间戳'}
      </span>

      <span className="flex-1 font-mono font-bold text-foreground text-sm tracking-tight leading-none truncate tabular-nums">
        {text}
      </span>

      <button
        type="button"
        onClick={() => {
          onUseNow(rawTime);
          toast.success('已使用当前时间戳');
        }}
        title={'填充到下方'}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>

      <CopyButton text={text} tooltip={'复制时间戳'} className="h-7 w-7 rounded-md border" />
    </div>
  );
}
