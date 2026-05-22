import React from 'react';
import { cn } from '@/lib/utils'; // 1. 引入标准的 shadcn 工具函数

export interface SwitchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
}

// 2. 移除内联 sx，继承标准 HTML 属性，并使用标准的类名注入机制
export interface SwitchButtonGroupProps<T extends string | number = string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
  size?: 'small' | 'medium' | 'large';
  buttonClassName?: string; // 替换原有的 buttonSx
}

export default function SwitchButtonGroup<T extends string | number = string>({
  value,
  options,
  onChange,
  size = 'medium',
  className,
  buttonClassName,
  ...props
}: SwitchButtonGroupProps<T>) {
  // 3. 将尺寸和高度、内边距等整体对齐，保证按钮和背景容器成比例缩放
  const sizeClasses = {
    small: 'text-xs h-8 px-2 py-1 rounded-md',
    medium: 'text-sm h-9 px-3 py-1.5 rounded-md',
    large: 'text-base h-11 px-4 py-2 rounded-lg',
  };

  const containerPadding = size === 'large' ? 'p-1' : 'p-1';

  return (
    <div
      className={cn(
        // 将默认布局设计得更为通用（去掉一刀切的 mb-4，由外部控制布局空间）
        'inline-flex w-full items-center justify-center rounded-lg bg-muted text-muted-foreground',
        containerPadding,
        className,
      )}
      {...props}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              // 4. 完美继承 shadcn 的 Tabs 交互和动效微调
              'flex-1 inline-flex items-center justify-center font-medium whitespace-nowrap transition-all',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              sizeClasses[size],
              isSelected
                ? 'bg-background text-foreground shadow-sm font-semibold animate-in fade-in-50 zoom-in-95 duration-150'
                : 'hover:bg-background/50 hover:text-foreground/80',
              buttonClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
