import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  CircularProgress,
  Stack,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import { getRouteByKey, getDefaultPageOrder, getDefaultVisibleRoutes } from '@/config/routes';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';

export default function App() {
  const [visiblePages, setVisiblePages] = useState<PageType[]>([]);
  const [pageOrder, setPageOrder] = useState<PageType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { snackbarProps, showMessage } = useSnackbar();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [savedVisible, savedOrder] = await Promise.all([
        storageUtil.get('app/visiblePages', getDefaultVisibleRoutes()),
        storageUtil.get('app/pageOrder', getDefaultPageOrder()),
      ]);
      setVisiblePages(savedVisible ?? getDefaultVisibleRoutes());
      setPageOrder(savedOrder && savedOrder.length > 0 ? savedOrder : getDefaultPageOrder());
    } catch (error) {
      console.error('Failed to load config:', error);
      setVisiblePages(getDefaultVisibleRoutes());
      setPageOrder(getDefaultPageOrder());
    } finally {
      setIsLoaded(true);
    }
  };

  const handlePageToggle = async (page: PageType) => {
    const isCurrentlyVisible = visiblePages.includes(page);
    let newPages: PageType[];

    if (isCurrentlyVisible) {
      if (visiblePages.length <= 1) {
        showToast('至少需要保留一个可见页面', 'warning');
        return;
      }
      newPages = visiblePages.filter((p) => p !== page);
    } else {
      newPages = [...visiblePages, page];
    }

    try {
      await storageUtil.set('app/visiblePages', newPages);
      setVisiblePages(newPages);
      const route = getRouteByKey(page);
      showToast(`已${isCurrentlyVisible ? '隐藏' : '显示'} ${route?.label || page}`, 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('保存失败', 'warning');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pageOrder.length - 1) return;

    const newOrder = [...pageOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    try {
      await storageUtil.set('app/pageOrder', newOrder);
      setPageOrder(newOrder);
    } catch (error) {
      console.error('Failed to save order:', error);
      showToast('排序保存失败', 'warning');
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const { getDefaultVisibleRoutes } = await import('@/config/routes');
      const defaults = getDefaultVisibleRoutes();
      const defaultOrder = getDefaultPageOrder();

      await Promise.all([
        storageUtil.set('app/visiblePages', defaults),
        storageUtil.set('app/pageOrder', defaultOrder),
      ]);

      setVisiblePages(defaults);
      setPageOrder(defaultOrder);
      showToast('已恢复默认', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败', 'warning');
    }
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning') => {
    showMessage(message, { severity });
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Button
          variant="text"
          size="small"
          onClick={handleRestoreDefaults}
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          恢复默认
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'grey.200',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {pageOrder.map((key, index, array) => {
            const route = getRouteByKey(key);
            if (!route) return null;

            const isChecked = visiblePages.includes(key);
            const isDisabled = isChecked && visiblePages.length === 1;

            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderBottom: index === array.length - 1 ? 'none' : '1px solid',
                  borderColor: 'grey.100',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {route.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isChecked ? '已在 Dashboard 启用' : '已在 Dashboard 隐藏'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    sx={{ color: 'text.secondary' }}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === array.length - 1}
                    sx={{ color: 'text.secondary' }}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                  <Switch
                    size="small"
                    checked={isChecked}
                    onChange={() => handlePageToggle(key)}
                    disabled={isDisabled}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
