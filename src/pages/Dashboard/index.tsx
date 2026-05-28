import { useRouter } from '@/providers/RouterProvider';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useMemo } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder, recentlyUsedTools } = useRouter();
  const { t } = useI18n(['features']);

  const visibleSet = useMemo(() => new Set<string>(visiblePages), [visiblePages]);

  const visibleFeatures = useMemo(() => {
    return pageOrder
      .filter((key) => visibleSet.has(key))
      .map((key) => ({ key, feature: getFeatureByKey(key) }))
      .filter((item) => item.feature?.themeColorKey && item.feature.icon != null);
  }, [pageOrder, visibleSet]);

  const recentFeatures = useMemo(() => {
    return recentlyUsedTools
      .filter((key) => visibleSet.has(key))
      .map((key) => ({ key, feature: getFeatureByKey(key) }))
      .filter((item) => item.feature?.themeColorKey && item.feature.icon != null);
  }, [recentlyUsedTools, visibleSet]);

  const showRecent = recentFeatures.length > 0;

  return (
    <div className={cn('flex flex-col gap-4 p-3.5 w-full h-auto select-none')}>
      {/* 最近使用 */}
      {showRecent && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {t('dashboard_recentlyUsed')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentFeatures.map(({ key, feature }) => {
              const IconComponent = feature!.icon!;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigateTo(key as PageType)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                    'border border-border/60 bg-card text-card-foreground',
                    'hover:bg-muted/40 hover:border-primary/30',
                    'transition-colors cursor-pointer',
                  )}
                >
                  <IconComponent className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {t(feature!.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 全部工具 — 紧凑 Grid */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
          {t('dashboard_allTools')}
        </h3>
        <div className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2')}>
          {visibleFeatures.map(({ key, feature }) => {
            const IconComponent = feature!.icon!;
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigateTo(key as PageType)}
                className={cn(
                  'group flex flex-col items-center justify-center gap-1.5',
                  'py-3 px-2 rounded-xl border border-border/50 bg-card',
                  'hover:bg-muted/40 hover:border-primary/30',
                  'transition-colors cursor-pointer',
                )}
              >
                <IconComponent
                  className={cn(
                    'h-5 w-5 text-muted-foreground/70',
                    'group-hover:text-foreground',
                    'transition-colors',
                  )}
                />
                <span className="text-[11px] font-medium text-muted-foreground/80 group-hover:text-foreground leading-tight text-center truncate w-full transition-colors">
                  {t(feature!.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
