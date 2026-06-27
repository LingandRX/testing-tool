import { FEATURES, getEntryPointType } from '@/config/features';
import { useRouter } from '@/providers/RouterProvider';
import { Suspense } from 'react';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import PageSkeleton from '@/components/PageSkeleton';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const entryPointType = getEntryPointType();

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();

  const animationClass =
    currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';

  if (!isLoaded) {
    return <PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />;
  }

  const currentFeature = FEATURES.find((f) => f.key === currentPage);
  const MatchedComponent = currentFeature?.components?.[entryPointType];

  return (
    <div
      key={currentPage}
      className={cn(
        'flex-1 flex flex-col overflow-x-hidden overflow-y-auto',
        'scrollbar-gutter-stable motion-reduce:transition-none',
        animationClass,
      )}
    >
      <Suspense
        fallback={<PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />}
      >
        <PageErrorBoundary resetKey={currentPage}>
          {MatchedComponent ? (
            <MatchedComponent />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">页面未找到</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                {`该功能在当前运行环境（${entryPointType}）下不可用或已被移除。`}
              </p>
            </div>
          )}
        </PageErrorBoundary>
      </Suspense>
    </div>
  );
}
