import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Box,
  TextField,
  Alert,
  List,
  ListItem,
  IconButton,
  Typography,
  Divider,
  Container,
  Stack,
  alpha,
  Theme,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import Button from '@/components/Button';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { storageUtil } from '@/utils/chromeStorage';
import { useRouter } from '@/providers/RouterProvider';
import type { OpenUrlPreferences, OpenUrlEntry } from '@/types/storage';

const THEME_COLOR = '#9c27b0';

const INPUT_STYLE = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'background.paper',
    borderRadius: 3.5,
    border: '1px solid',
    borderColor: 'grey.100',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'grey.300', bgcolor: 'grey.50' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      borderColor: THEME_COLOR,
      boxShadow: (_theme: Theme) => `0 0 0 4px ${alpha(THEME_COLOR, 0.1)}`,
    },
  },
  '& .MuiInputBase-input': {
    py: 1.2,
    px: 2,
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'text.secondary',
    mb: 0.5,
    '&.Mui-focused': { color: THEME_COLOR },
  },
};

const DEFAULT_PREFERENCES: OpenUrlPreferences = {
  entries: [],
};

export default function OpenUrlPage() {
  const [entries, setEntries] = useState<OpenUrlEntry[]>(DEFAULT_PREFERENCES.entries);
  const [newName, setNewName] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { snackbarProps, showMessage } = useSnackbar();
  const { syncNavigation } = useRouter();

  const showMixedContentWarning =
    newUrl.startsWith('http://') && !newUrl.includes('localhost') && !newUrl.includes('127.0.0.1');

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

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

  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
    showMessage('删除成功', { severity: 'success' });
  };

  const handleOpenInSidebar = async (entry: OpenUrlEntry) => {
    try {
      await storageUtil.set('openUrl/currentUrl', entry.url);
      syncNavigation('openUrlViewer');

      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tabId = currentTab.id;
      if (!tabId) {
        showMessage('无法获取当前标签页', { severity: 'error' });
        return;
      }

      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true,
      });
      await chrome.sidePanel.open({ windowId: currentTab.windowId });
      window.close();
    } catch (error) {
      console.error('Failed to open side panel:', error);
      showMessage(`打开失败: ${(error as Error).message}`, { severity: 'error' });
    }
  };

  const handleOpenInNewTab = (entry: OpenUrlEntry) => {
    chrome.tabs.create({ url: entry.url });
    window.close();
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Container sx={{ py: 2 }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: alpha(THEME_COLOR, 0.1),
              color: THEME_COLOR,
              display: 'flex',
            }}
          >
            <LanguageIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={900}
              sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}
            >
              URL 实验室
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              多环境跳转与安全性预检
            </Typography>
          </Box>
        </Stack>

        {/* Form Section */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'grey.100',
            mb: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="环境名称"
              placeholder="例如: 本地文档"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              variant="outlined"
              sx={INPUT_STYLE}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="目标 URL"
              placeholder="例如: http://localhost:8000/docs"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              fullWidth
              variant="outlined"
              sx={INPUT_STYLE}
              InputLabelProps={{ shrink: true }}
            />

            {showMixedContentWarning && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 3,
                  '& .MuiAlert-message': { fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.4 },
                }}
              >
                混合内容警告：当前 HTTPS 页面无法加载 HTTP 资源。
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleAddEntry}
              disabled={!newName.trim() || !isValidUrl(newUrl)}
              fullWidth
              startIcon={<AddIcon />}
              sx={{
                py: 1.2,
                borderRadius: 4,
                bgcolor: THEME_COLOR,
                fontWeight: 800,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: alpha(THEME_COLOR, 0.85),
                  boxShadow: `0 8px 24px ${alpha(THEME_COLOR, 0.2)}`,
                },
              }}
            >
              添加快捷方式
            </Button>
          </Stack>
        </Box>

        {/* List Section */}
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 800, px: 1, mb: 1, display: 'block' }}
          >
            已保存的快捷方式 ({entries.length})
          </Typography>

          {entries.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                bgcolor: 'grey.50',
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'grey.200',
              }}
            >
              <LinkIcon sx={{ color: 'grey.300', fontSize: 40, mb: 1 }} />
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: 'block', fontWeight: 600 }}
              >
                暂无快捷方式，请在上方添加
              </Typography>
            </Box>
          ) : (
            <List
              disablePadding
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'grey.100',
                overflow: 'hidden',
              }}
            >
              {entries.map((entry, index) => (
                <Fragment key={index}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                        noWrap
                      >
                        {entry.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          display: 'block',
                          mt: 0.2,
                          fontFamily: 'monospace',
                        }}
                      >
                        {entry.url}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="在侧边栏预览">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenInSidebar(entry)}
                          sx={{
                            color: THEME_COLOR,
                            bgcolor: alpha(THEME_COLOR, 0.05),
                            '&:hover': { bgcolor: THEME_COLOR, color: '#fff' },
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="新标签页打开">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenInNewTab(entry)}
                          sx={{
                            color: 'grey.500',
                            bgcolor: 'grey.100',
                            '&:hover': { bgcolor: 'grey.600', color: '#fff' },
                          }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEntry(index)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { color: 'error.dark', bgcolor: alpha('#f44336', 0.05) },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                  {index < entries.length - 1 && <Divider sx={{ mx: 2, borderColor: 'grey.50' }} />}
                </Fragment>
              ))}
            </List>
          )}
        </Box>
      </Container>
      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
