import { Box, Container, CircularProgress } from '@mui/material';
import Button from '@/components/Button';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import StorageCleanerConfirm from '@/components/StorageCleanerConfirm';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useStorageCleaner } from './useStorageCleaner';
import DomainHeader from './components/DomainHeader';
import StorageOptionsGrid from './components/StorageOptionsGrid';
import AutoRefreshToggle from './components/AutoRefreshToggle';
import ErrorDisplay from './components/ErrorDisplay';
import CleaningResult from './components/CleaningResult';

export default function StorageCleanerPage() {
  const { snackbarProps, showMessage } = useSnackbar();
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
            py: 1.3,
            borderRadius: 4,
            bgcolor: storageCleanerPageStyles.warningColor,
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: storageCleanerPageStyles.warningDark,
              boxShadow: '0 8px 20px rgba(255, 152, 0, 0.35)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
          disabled={loading}
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
      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
