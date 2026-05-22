import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { browser } from 'wxt/browser'; // 💡 1. 规范回归：引入 WXT 标准多端一致性代理空间
import type { ContextMenuPendingData, PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';
import { CONTEXT_MENU_DATA_EXPIRY_MS, saveContextMenuData } from '@/utils/useContextMenuData';

/**
 * 校验是否为合法的页面类型
 */
const isValidPage = (page: unknown): page is PageType => {
  return typeof page === 'string' && (getAllFeatureKeys() as string[]).includes(page);
};

/**
 * 校验页面列表是否合法
 */
const isValidPageList = (pages: unknown): pages is PageType[] => {
  return Array.isArray(pages) && pages.every(isValidPage);
};

/**
 * 将已保存的列表与默认列表合并，确保新增的功能特性被自动包含
 */
const mergeWithDefaults = (saved: PageType[], defaults: PageType[]): PageType[] => {
  const savedSet = new Set(saved);
  const defaultSet = new Set(defaults);

  const preserved = saved.filter((page) => defaultSet.has(page));
  const newItems = defaults.filter((page) => !savedSet.has(page));

  return [...preserved, ...newItems];
};

interface RouterContextType {
  currentPage: PageType;
  visiblePages: PageType[];
  pageOrder: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
  goBack: () => void;
  setVisiblePages: (pages: PageType[]) => void;
  setPageOrder: (pages: PageType[]) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProviderProps {
  children: ReactNode;
  defaultRoute?: PageType;
  syncRoute?: boolean;
  syncKey?: keyof StorageSchema;
  visiblePagesKey?: keyof StorageSchema;
  pageOrderKey?: keyof StorageSchema;
}

/**
 * 同步从 localStorage 获取存储快照（首屏 0 闪烁核心防线）
 */
const getSyncSnapshot = <T,>(
  key: string,
  defaultValue: T,
  validator?: (val: unknown) => val is T,
): T => {
  try {
    const val = localStorage.getItem(`snapshot/${key}`);
    if (!val) return defaultValue;
    const parsed = JSON.parse(val) as unknown;
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }
    return (parsed as T) ?? defaultValue;
  } catch (error) {
    console.error('[Router Snapshot Error] Failed to read sync cache:', error);
    return defaultValue;
  }
};

export function RouterProvider({
  children,
  defaultRoute = 'dashboard',
  syncRoute = true,
  syncKey = 'app/currentRoute',
  visiblePagesKey = 'app/visiblePages',
  pageOrderKey = 'app/pageOrder',
}: RouterProviderProps) {
  // 1. 初始化派生状态流（0 延迟快照同步）
  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    getSyncSnapshot(syncKey as string, defaultRoute, isValidPage),
  );

  const [visiblePages, setVisiblePages] = useState<PageType[]>(() => {
    const snapshot = getSyncSnapshot(
      visiblePagesKey as string,
      getDefaultVisibleFeatureKeys(),
      isValidPageList,
    );
    return mergeWithDefaults(snapshot, getDefaultVisibleFeatureKeys());
  });

  const [pageOrder, setPageOrder] = useState<PageType[]>(() => {
    const snapshot = getSyncSnapshot(
      pageOrderKey as string,
      getDefaultPageOrder(),
      isValidPageList,
    );
    return mergeWithDefaults(snapshot, getDefaultPageOrder());
  });

  const [isLoaded, setIsLoaded] = useState(() => {
    const snapshotKey = localStorage.getItem(`snapshot/${syncKey as string}`);
    const snapshotVisible = localStorage.getItem(`snapshot/${visiblePagesKey as string}`);
    const snapshotOrder = localStorage.getItem(`snapshot/${pageOrderKey as string}`);
    return !!(snapshotKey && snapshotVisible && snapshotOrder);
  });

  /**
   * 从异步存储中安全溯源初始数据
   */
  const loadInitialData = useCallback(async () => {
    try {
      const savedRoute = await storageUtil.get(syncKey, defaultRoute);
      const savedVisiblePages = await storageUtil.get(
        visiblePagesKey,
        getDefaultVisibleFeatureKeys(),
      );
      const savedPageOrder = await storageUtil.get(pageOrderKey, getDefaultPageOrder());

      if (isValidPage(savedRoute) && syncRoute) {
        setCurrentPage(savedRoute);
      }
      if (isValidPageList(savedVisiblePages)) {
        setVisiblePages(mergeWithDefaults(savedVisiblePages, getDefaultVisibleFeatureKeys()));
      }
      if (isValidPageList(savedPageOrder) && savedPageOrder.length > 0) {
        setPageOrder(mergeWithDefaults(savedPageOrder, getDefaultPageOrder()));
      }
    } catch (error) {
      console.error('[Router Init Error] Core data fetch failed:', error);
    }
  }, [defaultRoute, syncKey, syncRoute, visiblePagesKey, pageOrderKey]);

  // 副作用 1：组件挂载时，激活初始路由校验与右键菜单传递载荷（Context Payload）的嗅探
  useEffect(() => {
    let cancelled = false;

    loadInitialData()
      .then(() => {
        if (cancelled) return;
        setIsLoaded(true);

        // 检查 URL 参数中的右键菜单高阶中转数据
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const feature = params.get('feature') as PageType | null;
          const payload = params.get('payload');

          if (feature && payload && isValidPage(feature)) {
            void saveContextMenuData({ featureKey: feature, payload }).catch((err) => {
              console.error('[Router Context Handler Error]', err);
            });
            setCurrentPage(feature);

            const url = new URL(window.location.href);
            url.searchParams.delete('feature');
            url.searchParams.delete('payload');
            window.history.replaceState({}, '', url.toString());
            return;
          }
        }

        // 检查 storage 中的右键菜单待处理数据（针对 openPopup 的闭环场景）
        storageUtil
          .get('contextMenu/pendingData', undefined)
          .then((pendingData) => {
            if (
              pendingData &&
              isValidPage(pendingData.featureKey) &&
              Date.now() - pendingData.timestamp < CONTEXT_MENU_DATA_EXPIRY_MS
            ) {
              setCurrentPage(pendingData.featureKey as PageType);
            }
          })
          .catch(console.error);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [loadInitialData]);

  useEffect(() => {
    if (isLoaded && syncRoute) {
      void storageUtil.set(syncKey, currentPage as PageType).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${syncKey}`, JSON.stringify(currentPage));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [currentPage, isLoaded, syncRoute, syncKey]);

  useEffect(() => {
    if (isLoaded) {
      void storageUtil.set(visiblePagesKey, visiblePages).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${visiblePagesKey}`, JSON.stringify(visiblePages));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [visiblePages, isLoaded, visiblePagesKey]);

  useEffect(() => {
    if (isLoaded) {
      void storageUtil.set(pageOrderKey, pageOrder).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${pageOrderKey}`, JSON.stringify(pageOrder));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [pageOrder, isLoaded, pageOrderKey]);

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!syncRoute) return;

    const handleStorageChange = (changes: Record<string, { newValue?: unknown }>) => {
      if (syncRoute && changes[syncKey as string]) {
        const newRoute = changes[syncKey as string].newValue as PageType;
        if (newRoute && newRoute !== currentPageRef.current && isValidPage(newRoute)) {
          setCurrentPage(newRoute);
        }
      }
      if (changes[visiblePagesKey as string]) {
        const newPages = changes[visiblePagesKey as string].newValue;
        if (isValidPageList(newPages)) {
          setVisiblePages(newPages);
        }
      }
      if (changes[pageOrderKey as string]) {
        const newOrder = changes[pageOrderKey as string].newValue;
        if (isValidPageList(newOrder)) {
          setPageOrder(newOrder);
        }
      }
      if (changes['contextMenu/pendingData']) {
        const newData = changes['contextMenu/pendingData']
          .newValue as ContextMenuPendingData | null;
        if (
          newData &&
          isValidPage(newData.featureKey) &&
          Date.now() - newData.timestamp < CONTEXT_MENU_DATA_EXPIRY_MS
        ) {
          setCurrentPage(newData.featureKey as PageType);
        }
      }
    };

    // 💡 修复点：全域绑定 WXT 跨浏览器代理监听器，彻底闭环多端多进程广播
    browser.storage.onChanged.addListener(handleStorageChange);
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [syncRoute, syncKey, visiblePagesKey, pageOrderKey]);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const goBack = () => {
    setCurrentPage('dashboard');
  };

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        pageOrder,
        isLoaded,
        navigateTo,
        goBack,
        setVisiblePages,
        setPageOrder,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a valid RouterProvider context wrapper');
  }
  return context;
}

export default RouterProvider;
