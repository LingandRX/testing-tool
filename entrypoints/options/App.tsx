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
  Tabs,
  Tab,
  alpha,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getFeatureByKey,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';
import GlobalSnackbar, { useSnackbarState } from '@/components/GlobalSnackbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import PageHeader from '@/components/PageHeader';
import { THEME_COLORS } from '@/config/pageTheme';

type WindowType = 'popup' | 'sidepanel' | 'tab';

/**
 * Options 设置页面主组件
 * 支持对不同窗口入口的功能显示和排序进行独立配置
 */
export default function App() {
  // 从 URL 参数中初始化当前的 Tab 类型
  const initialWindowType = useMemo(() => {
    if (typeof window === 'undefined') return 'popup';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'popup' || tab === 'sidepanel' || tab === 'tab') {
      return tab as WindowType;
    }
    return 'popup';
  }, []);

  const [windowType, setWindowType] = useState<WindowType>(initialWindowType);
  const [visiblePages, setVisiblePages] = useState<PageType[]>([]);
  const [pageOrder, setPageOrder] = useState<PageType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { snackbarProps, showMessage } = useSnackbarState();

  // 根据当前选择的窗口类型确定对应的 Storage Key
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

  // 当 windowType 改变时，同步更新 URL 参数
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', windowType);
    window.history.replaceState({}, '', url.toString());
  }, [windowType]);

  // 加载配置数据
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

  /**
   * 切换页面可见性
   */
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

  /**
   * 调整页面显示顺序
   */
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

  /**
   * 恢复默认设置
   */
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
      showToast('已恢复当前模式默认设置', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败', 'warning');
    }
  };

  const handleWindowTypeChange = (_event: React.SyntheticEvent, newType: WindowType) => {
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
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ErrorBoundary>
        {/* 顶部标题与导航栏 */}
        <Box
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            pt: { xs: 3, sm: 5 },
            pb: 0,
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <PageHeader
              icon={<SettingsIcon />}
              iconColor={THEME_COLORS.primary}
              title="应用设置"
              subtitle="针对不同窗口类型独立配置 Dashboard 中显示的功能及其排序"
              sx={{ mb: 4 }}
            />
            <Tabs
              value={windowType}
              onChange={handleWindowTypeChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minWidth: { xs: 100, sm: 140 },
                  letterSpacing: '0.3px',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab value="popup" label="Popup 窗口" />
              <Tab value="sidepanel" label="侧边栏" />
              <Tab value="tab" label="标签页" />
            </Tabs>
          </Box>
        </Box>

        {/* 主内容区域 */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 4 } }}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2.5 }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleRestoreDefaults}
                startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: 'grey.200',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: alpha(THEME_COLORS.primary, 0.04),
                  },
                }}
              >
                恢复当前模式默认
              </Button>
            </Stack>

            {!isLoaded ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress size={32} thickness={5} />
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
                  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
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
                          p: { xs: 2, sm: 2.5 },
                          borderBottom: index === array.length - 1 ? 'none' : '1px solid',
                          borderColor: 'grey.100',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: alpha(feature.themeColor || THEME_COLORS.primary, 0.02),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={{ xs: 1.5, sm: 2.5 }}
                          alignItems="center"
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          {/* 拖拽/排序暗示图标 */}
                          <Box sx={{ color: 'grey.300', display: 'flex' }}>
                            <DragIndicatorIcon fontSize="small" />
                          </Box>

                          {/* 功能图标容器 */}
                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: 2.5,
                              bgcolor: alpha(feature.themeColor || THEME_COLORS.primary, 0.1),
                              color: feature.themeColor || THEME_COLORS.primary,
                              display: 'flex',
                              flexShrink: 0,
                            }}
                          >
                            {feature.icon}
                          </Box>

                          {/* 文本信息 */}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                fontSize: '0.95rem',
                                lineHeight: 1.2,
                                mb: 0.5,
                              }}
                            >
                              {feature.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {feature.description || '暂无描述'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, sm: 2 } }}>
                          {/* 移动操作按钮 */}
                          <Stack direction="row" sx={{ display: 'flex', mr: { xs: 0, sm: 1 } }}>
                            <IconButton
                              size="small"
                              onClick={() => handleMove(index, 'up')}
                              disabled={index === 0}
                              sx={{
                                color: 'grey.400',
                                p: { xs: 0.5, sm: 1 },
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: alpha(THEME_COLORS.primary, 0.08),
                                },
                              }}
                            >
                              <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMove(index, 'down')}
                              disabled={index === array.length - 1}
                              sx={{
                                color: 'grey.400',
                                p: { xs: 0.5, sm: 1 },
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: alpha(THEME_COLORS.primary, 0.08),
                                },
                              }}
                            >
                              <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                              mx: { xs: 0.5, sm: 1 },
                              display: 'block',
                              height: 24,
                              alignSelf: 'center',
                            }}
                          />

                          {/* 显示切换开关 */}
                          <Switch
                            color="primary"
                            checked={isChecked}
                            onChange={() => handlePageToggle(key)}
                            disabled={isDisabled}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: feature.themeColor || THEME_COLORS.primary,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: feature.themeColor || THEME_COLORS.primary,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </ErrorBoundary>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
