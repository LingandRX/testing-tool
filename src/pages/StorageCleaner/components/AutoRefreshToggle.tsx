import React from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface AutoRefreshToggleProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  reloadAfterClean: boolean;
  onChange: (checked: boolean) => void;
}

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
        清理后自动刷新页面
      </Label>

      <Switch id="auto-refresh-switch" checked={reloadAfterClean} onCheckedChange={onChange} />
    </div>
  );
}
