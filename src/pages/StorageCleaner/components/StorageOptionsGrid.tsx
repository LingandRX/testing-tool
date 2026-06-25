import React from 'react';
import type { StorageCleanerOptions } from '@/types/storage';
import type { StorageSizeInfo } from '../useStorageCleaner';
import OptionItem from './OptionItem';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CLEAN_OPTION_KEYS } from '../constants';

interface StorageOptionsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  options: StorageCleanerOptions;
  sizes: Record<string, StorageSizeInfo>;
  allSelected: boolean;
  someSelected: boolean;
  onOptionChange: (key: keyof StorageCleanerOptions) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function StorageOptionsGrid({
  options,
  sizes,
  allSelected,
  someSelected,
  onOptionChange,
  onSelectAll,
  className,
  ...props
}: StorageOptionsGridProps) {
  const handleToggleAll = () => {
    onSelectAll(!allSelected);
  };

  return (
    <div className={cn('w-full overflow-hidden', className)} {...props}>
      <div className="px-3.5 pt-3.5 pb-2">
        <div className="grid grid-cols-2 gap-2 items-stretch">
          {CLEAN_OPTION_KEYS.map((key) => (
            <OptionItem
              key={key}
              labelKey={key}
              checked={options[key]}
              sizeInfo={sizes[key]}
              onChange={() => onOptionChange(key)}
            />
          ))}
        </div>
      </div>

      <div
        onClick={handleToggleAll}
        className="border-t border-border flex justify-between items-center pl-3.5 pr-7 py-2.5 bg-muted/20 hover:bg-muted/40 cursor-pointer select-none transition-colors"
      >
        <Label className="text-xs font-bold text-muted-foreground/90 cursor-pointer tracking-wide uppercase">
          {'全选所有项'}
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
