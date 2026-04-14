import './App.css';
import RouterProvider from '@/providers/RouterProvider';
import NavigationBar from '@/components/NavigationBar';
import RouterContainer from '@/components/RouterContainer';

function App() {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <RouterProvider>
      <div className="app">
        <NavigationBar onOpenOptions={handleOpenOptions} />
        <RouterContainer />
      </div>
    </RouterProvider>
  );
}

export default App;
