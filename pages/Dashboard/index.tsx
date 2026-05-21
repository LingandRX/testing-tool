import { useRouter } from '@/providers/RouterProvider';
import ToolCard from '@/pages/Dashboard/ToolCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();
  const { t } = useTranslation(['features']);

  const visibleSet = useMemo(() => new Set(visiblePages), [visiblePages]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-fr gap-2 p-2">
      {pageOrder.map((key) => {
        if (!visibleSet.has(key as PageType)) return null;

        const feature = getFeatureByKey(key);
        if (!feature?.themeColorKey || feature.icon == null) return null;

        return (
          <ToolCard
            key={key}
            title={t(feature.labelKey)}
            description={t(feature.descriptionKey)}
            colorKey={feature.themeColorKey}
            icon={feature.icon}
            onClick={() => navigateTo(key)}
          />
        );
      })}
    </div>
  );
}
