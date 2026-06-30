import { useEffect } from 'react';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/layout/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MessageAction, sendMessage } from '@/utils/messages';

export default function App() {
  useEffect(() => {
    sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: true });
    return () => {
      sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: false });
    };
  }, []);

  return (
    <RouterProvider defaultRoute="dashboard" syncKey="app/sidepanelRoute">
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <TopBar />
        <ErrorBoundary>
          <RouterContainer />
        </ErrorBoundary>
      </div>
    </RouterProvider>
  );
}
