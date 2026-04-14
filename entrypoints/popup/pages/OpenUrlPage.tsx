import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  TextField,
  Alert,
  List,
  ListItem,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import Button from '@/components/Button';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { storageUtil } from '@/utils/chromeStorage';
import type { OpenUrlPreferences, OpenUrlEntry, PageType } from '@/types/storage';

const DEFAULT_PREFERENCES: OpenUrlPreferences = {
  entries: [],
};

export default function OpenUrlPage() {
  const [entries, setEntries] = useState<OpenUrlEntry[]>(DEFAULT_PREFERENCES.entries);
  const [newName, setNewName] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { snackbarProps, showMessage } = useSnackbar();

  // 混合内容警告检查
  const showMixedContentWarning =
    newUrl.startsWith('http://') && !newUrl.includes('localhost') && !newUrl.includes('127.0.0.1');

  // 验证 URL 是否有效
  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
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
        if (saved && saved.entries) {
          setEntries(saved.entries);
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
    const preferences: OpenUrlPreferences = { entries };
    storageUtil.set('openUrl/preferences', preferences).catch((error) => {
      console.error('Failed to save Open Url preferences:', error);
    });
  }, [entries]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      savePreferences();
    }, 500);
    return () => clearTimeout(timer);
  }, [entries, isLoaded, savePreferences]);

  // 添加新条目
  const handleAddEntry = () => {
    if (!newName.trim()) {
      showMessage('请输入名称', { severity: 'error' });
      return;
    }
    if (!isValidUrl(newUrl)) {
      showMessage('请输入有效的 URL', { severity: 'error' });
      return;
    }

    setEntries([...entries, { name: newName.trim(), url: newUrl.trim() }]);
    setNewName('');
    setNewUrl('');
    showMessage('添加成功', { severity: 'success' });
  };

  // 删除条目
  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
    showMessage('删除成功', { severity: 'success' });
  };

  // 在侧边栏打开 URL
  const handleOpenInSidebar = async (entry: OpenUrlEntry) => {
    try {
      // 保存当前选中的 URL
      await storageUtil.set('openUrl/currentUrl', entry.url);
      // 切换到查看页面
      await storageUtil.set('app/currentRoute', 'openUrlViewer' as PageType);

      // 获取当前标签页并打开侧边栏
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tabId = currentTab.id;
      if (!tabId) {
        showMessage('无法获取当前标签页', { severity: 'error' });
        return;
      }

      // 设置侧边栏为插件自己的页面
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true,
      });
      await chrome.sidePanel.open({ windowId: currentTab.windowId });

      // 关闭弹出窗口
      window.close();

      showMessage(`已在侧边栏打开: ${entry.name}`, { severity: 'success' });
    } catch (error) {
      console.error('Failed to open side panel:', error);
      showMessage(`打开失败: ${(error as Error).message}`, { severity: 'error' });
    }
  };

  // 在新标签页打开 URL
  const handleOpenInNewTab = (entry: OpenUrlEntry) => {
    chrome.tabs.create({ url: entry.url });
    window.close();
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 添加新 URL 表单 */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          添加新的快捷方式
        </Typography>
        <TextField
          label="名称"
          placeholder="例如: 本地文档"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />
        <TextField
          label="URL"
          placeholder="例如: http://localhost:8000/docs"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />

        {showMixedContentWarning && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            ⚠️ 混合内容警告：当前 HTTPS 页面无法加载 HTTP 资源。请考虑使用 HTTPS 或确认目标是
            localhost。
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddEntry}
            disabled={!newName.trim() || !isValidUrl(newUrl)}
            fullWidth
            startIcon={<AddIcon />}
          >
            添加
          </Button>
        </Box>
      </Paper>

      {/* URL 列表 */}
      <Paper elevation={1} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          快捷方式列表
        </Typography>
        {entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            暂无快捷方式，请添加
          </Typography>
        ) : (
          <List disablePadding>
            {entries.map((entry, index) => (
              <div key={index}>
                <ListItem
                  disablePadding
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" noWrap>
                      {entry.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {entry.url}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenInSidebar(entry)}
                      title="在侧边栏打开"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenInNewTab(entry)}
                      title="在新标签页打开"
                      color="default"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteEntry(index)}
                      title="删除"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < entries.length - 1 && <Divider sx={{ my: 1 }} />}
              </div>
            ))}
          </List>
        )}
      </Paper>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
