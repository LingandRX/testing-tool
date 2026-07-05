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
 * 从页面列表中过滤非法项（如已移除的 dashboard），保留合法 PageType
 */
const sanitizePageList = (pages: unknown): PageType[] | null => {
  if (!Array.isArray(pages)) return null;
  return pages.filter(isValidPage);
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

/**
 * 解析并合并页面列表：过滤非法项后与默认列表合并
 */
const resolvePageList = (pages: unknown, defaults: PageType[]): PageType[] => {
  const sanitized = sanitizePageList(pages);
  if (sanitized === null) return defaults;
  return mergeWithDefaults(sanitized, defaults);
};

interface RouterContextType {
  currentPage: PageType;
  visiblePages: PageType[];
  pageOrder: PageType[];
  recentlyUsedTools: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
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
  defaultRoute = 'timestamp',
  syncRoute = true,
  syncKey = 'app/currentRoute',
  visiblePagesKey = 'app/visiblePages',
  pageOrderKey = 'app/pageOrder',
}: RouterProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    getSyncSnapshot(syncKey as string, defaultRoute, isValidPage),
  );

  const [visiblePages, setVisiblePages] = useState<PageType[]>(() =>
    resolvePageList(
      getSyncSnapshot(visiblePagesKey as string, null),
      getDefaultVisibleFeatureKeys(),
    ),
  );

  const [pageOrder, setPageOrder] = useState<PageType[]>(() =>
    resolvePageList(getSyncSnapshot(pageOrderKey as string, null), getDefaultPageOrder()),
  );

  const [recentlyUsedTools, setRecentlyUsedTools] = useState<PageType[]>(
    () => sanitizePageList(getSyncSnapshot('app/recentlyUsedTools', null)) ?? [],
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const hasUserNavigatedRef = useRef(false);
  const canPersistRef = useRef(false);

  const loadInitialData = useCallback(async () => {
    try {
      const stored = await storageUtil.getMany([
        syncKey,
        visiblePagesKey,
        pageOrderKey,
        'app/recentlyUsedTools',
        'contextMenu/pendingData',
      ]);

      const savedRoute = (stored[syncKey] ?? defaultRoute) as PageType;
      const savedVisiblePages = (stored[visiblePagesKey] ??
        getDefaultVisibleFeatureKeys()) as PageType[];
      const savedPageOrder = (stored[pageOrderKey] ?? getDefaultPageOrder()) as PageType[];
      const savedRecentTools = (stored['app/recentlyUsedTools'] ?? []) as PageType[];

      if (isValidPage(savedRoute) && syncRoute && !hasUserNavigatedRef.current) {
        setCurrentPage(savedRoute);
      }
      if (sanitizePageList(savedVisiblePages) !== null) {
        setVisiblePages(resolvePageList(savedVisiblePages, getDefaultVisibleFeatureKeys()));
      }
      if (sanitizePageList(savedPageOrder) !== null) {
        setPageOrder(resolvePageList(savedPageOrder, getDefaultPageOrder()));
      }
      const sanitizedRecentTools = sanitizePageList(savedRecentTools);
      if (sanitizedRecentTools !== null) {
        setRecentlyUsedTools(sanitizedRecentTools);
      }
      canPersistRef.current = true;

      return stored['contextMenu/pendingData'];
    } catch (error) {
      console.error('[Router Init Error] Core data fetch failed:', error);
      return undefined;
    } finally {
      setIsLoaded(true);
    }
  }, [defaultRoute, syncKey, syncRoute, visiblePagesKey, pageOrderKey]);

  useEffect(() => {
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid async data loading pattern on mount
    loadInitialData()
      .then((pendingData) => {
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

        if (
          pendingData &&
          isValidPage(pendingData.featureKey) &&
          Date.now() - pendingData.timestamp < CONTEXT_MENU_DATA_EXPIRY_MS
        ) {
          setCurrentPage(pendingData.featureKey as PageType);
        }
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
        if (sanitizePageList(newPages) !== null) {
          setVisiblePages(resolvePageList(newPages, getDefaultVisibleFeatureKeys()));
        }
      }
      if (changes[pageOrderKey as string]) {
        const newOrder = changes[pageOrderKey as string].newValue;
        if (sanitizePageList(newOrder) !== null) {
          setPageOrder(resolvePageList(newOrder, getDefaultPageOrder()));
        }
      }
      if (changes['app/recentlyUsedTools']) {
        const newRecent = changes['app/recentlyUsedTools'].newValue;
        const sanitizedRecent = sanitizePageList(newRecent);
        if (sanitizedRecent !== null) {
          setRecentlyUsedTools(sanitizedRecent);
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

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        pageOrder,
        recentlyUsedTools,
        isLoaded,
        navigateTo,
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
