import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { globalStyles } from '@/config/pageTheme';
import { SnackbarProvider } from '@/components/GlobalSnackbar';
import { Box } from '@mui/material';
import { getEntryPointType } from '@/config/features';
import { useMemo } from 'react';

export default function App() {
  // 打开Chrome扩展选项页面，需确保manifest中已配置options_page或options_ui
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage().catch((r) => console.error(r));
  };

  const entryType = useMemo(() => getEntryPointType(), []);

  const routerConfig = useMemo(() => {
    if (entryType === 'tab') {
      return {
        syncKey: 'app/tabRoute' as const,
        visiblePagesKey: 'app/tabVisiblePages' as const,
        pageOrderKey: 'app/tabPageOrder' as const,
      };
    }
    return {
      syncKey: 'app/popupRoute' as const,
      visiblePagesKey: 'app/popupVisiblePages' as const,
      pageOrderKey: 'app/popupPageOrder' as const,
    };
  }, [entryType]);

  return (
    <RouterProvider
      syncKey={routerConfig.syncKey}
      visiblePagesKey={routerConfig.visiblePagesKey}
      pageOrderKey={routerConfig.pageOrderKey}
    >
      <SnackbarProvider initialOptions={{ autoHideDuration: 1500 }}>
        <Box
          className="app"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '400px',
            maxWidth: '400px',
            minWidth: '400px',
            height: '600px',
            minHeight: '600px',
            overflow: 'hidden',
            backgroundColor: globalStyles.backgroundColor,
            // 仅在明确的大屏幕（如独立页面或侧边栏拉伸）下才允许扩展
            '@media screen and (min-width: 600px)': {
              width: '100vw',
              maxWidth: 'none',
              minWidth: 'none',
              height: '100vh',
              minHeight: 'none',
            },
          }}
        >
          <TopBar onOpenOptions={handleOpenOptions} />
          <ErrorBoundary>
            <RouterContainer />
          </ErrorBoundary>
        </Box>
      </SnackbarProvider>
    </RouterProvider>
  );
}
