import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface AutoRefreshToggleProps {
  autoRefresh: boolean;
  onChange: (checked: boolean) => void;
}

export default function AutoRefreshToggle({ autoRefresh, onChange }: AutoRefreshToggleProps) {
  const { t } = useLazyTranslation('storageCleaner');
  return (
    <div className="mb-3 p-4 rounded-lg bg-background border border-border flex justify-between items-center shadow-sm transition-all hover:shadow-md">
      <span className="text-sm font-bold text-foreground px-3">
        {t('storageCleaner:autoRefresh')}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
      </label>
    </div>
  );
}
