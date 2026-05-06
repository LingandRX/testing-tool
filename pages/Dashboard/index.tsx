import { Box } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import ToolCard from '@/pages/Dashboard/ToolCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardPageStyles } from '@/config/pageTheme';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();
  const { t } = useTranslation(['features']);

  const visibleSet = useMemo(() => new Set(visiblePages), [visiblePages]);

  return (
    <Box sx={dashboardPageStyles.GRID_CONTAINER}>
      {pageOrder.map((key) => {
        if (!visibleSet.has(key as PageType)) return null;

        const feature = getFeatureByKey(key);
        if (!feature?.themeColor || feature.icon == null) return null;

        return (
          <ToolCard
            key={key}
            title={t(feature.labelKey)}
            description={t(feature.descriptionKey)}
            colorCode={feature.themeColor}
            icon={feature.icon}
            onClick={() => navigateTo(key)}
          />
        );
      })}
    </Box>
  );
}
