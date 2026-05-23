import React, { useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from './constants';
import { DATE_FORMAT } from './constants';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils'; // shadcn 核心类名合并工具

interface ResultViewProps extends React.HTMLAttributes<HTMLDivElement> {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  /** 无结果时是否渲染占位（桌面端右栏使用），默认 false */
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
    const { t } = useLazyTranslation('timestamp');

    // 严谨计算时间衍生的附加时区/相对时间状态
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

    // 1. 空状态骨架面板：优雅匹配 shadcn 的中性灰色居中占位
    if (!result) {
      if (!showEmptyPlaceholder) return null;
      return (
        <div
          className={cn(
            'flex-1 flex items-center justify-center text-sm font-medium border border-dashed border-border/60 rounded-xl py-12 px-4 text-center text-muted-foreground bg-muted/20 min-h-[320px] animate-in fade-in duration-200',
            className,
          )}
          {...props}
        >
          {t('timestamp:resultEmpty')}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col w-full',
          className,
        )}
        {...props}
      >
        {/* 顶部小标签 */}
        <span className="block text-muted-foreground/90 mb-2.5 text-xs font-semibold tracking-wider uppercase">
          {t('timestamp:resultLabel')}
        </span>

        {/*
          2. 核心结果大卡片：
          对齐 shadcn 官方卡片风格，使用 bg-card、border-border 构筑多层级阴影。
          核心数值直接拉粗为 text-foreground (在黑夜模式下会自动转为大气的纯白，完美避开刺眼强光)
        */}
        <div className="bg-card text-card-foreground border border-border p-4 sm:p-5 rounded-xl relative mb-3.5 shadow-sm flex justify-between items-center gap-4 focus-within:ring-1 focus-within:ring-ring transition-all">
          <span className="font-mono font-extrabold text-foreground break-all text-xl sm:text-2xl tracking-tight leading-tight select-all tabular-nums">
            {result}
          </span>
          <CopyButton
            text={result}
            tooltip={t('timestamp:copyResultTooltip')}
            className="h-8 w-8 rounded-md shrink-0 border"
          />
        </div>

        {/*
          3. 衍生的附加参考数据区：
          背景改为低饱和度的 bg-muted/40 隔离带。
          内部数值降级为 text-muted-foreground，建立教科书般的完美“视觉权重层级”。
        */}
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
                    item.isMono && 'font-mono text-[11px]', // ISO/UTC 等机器时间使用精细化等宽代码体
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
