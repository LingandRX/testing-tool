import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delayMs?: number;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, side = 'top', children, delayMs = 200, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const showTooltip = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(true), delayMs);
    };

    const hideTooltip = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(false);
    };

    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const sideClasses = {
      top: 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
      left: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
      right: 'left-full ml-1.5 top-1/2 -translate-y-1/2',
    };

    return (
      <div
        className="relative inline-flex"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        ref={ref}
        {...props}
      >
        {children}
        {visible && content && (
          <div
            role="tooltip"
            className={cn(
              'absolute z-50 whitespace-nowrap rounded-md bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-md border border-border/60 pointer-events-none fade-in-zoom-95',
              sideClasses[side],
              className,
            )}
          >
            {content}
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
