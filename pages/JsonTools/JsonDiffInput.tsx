import TextInputArea from '@/components/TextInputArea';

interface JsonDiffInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export default function JsonDiffInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: JsonDiffInputProps) {
  return (
    <div className="flex-1 min-w-0">
      <span className="block mb-1.5 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <TextInputArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minRows={8}
        autoResize={false}
        externalError={error ?? undefined}
        showClear={true}
      />
    </div>
  );
}

export { JsonDiffInput };
export type { JsonDiffInputProps };
