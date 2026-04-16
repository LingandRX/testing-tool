import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import { ROUTES } from '@/config/routes';

function App() {
  const [visiblePages, setVisiblePages] = useState<PageType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'warning'>('info');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await storageUtil.get('app/visiblePages', [
        'timestamp',
        'storageCleaner',
        'openUrl',
      ] as PageType[]);
      setVisiblePages(saved ?? ['timestamp', 'storageCleaner', 'openUrl']);
    } catch (error) {
      console.error('Failed to load config:', error);
      setVisiblePages(['timestamp', 'storageCleaner', 'openUrl']);
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
      const route = ROUTES.find((r) => r.key === page);
      showToast(`已${isCurrentlyVisible ? '隐藏' : '显示'} ${route?.label || page}`, 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('保存失败', 'warning');
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const defaults = ROUTES.filter((route) => route.defaultVisible).map((route) => route.key);
      await storageUtil.set('app/visiblePages', defaults);
      setVisiblePages(defaults);
      showToast('已恢复默认', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败', 'warning');
    }
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning') => {
    setToast(message);
    setToastSeverity(severity);
  };

  const handleCloseToast = () => setToast(null);

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
          {ROUTES.filter((route) => route.key !== 'dashboard' && route.key !== 'openUrlViewer').map(
            (route, index, array) => {
              const isChecked = visiblePages.includes(route.key);
              const isDisabled = isChecked && visiblePages.length === 1;

              return (
                <Box
                  key={route.key}
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
                  <Switch
                    size="small"
                    checked={isChecked}
                    onChange={() => handlePageToggle(route.key)}
                    disabled={isDisabled}
                  />
                </Box>
              );
            },
          )}
        </Box>
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
