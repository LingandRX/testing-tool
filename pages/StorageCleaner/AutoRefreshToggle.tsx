import React from 'react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils';
// 引入官方的 Switch 原子组件
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AutoRefreshToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  autoRefresh: boolean;
  onChange: (checked: boolean) => void;
}

export default function AutoRefreshToggle({
  autoRefresh,
  onChange,
  className,
  ...props
}: AutoRefreshToggleProps) {
  const { t } = useLazyTranslation('storageCleaner');

  return (
    <div
      className={cn(
        // 外层包裹维持优雅的 shadcn 风格中性卡片，去除硬编码 mb-3 扩展灵活性
        'w-full p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all focus-within:ring-1 focus-within:ring-ring flex justify-between items-center',
        className,
      )}
      {...props}
    >
      {/* 3. 使用标准的 shadcn/ui Label 组件：
        绑定 htmlFor 建立安全的表单无障碍桥梁，使得用户点击文字也能触发开关联动
      */}
      <Label
        htmlFor="auto-refresh-switch"
        className="text-sm font-bold text-foreground cursor-pointer select-none tracking-tight"
      >
        {t('storageCleaner:autoRefresh')}
      </Label>

      {/* 4. 超进化：彻底废除 200 个字符的原生 checkbox 拼接！
        完美调用 shadcn 的 Switch 组件。它会自动应用全站统一的主色（Primary）、
        带阻尼的滑块硬件加速动效、以及教科书级别的 WAI-ARIA 无障碍键盘焦点提示。
      */}
      <Switch
        id="auto-refresh-switch"
        checked={autoRefresh}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary" // 如果依然需要特定的琥珀色可写 data-[state=checked]:bg-amber-500
      />
    </div>
  );
}
