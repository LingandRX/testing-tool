import { Box, IconButton, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';
import { jsonDiffPageStyles } from '@/config/pageTheme';

interface DiffNavigatorProps {
  total: number;
  /** 0-based index */
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DiffNavigator({ total, currentIndex, onPrev, onNext }: DiffNavigatorProps) {
  const { t } = useTranslation(['jsonDiff']);

  if (total === 0) {
    return (
      <Box sx={jsonDiffPageStyles.NAVIGATOR}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {t('jsonDiff:noDiffs')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={jsonDiffPageStyles.NAVIGATOR}>
      <IconButton size="small" aria-label={t('jsonDiff:previousDiff')} onClick={onPrev}>
        <NavigateBeforeIcon />
      </IconButton>
      <Typography
        variant="body2"
        sx={{ fontWeight: 800, fontFamily: 'monospace', minWidth: 60, textAlign: 'center' }}
      >
        {currentIndex + 1} / {total}
      </Typography>
      <IconButton size="small" aria-label={t('jsonDiff:nextDiff')} onClick={onNext}>
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
}

export type { DiffNavigatorProps };
