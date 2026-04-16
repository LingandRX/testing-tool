import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Box,
  Checkbox,
  Alert,
  Divider,
  Container,
  Stack,
  Switch,
  Grid,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import StorageIcon from '@mui/icons-material/Storage';
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
  getCookieSize,
  getLocalStorageSize,
  getSessionStorageSize,
  formatSize,
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
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { snackbarProps, showMessage } = useSnackbar();
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

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
    const url = tab.url;
    const tabId = tab.id!;
    setDomain(new URL(url).hostname);

    const [savedPrefs, cSize, lsSize, ssSize] = await Promise.all([
      storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES),
      getCookieSize(url),
      getLocalStorageSize(tabId),
      getSessionStorageSize(tabId),
    ]);

    setAutoRefresh(savedPrefs?.autoRefresh ?? DEFAULT_PREFERENCES.autoRefresh);
    setOptions(savedPrefs?.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
    setSizes({
      cookies: cSize,
      localStorage: lsSize,
      sessionStorage: ssSize,
    });
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleAutoRefreshChange = useCallback(
    async (checked: boolean) => {
      setAutoRefresh(checked);
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh: checked,
        selectedTypes: options,
      });
    },
    [options],
  );

  const handleOptionChange = useCallback(
    async (key: keyof StorageCleanerOptions) => {
      setOptions((prev) => {
        const newOptions = { ...prev, [key]: !prev[key] };
        storageUtil.set('storageCleaner/preferences', {
          autoRefresh,
          selectedTypes: newOptions,
        });
        return newOptions;
      });
    },
    [autoRefresh],
  );

  const allSelected = Object.values(options).every(Boolean);
  const someSelected = Object.values(options).some(Boolean) && !allSelected;

  const handleSelectAll = useCallback(
    async (checked: boolean) => {
      const newOptions = {
        localStorage: checked,
        sessionStorage: checked,
        indexedDB: checked,
        cookies: checked,
        cacheStorage: checked,
        serviceWorkers: checked,
      };
      setOptions(newOptions);
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh,
        selectedTypes: newOptions,
      });
    },
    [autoRefresh],
  );

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
      if (autoRefresh && cleaningResult.success && tab.id !== undefined) {
        showMessage('清理成功，即将刷新页面');
        reloadTimeoutRef.current = setTimeout(() => {
          chrome.tabs.reload(tab.id!);
        }, 1500);
      } else {
        loadInfo();
      }
    } catch (err) {
      showMessage(`清理失败: ${String(err)}`, { severity: 'error' });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh, showMessage]);

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" icon={<WarningIcon />} sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const totalSize = Object.values(sizes).reduce((acc, curr) => acc + curr, 0);

  const OptionItem = ({
    label,
    checked,
    size,
    onChange,
  }: {
    label: string;
    checked: boolean;
    size?: number;
    onChange: () => void;
  }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.6,
        px: 1.2,
        borderRadius: 2.5,
        transition: 'all 0.2s',
        '&:hover': { bgcolor: 'grey.50' },
      }}
    >
      <Stack direction="row" spacing={0.8} alignItems="baseline">
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.primary"
          sx={{ fontSize: '0.75rem' }}
        >
          {label}
        </Typography>
        {size !== undefined && size > 0 && (
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontSize: '0.65rem', fontWeight: 500 }}
          >
            {formatSize(size)}
          </Typography>
        )}
      </Stack>
      <Checkbox
        size="small"
        checked={checked}
        onChange={onChange}
        color="warning"
        sx={{ p: 0.5 }}
      />
    </Box>
  );

  return (
    <Box sx={{ pb: 2 }}>
      <Container sx={{ py: 2 }}>
        {/* Domain Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: '#fff4e5',
              color: '#ff9800',
              display: 'flex',
            }}
          >
            <StorageIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                variant="subtitle1"
                fontWeight={900}
                sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}
              >
                存储清理
              </Typography>
              {totalSize > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: '#fff4e5',
                    color: '#ff9800',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1.5,
                    fontWeight: 800,
                    fontSize: '0.65rem',
                  }}
                >
                  已占用 {formatSize(totalSize)}
                </Typography>
              )}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                display: 'block',
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {domain || '加载中...'}
            </Typography>
          </Box>
        </Stack>

        {/* Storage Options Grid */}
        <Box
          sx={{
            mb: 2,
            border: '1px solid',
            borderColor: 'grey.100',
            borderRadius: 4,
            p: 0.8,
            bgcolor: 'background.paper',
          }}
        >
          <Grid container spacing={0}>
            <Grid size={6}>
              <OptionItem
                label="LocalStorage"
                checked={options.localStorage}
                size={sizes.localStorage}
                onChange={() => handleOptionChange('localStorage')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="Session"
                checked={options.sessionStorage}
                size={sizes.sessionStorage}
                onChange={() => handleOptionChange('sessionStorage')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="IndexedDB"
                checked={options.indexedDB}
                onChange={() => handleOptionChange('indexedDB')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="Cookies"
                checked={options.cookies}
                size={sizes.cookies}
                onChange={() => handleOptionChange('cookies')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="Cache"
                checked={options.cacheStorage}
                onChange={() => handleOptionChange('cacheStorage')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="Workers"
                checked={options.serviceWorkers}
                onChange={() => handleOptionChange('serviceWorkers')}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 0.8, borderColor: 'grey.50' }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.2,
              py: 0.4,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ color: 'text.secondary', fontSize: '0.65rem' }}
            >
              全选所有项
            </Typography>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              color="warning"
              sx={{ p: 0.5 }}
            />
          </Box>
        </Box>

        {/* Auto Refresh Toggle */}
        <Box
          sx={{
            mb: 2,
            p: 1.2,
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.100',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" fontWeight={700}>
            清理后自动刷新页面
          </Typography>
          <Switch
            size="small"
            checked={autoRefresh}
            onChange={(e) => handleAutoRefreshChange(e.target.checked)}
            color="warning"
          />
        </Box>

        {/* Primary Action */}
        <Button
          variant="contained"
          onClick={() => setShowConfirm(true)}
          sx={{
            py: 1.2,
            borderRadius: 4,
            bgcolor: '#ff9800',
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#f57c00', boxShadow: '0 8px 16px rgba(255, 152, 0, 0.2)' },
          }}
          disabled={loading}
          fullWidth
        >
          {loading ? '正在清理...' : '立即清理'}
        </Button>

        {/* Result & Refresh Secondary Action */}
        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={result.success ? 'success' : 'error'}
              sx={{
                borderRadius: 2.5,
                py: 0,
                '& .MuiAlert-message': { fontSize: '0.75rem', fontWeight: 600 },
              }}
            >
              {result.success ? formatCleaningResult(result) : result.error || '清理失败'}
            </Alert>
          </Box>
        )}
      </Container>

      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />
      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
