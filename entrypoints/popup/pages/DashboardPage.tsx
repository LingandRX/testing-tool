import { Box, Typography } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import DashboardCard from '@/components/DashboardCard';
import { cardConfigs } from '@/config/dashboardCards';
import type { PageType } from '@/types/storage';
import { useEffect, useState, useCallback } from 'react';
import dayjs from '@/utils/dayjs';
import { dashboardPageStyles } from '@/config/pageTheme';

export default function DashboardPage() {
  const { navigateTo, visiblePages, pageOrder } = useRouter();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

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

        const snapshot =
          key === 'timestamp' ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: dashboardPageStyles.primaryColor,
                  fontSize: '0.85rem',
                }}
              >
                {now.valueOf()}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {now.format('HH:mm:ss')}
              </Typography>
            </Box>
          ) : undefined;

        return (
          <DashboardCard
            key={key}
            config={config}
            onClick={() => handleCardClick(key)}
            snapshot={snapshot}
            cardBackgroundColor={dashboardPageStyles.cardBackgroundColor}
          />
        );
      })}
    </Box>
  );
}
