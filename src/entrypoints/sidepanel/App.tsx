import { useEffect } from 'react';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SnackbarProvider } from '@/components/GlobalSnackbar';
import { MessageAction, sendMessage } from '@/utils/messages';

export default function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage().catch((err) => {
      console.error('Failed to open options page:', err);
    });
  };

  useEffect(() => {
    sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: true });
    return () => {
      sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: false });
    };
  }, []);

  return (
    <RouterProvider defaultRoute="dashboard" syncKey="app/sidepanelRoute">
      <SnackbarProvider initialOptions={{ autoHideDuration: 1500 }}>
        <div className="app flex flex-col h-screen w-full overflow-hidden">
          <TopBar onOpenOptions={handleOpenOptions} />
          <ErrorBoundary>
            <RouterContainer />
          </ErrorBoundary>
        </div>
      </SnackbarProvider>
    </RouterProvider>
  );
}
