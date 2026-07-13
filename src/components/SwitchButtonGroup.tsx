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
}

const SIZE_CLASSES = {
  small: 'text-xs h-8 px-2 py-1 rounded-md',
  medium: 'text-sm h-9 px-3 py-1.5 rounded-md',
  large: 'text-base h-11 px-4 py-2 rounded-lg',
} as const;

const INTERACTIVE_CLASSES =
  'active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted';

const SELECTED_CLASSES =
  'bg-background text-foreground shadow-sm font-semibold hover:bg-background hover:text-foreground';
const UNSELECTED_CLASSES = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

export default function SwitchButtonGroup<T extends string | number = string>({
  value,
  options,
  onChange,
  size = 'medium',
  className,
  ...props
}: SwitchButtonGroupProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex w-full items-center justify-center rounded-lg bg-muted p-1',
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
            INTERACTIVE_CLASSES,
            value === option.value ? SELECTED_CLASSES : UNSELECTED_CLASSES,
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
