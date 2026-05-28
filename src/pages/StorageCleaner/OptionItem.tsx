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
        'flex justify-between items-center py-2.5 px-3.5 rounded-xl border cursor-pointer select-none',
        checked
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-muted/70',
        className,
      )}
      {...props}
    >
      {/* 左侧数据区域 */}
      <div className="flex-1 min-w-0 mr-4">
        <span
          className={cn(
            'block text-xs font-semibold leading-tight truncate',
            checked ? 'text-foreground font-bold' : 'text-foreground/80',
          )}
        >
          {t(labelKey)}
        </span>

        {/* 底部容量大小或计数标识 */}
        {size !== undefined && size > 0 ? (
          <span className="block text-[10px] font-mono font-medium text-muted-foreground/80 mt-0.5 tabular-nums">
            {isCount ? `${size} ${t('storageCleaner:countUnit')}` : formatSize(size)}
          </span>
        ) : (
          <span className="block text-[10px] font-medium text-muted-foreground/60 mt-0.5 italic">
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
