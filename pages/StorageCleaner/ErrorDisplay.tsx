import { Box, Container, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const { t } = useLazyTranslation('storageCleaner');
  return (
    <Container sx={storageCleanerPageStyles.ERROR_DISPLAY_CONTAINER}>
      <Box sx={{ width: '100%', maxWidth: 320 }}>
        <Box sx={storageCleanerPageStyles.ERROR_DISPLAY_BOX}>
          <WarningIcon sx={{ fontSize: 36, color: 'error.main', mb: 2 }} />
          <Typography
            variant="body1"
            color="error.main"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              lineHeight: 1.4,
              mb: 3,
            }}
          >
            {error}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {t('storageCleaner:errorStandardOnly')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
