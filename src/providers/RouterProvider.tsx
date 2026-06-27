import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { browser } from 'wxt/browser';
import type { ContextMenuPendingData, PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';
import { CONTEXT_MENU_DATA_EXPIRY_MS, saveContextMenuData } from '@/utils/useContextMenuData';
import { getSyncSnapshot } from '@/utils/syncSnapshot';

const MAX_RECENTLY_USED = 3;

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
  recentlyUsedTools: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
  goHome: () => void;
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

export function RouterProvider({
  children,
  defaultRoute = 'dashboard',
  syncRoute = true,
  syncKey = 'app/currentRoute',
  visiblePagesKey = 'app/visiblePages',
  pageOrderKey = 'app/pageOrder',
}: RouterProviderProps) {
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

  const [recentlyUsedTools, setRecentlyUsedTools] = useState<PageType[]>(() =>
    getSyncSnapshot('app/recentlyUsedTools', [], isValidPageList),
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const hasUserNavigatedRef = useRef(false);
  const canPersistRef = useRef(false);

  const loadInitialData = useCallback(async () => {
    try {
      const savedRoute = await storageUtil.get(syncKey, defaultRoute);
      const savedVisiblePages = await storageUtil.get(
        visiblePagesKey,
        getDefaultVisibleFeatureKeys(),
      );
      const savedPageOrder = await storageUtil.get(pageOrderKey, getDefaultPageOrder());
      const savedRecentTools = await storageUtil.get('app/recentlyUsedTools', []);

      if (isValidPage(savedRoute) && syncRoute && !hasUserNavigatedRef.current) {
        setCurrentPage(savedRoute);
      }
      if (isValidPageList(savedVisiblePages)) {
        setVisiblePages(mergeWithDefaults(savedVisiblePages, getDefaultVisibleFeatureKeys()));
      }
      if (isValidPageList(savedPageOrder) && savedPageOrder.length > 0) {
        setPageOrder(mergeWithDefaults(savedPageOrder, getDefaultPageOrder()));
      }
      if (isValidPageList(savedRecentTools)) {
        setRecentlyUsedTools(savedRecentTools);
      }
      canPersistRef.current = true;
    } catch (error) {
      console.error('[Router Init Error] Core data fetch failed:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [defaultRoute, syncKey, syncRoute, visiblePagesKey, pageOrderKey]);

  useEffect(() => {
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid async data loading pattern on mount
    loadInitialData()
      .then(() => {
        if (cancelled) return;

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

        storageUtil
          .get('contextMenu/pendingData')
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
    if (isLoaded && canPersistRef.current && syncRoute) {
      void storageUtil.set(syncKey, currentPage).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${syncKey}`, JSON.stringify(currentPage));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [currentPage, isLoaded, syncRoute, syncKey]);

  useEffect(() => {
    if (isLoaded && canPersistRef.current) {
      void storageUtil.set(visiblePagesKey, visiblePages).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${visiblePagesKey}`, JSON.stringify(visiblePages));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [visiblePages, isLoaded, visiblePagesKey]);

  useEffect(() => {
    if (isLoaded && canPersistRef.current) {
      void storageUtil.set(pageOrderKey, pageOrder).catch(console.error);
      try {
        localStorage.setItem(`snapshot/${pageOrderKey}`, JSON.stringify(pageOrder));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [pageOrder, isLoaded, pageOrderKey]);

  useEffect(() => {
    if (isLoaded && canPersistRef.current) {
      void storageUtil.set('app/recentlyUsedTools', recentlyUsedTools).catch(console.error);
      try {
        localStorage.setItem('snapshot/app/recentlyUsedTools', JSON.stringify(recentlyUsedTools));
      } catch (err) {
        console.error('[Router LocalStorage Error]', err);
      }
    }
  }, [recentlyUsedTools, isLoaded]);

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
          setVisiblePages(mergeWithDefaults(newPages, getDefaultVisibleFeatureKeys()));
        }
      }
      if (changes[pageOrderKey as string]) {
        const newOrder = changes[pageOrderKey as string].newValue;
        if (isValidPageList(newOrder)) {
          setPageOrder(mergeWithDefaults(newOrder, getDefaultPageOrder()));
        }
      }
      if (changes['app/recentlyUsedTools']) {
        const newRecent = changes['app/recentlyUsedTools'].newValue;
        if (isValidPageList(newRecent)) {
          setRecentlyUsedTools(newRecent);
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

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [syncRoute, syncKey, visiblePagesKey, pageOrderKey]);

  const navigateTo = (page: PageType) => {
    hasUserNavigatedRef.current = true;
    canPersistRef.current = true;
    setCurrentPage(page);
    setRecentlyUsedTools((prev) => {
      const filtered = prev.filter((p) => p !== page);
      return [page, ...filtered].slice(0, MAX_RECENTLY_USED);
    });
  };

  const goHome = () => {
    hasUserNavigatedRef.current = true;
    canPersistRef.current = true;
    setCurrentPage('dashboard');
  };

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        pageOrder,
        recentlyUsedTools,
        isLoaded,
        navigateTo,
        goHome,
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
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}

export default RouterProvider;
