import { getFeatureByKey } from '@/config/features';
import { loadPage } from '@/config/pageLoaders/index';
import { useRouter } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';
import { type ComponentType, useEffect, useState } from 'react';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const pageComponentCache = new Map<PageType, ComponentType>();

/**
 * 预加载指定页面组件，提升切换页面时的流畅度
 */
export function preloadPage(key: PageType): void {
  if (!pageComponentCache.has(key)) {
    loadPage(key)
      .then((mod) => {
        pageComponentCache.set(key, mod.default);
      })
      .catch(() => {});
  }
}

function LoadedPage({ pageKey }: { pageKey: PageType }) {
  const cached = pageComponentCache.get(pageKey) ?? null;
  const [Page, setPage] = useState<ComponentType | null>(() => cached);
  const [wasCached] = useState<boolean>(() => Boolean(cached));

  useEffect(() => {
    let cancelled = false;

    if (!pageComponentCache.has(pageKey)) {
      loadPage(pageKey)
        .then((mod) => {
          pageComponentCache.set(pageKey, mod.default);
          if (!cancelled) {
            setPage(() => mod.default);
          }
        })
        .catch((err) => {
          console.error('[Router Page Load Error]', err);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  if (!Page) {
    return <div className="flex-1" aria-hidden="true" />;
  }

  if (!wasCached) {
    return (
      <div className="flex-1 flex flex-col min-w-0 page-transition-enter">
        <Page />
      </div>
    );
  }

  return <Page />;
}

export default function RouterContainer() {
  const { currentPage } = useRouter();

  const currentFeature = getFeatureByKey(currentPage);

  return (
    <div
      key={currentPage}
      className={cn(
        'flex-1 flex flex-col overflow-x-hidden overflow-y-auto',
        'motion-reduce:transition-none page-transition-enter',
      )}
    >
      <PageErrorBoundary resetKey={currentPage}>
        {currentFeature ? (
          <LoadedPage key={currentPage} pageKey={currentPage} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center fade-in-300">
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
