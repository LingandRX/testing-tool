import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { PageType } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import TimestampPage from './pages/TimestampPage';
import StorageCleanerPage from './pages/StorageCleanerPage';
import './App.css';


const PAGE_CONFIG = {
  timestamp: { label: '时间戳', defaultVisible: true },
  storageCleaner: { label: '存储清理', defaultVisible: true },
} as const satisfies Record<PageType, { label: string; defaultVisible: boolean }>;

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('timestamp');
  const [visiblePages, setVisiblePages] = useState<PageType[]>(['timestamp', 'storageCleaner']);
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
        storageUtil.get('app/currentRoute', 'timestamp'),
        storageUtil.get('app/visiblePages', ['timestamp', 'storageCleaner'] as PageType[]),
      ]);

      if (savedRoute) {
        setCurrentPage(savedRoute);
      }

      if (savedVisiblePages) {
        setVisiblePages(savedVisiblePages);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const NavButton = ({ pageKey }: { pageKey: PageType }) => {
    const config = PAGE_CONFIG[pageKey];
    if (!config) return null;

    return (
      <Box key={pageKey}>
        <button
          className={currentPage === pageKey ? 'nav-button active' : 'nav-button'}
          onClick={() => handlePageChange(pageKey)}
        >
          {config.label}
        </button>
      </Box>
    );
  };

  if (!isLoaded) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="app">
      <Box className="nav-container">
        {(Object.keys(PAGE_CONFIG) as PageType[])
          .filter((key) => visiblePages.includes(key))
          .map((key) => <NavButton key={key} pageKey={key} />)}
      </Box>
      {currentPage === 'timestamp' && <TimestampPage />}
      {currentPage === 'storageCleaner' && <StorageCleanerPage />}
    </div>
  );
}

export default App;
