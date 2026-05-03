import { Box } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import DashboardCard from '@/components/DashboardCard';
import { getFeatureByKey } from '@/config/features';
import type { PageType } from '@/types/storage';
import { useCallback } from 'react';

import { dashboardPageStyles } from '@/config/pageTheme';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();

  const isVisible = (key: string) => visiblePages.includes(key as PageType);

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
          xs: '1fr', // 弹出窗口或小屏幕保持单列
          sm: 'repeat(auto-fill, minmax(300px, 1fr))', // 标签页大屏幕自适应多列
        },
        gap: 2,
        p: 2,
      }}
    >
      {pageOrder.map((key) => {
        if (!isVisible(key)) return null;

        const feature = getFeatureByKey(key);
        if (!feature || !feature.icon || !feature.themeColor) return null;

        // 适配 DashboardCard 组件，将 themeColor 映射到 colorCode
        const cardConfig = {
          title: feature.label,
          description: feature.description,
          colorCode: feature.themeColor,
          icon: feature.icon,
        };

        return (
          <DashboardCard
            key={key}
            config={cardConfig}
            onClick={() => handleCardClick(key)}
            cardBackgroundColor={dashboardPageStyles.cardBackgroundColor}
          />
        );
      })}
    </Box>
  );
}
