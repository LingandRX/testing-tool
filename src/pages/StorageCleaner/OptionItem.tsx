import React from 'react';
import { formatSize } from '@/utils/storageCleaner';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';
// 引入官方的 Checkbox 原子组件
import { Checkbox } from '@/components/ui/checkbox';

interface OptionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelKey: string;
  checked: boolean;
  size?: number;
  isCount?: boolean;
  onChange: () => void;
}

export default function OptionItem({
  labelKey,
  checked,
  size,
  isCount = false,
  onChange,
  className,
  ...props
}: OptionItemProps) {
  const { t } = useI18n('storageCleaner');

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
          {t(labelKey)}
        </span>

        {size !== undefined && size > 0 ? (
          <span
            className={cn(
              'block text-[10px] font-mono font-medium mt-0.5 tabular-nums transition-colors',
              checked ? 'text-primary/70' : 'text-muted-foreground/70',
            )}
          >
            {isCount ? `${size} ${t('storageCleaner:countUnit')}` : formatSize(size)}
          </span>
        ) : (
          <span className="block text-[10px] font-medium text-muted-foreground/50 mt-0.5 italic">
            {t('storageCleaner:noData')}
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
