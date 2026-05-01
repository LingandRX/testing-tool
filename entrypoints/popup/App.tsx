import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { globalStyles } from '@/config/pageTheme';
import { SnackbarProvider } from '@/components/GlobalSnackbar';
import { Box } from '@mui/material';

export default function App() {
  // 打开Chrome扩展选项页面，需确保manifest中已配置options_page或options_ui
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage().catch((r) => console.error(r));
  };

  return (
    <RouterProvider syncKey="app/popupRoute">
      <SnackbarProvider initialOptions={{ autoHideDuration: 1500000 }}>
        <Box
          className="app"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '400px',
            height: '600px',
            overflow: 'hidden',
            backgroundColor: globalStyles.backgroundColor,
            '@media screen and (min-width: 401px), screen and (min-height: 601px)': {
              width: '100vw',
              height: '100vh',
              minWidth: '400px',
              minHeight: '600px',
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
