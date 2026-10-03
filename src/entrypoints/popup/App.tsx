import { useEffect } from 'react';
import RouterProvider, { useRouter } from '@/providers/RouterProvider';
import FeatureNav from '@/layout/FeatureNav';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getPopupHeight } from '@/config/features';

function PopupLayout() {
  const { currentPage } = useRouter();
  const targetHeight = getPopupHeight(currentPage);

  useEffect(() => {
    const heightPx = `${targetHeight}px`;
    document.documentElement.style.height = heightPx;
    document.body.style.height = heightPx;
  }, [targetHeight]);

  return (
    <div
      className="flex w-[450px] max-w-[450px] min-w-[450px] max-h-[600px] min-h-[400px] overflow-hidden bg-background"
      style={{ height: `${targetHeight}px` }}
    >
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <ErrorBoundary>
          <RouterContainer />
        </ErrorBoundary>
      </div>
      <FeatureNav />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider
      defaultRoute="timestamp"
      syncKey="app/popupRoute"
      visiblePagesKey="app/popupVisiblePages"
      pageOrderKey="app/popupPageOrder"
    >
      <PopupLayout />
    </RouterProvider>
  );
}
