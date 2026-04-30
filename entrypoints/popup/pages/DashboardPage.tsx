import { Box } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import DashboardCard from '@/components/DashboardCard';
import { cardConfigs } from '@/config/dashboardCards';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {pageOrder.map((key) => {
        if (!isVisible(key)) return null;

        const config = cardConfigs[key];
        if (!config) return null;

        return (
          <DashboardCard
            key={key}
            config={config}
            onClick={() => handleCardClick(key)}
            cardBackgroundColor={dashboardPageStyles.cardBackgroundColor}
          />
        );
      })}
    </Box>
  );
}
