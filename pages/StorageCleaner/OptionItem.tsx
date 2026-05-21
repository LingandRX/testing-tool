import { formatSize } from '@/utils/storageCleaner';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface OptionItemProps {
  labelKey: string;
  checked: boolean;
  size?: number;
  isCount?: boolean;
  onChange: () => void;
}

export default function OptionItem({
  labelKey,
  checked,
  size,
  isCount = false,
  onChange,
}: OptionItemProps) {
  const { t } = useLazyTranslation('storageCleaner');
  return (
    <div
      className={`flex justify-between items-center py-2 px-3 rounded-lg transition-all duration-200 ${
        checked
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-transparent border border-transparent hover:bg-gray-50 hover:shadow-sm'
      }`}
    >
      <div className="flex-1 min-w-0 mr-3">
        <span
          className={`block text-xs leading-tight truncate transition-colors ${
            checked ? 'text-amber-700 font-bold' : 'text-gray-900 font-bold'
          }`}
        >
          {t(labelKey)}
        </span>
        {size !== undefined && size > 0 ? (
          <span className="block text-[10px] font-semibold text-gray-500 mt-0.5 opacity-80">
            {isCount ? `${size} ${t('storageCleaner:countUnit')}` : formatSize(size)}
          </span>
        ) : (
          <span className="block text-[10px] font-medium text-gray-400 mt-0.5 italic">
            {t('storageCleaner:noData')}
          </span>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
      />
    </div>
  );
}
