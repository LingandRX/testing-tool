import { useRouter } from '@/providers/RouterProvider';
import ToolCard from '@/pages/Dashboard/ToolCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useMemo, useState } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder, recentlyUsedTools } = useRouter();
  const { t } = useI18n(['features']);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleSet = useMemo(() => new Set<string>(visiblePages), [visiblePages]);

  const visibleFeatures = useMemo(() => {
    return pageOrder
      .filter((key) => visibleSet.has(key))
      .map((key) => ({ key, feature: getFeatureByKey(key) }))
      .filter((item) => item.feature?.themeColorKey && item.feature.icon != null);
  }, [pageOrder, visibleSet]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return visibleFeatures;
    const query = searchQuery.toLowerCase();
    return visibleFeatures.filter(
      (item) =>
        t(item.feature!.labelKey).toLowerCase().includes(query) ||
        t(item.feature!.descriptionKey).toLowerCase().includes(query),
    );
  }, [visibleFeatures, searchQuery, t]);

  const recentFeatures = useMemo(() => {
    return recentlyUsedTools
      .filter((key) => visibleSet.has(key))
      .map((key) => ({ key, feature: getFeatureByKey(key) }))
      .filter((item) => item.feature?.themeColorKey && item.feature.icon != null);
  }, [recentlyUsedTools, visibleSet]);

  const showRecent = !searchQuery.trim() && recentFeatures.length > 0;

  return (
    <div className={cn('flex flex-col gap-4 p-3.5 w-full h-auto select-none')}>
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('dashboard_searchPlaceholder')}
          className={cn(
            'w-full h-9 pl-9 pr-3 rounded-lg border border-border/70 bg-background text-sm',
            'placeholder:text-muted-foreground/50 outline-none',
            'focus:border-primary/50 focus:ring-1 focus:ring-primary/20',
            'transition-colors',
          )}
        />
      </div>

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

      {/* 全部工具 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
          {t('dashboard_allTools')}
        </h3>
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] auto-rows-auto gap-3.5',
          )}
        >
          {filteredFeatures.map(({ key, feature }) => (
            <ToolCard
              key={key}
              title={t(feature!.labelKey)}
              description={t(feature!.descriptionKey)}
              colorKey={feature!.themeColorKey!}
              icon={feature!.icon!}
              onNavigate={() => navigateTo(key as PageType)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
