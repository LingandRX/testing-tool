import React from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface AutoRefreshToggleProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  reloadAfterClean: boolean;
  skipConfirm: boolean;
  onReloadChange: (checked: boolean) => void;
  onSkipConfirmChange: (checked: boolean) => void;
}

export default function AutoRefreshToggle({
  reloadAfterClean,
  skipConfirm,
  onReloadChange,
  onSkipConfirmChange,
  className,
  ...props
}: AutoRefreshToggleProps) {
  return (
    <div
      className={cn('w-full border-t border-border bg-card divide-y divide-border/50', className)}
      {...props}
    >
      <div className="px-3.5 py-2.5 flex justify-between items-center">
        <Label
          htmlFor="auto-refresh-switch"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none tracking-tight"
        >
          清理后自动刷新页面
        </Label>
        <Switch
          id="auto-refresh-switch"
          checked={reloadAfterClean}
          onCheckedChange={onReloadChange}
        />
      </div>

      <div className="px-3.5 py-2.5 flex justify-between items-center">
        <Label
          htmlFor="skip-confirm-switch"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none tracking-tight"
        >
          快捷清理（跳过二次确认）
        </Label>
        <Switch
          id="skip-confirm-switch"
          checked={skipConfirm}
          onCheckedChange={onSkipConfirmChange}
        />
      </div>
    </div>
  );
}
