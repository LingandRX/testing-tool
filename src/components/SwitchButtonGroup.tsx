import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SwitchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
}

export interface SwitchButtonGroupProps<T extends string | number = string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
  size?: 'small' | 'medium' | 'large';
  buttonClassName?: string;
}

const SIZE_CLASSES = {
  small: 'text-xs h-8 px-2 py-1 rounded-md',
  medium: 'text-sm h-9 px-3 py-1.5 rounded-md',
  large: 'text-base h-11 px-4 py-2 rounded-lg',
} as const;

const SELECTED_CLASSES = 'bg-background text-foreground shadow-sm font-semibold fade-in-zoom-95';
const UNSELECTED_CLASSES = 'hover:bg-background/50 hover:text-foreground/80';

export default function SwitchButtonGroup<T extends string | number = string>({
  value,
  options,
  onChange,
  size = 'medium',
  className,
  buttonClassName,
  ...props
}: SwitchButtonGroupProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex w-full items-center justify-center rounded-lg bg-muted text-muted-foreground p-1',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 transition-all',
            SIZE_CLASSES[size],
            value === option.value ? SELECTED_CLASSES : UNSELECTED_CLASSES,
            buttonClassName,
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
