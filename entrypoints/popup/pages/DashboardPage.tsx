import { Box, Typography, Container } from '@mui/material';
import { useRouter } from '@/providers/RouterProvider';
import ToolCard from '@/components/ToolCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import LanguageIcon from '@mui/icons-material/Language';
import type { PageType } from '@/types/storage';
import { useEffect, useState } from 'react';
import dayjs from '@/utils/dayjs';

export default function DashboardPage() {
  const { navigateTo, visiblePages } = useRouter();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isVisible = (key: string) => visiblePages.includes(key as PageType);

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100%', pb: 4 }}>
      <Container maxWidth="sm" sx={{ py: 3, px: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isVisible('timestamp') && (
            <ToolCard
              title="时间戳"
              description="Unix 毫秒数转换与格式化"
              colorCode="#2196f3"
              icon={<AccessTimeIcon sx={{ fontSize: 20 }} />}
              onClick={() => navigateTo('timestamp')}
              snapshot={
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#2196f3',
                      fontSize: '0.85rem',
                    }}
                  >
                    {now.valueOf()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {now.format('HH:mm:ss')}
                  </Typography>
                </Box>
              }
            />
          )}

          {isVisible('storageCleaner') && (
            <ToolCard
              title="存储管理"
              description="清理缓存、Cookies 及本地存储"
              colorCode="#ff9800"
              icon={<StorageIcon sx={{ fontSize: 20 }} />}
              onClick={() => navigateTo('storageCleaner')}
            />
          )}

          {isVisible('openUrl') && (
            <ToolCard
              title="URL 实验室"
              description="多环境跳转与安全性预检"
              colorCode="#9c27b0"
              icon={<LanguageIcon sx={{ fontSize: 20 }} />}
              onClick={() => navigateTo('openUrl')}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
}
