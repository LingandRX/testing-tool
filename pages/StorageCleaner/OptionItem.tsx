import React from 'react';
import { formatSize } from '@/utils/storageCleaner';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
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
  const { t } = useLazyTranslation('storageCleaner');

  return (
    <div
      // 3. 跨越级交互升级：将外部容器升级为一个高度敏感的可点击 Tab 热区
      onClick={onChange}
      className={cn(
        'flex justify-between items-center py-2.5 px-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200',
        // 4. 彻底抛弃硬编码黄底：
        // - 选中时：使用 bg-primary/5 (系统主色超淡叠加) 配合标准 border-primary/30。
        // - 未选中时：保持透明 border-transparent，悬停呈现 bg-muted。
        // 这样在暗黑模式下会自动无缝混色，极为深邃、高级。
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
            'block text-xs font-semibold leading-tight truncate transition-colors',
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

      {/* 5. 超进化：全面替换原生 input 标签
        完美调用 shadcn 的 Checkbox 组件。它自带全站统一的主色（Primary）、
        打钩选中时的平滑微放大缩放动效（Scale Animation），
        并且阻止冒泡，防范与外层的全局覆盖点击事件产生双重冲突。
      */}
      <Checkbox
        checked={checked}
        // 阻止 Checkbox 自身的点击事件冒泡，因为外层 div 已经代理了点击逻辑
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    </div>
  );
}
