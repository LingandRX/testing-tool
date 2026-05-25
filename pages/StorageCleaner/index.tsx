import { Loader2 } from 'lucide-react'; // 引入标准的高级阻尼 Spinner 图标
import { Button } from '@/components/ui/button';
import StorageCleanerConfirm from '@/pages/StorageCleaner/StorageCleanerConfirm';
import { useStorageCleaner } from './useStorageCleaner';
import StorageOptionsGrid from './StorageOptionsGrid';
import AutoRefreshToggle from './AutoRefreshToggle';
import ErrorDisplay from './ErrorDisplay';
import CleaningResult from './CleaningResult';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { t } = useLazyTranslation('storageCleaner');

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
          正在读取站点数据...
        </span>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="p-4 w-full flex flex-col space-y-3.5">
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
