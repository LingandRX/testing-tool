import { Alert, Box } from '@mui/material';
import type { CleaningResult } from '@/types/storage';
import { formatCleaningResult } from '@/utils/storageCleaner';
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
        sx={{
          borderRadius: 3,
          py: 1,
          px: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '& .MuiAlert-message': {
            fontSize: '0.8rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          '& .MuiAlert-icon': {
            fontSize: '1.2rem',
            mr: 1,
          },
        }}
      >
        {result.success
          ? formatCleaningResult(result, t as unknown as (key: string, options?: unknown) => string)
          : result.error || t('storageCleaner:partialFailure')}
      </Alert>
    </Box>
  );
}
