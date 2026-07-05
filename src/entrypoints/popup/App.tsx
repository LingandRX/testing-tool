import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/layout/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <RouterProvider
      syncKey="app/popupRoute"
      visiblePagesKey="app/popupVisiblePages"
      pageOrderKey="app/popupPageOrder"
    >
      <div className="flex flex-col w-[400px] max-w-[400px] min-w-[400px] h-[600px] min-h-[600px] overflow-hidden bg-background">
        <TopBar />
        <ErrorBoundary>
          <RouterContainer />
        </ErrorBoundary>
      </div>
    </RouterProvider>
  );
}
