import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 两列内容块的行数 */
  rows?: number;
}

/**
 * 页面级骨架屏布局：标题行 + 两列内容块 + 底部操作区。
 * 块高度尽量贴近真实内容，减少「骨架 → 内容」的二次跳动。
 */
function PageSkeleton({ rows = 6, className, ...props }: PageSkeletonProps) {
  return (
    <div className={cn('w-full flex flex-col space-y-4', className)} {...props}>
      <div className="w-full rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-border/50">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg w-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

export default PageSkeleton;
