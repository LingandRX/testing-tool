import { Button } from '@/components/ui/button';
import { useSnackbar } from '@/components/GlobalSnackbar';
import StorageCleanerConfirm from '@/pages/StorageCleaner/StorageCleanerConfirm';
import { useStorageCleaner } from './useStorageCleaner';
import StorageOptionsGrid from './StorageOptionsGrid';
import AutoRefreshToggle from './AutoRefreshToggle';
import ErrorDisplay from './ErrorDisplay';
import CleaningResult from './CleaningResult';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { showMessage } = useSnackbar();
  const { t } = useLazyTranslation('storageCleaner');
  const {
    error,
    isInitializing,
    options,
    sizes,
    autoRefresh,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    allSelected,
    someSelected,
    handleAutoRefreshChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  } = useStorageCleaner({ showMessage });

  const isDisabled = !(someSelected || allSelected) || loading;

  if (isInitializing) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div>
      <div className="p-2">
        <StorageOptionsGrid
          options={options}
          sizes={sizes}
          allSelected={allSelected}
          someSelected={someSelected}
          onOptionChange={handleOptionChange}
          onSelectAll={handleSelectAll}
        />

        <AutoRefreshToggle autoRefresh={autoRefresh} onChange={handleAutoRefreshChange} />

        <Button
          variant="default"
          onClick={() => setShowConfirm(true)}
          disabled={isDisabled}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {loading ? t('storageCleaner:cleaning') : t('storageCleaner:cleanNow')}
        </Button>

        <CleaningResult result={result} />
      </div>

      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />
    </div>
  );
}
