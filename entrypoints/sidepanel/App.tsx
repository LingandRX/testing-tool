import './App.css';
import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';

function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <RouterProvider defaultRoute="dashboard" syncKey="app/sidepanelRoute">
      <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar onOpenOptions={handleOpenOptions} />
        <RouterContainer />
      </div>
    </RouterProvider>
  );
}

export default App;
