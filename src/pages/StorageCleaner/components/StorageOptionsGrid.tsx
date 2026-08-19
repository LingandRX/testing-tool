import React from 'react';
import type { StorageCleanerOptions } from '@/types/storage';
import type { StorageSizeInfo } from '../useStorageCleaner';
import OptionItem from './OptionItem';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CLEAN_OPTION_KEYS } from '../constants';
import { formatBytes } from '@/utils/format';
import { Sparkles } from 'lucide-react';

interface StorageOptionsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  options: StorageCleanerOptions;
  sizes: Record<string, StorageSizeInfo>;
  totalBytes: number;
  hasDataCount: number;
  allSelected: boolean;
  someSelected: boolean;
  cleaningKey: keyof StorageCleanerOptions | null;
  loading: boolean;
  onOptionChange: (key: keyof StorageCleanerOptions) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOnlyWithData: () => void;
  onCleanSingle: (key: keyof StorageCleanerOptions) => void;
}

export default function StorageOptionsGrid({
  options,
  sizes,
  totalBytes,
  hasDataCount,
  allSelected,
  someSelected,
  cleaningKey,
  loading,
  onOptionChange,
  onSelectAll,
  onSelectOnlyWithData,
  onCleanSingle,
  className,
  ...props
}: StorageOptionsGridProps) {
  const handleToggleAll = () => {
    onSelectAll(!allSelected);
  };

  return (
    <div className={cn('w-full overflow-hidden', className)} {...props}>
      {/* 顶部容量概览与快捷操作栏 */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-foreground/90 tracking-tight">当前占用:</span>
          <span className="text-xs font-mono font-bold text-primary tabular-nums">
            {formatBytes(totalBytes)}
          </span>
          <span className="text-[11px] text-muted-foreground ml-0.5">
            ({hasDataCount} 项有数据)
          </span>
        </div>

        {hasDataCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSelectOnlyWithData}
            disabled={loading}
            className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-md"
          >
            <Sparkles className="h-3 w-3" />
            仅选有数据
          </Button>
        )}
      </div>

      {/* 选项网格 */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2 items-stretch">
          {CLEAN_OPTION_KEYS.map((key) => (
            <OptionItem
              key={key}
              labelKey={key}
              checked={options[key]}
              sizeInfo={sizes[key]}
              isCleaningSingle={cleaningKey === key}
              isGlobalLoading={loading}
              onChange={() => onOptionChange(key)}
              onCleanSingle={onCleanSingle}
            />
          ))}
        </div>
      </div>

      {/* 底部全选与快捷切换 */}
      <div
        onClick={handleToggleAll}
        className="border-t border-border flex justify-between items-center px-3.5 py-2.5 bg-muted/20 hover:bg-muted/40 cursor-pointer select-none transition-colors"
      >
        <Label className="text-xs font-bold text-muted-foreground/90 cursor-pointer tracking-wide uppercase">
          全选所有项
        </Label>

        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
          className="h-4 w-4 shrink-0 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-muted-foreground/40"
        />
      </div>
    </div>
  );
}
