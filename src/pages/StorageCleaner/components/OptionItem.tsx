import React from 'react';
import { formatBytes } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { StorageSizeInfo } from '../useStorageCleaner';
import { Checkbox } from '@/components/ui/checkbox';

const OPTION_LABELS: Record<string, string> = {
  localStorage: 'Local Storage',
  sessionStorage: 'Session Storage',
  indexedDB: '站点存储',
  cookies: 'Cookies',
  cacheStorage: 'Cache Storage',
  serviceWorkers: 'Service Workers',
};

interface OptionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelKey: string;
  checked: boolean;
  sizeInfo?: StorageSizeInfo;
  onChange: () => void;
}

export default function OptionItem({
  labelKey,
  checked,
  sizeInfo,
  onChange,
  className,
  ...props
}: OptionItemProps) {
  const sizeValue = sizeInfo?.value;
  const isCount = sizeInfo?.displayType === 'count';
  const label = OPTION_LABELS[labelKey] || labelKey;

  return (
    <div
      onClick={onChange}
      className={cn(
        'flex justify-between items-center py-2.5 px-3.5 rounded-lg border cursor-pointer select-none transition-colors',
        checked
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-muted/50',
        className,
      )}
      {...props}
    >
      <div className="flex-1 min-w-0 mr-3">
        <span
          className={cn(
            'block text-xs font-semibold leading-tight truncate transition-colors',
            checked ? 'text-foreground' : 'text-foreground/75',
          )}
        >
          {label}
        </span>

        {sizeValue !== undefined && sizeValue > 0 ? (
          <span
            className={cn(
              'block text-[10px] font-mono font-medium mt-0.5 tabular-nums transition-colors',
              checked ? 'text-primary/70' : 'text-muted-foreground/70',
            )}
          >
            {isCount ? `${sizeValue} 项` : formatBytes(sizeValue)}
          </span>
        ) : (
          <span className="block text-[10px] font-medium text-muted-foreground/50 mt-0.5 italic">
            {'无数据'}
          </span>
        )}
      </div>

      <Checkbox
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    </div>
  );
}
