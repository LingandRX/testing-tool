import { Fragment } from 'react';
import { Box, ListItem, Typography, Stack, Divider, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha } from '@mui/material/styles';
import { storageUtil } from '@/utils/chromeStorage';
import type { OpenUrlEntry } from '@/types/storage';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';
import { openUrlPageStyles } from '@/config/pageTheme';

interface UrlEntryItemProps {
  entry: OpenUrlEntry;
  index: number;
  isLast: boolean;
  onDelete: (index: number) => void;
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

const UrlEntryItem = ({ entry, index, isLast, onDelete, showMessage }: UrlEntryItemProps) => {
  const handleOpenInSidebar = async (entry: OpenUrlEntry) => {
    try {
      // 存储目标 URL
      await storageUtil.set('openUrl/currentUrl', entry.url);
      // 直接设置侧边栏的路由，而不是通过 syncNavigation 影响弹窗路由
      await storageUtil.set('app/sidepanelRoute', 'openUrlViewer');

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

      // 仅当在 Popup 中时才关闭窗口，防止在侧边栏内点击预览时导致侧边栏关闭
      if (window.location.pathname.includes('popup.html')) {
        window.close();
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
      showMessage(`打开失败: ${(error as Error).message}`, { severity: 'error' });
    }
  };

  const handleOpenInNewTab = (entry: OpenUrlEntry) => {
    chrome.tabs.create({ url: entry.url });
    window.close();
  };

  const handleDelete = () => {
    onDelete(index);
  };

  return (
    <Fragment>
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
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }} noWrap>
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
                color: openUrlPageStyles.themeColor,
                bgcolor: alpha(openUrlPageStyles.themeColor, 0.05),
                '&:hover': { bgcolor: openUrlPageStyles.themeColor, color: '#fff' },
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
              onClick={handleDelete}
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
      {!isLast && <Divider sx={{ mx: 2, borderColor: 'grey.50' }} />}
    </Fragment>
  );
};

export default UrlEntryItem;
