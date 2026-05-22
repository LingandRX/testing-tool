import React, { useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from '@/config/pageTheme';
import { DATE_FORMAT, timestampPageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface ResultViewProps {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  /** 无结果时是否渲染占位（桌面端右栏使用），默认 false（移动端单栏隐藏） */
  showEmptyPlaceholder?: boolean;
}

const ResultView = React.memo(
  ({ result, mode, unit, zone, showEmptyPlaceholder = false }: ResultViewProps) => {
    const { t } = useLazyTranslation('timestamp');

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
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm font-semibold py-12 text-center">
          {t('timestamp:resultEmpty')}
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-300">
        <span className="block text-muted-foreground mb-3 text-xs font-bold">
          {t('timestamp:resultLabel')}
        </span>

        <div className="bg-primary/10 p-5 rounded-xl relative mb-4 border border-primary/30 flex justify-between items-center">
          <span className="font-mono font-bold text-primary break-all pr-4 text-xl tracking-tight leading-tight">
            {result}
          </span>
          <CopyButton
            text={result}
            tooltip={t('timestamp:copyResultTooltip')}
            size="small"
            color={timestampPageStyles.primaryColor}
          />
        </div>

        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-3">
          {[
            { label: t('timestamp:relativeTime'), value: extraInfo?.relative },
            { label: t('timestamp:iso8601'), value: extraInfo?.iso },
            { label: t('timestamp:utcTime'), value: extraInfo?.utc },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-muted-foreground font-bold text-xs pr-2 whitespace-nowrap">
                {item.label}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-primary font-semibold text-xs break-all text-right">
                  {item.value}
                </span>
                {item.value && (
                  <CopyButton
                    text={item.value}
                    tooltip={t('timestamp:copyTooltip')}
                    size="small"
                    color={timestampPageStyles.primaryColor}
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
