import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/layout/TopBar';
import FeatureNav from '@/layout/FeatureNav';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <RouterProvider
      defaultRoute="timestamp"
      syncKey="app/popupRoute"
      visiblePagesKey="app/popupVisiblePages"
      pageOrderKey="app/popupPageOrder"
    >
      <div className="flex w-[450px] max-w-[450px] min-w-[450px] h-[600px] min-h-[600px] overflow-hidden bg-background">
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <ErrorBoundary>
            <RouterContainer />
          </ErrorBoundary>
        </div>
        <FeatureNav />
      </div>
    </RouterProvider>
  );
}
