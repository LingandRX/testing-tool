import React, { useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from './constants';
import { DATE_FORMAT } from './constants';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

interface ResultViewProps extends React.HTMLAttributes<HTMLDivElement> {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;

  showEmptyPlaceholder?: boolean;
}

const ResultView = React.memo(
  ({
    result,
    mode,
    unit,
    zone,
    showEmptyPlaceholder = false,
    className,
    ...props
  }: ResultViewProps) => {
    const { t } = useI18n('timestamp');

    const extraInfo = useMemo(() => {
      if (!result) return null;
      const d =
        mode === 'ts2dt'
          ? dayjs(result, DATE_FORMAT).tz(zone)
          : unit === 'ms'
            ? dayjs(Number(result))
            : dayjs.unix(Number(result));

      return {
        relative: d.fromNow(),
        iso: d.toISOString(),
        utc: d.utc().format(DATE_FORMAT) + ' UTC',
      };
    }, [result, mode, zone, unit]);

    if (!result) {
      if (!showEmptyPlaceholder) return null;
      return (
        <div
          className={cn(
            'flex-1 flex items-center justify-center text-sm font-medium border border-dashed border-border/60 rounded-xl py-12 px-4 text-center text-muted-foreground bg-muted/20 min-h-[320px]',
            className,
          )}
          {...props}
        >
          {t('timestamp:resultEmpty')}
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col w-full', className)} {...props}>
        {/* 顶部小标签 */}
        <span className="block text-muted-foreground/90 mb-2.5 text-xs font-semibold tracking-wider uppercase">
          {t('timestamp:resultLabel')}
        </span>

        <div className="bg-card text-card-foreground border border-border p-4 sm:p-5 rounded-xl relative mb-3.5 shadow-sm flex justify-between items-center gap-4 focus-within:ring-1 focus-within:ring-ring">
          <span className="font-mono font-extrabold text-foreground break-all text-xl sm:text-2xl tracking-tight leading-tight select-all tabular-nums">
            {result}
          </span>
          <CopyButton
            text={result}
            tooltip={t('timestamp:copyResultTooltip')}
            className="h-8 w-8 rounded-md shrink-0 border"
          />
        </div>

        <div className="bg-muted/40 p-4 rounded-xl border border-border/50 flex flex-col gap-3">
          {[
            { label: t('timestamp:relativeTime'), value: extraInfo?.relative },
            { label: t('timestamp:iso8601'), value: extraInfo?.iso, isMono: true },
            { label: t('timestamp:utcTime'), value: extraInfo?.utc, isMono: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 py-0.5 border-b border-border/30 last:border-0 pb-2 sm:pb-0 last:pb-0"
            >
              <span className="text-muted-foreground font-semibold text-xs shrink-0 select-none">
                {item.label}
              </span>
              <div className="flex items-center justify-between sm:justify-end gap-2 min-w-0 w-full sm:w-auto">
                <span
                  className={cn(
                    'text-xs text-foreground/90 font-medium break-all text-left sm:text-right tabular-nums',
                    item.isMono && 'font-mono text-[11px]',
                  )}
                >
                  {item.value}
                </span>
                {item.value && (
                  <CopyButton
                    text={item.value}
                    tooltip={t('timestamp:copyTooltip')}
                    className="h-6 w-6 rounded-md border shrink-0 text-muted-foreground"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ResultView.displayName = 'ResultView';

export default ResultView;
