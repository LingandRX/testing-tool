import React from 'react';
import { formatBytes } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { StorageSizeInfo } from '../useStorageCleaner';
import type { StorageCleanerOptions } from '@/types/storage';
import { CLEAN_OPTION_KEYS, OPTION_LABELS } from '../constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2 } from 'lucide-react';

interface OptionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelKey: (typeof CLEAN_OPTION_KEYS)[number];
  checked: boolean;
  sizeInfo?: StorageSizeInfo;
  isCleaningSingle?: boolean;
  isGlobalLoading?: boolean;
  onChange: () => void;
  onCleanSingle?: (key: keyof StorageCleanerOptions) => void;
}

export default function OptionItem({
  labelKey,
  checked,
  sizeInfo,
  isCleaningSingle = false,
  isGlobalLoading = false,
  onChange,
  onCleanSingle,
  className,
  ...props
}: OptionItemProps) {
  const sizeValue = sizeInfo?.value ?? 0;
  const hasData = sizeValue > 0;
  const isCount = sizeInfo?.displayType === 'count';
  const label = OPTION_LABELS[labelKey];

  const handleSingleCleanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGlobalLoading && onCleanSingle) {
      onCleanSingle(labelKey);
    }
  };

  return (
    <div
      onClick={onChange}
      className={cn(
        'group relative flex items-center justify-between py-2.5 px-3 rounded-lg border cursor-pointer select-none transition-all duration-150',
        checked
          ? 'bg-primary/5 border-primary/40 shadow-xs'
          : hasData
            ? 'bg-card border-border hover:border-muted-foreground/30 hover:bg-muted/30'
            : 'bg-transparent border-dashed border-border/60 opacity-60 hover:opacity-100 hover:border-muted-foreground/30',
        className,
      )}
      {...props}
    >
      <div className="flex-1 min-w-0 mr-2">
        <span
          className={cn(
            'block text-xs font-semibold leading-tight truncate transition-colors',
            checked ? 'text-foreground' : hasData ? 'text-foreground/90' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>

        {hasData ? (
          <span
            className={cn(
              'inline-flex items-center text-[10px] font-mono font-bold mt-1 px-1.5 py-0.2 rounded tabular-nums transition-colors',
              checked ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground/80',
            )}
          >
            {isCount ? `${sizeValue} 项` : formatBytes(sizeValue)}
          </span>
        ) : (
          <span className="block text-[10px] font-medium text-muted-foreground/60 mt-1 italic">
            无数据
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* 单项快捷清理小按钮：仅在有数据或悬浮时便捷展示 */}
        {hasData && onCleanSingle && (
          <button
            type="button"
            title={`单独清理 ${label}`}
            onClick={handleSingleCleanClick}
            disabled={isGlobalLoading}
            className={cn(
              'h-6 w-6 rounded flex items-center justify-center text-muted-foreground transition-all',
              'hover:bg-destructive/10 hover:text-destructive active:scale-95',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              isCleaningSingle && 'opacity-100 text-destructive',
            )}
          >
            {isCleaningSingle ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        <Checkbox
          checked={checked}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={onChange}
          className="h-4 w-4 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>
    </div>
  );
}
