import { getFeatureByKey } from '@/config/features';
import { loadPage } from '@/config/pageLoaders/index';
import { useRouter } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';
import { type ComponentType, useEffect, useState } from 'react';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import PageSkeleton from '@/components/PageSkeleton';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

function LoadedPage({ pageKey }: { pageKey: PageType }) {
  const [Page, setPage] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadPage(pageKey)
      .then((mod) => {
        if (!cancelled) {
          setPage(() => mod.default);
        }
      })
      .catch((err) => {
        console.error('[Router Page Load Error]', err);
      });

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  if (!Page) {
    return <PageSkeleton variant={pageKey === 'dashboard' ? 'dashboard' : 'tool'} />;
  }

  return <Page />;
}

export default function RouterContainer() {
  const { currentPage } = useRouter();

  const animationClass =
    currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';

  const currentFeature = getFeatureByKey(currentPage);

  return (
    <div
      key={currentPage}
      className={cn(
        'flex-1 flex flex-col overflow-x-hidden overflow-y-auto',
        'scrollbar-gutter-stable motion-reduce:transition-none',
        animationClass,
      )}
    >
      <PageErrorBoundary resetKey={currentPage}>
        {currentFeature ? (
          <LoadedPage key={currentPage} pageKey={currentPage} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">页面未找到</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              该功能不存在或已被移除。
            </p>
          </div>
        )}
      </PageErrorBoundary>
    </div>
  );
}
