/**
 * PageSkeleton 组件 - 页面加载骨架屏
 *
 * 用于 Suspense fallback 和初始加载状态，提供平滑的视觉过渡
 * 避免白屏闪烁，减少布局偏移
 */

/**
 * 工具页面骨架屏
 */
function ToolPageSkeleton() {
  return (
    <div className="p-5">
      {/* 标题区域 */}
      <div className="w-44 h-7 bg-muted rounded animate-pulse mb-4" />

      {/* 输入区域 */}
      <div className="w-full h-[120px] bg-muted rounded-xl animate-pulse mb-4" />

      {/* 控制栏 */}
      <div className="flex gap-2 mb-4">
        <div className="w-24 h-9 bg-muted rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-muted rounded-lg animate-pulse" />
        <div className="flex-1" />
        <div className="w-24 h-9 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* 结果区域 */}
      <div className="w-full h-[160px] bg-muted rounded-xl animate-pulse" />
    </div>
  );
}

/**
 * 页面加载骨架屏
 */
export default function PageSkeleton() {
  return <ToolPageSkeleton />;
}

PageSkeleton.displayName = 'PageSkeleton';
