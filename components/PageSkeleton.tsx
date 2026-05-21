/**
 * PageSkeleton 组件 - 页面加载骨架屏
 *
 * 用于 Suspense fallback 和初始加载状态，提供平滑的视觉过渡
 * 避免白屏闪烁，减少布局偏移
 */
interface PageSkeletonProps {
  /** 骨架屏类型 */
  variant?: 'dashboard' | 'tool';
}

/**
 * 仪表盘卡片骨架屏
 */
function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-5 h-[100px]">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
          <div>
            <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-3.5 bg-gray-200 rounded animate-pulse mt-1.5" />
          </div>
        </div>
        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * 工具页面骨架屏
 */
function ToolPageSkeleton() {
  return (
    <div className="p-5">
      {/* 标题区域 */}
      <div className="w-44 h-7 bg-gray-200 rounded animate-pulse mb-4" />

      {/* 输入区域 */}
      <div className="w-full h-[120px] bg-gray-200 rounded-xl animate-pulse mb-4" />

      {/* 控制栏 */}
      <div className="flex gap-2 mb-4">
        <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1" />
        <div className="w-22 h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* 结果区域 */}
      <div className="w-full h-[160px] bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

/**
 * 页面加载骨架屏
 *
 * @param props - PageSkeletonProps
 * @returns 骨架屏 JSX 元素
 */
export default function PageSkeleton({ variant = 'dashboard' }: PageSkeletonProps) {
  if (variant === 'tool') {
    return <ToolPageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] auto-rows-fr gap-4 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <DashboardCardSkeleton key={index} />
      ))}
    </div>
  );
}

PageSkeleton.displayName = 'PageSkeleton';
