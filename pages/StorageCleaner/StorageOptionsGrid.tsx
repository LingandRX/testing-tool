import React from 'react';
import type { StorageCleanerOptions } from '@/types/storage';
import OptionItem from './OptionItem';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils';
// 1. 引入官方标准的 Checkbox 原子组件
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StorageOptionsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  options: StorageCleanerOptions;
  sizes: Record<string, number>;
  allSelected: boolean;
  someSelected: boolean; // 重新激活半选状态
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
  const { t } = useLazyTranslation('storageCleaner');

  const optionKeys: { key: keyof StorageCleanerOptions; isCount?: boolean }[] = [
    { key: 'localStorage' },
    { key: 'sessionStorage' },
    { key: 'indexedDB' },
    { key: 'cookies' },
    { key: 'cacheStorage', isCount: true },
    { key: 'serviceWorkers', isCount: true },
  ];

  // 2. 处理全选栏点击事件：包裹整个栏变成超级热区
  const handleToggleAll = () => {
    // 如果当前已经是全选，点击则取消全选；否则，点击就是全选
    onSelectAll(!allSelected);
  };

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden',
        className,
      )}
      {...props}
    >
      {/* 核心网格区 */}
      <div className="p-3">
        {/* 💡 优化点：加入 items-stretch，确保左右卡片高度绝对对齐 */}
        <div className="grid grid-cols-2 gap-2.5 items-stretch">
          {optionKeys.map(({ key, isCount }) => (
            /* 💡 终极修复：直接把 key 挂在 OptionItem 上，移除了无意义的包裹 div */
            <OptionItem
              key={key}
              labelKey={`storageCleaner:options.${key}`}
              checked={options[key]}
              size={sizes[key]}
              isCount={isCount}
              onChange={() => onOptionChange(key)}
            />
          ))}
        </div>
      </div>

      {/* 3. 全选功能底护栏超进化：
        - 整体赋予 cursor-pointer 和 onClick，点击一整行都能触发全选。
        - 悬停时自动变色提示可点击 (hover:bg-muted/50)。
      */}
      <div
        onClick={handleToggleAll}
        className="border-t border-border flex justify-between items-center px-4 py-2.5 bg-muted/20 hover:bg-muted/50 cursor-pointer select-none"
      >
        <Label className="text-xs font-bold text-muted-foreground/90 cursor-pointer">
          {t('storageCleaner:selectAll')}
        </Label>

        {/* 4. 降维打击：调用标准的 shadcn/ui Checkbox
          - 阻止冒泡：防止事件重复触发。
          - 完美注入半选逻辑：当 allSelected 为 false 但 someSelected 为 true 时，
            组件会自动呈现优雅的 "—" (减号) 半选视觉状态，向主流系统控制台高标准看齐！
        */}
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
          className="h-4 w-4 shrink-0 rounded border-input data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary"
        />
      </div>
    </div>
  );
}
