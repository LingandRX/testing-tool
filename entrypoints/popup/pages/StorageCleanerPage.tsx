import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Checkbox,
  Button,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageCleanerOptions, CleaningResult, StorageCleanerPreferences } from 'types/storage';
import {
  getCurrentTab,
  isRestrictedUrl,
  clearStorage,
  formatCleaningResult,
} from '@/utils/storageCleaner';

const DEFAULT_OPTIONS: StorageCleanerOptions = {
  localStorage: true,
  sessionStorage: true,
  indexedDB: true,
  cookies: true,
  cacheStorage: true,
  serviceWorkers: true,
};

const DEFAULT_PREFERENCES: StorageCleanerPreferences = {
  autoRefresh: true,
  selectedTypes: DEFAULT_OPTIONS,
};

export default function StorageCleanerPage() {
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Load tab info and user preferences
  useEffect(() => {
    const loadInfo = async () => {
      const tab = await getCurrentTab();

      if (!tab || !tab.url) {
        setError('无法获取当前标签页');
        return;
      }

      if (isRestrictedUrl(tab.url)) {
        setError('存储清理功能不支持此页面');
        return;
      }

      setDomain(new URL(tab.url).hostname);

      // Load user preferences
      const prefs = await storageUtil.get(
        'storageCleaner/preferences',
        DEFAULT_PREFERENCES,
      );
      setAutoRefresh(prefs?.autoRefresh ?? DEFAULT_PREFERENCES.autoRefresh);
      setOptions(prefs?.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
    };

    loadInfo();
  }, []);

  const handleOptionChange = useCallback((key: keyof StorageCleanerOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleClean = useCallback(async () => {
    const tab = await getCurrentTab();

    if (!tab || !tab.id || !tab.url) {
      setSnackbar({ open: true, message: '无法获取当前标签页' });
      return;
    }

    setLoading(true);

    try {
      const cleaningResult = await clearStorage(tab.id, tab.url, options);
      setResult(cleaningResult);

      // Save user preferences
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh,
        selectedTypes: options,
      });

      // Auto refresh if enabled
      if (autoRefresh && cleaningResult.success && tab.id !== undefined) {
        setSnackbar({ open: true, message: '页面即将刷新，Popup 将关闭' });
        setTimeout(() => {
          chrome.tabs.reload(tab.id!);
        }, 1500);
      }
    } catch (err) {
      setSnackbar({ open: true, message: `清理失败: ${String(err)}` });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh]);

  const handleRefresh = useCallback(async () => {
    const tab = await getCurrentTab();
    if (tab?.id !== undefined) {
      setSnackbar({ open: true, message: '页面即将刷新，Popup 将关闭' });
      setTimeout(() => {
        chrome.tabs.reload(tab.id!);
      }, 1500);
    }
  }, []);

  if (error) {
    return (
      <Paper sx={{ p: 2, m: 1, borderRadius: 2 }}>
        <Alert severity="error" icon={<WarningIcon />}>
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 1, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          存储清理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          当前页面: {domain || '加载中...'}
        </Typography>
      </Box>

      {/* Storage Type Options */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          选择要清理的存储类型：
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.localStorage}
                onChange={() => handleOptionChange('localStorage')}
              />
            }
            label="localStorage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.sessionStorage}
                onChange={() => handleOptionChange('sessionStorage')}
              />
            }
            label="sessionStorage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.indexedDB}
                onChange={() => handleOptionChange('indexedDB')}
              />
            }
            label="IndexedDB"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.cookies}
                onChange={() => handleOptionChange('cookies')}
              />
            }
            label="Cookies"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.cacheStorage}
                onChange={() => handleOptionChange('cacheStorage')}
              />
            }
            label="Cache Storage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.serviceWorkers}
                onChange={() => handleOptionChange('serviceWorkers')}
              />
            }
            label="Service Workers"
          />
        </Box>
      </Box>

      {/* Auto Refresh Option */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          }
          label="清理完成后自动刷新页面"
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          fullWidth
        >
          {loading ? '清理中...' : '清理'}
        </Button>
      </Box>

      {/* Result Display */}
      {result && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity={result.success ? 'success' : 'error'}
            sx={{ mb: !autoRefresh && result.success ? 1 : 0 }}
          >
            {result.success ? formatCleaningResult(result) : result.error || '清理失败'}
          </Alert>
          {!autoRefresh && result.success && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              fullWidth
            >
              刷新页面
            </Button>
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          <Typography variant="h6">确认清理</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
            将清理以下存储类型：
          </Typography>
          <Box sx={{ mb: 1 }}>
            {options.localStorage && (
              <Typography variant="body2">- localStorage</Typography>
            )}
            {options.sessionStorage && (
              <Typography variant="body2">- sessionStorage</Typography>
            )}
            {options.indexedDB && <Typography variant="body2">- IndexedDB</Typography>}
            {options.cookies && <Typography variant="body2">- Cookies</Typography>}
            {options.cacheStorage && (
              <Typography variant="body2">- Cache Storage</Typography>
            )}
            {options.serviceWorkers && (
              <Typography variant="body2">- Service Workers</Typography>
            )}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 1 }}
          >
            此操作不可撤销。
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setShowConfirm(false)}>
              取消
            </Button>
            <Button variant="contained" color="error" onClick={handleClean}>
              确认清理
            </Button>
          </Box>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="info" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
