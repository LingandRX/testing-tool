import { FEATURES, getEntryPointType } from '@/config/features';
import { useRouter } from '@/providers/RouterProvider';
import { Suspense, useMemo } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import PageSkeleton from '@/components/PageSkeleton';
import { cn } from '@/lib/utils'; // 1. 引入标准的 shadcn 工具函数
import { AlertTriangle } from 'lucide-react'; // 用于标准的 404 异常展示

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();
  const { t } = useI18n('common');

  // 2. 稳定的动态动画类名映射
  const animationClass = useMemo(() => {
    return currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';
  }, [currentPage]);

  const entryPointType = getEntryPointType();

  // 骨架屏加载状态守卫
  if (!isLoaded) {
    return <PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />;
  }

  // 3. 严格的路由查找与类型安全的组件分发
  const currentFeature = FEATURES.find((f) => f.key === currentPage);
  const MatchedComponent = currentFeature?.components?.[entryPointType];

  return (
    <div
      key={currentPage} // 保持原有通过重新挂载触发动画的精简特性
      className={cn(
        'flex-1 flex flex-col overflow-x-hidden overflow-y-auto',
        'scrollbar-gutter-stable motion-reduce:transition-none', // 当系统开启“减弱动态效果”时，自动优雅降级，防止眩晕
        animationClass,
      )}
    >
      <Suspense
        fallback={<PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />}
      >
        <PageErrorBoundary resetKey={currentPage}>
          {/*
            4. 路由防御拦截：
            如果组件存在则正常流式渲染，如果由于版本更迭或非法路径导致找不到对应组件，
            渲染一个优雅且符合 shadcn 风格的中性 404 提示页，而不是死白屏。
          */}
          {MatchedComponent ? (
            <MatchedComponent />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('router.notFound')}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                {t('router.notFoundDescription', { entryPointType })}
              </p>
            </div>
          )}
        </PageErrorBoundary>
      </Suspense>
    </div>
  );
}
