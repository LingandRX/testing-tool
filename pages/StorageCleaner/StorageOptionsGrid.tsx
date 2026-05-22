import type { StorageCleanerOptions } from '@/types/storage';
import OptionItem from './OptionItem';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface StorageOptionsGridProps {
  options: StorageCleanerOptions;
  sizes: Record<string, number>;
  allSelected: boolean;
  someSelected: boolean;
  onOptionChange: (key: keyof StorageCleanerOptions) => void;
  onSelectAll: (checked: boolean) => void;
}

export default function StorageOptionsGrid({
  options,
  sizes,
  allSelected,
  someSelected: _someSelected,
  onOptionChange,
  onSelectAll,
}: StorageOptionsGridProps) {
  const { t } = useLazyTranslation('storageCleaner');

  const optionKeys: { key: keyof StorageCleanerOptions; isCount?: boolean }[] = [
    { key: 'localStorage' },
    { key: 'sessionStorage' },
    { key: 'indexedDB' },
    { key: 'cookies' },
    { key: 'cacheStorage', isCount: true },
    { key: 'serviceWorkers', isCount: true },
  ];

  return (
    <div className="mb-3 border rounded-lg bg-background shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {optionKeys.map(({ key, isCount }) => (
            <div key={key}>
              <OptionItem
                labelKey={`storageCleaner:options.${key}`}
                checked={options[key]}
                size={sizes[key]}
                isCount={isCount}
                onChange={() => onOptionChange(key)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="border-t" />
      <div className="flex justify-between items-center px-5 py-2 transition-colors hover:bg-muted rounded-b-lg">
        <span className="text-xs font-bold text-muted-foreground">
          {t('storageCleaner:selectAll')}
        </span>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
