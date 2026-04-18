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
  CircularProgress,
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
  getIndexedDBSize,
  getCacheStorageSize,
  getServiceWorkerCount,
  formatSize,
} from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';

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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { snackbarProps, showMessage } = useSnackbar();
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, []);

  const loadInfo = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab || !tab.url) {
        setError('无法获取当前标签页');
        return;
      }
      if (isRestrictedUrl(tab.url)) {
        setError('存储清理功能不支持此页面');
        return;
      }
      
      // 重置错误状态
      setError('');
      
      const url = tab.url;
      const tabId = tab.id!;
      setDomain(new URL(url).hostname);

      const [savedPrefs, cSize, lsSize, ssSize, idbSize, cacheCount, swCount] = await Promise.all([
        storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES),
        getCookieSize(url),
        getLocalStorageSize(tabId),
        getSessionStorageSize(tabId),
        getIndexedDBSize(tabId),
        getCacheStorageSize(tabId),
        getServiceWorkerCount(tabId),
      ]);

      if (savedPrefs) {
        setAutoRefresh(savedPrefs.autoRefresh ?? DEFAULT_PREFERENCES.autoRefresh);
        setOptions(savedPrefs.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
      }
      
      setSizes({
        cookies: cSize,
        localStorage: lsSize,
        sessionStorage: ssSize,
        indexedDB: idbSize,
        cacheStorage: cacheCount,
        serviceWorkers: swCount,
      });
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const loadInfoRef = useRef(loadInfo);
  loadInfoRef.current = loadInfo;

  useEffect(() => {
    loadInfoRef.current();

    const handleTabChange = () => loadInfoRef.current();
    const handleTabUpdated = (_tabId: number, changeInfo: { status?: string; url?: string }) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        loadInfoRef.current();
      }
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.windows.onFocusChanged.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      chrome.windows.onFocusChanged.removeListener(handleTabChange);
    };
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

      // 5秒后自动清除结果提示
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = setTimeout(() => {
        setResult(null);
      }, 5000);

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
  }, [options, autoRefresh, showMessage, loadInfo]);

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={24} color="warning" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ 
        py: 8, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              p: 4,
              boxShadow: '0 8px 24px rgba(244, 67, 54, 0.15)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              bgcolor: 'rgba(244, 67, 54, 0.05)'
            }}
          >
            <WarningIcon sx={{ fontSize: 36, color: 'error.main', mb: 2 }} />
            <Typography 
              variant="body1" 
              color="error.main" 
              sx={{ 
                fontSize: '0.9rem',
                fontWeight: 700,
                lineHeight: 1.4,
                mb: 3
              }}
            >
              {error}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 500,
                lineHeight: 1.4
              }}
            >
              存储清理功能仅适用于标准网页
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // 这里的总大小仅包含以字节计算的项
  const totalSize = (sizes.cookies || 0) + (sizes.localStorage || 0) + (sizes.sessionStorage || 0) + (sizes.indexedDB || 0);

  const OptionItem = ({
    label,
    checked,
    size,
    isCount = false,
    onChange,
  }: {
    label: string;
    checked: boolean;
    size?: number;
    isCount?: boolean;
    onChange: () => void;
  }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        px: 1.5,
        borderRadius: 3,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: checked ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
        border: `1px solid ${checked ? 'rgba(255, 152, 0, 0.2)' : 'transparent'}`,
        '&:hover': { 
          bgcolor: checked ? 'rgba(255, 152, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={checked ? storageCleanerPageStyles.warningColor : 'text.primary'}
          sx={{ 
            fontSize: '0.75rem', 
            display: 'block', 
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.2s'
          }}
        >
          {label}
        </Typography>
        {size !== undefined && size > 0 ? (
          <Typography
            variant="caption"
            sx={{ 
              color: 'text.secondary', 
              fontSize: '0.65rem', 
              fontWeight: 600,
              display: 'block',
              mt: 0.3,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              opacity: 0.8
            }}
          >
            {isCount ? `${size} 个` : formatSize(size)}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{ 
              color: 'grey.400', 
              fontSize: '0.65rem', 
              fontWeight: 500,
              display: 'block',
              mt: 0.3,
              lineHeight: 1,
              fontStyle: 'italic'
            }}
          >
            无数据
          </Typography>
        )}
      </Box>
      <Checkbox
        size="small"
        checked={checked}
        onChange={onChange}
        color="warning"
        sx={{
          p: 0.6,
          '& .MuiSvgIcon-root': {
            fontSize: 18,
            transition: 'transform 0.2s'
          },
          '&:hover .MuiSvgIcon-root': {
            transform: 'scale(1.1)'
          }
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ pb: 2 }}>
      <Container sx={{ py: 2 }}>
        {/* Domain Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              color: storageCleanerPageStyles.warningColor,
              display: 'flex',
              boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255, 152, 0, 0.15)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <StorageIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ 
                  letterSpacing: '-0.5px', 
                  lineHeight: 1.2,
                  fontSize: '1rem',
                  color: 'text.primary'
                }}
              >
                存储清理
              </Typography>
              {totalSize > 0 && (
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 152, 0, 0.15)',
                    color: storageCleanerPageStyles.warningColor,
                    px: 1.5,
                    py: 0.3,
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    boxShadow: '0 2px 4px rgba(255, 152, 0, 0.2)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 152, 0, 0.25)'
                    }
                  }}
                >
                  已占用 {formatSize(totalSize)}
                </Box>
              )}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                display: 'block',
                maxWidth: 240,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mt: 0.3,
                fontSize: '0.75rem'
              }}
            >
              {domain || '加载中...'}
            </Typography>
          </Box>
        </Stack>

        {/* Storage Options Grid */}
        <Box
          sx={{
            mb: 3,
            border: '1px solid',
            borderColor: 'grey.100',
            borderRadius: 4,
            p: 1.2,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Grid container spacing={1.5}>
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
                label="Session Storage"
                checked={options.sessionStorage}
                size={sizes.sessionStorage}
                onChange={() => handleOptionChange('sessionStorage')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="IndexedDB"
                checked={options.indexedDB}
                size={sizes.indexedDB}
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
                label="Cache Storage"
                checked={options.cacheStorage}
                size={sizes.cacheStorage}
                isCount
                onChange={() => handleOptionChange('cacheStorage')}
              />
            </Grid>
            <Grid size={6}>
              <OptionItem
                label="Service Workers"
                checked={options.serviceWorkers}
                size={sizes.serviceWorkers}
                isCount
                onChange={() => handleOptionChange('serviceWorkers')}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 1.2, borderColor: 'grey.100' }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.5,
              py: 0.6,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              全选所有项
            </Typography>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              color="warning"
              sx={{
                p: 0.6,
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                  transition: 'transform 0.2s'
                },
                '&:hover .MuiSvgIcon-root': {
                  transform: 'scale(1.1)'
                }
              }}
            />
          </Box>
        </Box>

        {/* Auto Refresh Toggle */}
        <Box
          sx={{
            mb: 3,
            p: 1.5,
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.100',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
            清理后自动刷新页面
          </Typography>
          <Switch
            size="small"
            checked={autoRefresh}
            onChange={(e) => handleAutoRefreshChange(e.target.checked)}
            color="warning"
            sx={{
              '& .MuiSwitch-track': {
                borderRadius: 20,
              },
              '& .MuiSwitch-thumb': {
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s'
              },
              '&:hover .MuiSwitch-thumb': {
                transform: 'scale(1.1)'
              }
            }}
          />
        </Box>

        {/* Primary Action */}
        <Button
          variant="contained"
          onClick={() => setShowConfirm(true)}
          sx={{
            py: 1.3,
            borderRadius: 4,
            bgcolor: storageCleanerPageStyles.warningColor,
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              bgcolor: storageCleanerPageStyles.warningDark, 
              boxShadow: '0 8px 20px rgba(255, 152, 0, 0.35)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          }}
          disabled={loading}
          fullWidth
        >
          {loading ? '正在清理...' : '立即清理'}
        </Button>

        {/* Result & Refresh Secondary Action */}
        {result && (
          <Box sx={{ mt: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
            <Alert
              severity={result.success ? 'success' : 'error'}
              sx={{
                borderRadius: 3,
                py: 1,
                px: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                '& .MuiAlert-message': { 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  lineHeight: 1.4
                },
                '& .MuiAlert-icon': {
                  fontSize: '1.2rem',
                  mr: 1
                }
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
