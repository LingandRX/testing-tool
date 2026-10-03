import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * 统一的旋转指示器尺寸：
 * xs 用于 xs/iconSm/iconXs 按钮，sm 用于常规按钮，md/lg 用于独立加载区域
 *
 * 纯视觉组件（aria-hidden）：加载语义由外层承担——按钮用 aria-busy，
 * 加载占位用 role="status" + 可见文案，避免污染按钮的 accessible name。
 */
const spinnerVariants = cva('animate-spin motion-reduce:animate-none text-muted-foreground', {
  variants: {
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-9 w-9',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {}

function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0', className)} {...props}>
      <Loader2 className={spinnerVariants({ size })} />
    </span>
  );
}

export { Spinner, spinnerVariants };
export default Spinner;
