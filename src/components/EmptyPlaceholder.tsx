import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  messageClassName?: string;
}

const CONTAINER_CLASSES =
  'rounded-xl bg-muted/30 border border-dashed border-border/80 text-center flex flex-col items-center justify-center select-none p-8 min-h-[120px]';

const MESSAGE_CLASSES =
  'text-xs font-semibold text-muted-foreground/80 tracking-wide max-w-[240px] leading-relaxed';

export default function EmptyPlaceholder({
  children,
  className,
  messageClassName,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div className={cn(CONTAINER_CLASSES, className)} {...props}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <p className={cn(MESSAGE_CLASSES, messageClassName)}>{children}</p>
      ) : (
        children
      )}
    </div>
  );
}
