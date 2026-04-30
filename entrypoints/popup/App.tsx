import './App.css';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import { globalStyles } from '@/config/pageTheme';

function App() {
  // 打开Chrome扩展选项页面，需确保manifest中已配置options_page或options_ui
  const handleOpenOptions = () => {
    chrome.runtime
      .openOptionsPage()
      .then(() => {
        console.log('Options page opened.');
      })
      .catch(() => {
        console.error('Failed to open options page.');
      });
  };

  return (
    <RouterProvider defaultRoute="dashboard" syncRoute={true} syncKey="app/popupRoute">
      <div
        className="app"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: globalStyles.backgroundColor,
        }}
      >
        <TopBar onOpenOptions={handleOpenOptions} />
        <RouterContainer />
      </div>
    </RouterProvider>
  );
}

export default App;
