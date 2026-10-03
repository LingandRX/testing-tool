import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

export interface LoadingPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 加载提示文案 */
  label?: string;
  /** 指示器尺寸 */
  spinnerSize?: 'sm' | 'md' | 'lg';
}

/**
 * 整页/整块区域的加载占位：居中旋转指示器 + 提示文案。
 * 用于页面懒加载、整页异步等待等场景。
 */
function LoadingPlaceholder({
  label = '正在加载...',
  spinnerSize = 'md',
  className,
  ...props
}: LoadingPlaceholderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 fade-in-200 motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      <Spinner size={spinnerSize} />
      <span className="text-xs font-medium tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export default LoadingPlaceholder;
