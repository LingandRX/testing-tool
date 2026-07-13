import React from 'react';
import { ChevronRight } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import { cn } from '@/lib/utils';

export interface JsonDiffPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 面板标题，如 "数据 A（原始）" */
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  /** 是否处于折叠态 */
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** 折叠态展示的单行缩略预览文本 */
  preview: string;
}

export default function JsonDiffPanel({
  title,
  placeholder,
  value,
  onChange,
  error,
  collapsed,
  onToggleCollapse,
  preview,
  className,
  ...props
}: JsonDiffPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-md border bg-card transition-all duration-300 ease-in-out',
        error
          ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive focus-within:border-destructive'
          : 'border-border focus-within:ring-1 focus-within:ring-ring focus-within:border-border/80',
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
        <TextInputArea
          fill
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          externalError={error ?? undefined}
          showClear={true}
          allowCopy={true}
          borderless
          className="min-h-0 flex-1"
        />
      </div>
    </div>
  );
}
