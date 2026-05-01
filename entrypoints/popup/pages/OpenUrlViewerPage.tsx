import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { storageUtil } from '@/utils/chromeStorage';

// 只允许 HTTP/HTTPS 协议，阻止危险协议
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export default function OpenUrlViewerPage() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 验证 URL 是否安全
  const validateUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
        return `不支持的 URL 协议: ${urlObj.protocol}。仅允许 HTTP 和 HTTPS。`;
      }
      return null;
    } catch {
      return '无效的 URL 格式';
    }
  };

  // 从存储加载当前选中的 URL
  const loadCurrentUrl = useCallback(async () => {
    try {
      const saved = await storageUtil.get('openUrl/currentUrl', '');
      if (saved) {
        const validationError = validateUrl(saved);
        if (validationError) {
          setError(validationError);
        } else {
          setCurrentUrl(saved);
          setError(null);
          setIframeLoading(true); // 重置 iframe 加载状态
        }
      } else {
        setError(null);
        setCurrentUrl('');
      }
    } catch (error) {
      console.error('Failed to load current URL:', error);
      setError('加载 URL 失败');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadCurrentUrl();
  }, [loadCurrentUrl]);

  // 监听存储变化，确保 URL 变更时能及时更新
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['openUrl/currentUrl']) {
        loadCurrentUrl();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [loadCurrentUrl]);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          p: 2,
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography color="text.secondary">请返回 OpenUrl 页面选择有效的 URL。</Typography>
      </Box>
    );
  }

  if (!currentUrl) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          没有选中的 URL
        </Alert>
        <Typography color="text.secondary">请先在 OpenUrl 页面选择一个 URL 打开。</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 加载状态指示器 */}
      {iframeLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2 }}>加载中...</Typography>
          </Box>
        </Box>
      )}
      <iframe
        src={currentUrl}
        title="OpenUrl Viewer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-navigation"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          display: 'block',
        }}
        onLoad={() => setIframeLoading(false)}
        onError={() => {
          setIframeLoading(false);
          setError('URL 加载失败，请检查网络连接或 URL 是否正确');
        }}
      />
    </Box>
  );
}
