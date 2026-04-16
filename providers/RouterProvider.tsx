import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import { getDefaultVisibleRoutes } from '@/config/routes';

interface RouterContextType {
  currentPage: PageType;
  visiblePages: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
  navigateLocal: (page: PageType) => void;
  syncNavigation: (page: PageType) => void;
  goBack: () => void;
  setVisiblePages: (pages: PageType[]) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProviderProps {
  children: ReactNode;
  defaultRoute?: PageType;
  syncRoute?: boolean;
}

export function RouterProvider({
  children,
  defaultRoute = 'dashboard',
  syncRoute = true
}: RouterProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(defaultRoute);
  const [visiblePages, setVisiblePages] = useState<PageType[]>(getDefaultVisibleRoutes());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoaded && syncRoute) {
      storageUtil.set('app/currentRoute', currentPage);
    }
  }, [currentPage, isLoaded, syncRoute]);

  // Listen for storage changes if sync is enabled
  useEffect(() => {
    if (!syncRoute) return;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['app/currentRoute']) {
        const newRoute = changes['app/currentRoute'].newValue as PageType;
        if (newRoute && newRoute !== currentPage) {
          setCurrentPage(newRoute);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [syncRoute, currentPage]);

  const loadInitialData = async () => {
    try {
      const [savedRoute, savedVisiblePages] = await Promise.all([
        storageUtil.get('app/currentRoute', defaultRoute),
        storageUtil.get('app/visiblePages', getDefaultVisibleRoutes()),
      ]);

      if (savedRoute && syncRoute) {
        setCurrentPage(savedRoute);
      }
      if (savedVisiblePages) {
        setVisiblePages(savedVisiblePages);
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
    storageUtil.set('app/currentRoute', page);
  };

  const goBack = () => {
    setCurrentPage('dashboard');
  };

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        isLoaded,
        navigateTo,
        navigateLocal,
        syncNavigation,
        goBack,
        setVisiblePages
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
