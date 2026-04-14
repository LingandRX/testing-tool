import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import { getDefaultVisibleRoutes } from '@/config/routes';

interface RouterContextType {
  currentPage: PageType;
  visiblePages: PageType[];
  isLoaded: boolean;
  navigateTo: (page: PageType) => void;
  setVisiblePages: (pages: PageType[]) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProviderProps {
  children: ReactNode;
  defaultRoute?: PageType;
}

export function RouterProvider({
  children,
  defaultRoute = 'timestamp'
}: RouterProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(defaultRoute);
  const [visiblePages, setVisiblePages] = useState<PageType[]>(getDefaultVisibleRoutes());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storageUtil.set('app/currentRoute', currentPage);
    }
  }, [currentPage, isLoaded]);

  const loadInitialData = async () => {
    try {
      const [savedRoute, savedVisiblePages] = await Promise.all([
        storageUtil.get('app/currentRoute', defaultRoute),
        storageUtil.get('app/visiblePages', getDefaultVisibleRoutes()),
      ]);

      if (savedRoute) {
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

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        isLoaded,
        navigateTo,
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
