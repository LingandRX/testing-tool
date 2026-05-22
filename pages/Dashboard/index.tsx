import { useRouter } from '@/providers/RouterProvider';
import ToolCard from '@/pages/Dashboard/ToolCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();
  const { t } = useTranslation(['features']);

  const visibleSet = useMemo(() => new Set<string>(visiblePages), [visiblePages]);

  return (
    /* 💡 核心修复点：
      - 彻底移除限制死高度的 auto-rows-fr，换用弹性自适应的 auto-rows-auto。
      - 将 gap-2 / p-2 扩展为标准的 gap-3.5 / p-3.5，彻底消灭挤压颤噪。
    */
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] auto-rows-auto gap-3.5 p-3.5 w-full h-full',
        'animate-in fade-in duration-300 select-none',
      )}
    >
      {pageOrder.map((key) => {
        if (!visibleSet.has(key)) return null;

        const feature = getFeatureByKey(key);
        if (!feature?.themeColorKey || feature.icon == null) return null;

        return (
          <ToolCard
            key={key}
            title={t(feature.labelKey)}
            description={t(feature.descriptionKey)}
            colorKey={feature.themeColorKey}
            icon={feature.icon}
            onNavigate={() => navigateTo(key as PageType)}
          />
        );
      })}
    </div>
  );
}
