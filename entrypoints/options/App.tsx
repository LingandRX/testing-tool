import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';

const PAGE_CONFIG = {
  timestamp: { label: '时间戳', defaultVisible: true },
  storageCleaner: { label: '存储清理', defaultVisible: true },
} as const satisfies Record<PageType, { label: string; defaultVisible: boolean }>;

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
      ] as PageType[]);
      // Ensure we always have an array
      setVisiblePages(saved ?? ['timestamp', 'storageCleaner']);
    } catch (error) {
      console.error('Failed to load config:', error);
      setVisiblePages(['timestamp', 'storageCleaner']);
    } finally {
      setIsLoaded(true);
    }
  };

  const handlePageToggle = async (page: PageType) => {
    const isCurrentlyVisible = visiblePages.includes(page);
    let newPages: PageType[];

    if (isCurrentlyVisible) {
      // 尝试隐藏，但至少保留一个
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
      showToast(
        `已${isCurrentlyVisible ? '隐藏' : '显示'} ${PAGE_CONFIG[page].label}`,
        'success',
      );
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('保存失败，请重试', 'warning');
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const defaults = (Object.keys(PAGE_CONFIG) as PageType[]).filter(
        (key) => PAGE_CONFIG[key].defaultVisible,
      );
      await storageUtil.set('app/visiblePages', defaults);
      setVisiblePages(defaults);
      showToast('已恢复默认设置', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败，请重试', 'warning');
    }
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning') => {
    setToast(message);
    setToastSeverity(severity);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        ⚙️ 扩展设置
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        paragraph
        sx={{ mb: 3 }}
      >
        自定义 popup 弹窗中显示的功能页面。更改将立即生效，无需保存。
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
          可见页面设置
        </Typography>

        {(Object.keys(PAGE_CONFIG) as PageType[]).map((pageKey) => {
          const config = PAGE_CONFIG[pageKey];
          const isChecked = visiblePages.includes(pageKey);
          const isDisabled = !isChecked && visiblePages.length === 1;

          return (
            <FormControlLabel
              key={pageKey}
              control={
                <Switch
                  checked={isChecked}
                  onChange={() => handlePageToggle(pageKey)}
                  disabled={isDisabled}
                  color="primary"
                />
              }
              label={config.label}
              sx={{
                width: '100%',
                mb: 1,
                '&:last-child': { mb: 0 },
              }}
            />
          );
        })}
      </Paper>

      <Box display="flex" justifyContent="flex-start" sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleRestoreDefaults}
          startIcon={<RefreshIcon />}
          size="small"
        >
          恢复默认
        </Button>
      </Box>

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
          sx={{ width: '100%' }}
        >
          {toast}
        </Alert>
      </Snackbar>

      <Box mt={4} pt={2} borderTop={1} borderColor="divider">
        <Typography variant="caption" color="text.secondary">
          提示：更改将立即应用到 popup 弹窗。如需查看效果,请关闭并重新打开扩展弹窗。
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
