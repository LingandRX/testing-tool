import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollapsiblePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 面板标题 */
  title: string;
  /** 是否处于折叠态 */
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** 折叠态展示的单行缩略预览文本 */
  preview?: string;
  /** 展开态内容 */
  children?: React.ReactNode;
}

export default function CollapsiblePanel({
  title,
  collapsed,
  onToggleCollapse,
  preview,
  children,
  className,
  ...props
}: CollapsiblePanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-md border bg-card transition-all duration-300 ease-in-out',
        className,
      )}
      style={{
        flex: collapsed ? '0 0 36px' : '1 1 120px',
      }}
      {...props}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className={cn(
          'flex h-[36px] w-full cursor-pointer select-none items-center justify-between bg-muted/20 hover:bg-muted/30 transition-colors px-3 shrink-0 text-left focus:outline-none focus:bg-muted/40',
          !collapsed && 'border-b border-border/60',
        )}
      >
        <span className="text-[11px] font-semibold text-foreground/90 shrink-0">{title}</span>
        <span
          className={cn(
            'flex-1 truncate font-mono text-xs text-muted-foreground/70 ml-3 transition-all duration-300',
            collapsed ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 pointer-events-none',
          )}
        >
          {preview}
        </span>
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground transition-transform duration-300',
            !collapsed && 'rotate-90',
          )}
        />
      </button>

      <div
        className={cn(
          'flex-1 min-h-0 flex flex-col transition-opacity duration-300',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
        )}
      >
        {children}
      </div>
    </div>
  );
}
