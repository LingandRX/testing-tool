import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import { cn } from '@/lib/utils';

export interface JsonDiffPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 面板标题，如 "数据 A（原始）" */
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  /** 是否处于折叠态（Accordion 收起） */
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
        'flex flex-col overflow-hidden rounded-md border border-border bg-card',
        collapsed ? 'h-[38px] shrink-0' : 'flex-1 min-h-[120px]',
        className,
      )}
      {...props}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-[36px] w-full items-center gap-2 px-3 text-left select-none bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {title}
          </span>
          <span className="flex-1 truncate font-mono text-xs text-muted-foreground">{preview}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <>
          <div
            onClick={onToggleCollapse}
            className="flex h-[36px] cursor-pointer select-none items-center justify-between border-b border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors px-3"
          >
            <span className="text-[11px] font-semibold text-foreground/90">{title}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </div>
          <TextInputArea
            fill
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            externalError={error ?? undefined}
            showClear={true}
            allowCopy={true}
            className="min-h-0 flex-1"
          />
        </>
      )}
    </div>
  );
}
