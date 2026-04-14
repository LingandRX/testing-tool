import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { storageUtil } from '@/utils/chromeStorage';

export default function OpenUrlViewerPage() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // 从存储加载当前选中的 URL
  useEffect(() => {
    const loadCurrentUrl = async () => {
      try {
        const saved = await storageUtil.get('openUrl/currentUrl', '');
        if (saved) {
          setCurrentUrl(saved);
        }
      } catch (error) {
        console.error('Failed to load current URL:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCurrentUrl();
  }, []);

  if (!isLoaded) {
    return <Box sx={{ p: 2, flex: 1 }}>Loading...</Box>;
  }

  if (!currentUrl) {
    return (
      <Box sx={{ p: 2, flex: 1 }}>
        没有选中的 URL，请先在 OpenUrl 页面选择一个 URL 打开。
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <iframe
        src={currentUrl}
        title="OpenUrl Viewer"
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
