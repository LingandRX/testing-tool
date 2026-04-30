import './App.css';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import { globalStyles } from '@/config/pageTheme';

function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
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
