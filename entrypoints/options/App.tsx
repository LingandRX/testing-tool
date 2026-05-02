import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getFeatureByKey,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';
import GlobalSnackbar, { useSnackbarState } from '@/components/GlobalSnackbar';
import ErrorBoundary from '@/components/ErrorBoundary';

type WindowType = 'popup' | 'sidepanel' | 'tab';

export default function App() {
  const [windowType, setWindowType] = useState<WindowType>('popup');
  const [visiblePages, setVisiblePages] = useState<PageType[]>([]);
  const [pageOrder, setPageOrder] = useState<PageType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { snackbarProps, showMessage } = useSnackbarState();

  const configKeys = useMemo(() => {
    switch (windowType) {
      case 'sidepanel':
        return {
          visible: 'app/sidepanelVisiblePages' as keyof StorageSchema,
          order: 'app/sidepanelPageOrder' as keyof StorageSchema,
        };
      case 'tab':
        return {
          visible: 'app/tabVisiblePages' as keyof StorageSchema,
          order: 'app/tabPageOrder' as keyof StorageSchema,
        };
      case 'popup':
      default:
        return {
          visible: 'app/popupVisiblePages' as keyof StorageSchema,
          order: 'app/popupPageOrder' as keyof StorageSchema,
        };
    }
  }, [windowType]);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoaded(false);
      try {
        const [savedVisible, savedOrder] = await Promise.all([
          storageUtil.get(configKeys.visible, getDefaultVisibleFeatureKeys()),
          storageUtil.get(configKeys.order, getDefaultPageOrder()),
        ]);
        setVisiblePages((savedVisible as PageType[]) ?? getDefaultVisibleFeatureKeys());
        setPageOrder((savedOrder as PageType[]) ?? getDefaultPageOrder());
      } catch (error) {
        console.error('Failed to load config:', error);
        setVisiblePages(getDefaultVisibleFeatureKeys());
        setPageOrder(getDefaultPageOrder());
      } finally {
        setIsLoaded(true);
      }
    };

    loadConfig().catch(console.error);
  }, [configKeys]);

  const handlePageToggle = async (page: PageType) => {
    const isCurrentlyVisible = visiblePages.includes(page);
    let newPages: PageType[];

    if (isCurrentlyVisible) {
      if (visiblePages.length <= 1) {
        showToast('至少需要保留一个可见页面', 'warning');
        return;
      }
      newPages = visiblePages.filter((p) => p !== page);
    } else {
      newPages = [...visiblePages, page];
    }

    try {
      await storageUtil.set(configKeys.visible, newPages);
      setVisiblePages(newPages);
      const feature = getFeatureByKey(page);
      showToast(`已${isCurrentlyVisible ? '隐藏' : '显示'} ${feature?.label || page}`, 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('保存失败', 'warning');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pageOrder.length - 1) return;

    const newOrder = [...pageOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    try {
      await storageUtil.set(configKeys.order, newOrder);
      setPageOrder(newOrder);
    } catch (error) {
      console.error('Failed to save order:', error);
      showToast('排序保存失败', 'warning');
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const defaults = getDefaultVisibleFeatureKeys();
      const defaultOrder = getDefaultPageOrder();

      await Promise.all([
        storageUtil.set(configKeys.visible, defaults),
        storageUtil.set(configKeys.order, defaultOrder),
      ]);

      setVisiblePages(defaults);
      setPageOrder(defaultOrder);
      showToast('已恢复默认', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败', 'warning');
    }
  };

  const handleWindowTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: WindowType | null,
  ) => {
    if (newType !== null) {
      setWindowType(newType);
    }
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning') => {
    showMessage(message, { severity });
  };

  return (
    <Box
      className="app"
      sx={{ p: 4, minHeight: '100vh', bgcolor: 'grey.50', display: 'block', overflowY: 'auto' }}
    >
      <ErrorBoundary>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Stack spacing={3} sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                功能显示配置
              </Typography>
              <Typography variant="body2" color="text.secondary">
                针对不同窗口类型独立配置 Dashboard 中显示的功能及其排序
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={windowType}
              exclusive
              onChange={handleWindowTypeChange}
              size="small"
              color="primary"
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="popup" sx={{ px: 3 }}>
                Popup 窗口
              </ToggleButton>
              <ToggleButton value="sidepanel" sx={{ px: 3 }}>
                侧边栏
              </ToggleButton>
              <ToggleButton value="tab" sx={{ px: 3 }}>
                标签页
              </ToggleButton>
            </ToggleButtonGroup>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="text"
                size="small"
                onClick={handleRestoreDefaults}
                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                sx={{ color: 'text.secondary', fontWeight: 600 }}
              >
                恢复默认
              </Button>
            </Stack>
          </Stack>

          {!isLoaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {pageOrder.map((key, index, array) => {
                  const feature = getFeatureByKey(key);
                  if (!feature) return null;

                  const isChecked = visiblePages.includes(key);
                  const isDisabled = isChecked && visiblePages.length === 1;

                  return (
                    <Box
                      key={key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2.5,
                        borderBottom: index === array.length - 1 ? 'none' : '1px solid',
                        borderColor: 'grey.100',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'grey.50' },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {feature.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isChecked ? '已在 Dashboard 启用' : '已在 Dashboard 隐藏'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          sx={{ color: 'text.secondary' }}
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === array.length - 1}
                          sx={{ color: 'text.secondary' }}
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                        <Switch
                          size="small"
                          checked={isChecked}
                          onChange={() => handlePageToggle(key)}
                          disabled={isDisabled}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Box>
      </ErrorBoundary>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
