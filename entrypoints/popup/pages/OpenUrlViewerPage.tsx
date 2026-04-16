import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { storageUtil } from '@/utils/chromeStorage';

// 只允许 HTTP/HTTPS 协议，阻止危险协议
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export default function OpenUrlViewerPage() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
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
  useEffect(() => {
    const loadCurrentUrl = async () => {
      try {
        const saved = await storageUtil.get('openUrl/currentUrl', '');
        if (saved) {
          const validationError = validateUrl(saved);
          if (validationError) {
            setError(validationError);
          } else {
            setCurrentUrl(saved);
            setError(null);
          }
        }
      } catch (error) {
        console.error('Failed to load current URL:', error);
        setError('加载 URL 失败');
      } finally {
        setIsLoaded(true);
      }
    };
    loadCurrentUrl();
  }, []);

  if (!isLoaded) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!currentUrl) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        <Typography color="text.secondary">
          没有选中的 URL，请先在 OpenUrl 页面选择一个 URL 打开。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
      />
    </Box>
  );
}
