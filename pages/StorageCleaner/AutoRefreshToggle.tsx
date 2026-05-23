/**
 * 自动刷新开关组件
 *
 * 用于 StorageCleaner 页面，控制是否自动刷新存储数据列表。
 * 以卡片形式展示，左侧为标签文本，右侧为 shadcn/ui Switch 开关。
 *
 * @example
 * ```tsx
 * <AutoRefreshToggle
 *   reloadAfterClean={reloadAfterClean}
 *   onChange={(checked) => setReloadAfterClean(checked)}
 * />
 * ```
 */

import React from 'react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface AutoRefreshToggleProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** 开关的当前状态（受控） */
  reloadAfterClean: boolean;
  /** 状态变化时的回调函数 */
  onChange: (checked: boolean) => void;
}

/**
 * 自动刷新开关
 *
 * @param reloadAfterClean - 当前开关状态
 * @param onChange - 状态变化回调，接收新的布尔值
 * @param className - 额外的 CSS 类名，用于覆盖或扩展样式
 * @param props - 透传给外层 div 的其他 HTML 属性
 */
export default function AutoRefreshToggle({
  reloadAfterClean,
  onChange,
  className,
  ...props
}: AutoRefreshToggleProps) {
  const { t } = useLazyTranslation('storageCleaner');

  return (
    <div
      className={cn(
        'w-full p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all focus-within:ring-1 focus-within:ring-ring flex justify-between items-center',
        className,
      )}
      {...props}
    >
      {/* Label 与 Switch 通过 htmlFor + id 关联，支持点击文字触发开关 */}
      <Label
        htmlFor="auto-refresh-switch"
        className="text-sm font-bold text-foreground cursor-pointer select-none tracking-tight"
      >
        {t('storageCleaner:autoRefresh')}
      </Label>

      <Switch id="auto-refresh-switch" checked={reloadAfterClean} onCheckedChange={onChange} />
    </div>
  );
}
