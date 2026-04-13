import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@/components/Button';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import StorageCleanerConfirm from '@/components/StorageCleanerConfirm';
import { storageUtil } from '@/utils/chromeStorage';
import type {
  StorageCleanerOptions,
  CleaningResult,
  StorageCleanerPreferences,
} from '@/types/storage';
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
  const { snackbarProps, showMessage } = useSnackbar();

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
      const prefs = await storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES);
      setAutoRefresh(prefs?.autoRefresh ?? DEFAULT_PREFERENCES.autoRefresh);
      setOptions(prefs?.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
    };

    loadInfo();
  }, []);

  const handleAutoRefreshChange = useCallback(async (checked: boolean) => {
    setAutoRefresh(checked);
    // Save preference immediately
    const prefs = await storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES);
    await storageUtil.set('storageCleaner/preferences', {
      ...(prefs || DEFAULT_PREFERENCES),
      autoRefresh: checked,
    });
  }, []);

  const handleOptionChange = useCallback(async (key: keyof StorageCleanerOptions) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: !prev[key] };
      // Save options immediately
      storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES).then((prefs) => {
        storageUtil.set('storageCleaner/preferences', {
          ...(prefs || DEFAULT_PREFERENCES),
          selectedTypes: newOptions,
        });
      });
      return newOptions;
    });
  }, []);

  const allSelected = Object.values(options).every(Boolean);
  const someSelected = Object.values(options).some(Boolean) && !allSelected;

  const handleSelectAll = useCallback(async (checked: boolean) => {
    const newOptions = {
      localStorage: checked,
      sessionStorage: checked,
      indexedDB: checked,
      cookies: checked,
      cacheStorage: checked,
      serviceWorkers: checked,
    };
    setOptions(newOptions);

    // Save options immediately
    const prefs = await storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES);
    await storageUtil.set('storageCleaner/preferences', {
      ...(prefs || DEFAULT_PREFERENCES),
      selectedTypes: newOptions,
    });
  }, []);

  const handleClean = useCallback(async () => {
    const tab = await getCurrentTab();

    if (!tab || !tab.id || !tab.url) {
      showMessage('无法获取当前标签页');
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
        showMessage('页面即将刷新，Popup 将关闭');
        setTimeout(() => {
          chrome.tabs.reload(tab.id!);
        }, 1500);
      }
    } catch (err) {
      showMessage(`清理失败: ${String(err)}`, { severity: 'error' });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh, showMessage]);

  const handleRefresh = useCallback(async () => {
    const tab = await getCurrentTab();
    if (tab?.id !== undefined) {
      showMessage('页面即将刷新，Popup 将关闭');
      setTimeout(() => {
        chrome.tabs.reload(tab.id!);
      }, 1500);
    }
  }, [showMessage]);

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
        <Typography variant="body2" color="text.secondary">
          当前页面: {domain || '加载中...'}
        </Typography>
      </Box>

      {/* Storage Type Options */}
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          bgcolor: 'grey.50',
          borderRadius: 2,
          mb: 2,
          '&:before': { display: 'none' },
          '&.Mui-expanded': { m: 0, mb: 2 },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.1rem' }} />}
          sx={{
            px: 2,
            minHeight: 48,
            '&.Mui-expanded': { minHeight: 48 },
            '& .MuiAccordionSummary-content': { my: 1, '&.Mui-expanded': { my: 1 } },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            清理选项 {allSelected ? '(全部)' : someSelected ? '(部分)' : '(未选)'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.localStorage}
                  onChange={() => handleOptionChange('localStorage')}
                />
              }
              label={<Typography variant="body2">localStorage</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.sessionStorage}
                  onChange={() => handleOptionChange('sessionStorage')}
                />
              }
              label={<Typography variant="body2">sessionStorage</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.indexedDB}
                  onChange={() => handleOptionChange('indexedDB')}
                />
              }
              label={<Typography variant="body2">IndexedDB</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.cookies}
                  onChange={() => handleOptionChange('cookies')}
                />
              }
              label={<Typography variant="body2">Cookies</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.cacheStorage}
                  onChange={() => handleOptionChange('cacheStorage')}
                />
              }
              label={<Typography variant="body2">Cache Storage</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={options.serviceWorkers}
                  onChange={() => handleOptionChange('serviceWorkers')}
                />
              }
              label={<Typography variant="body2">Service Workers</Typography>}
            />
            <Divider sx={{ my: 1, opacity: 0.6 }} />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  全选
                </Typography>
              }
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Auto Refresh Option */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoRefresh}
              onChange={(e) => handleAutoRefreshChange(e.target.checked)}
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
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
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
      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />

      {/* Snackbar */}
      <GlobalSnackbar {...snackbarProps} />
    </Paper>
  );
}
