import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
  getFeatureByKey,
} from '@/config/features';
import GlobalSnackbar, { useSnackbarState } from '@/components/GlobalSnackbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import PageHeader from '@/components/PageHeader';
import { useTheme, type PaletteColor, type Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { PaletteColorKey } from '@/config/features';

const getPaletteColor = (theme: Theme, key: PaletteColorKey): PaletteColor =>
  (theme.palette as unknown as Record<string, PaletteColor>)[key];

const isValidPage = (page: unknown): page is PageType => {
  return typeof page === 'string' && (getAllFeatureKeys() as string[]).includes(page);
};

const isValidPageList = (pages: unknown): pages is PageType[] => {
  return Array.isArray(pages) && pages.every(isValidPage);
};

type WindowType = 'popup' | 'sidepanel' | 'tab';

interface SortableFeatureRowProps {
  pageKey: PageType;
  isLast: boolean;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (key: PageType) => void;
}

function SortableFeatureRow({
  pageKey,
  isLast,
  isChecked,
  isDisabled,
  onToggle,
}: SortableFeatureRowProps) {
  const theme = useTheme();
  const { t } = useTranslation(['features']);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pageKey,
  });

  const feature = getFeatureByKey(pageKey);
  if (!feature) return null;

  const colorKey = feature.themeColorKey ?? 'primary';
  const colorCode = getPaletteColor(theme, colorKey).main;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative' as const,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 2, sm: 2.5 },
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        bgcolor: isDragging ? alpha(colorCode, 0.04) : 'transparent',
        boxShadow: isDragging ? `0 8px 20px ${alpha('#000', 0.08)}` : 'none',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          bgcolor: alpha(colorCode, 0.02),
        },
        '&:hover .drag-handle': {
          color: 'text.secondary',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems="center"
        sx={{ flex: 1, minWidth: 0 }}
      >
        {/* 拖拽手柄 - 整行可拖,手柄是视觉暗示 */}
        <Box
          className="drag-handle"
          {...attributes}
          {...listeners}
          sx={{
            color: alpha(theme.palette.text.primary, 0.2),
            display: 'flex',
            cursor: 'grab',
            touchAction: 'none',
            transition: 'color 0.2s',
            '&:active': { cursor: 'grabbing' },
            '&:hover': { color: 'text.secondary' },
          }}
          aria-label={`拖拽以调整 ${t(feature.labelKey)} 的位置`}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>

        {/* 功能图标 */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor: alpha(colorCode, 0.1),
            color: colorCode,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {feature.icon}
        </Box>

        {/* 文本信息 */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '0.95rem',
              lineHeight: 1.3,
            }}
          >
            {t(feature.labelKey)}
          </Typography>
          {feature.descriptionKey && (
            <Tooltip title={t(feature.descriptionKey)} placement="top-start" enterDelay={400}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  mt: 0.25,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }}
              >
                {t(feature.descriptionKey)}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Stack>

      <Switch
        color="primary"
        checked={isChecked}
        onChange={() => onToggle(pageKey)}
        disabled={isDisabled}
      />
    </Box>
  );
}

/**
 * Options 设置页面主组件
 * 支持对不同窗口入口的功能显示和排序进行独立配置
 */
export default function App() {
  const theme = useTheme();
  const { t } = useTranslation(['features', 'common']);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
    const url = new URL(window.location.href);
    url.searchParams.set('tab', windowType);
    window.history.replaceState({}, '', url.toString());
  }, [windowType]);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoaded(false);
      try {
        const [savedVisible, savedOrder] = await Promise.all([
          storageUtil.get(configKeys.visible, getDefaultVisibleFeatureKeys()),
          storageUtil.get(configKeys.order, getDefaultPageOrder()),
        ]);
        setVisiblePages(
          isValidPageList(savedVisible) ? savedVisible : getDefaultVisibleFeatureKeys(),
        );
        setPageOrder(isValidPageList(savedOrder) ? savedOrder : getDefaultPageOrder());
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

  const showToast = (message: string, severity: 'success' | 'info' | 'warning') => {
    showMessage(message, { severity });
  };

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
      const label = feature ? t(feature.labelKey) : page;
      showToast(`已${isCurrentlyVisible ? '隐藏' : '显示'} ${label}`, 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('保存失败', 'warning');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageOrder.indexOf(active.id as PageType);
    const newIndex = pageOrder.indexOf(over.id as PageType);
    if (oldIndex < 0 || newIndex < 0) return;

    const newOrder = arrayMove(pageOrder, oldIndex, newIndex);
    setPageOrder(newOrder);

    try {
      await storageUtil.set(configKeys.order, newOrder);
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
      showToast('已恢复当前模式默认设置', 'success');
    } catch (error) {
      console.error('Failed to restore defaults:', error);
      showToast('恢复失败', 'warning');
    }
  };

  const handleWindowTypeChange = (_event: SyntheticEvent, newType: WindowType) => {
    if (newType !== null) {
      setWindowType(newType);
    }
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box
      className="app"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
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
            borderColor: 'divider',
            pt: { xs: 3, sm: 5 },
            pb: 0,
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <PageHeader
              icon={<SettingsIcon />}
              iconColor={theme.palette.primary.main}
              title="应用设置"
              subtitle="针对不同窗口类型独立配置 Dashboard 中显示的功能及其排序"
              sx={{ mb: 4 }}
            />
            {/* Tab 与恢复按钮同行 */}
            <Stack
              direction="row"
              alignItems="flex-end"
              justifyContent="space-between"
              sx={{ borderBottom: 'none' }}
            >
              <Tabs
                value={windowType}
                onChange={handleWindowTypeChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  flex: 1,
                  minHeight: 'auto',
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
              <Tooltip title="恢复当前模式默认" placement="top">
                <IconButton
                  onClick={handleRestoreDefaults}
                  size="small"
                  sx={{
                    mb: 1,
                    ml: 1,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                  aria-label="恢复当前模式默认"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* 主内容区域 */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 4 } }}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={pageOrder} strategy={verticalListSortingStrategy}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {pageOrder.map((key, index, array) => {
                      const isChecked = visiblePages.includes(key);
                      const isDisabled = isChecked && visiblePages.length === 1;
                      return (
                        <SortableFeatureRow
                          key={key}
                          pageKey={key}
                          isLast={index === array.length - 1}
                          isChecked={isChecked}
                          isDisabled={isDisabled}
                          onToggle={handlePageToggle}
                        />
                      );
                    })}
                  </Box>
                </SortableContext>
              </DndContext>
            </Paper>
          </Box>
        </Box>
      </ErrorBoundary>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
