export interface SwitchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
}

export interface SwitchButtonGroupProps<T extends string | number = string> {
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
  sx?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large';
  buttonSx?: React.CSSProperties;
}

export default function SwitchButtonGroup<T extends string | number = string>({
  value,
  options,
  onChange,
  sx,
  size = 'medium',
  buttonSx,
}: SwitchButtonGroupProps<T>) {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div
      className="w-full mb-4 rounded-xl border border-gray-200 bg-gray-50 p-1.5 flex gap-1"
      style={sx}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
            sizeClasses[size]
          } ${
            value === option.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
          }`}
          style={buttonSx}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
