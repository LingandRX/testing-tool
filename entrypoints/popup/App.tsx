import { useState } from 'react';
import { Box, Button } from '@mui/material';
import TimestampPage from './pages/TimestampPage';
import StorageCleanerPage from './pages/StorageCleanerPage';
import './App.css';

type PageType = 'timestamp' | 'storageCleaner';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('timestamp');

  return (
    <div className="app">
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant={currentPage === 'timestamp' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('timestamp')}
        >
          时间戳
        </Button>
        <Button
          variant={currentPage === 'storageCleaner' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('storageCleaner')}
          sx={{ ml: 1 }}
        >
          存储清理
        </Button>
      </Box>
      {currentPage === 'timestamp' && <TimestampPage />}
      {currentPage === 'storageCleaner' && <StorageCleanerPage />}
    </div>
  );
}

export default App;
