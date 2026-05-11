import React from 'react';
import { Box, Fade, Typography } from '@mui/material';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from '@/config/pageTheme';
import { timestampPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface ResultViewProps {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
}

const ResultView = React.memo(({ result }: ResultViewProps) => {
  const { t } = useTranslation(['timestamp']);

  if (!result) return null;

  return (
    <Fade in={!!result}>
      <Box sx={{ mt: 2.5 }}>
        <Typography variant="caption" sx={timestampPageStyles.RESULT_LABEL}>
          {t('timestamp:resultLabel')}
        </Typography>

        <Box sx={timestampPageStyles.RESULT_MAIN_BOX}>
          <Typography variant="body1" sx={timestampPageStyles.RESULT_MAIN_TEXT}>
            {result}
          </Typography>
          <CopyButton
            text={result}
            tooltip={t('timestamp:copyResultTooltip')}
            size="small"
            color={timestampPageStyles.primaryColor}
          />
        </Box>
      </Box>
    </Fade>
  );
});

ResultView.displayName = 'ResultView';

export default ResultView;
