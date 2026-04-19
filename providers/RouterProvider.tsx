import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import { getDefaultVisibleRoutes, getDefaultPageOrder } from '@/config/routes';

interface RouterContextType {
  currentPage: PageType;
  visiblePages: PageType[];
  pageOrder: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
  navigateLocal: (page: PageType) => void;
  syncNavigation: (page: PageType) => void;
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
}

export function RouterProvider({
  children,
  defaultRoute = 'dashboard',
  syncRoute = true,
  syncKey = 'app/currentRoute'
}: RouterProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(defaultRoute);
  const [visiblePages, setVisiblePages] = useState<PageType[]>(getDefaultVisibleRoutes());
  const [pageOrder, setPageOrder] = useState<PageType[]>(getDefaultPageOrder());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [syncKey]);

  useEffect(() => {
    if (isLoaded && syncRoute) {
      storageUtil.set(syncKey, currentPage as any);
    }
  }, [currentPage, isLoaded, syncRoute, syncKey]);

  // Listen for storage changes if sync is enabled
  useEffect(() => {
    if (!syncRoute) return;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // 同步路由
      if (syncRoute && changes[syncKey as string]) {
        const newRoute = changes[syncKey as string].newValue as PageType;
        if (newRoute && newRoute !== currentPage) {
          setCurrentPage(newRoute);
        }
      }
      // 同步可见页面列表
      if (changes['app/visiblePages']) {
        setVisiblePages(changes['app/visiblePages'].newValue as PageType[]);
      }
      // 同步页面排序
      if (changes['app/pageOrder']) {
        setPageOrder(changes['app/pageOrder'].newValue as PageType[]);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [syncRoute, currentPage, syncKey]);

  const loadInitialData = async () => {
    try {
      const [savedRoute, savedVisiblePages, savedPageOrder] = await Promise.all([
        storageUtil.get(syncKey, defaultRoute),
        storageUtil.get('app/visiblePages', getDefaultVisibleRoutes()),
        storageUtil.get('app/pageOrder', getDefaultPageOrder()),
      ]);

      if (savedRoute && syncRoute) {
        setCurrentPage(savedRoute as PageType);
      }
      if (savedVisiblePages) {
        setVisiblePages(savedVisiblePages);
      }
      if (savedPageOrder && savedPageOrder.length > 0) {
        setPageOrder(savedPageOrder);
      }
    } catch (error) {
      console.error('Failed to load initial routing data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const navigateLocal = (page: PageType) => {
    setCurrentPage(page);
  };

  const syncNavigation = (page: PageType) => {
    storageUtil.set(syncKey, page as any);
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
        navigateLocal,
        syncNavigation,
        goBack,
        setVisiblePages,
        setPageOrder
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export default RouterProvider;
