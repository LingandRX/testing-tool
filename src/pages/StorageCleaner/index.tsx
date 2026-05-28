import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorageCleanerConfirm from './StorageCleanerConfirm';
import { useStorageCleaner } from './useStorageCleaner';
import StorageOptionsGrid from './StorageOptionsGrid';
import AutoRefreshToggle from './AutoRefreshToggle';
import ErrorDisplay from './ErrorDisplay';
import CleaningResult from './CleaningResult';
import { useI18n } from '@/utils/chromeI18n';

export default function Index() {
  const { t } = useI18n('storageCleaner');

  const {
    error,
    isInitializing,
    options,
    sizes,
    reloadAfterClean,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    allSelected,
    someSelected,
    handleReloadAfterCleanChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  } = useStorageCleaner();

  const isButtonDisabled = !(someSelected || allSelected) || loading;

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full">
        <Loader2 className="h-6 w-6 text-muted-foreground/80" />
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          {t('storageCleaner:initializing')}
        </span>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      {/* 操作区域卡片 */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <StorageOptionsGrid
          options={options}
          sizes={sizes}
          allSelected={allSelected}
          someSelected={someSelected}
          onOptionChange={handleOptionChange}
          onSelectAll={handleSelectAll}
        />

        <AutoRefreshToggle
          reloadAfterClean={reloadAfterClean}
          onChange={handleReloadAfterCleanChange}
        />

        <div className="px-3.5 pb-3.5 pt-1">
          <Button
            variant="destructive"
            size="default"
            onClick={() => setShowConfirm(true)}
            disabled={isButtonDisabled}
            className="w-full h-10 font-bold shadow-sm text-sm tracking-wide"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('storageCleaner:cleaning')}
              </>
            ) : (
              t('storageCleaner:cleanNow')
            )}
          </Button>
        </div>
      </div>

      <CleaningResult result={result} />

      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />
    </div>
  );
}
