import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/layout/TopBar';
import RouterContainer from '@/components/RouterContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getEntryPointType } from '@/config/features';
export default function App() {
  const entryType = getEntryPointType();

  const routerConfig =
    entryType === 'tab'
      ? {
          syncKey: 'app/tabRoute' as const,
          visiblePagesKey: 'app/tabVisiblePages' as const,
          pageOrderKey: 'app/tabPageOrder' as const,
        }
      : {
          syncKey: 'app/popupRoute' as const,
          visiblePagesKey: 'app/popupVisiblePages' as const,
          pageOrderKey: 'app/popupPageOrder' as const,
        };

  return (
    <RouterProvider
      syncKey={routerConfig.syncKey}
      visiblePagesKey={routerConfig.visiblePagesKey}
      pageOrderKey={routerConfig.pageOrderKey}
    >
      <div className="flex flex-col w-[400px] max-w-[400px] min-w-[400px] h-[600px] min-h-[600px] overflow-hidden bg-background sm:w-screen sm:max-w-none sm:min-w-0 sm:h-screen sm:min-h-0">
        <TopBar />
        <ErrorBoundary>
          <RouterContainer />
        </ErrorBoundary>
      </div>
    </RouterProvider>
  );
}
