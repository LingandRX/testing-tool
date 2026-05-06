import { Alert, Box } from '@mui/material';
import type { CleaningResult } from '@/types/storage';
import { formatCleaningResult } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface CleaningResultProps {
  result: CleaningResult | null;
}

export default function CleaningResult({ result }: CleaningResultProps) {
  const { t } = useTranslation(['storageCleaner']);
  if (!result) return null;

  return (
    <Box sx={{ mt: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
      <Alert
        severity={result.success ? 'success' : 'error'}
        sx={storageCleanerPageStyles.CLEANING_RESULT_ALERT}
      >
        {result.success
          ? formatCleaningResult(result, t)
          : result.error || t('storageCleaner:partialFailure')}
      </Alert>
    </Box>
  );
}
