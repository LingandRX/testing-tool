import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SnackbarProvider } from '@/components/GlobalSnackbar';
import { getEntryPointType } from '@/config/features';
import { useMemo } from 'react';

export default function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage().catch(console.error);
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
        <div className="app flex flex-col w-[400px] max-w-[400px] min-w-[400px] h-[600px] min-h-[600px] overflow-hidden bg-background sm:w-screen sm:max-w-none sm:min-w-0 sm:h-screen sm:min-h-0">
          <TopBar onOpenOptions={handleOpenOptions} />
          <ErrorBoundary>
            <RouterContainer />
          </ErrorBoundary>
        </div>
      </SnackbarProvider>
    </RouterProvider>
  );
}
