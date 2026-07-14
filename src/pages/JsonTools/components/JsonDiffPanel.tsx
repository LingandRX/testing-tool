import React from 'react';
import TextInputArea from '@/components/TextInputArea';
import CollapsiblePanel from './CollapsiblePanel';
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
    <CollapsiblePanel
      title={title}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      preview={preview}
      className={cn(
        error
          ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive focus-within:border-destructive'
          : 'border-border focus-within:ring-1 focus-within:ring-ring focus-within:border-border/80',
        className,
      )}
      {...props}
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
    </CollapsiblePanel>
  );
}
