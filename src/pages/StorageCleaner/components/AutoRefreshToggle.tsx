/**
 * 自动刷新开关行
 *
 * 用于 StorageCleaner 页面的操作区域内（非独立卡片），
 * 控制清理后是否自动刷新页面。左侧为标签文本，右侧为 shadcn/ui Switch 开关。
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
  return (
    <div
      className={cn(
        'w-full px-3.5 py-3 border-t border-border flex justify-between items-center',
        className,
      )}
      {...props}
    >
      <Label
        htmlFor="auto-refresh-switch"
        className="text-xs font-bold text-muted-foreground/90 cursor-pointer select-none tracking-wide uppercase"
      >
        {'清理后自动刷新页面'}
      </Label>

      <Switch id="auto-refresh-switch" checked={reloadAfterClean} onCheckedChange={onChange} />
    </div>
  );
}
