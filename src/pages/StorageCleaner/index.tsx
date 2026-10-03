import { Button } from '@/components/ui/button';
import PageSkeleton from '@/components/loading/PageSkeleton';
import StorageCleanerConfirm from './components/StorageCleanerConfirm';
import { useStorageCleaner } from './useStorageCleaner';
import StorageOptionsGrid from './components/StorageOptionsGrid';
import AutoRefreshToggle from './components/AutoRefreshToggle';
import ErrorDisplay from './components/ErrorDisplay';
import CleaningResult from './components/CleaningResult';

export default function Index() {
  const {
    error,
    isInitializing,
    options,
    sizes,
    reloadAfterClean,
    skipConfirm,
    loading,
    cleaningKey,
    isRefreshingSizes,
    result,
    showConfirm,
    setShowConfirm,
    totalBytes,
    hasDataCount,
    allSelected,
    someSelected,
    handleReloadAfterCleanChange,
    handleSkipConfirmChange,
    handleOptionChange,
    handleSelectAll,
    handleSelectOnlyWithData,
    handleClean,
    handleCleanSingle,
    triggerClean,
  } = useStorageCleaner();

  const isButtonDisabled = !(someSelected || allSelected) || loading || isRefreshingSizes;

  if (isInitializing) {
    return (
      <div
        data-testid="storage-cleaner-skeleton"
        aria-busy="true"
        aria-label="正在读取数据..."
        className="p-4 w-full select-none"
      >
        <PageSkeleton />
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
          totalBytes={totalBytes}
          hasDataCount={hasDataCount}
          allSelected={allSelected}
          someSelected={someSelected}
          cleaningKey={cleaningKey}
          loading={loading}
          onOptionChange={handleOptionChange}
          onSelectAll={handleSelectAll}
          onSelectOnlyWithData={handleSelectOnlyWithData}
          onCleanSingle={handleCleanSingle}
        />

        <AutoRefreshToggle
          reloadAfterClean={reloadAfterClean}
          skipConfirm={skipConfirm}
          onReloadChange={handleReloadAfterCleanChange}
          onSkipConfirmChange={handleSkipConfirmChange}
        />

        <div className="px-3.5 pb-3.5 pt-2">
          <Button
            variant="destructive"
            size="default"
            onClick={triggerClean}
            loading={loading && !cleaningKey}
            disabled={isButtonDisabled}
            className="w-full h-10 font-bold shadow-sm text-sm tracking-wide transition-all"
          >
            {loading && !cleaningKey ? '正在清理...' : '立即清理'}
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
