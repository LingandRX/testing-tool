import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { Settings, RefreshCw, GripVertical } from 'lucide-react';
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
import PageErrorBoundary from '@/components/PageErrorBoundary';
import PageHeader from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import type { PaletteColorKey } from '@/config/features';

const PALETTE_COLORS: Record<PaletteColorKey, string> = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#e65100',
  error: '#c62828',
  secondary: '#9c27b0',
  info: '#0288d1',
};

const getColorCode = (key: PaletteColorKey): string => PALETTE_COLORS[key];

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
  const { t } = useTranslation(['features']);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pageKey,
  });

  const feature = getFeatureByKey(pageKey);
  if (!feature) return null;

  const colorKey = feature.themeColorKey ?? 'primary';
  const colorCode = getColorCode(colorKey);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative' as const,
    backgroundColor: isDragging ? `${colorCode}0a` : 'transparent',
    boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.08)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 sm:p-5 transition-all duration-200 hover:bg-muted ${
        isLast ? '' : 'border-b border-border'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* 拖拽手柄 */}
        <div
          className="drag-handle text-muted-foreground cursor-grab touch-none transition-colors duration-200 hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`拖拽以调整 ${t(feature.labelKey)} 的位置`}
        >
          <GripVertical size={16} />
        </div>

        {/* 功能图标 */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            backgroundColor: `${colorCode}1a`,
            color: colorCode,
          }}
        >
          {feature.icon && <feature.icon size={20} />}
        </div>

        {/* 文本信息 */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[0.95rem] leading-tight text-foreground">
            {t(feature.labelKey)}
          </div>
          {feature.descriptionKey && (
            <div
              className="text-xs text-muted-foreground font-medium mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
              title={t(feature.descriptionKey)}
            >
              {t(feature.descriptionKey)}
            </div>
          )}
        </div>
      </div>

      {/* 开关 */}
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={isDisabled}
        onClick={() => onToggle(pageKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isChecked ? 'bg-primary' : 'bg-muted'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function App() {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-background flex flex-col">
      <PageErrorBoundary>
        {/* 顶部标题与导航栏 */}
        <div className="w-full bg-background border-b border-border pt-8 sm:pt-12 pb-0 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto">
            <PageHeader
              icon={<Settings size={20} />}
              iconColor="#1976d2"
              title="应用设置"
              subtitle="针对不同窗口类型独立配置 Dashboard 中显示的功能及其排序"
              sx={{ marginBottom: '1rem' }}
            />
            {/* Tab 与恢复按钮同行 */}
            <div className="flex items-end justify-between border-b-0">
              <div className="flex-1 flex">
                {(['popup', 'sidepanel', 'tab'] as WindowType[]).map((type) => (
                  <button
                    key={type}
                    onClick={(e) => handleWindowTypeChange(e, type)}
                    className={`px-4 sm:px-6 py-2 text-[0.9rem] font-bold transition-colors duration-200 ${
                      windowType === type
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type === 'popup' ? 'Popup 窗口' : type === 'sidepanel' ? '侧边栏' : '标签页'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRestoreDefaults}
                className="mb-1 ml-2 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                title="恢复当前模式默认"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={pageOrder} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col">
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
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </PageErrorBoundary>

      <GlobalSnackbar {...snackbarProps} />
    </div>
  );
}
