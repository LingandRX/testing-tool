import { Box, Container, CircularProgress } from '@mui/material';
import Button from '@/components/Button';
import { useSnackbar as useGlobalSnackbar } from '@/components/GlobalSnackbar';
import StorageCleanerConfirm from '@/components/StorageCleanerConfirm';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useStorageCleaner } from './useStorageCleaner';
import DomainHeader from './components/DomainHeader';
import StorageOptionsGrid from './components/StorageOptionsGrid';
import AutoRefreshToggle from './components/AutoRefreshToggle';
import ErrorDisplay from './components/ErrorDisplay';
import CleaningResult from './components/CleaningResult';

export default function StorageCleanerPage() {
  const { showMessage } = useGlobalSnackbar();
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

  const isDisabled = (!someSelected && !allSelected) || loading;

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
          sx={{
            bgcolor: storageCleanerPageStyles.warningColor,
            '&:hover': {
              bgcolor: storageCleanerPageStyles.warningDark,
            },
          }}
          disabled={isDisabled}
          fullWidth
        >
          {loading ? '正在清理...' : '立即清理'}
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
