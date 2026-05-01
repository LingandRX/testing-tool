import { useEffect } from 'react';
import './App.css';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import { MessageAction, sendMessage } from '@/utils/messages';

export default function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  // 通知侧边栏已打开
  useEffect(() => {
    sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: true });
    return () => {
      // 尝试在关闭时通知，虽然在某些情况下可能无法成功发送
      sendMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: false });
    };
  }, []);

  return (
    <RouterProvider defaultRoute="dashboard" syncKey="app/sidepanelRoute">
      <div
        className="app"
        style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      >
        <TopBar onOpenOptions={handleOpenOptions} />
        <RouterContainer />
      </div>
    </RouterProvider>
  );
}
