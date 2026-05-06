import { Box, CircularProgress, Container } from '@mui/material';
import Button from '@/components/Button';
import { useSnackbar } from '@/components/GlobalSnackbar';
import StorageCleanerConfirm from '@/pages/StorageCleaner/StorageCleanerConfirm';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useStorageCleaner } from './useStorageCleaner';
import DomainHeader from './DomainHeader';
import StorageOptionsGrid from './StorageOptionsGrid';
import AutoRefreshToggle from './AutoRefreshToggle';
import ErrorDisplay from './ErrorDisplay';
import CleaningResult from './CleaningResult';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { showMessage } = useSnackbar();
  const { t } = useTranslation(['storageCleaner']);
  const {
    domain,
    error,
    isInitializing,
    options,
    sizes,
    autoRefresh,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    totalSize,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={24} color="warning" />
      </Box>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <Box>
      <Container sx={{ py: 2 }}>
        <DomainHeader domain={domain} totalSize={totalSize} />

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
          variant="contained"
          onClick={() => setShowConfirm(true)}
          sx={storageCleanerPageStyles.CONFIRM_DIALOG_CONFIRM}
          disabled={isDisabled}
          fullWidth
        >
          {loading ? t('storageCleaner:cleaning') : t('storageCleaner:cleanNow')}
        </Button>

        <CleaningResult result={result} />
      </Container>

      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />
    </Box>
  );
}
