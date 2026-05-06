import { Box } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import DashboardCard from '@/pages/Dashboard/DashboardCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardPageStyles } from '@/config/pageTheme';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();
  const { t } = useTranslation(['features']);

  const visibleSet = useMemo(() => new Set(visiblePages), [visiblePages]);

  const handleCardClick = useCallback(
    (page: PageType) => {
      navigateTo(page);
    },
    [navigateTo],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fill, minmax(300px, 1fr))',
        },
        gap: 2,
        p: 2,
      }}
    >
      {pageOrder.map((key) => {
        if (!visibleSet.has(key as PageType)) return null;

        const feature = getFeatureByKey(key);
        if (!feature?.themeColor || feature.icon == null) return null;

        return (
          <DashboardCard
            key={key}
            title={t(feature.labelKey)}
            description={t(feature.descriptionKey)}
            colorCode={feature.themeColor}
            icon={feature.icon}
            onClick={handleCardClick}
            pageKey={key as PageType}
            cardBackgroundColor={dashboardPageStyles.cardBackgroundColor}
          />
        );
      })}
    </Box>
  );
}
