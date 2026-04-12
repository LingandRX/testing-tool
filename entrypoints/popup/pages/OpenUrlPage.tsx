import { useState, useEffect, useCallback } from 'react';
import { Paper, Box, TextField, Alert, Snackbar } from '@mui/material';
import Button from '@/components/Button';
import { storageUtil } from '@/utils/chromeStorage';
import type { OpenUrlPreferences } from '@/types/storage';

const DEFAULT_PREFERENCES: OpenUrlPreferences = {
  apiUrl: '',
};

export default function OpenUrlPage() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_PREFERENCES.apiUrl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isLoaded, setIsLoaded] = useState(false);

  // 混合内容警告检查
  const showMixedContentWarning =
    apiUrl.startsWith('http://') && !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1');

  // 验证 URL 是否有效
  const isValidUrl = () => {
    if (!apiUrl.trim()) return false;
    try {
      new URL(apiUrl);
      return true;
    } catch {
      return false;
    }
  };

  // 从存储加载偏好设置
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await storageUtil.get('openUrl/preferences', DEFAULT_PREFERENCES);
        if (saved && saved.apiUrl) {
          setApiUrl(saved.apiUrl);
        }
      } catch (error) {
        console.error('Failed to load Open Url preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreferences();
  }, []);

  // 去抖保存到存储
  const savePreferences = useCallback(() => {
    const preferences: OpenUrlPreferences = { apiUrl };
    storageUtil.set('openUrl/preferences', preferences).catch((error) => {
      console.error('Failed to save Open Url preferences:', error);
    });
  }, [apiUrl]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      savePreferences();
    }, 500);
    return () => clearTimeout(timer);
  }, [apiUrl, isLoaded, savePreferences]);

  const showMessage = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleOpenInSidepanel = async () => {
    if (!isValidUrl()) {
      showMessage('请输入有效的 URL', 'error');
      return;
    }

    try {
      // 获取当前标签页
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tabId = currentTab.id;
      if (!tabId) {
        showMessage('无法获取当前标签页', 'error');
        return;
      }

      // 打开侧边栏并设置 URL
      await chrome.sidePanel.setOptions({
        tabId,
        path: apiUrl,
        enabled: true,
      });
      await chrome.sidePanel.open({ windowId: currentTab.windowId });

      showMessage('Your Url 已在侧边栏打开', 'success');
    } catch (error) {
      console.error('Failed to open side panel:', error);
      showMessage(`打开失败: ${(error as Error).message}`, 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
        <TextField
          label="API URL"
          placeholder="例如: http://localhost:8000/docs"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          fullWidth
          multiline
          margin="normal"
          variant="outlined"
        />

        {showMixedContentWarning && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            ⚠️ 混合内容警告：当前 HTTPS 页面无法加载 HTTP 资源。请考虑使用 HTTPS 或确认目标是
            localhost。
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleOpenInSidepanel}
            disabled={!isValidUrl()}
            fullWidth
          >
            Open Url in Sidepanel
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        color={snackbarSeverity === 'success' ? 'success' : 'error'}
      />
    </Box>
  );
}
