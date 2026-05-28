import React from 'react';
import TextInputArea from '@/components/TextInputArea';
import { cn } from '@/lib/utils';

export interface JsonDiffInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  minRows?: number;
}

export default function JsonDiffInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  minRows = 10,
  className,
  ...props
}: JsonDiffInputProps) {
  return (
    <div className={cn('flex-1 min-w-0 flex flex-col', className)} {...props}>
      <span className="block mb-2 text-[10px] font-bold tracking-wide text-muted-foreground/80 uppercase select-none px-0.5">
        {label}
      </span>

      <TextInputArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minRows={minRows}
        maxRows={16}
        externalError={error ?? undefined}
        showClear={true}
        allowCopy={true}
      />
    </div>
  );
}
