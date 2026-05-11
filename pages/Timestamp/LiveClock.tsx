import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CopyButton from '@/components/CopyButton';
import { useSnackbar } from '@/components/GlobalSnackbar';
import type { UnitType } from '@/config/pageTheme';
import { timestampPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface LiveClockProps {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

const LiveClock = React.memo(({ unit, onUseNow }: LiveClockProps) => {
  const [now, setNow] = useState(() => Date.now());
  const { t } = useTranslation(['timestamp']);
  const { showMessage } = useSnackbar();
  const onUseNowRef = useRef(onUseNow);

  useEffect(() => {
    onUseNowRef.current = onUseNow;
  }, [onUseNow]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayVal = useMemo(
    () => String(Math.floor(now / (unit === 'ms' ? 1 : 1000))),
    [now, unit],
  );

  const handleUseNow = useCallback(() => {
    onUseNowRef.current(now);
    showMessage(t('timestamp:usedSuccess'), { severity: 'success' });
  }, [now, showMessage, t]);

  return (
    <Box sx={timestampPageStyles.LIVE_CLOCK_CARD}>
      <Typography variant="caption" sx={timestampPageStyles.LIVE_CLOCK_LABEL}>
        {t('timestamp:currentTs')}
      </Typography>
      <Typography variant="subtitle2" sx={timestampPageStyles.LIVE_CLOCK_VALUE}>
        {displayVal}
      </Typography>
      <Tooltip title={t('timestamp:useNowTooltip')}>
        <IconButton
          size="small"
          onClick={handleUseNow}
          sx={timestampPageStyles.LIVE_CLOCK_ICON_BUTTON}
        >
          <AccessTimeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <CopyButton
        text={displayVal}
        tooltip={t('timestamp:copyTsTooltip')}
        size="small"
        color={timestampPageStyles.primaryColor}
      />
    </Box>
  );
});

LiveClock.displayName = 'LiveClock';

export default LiveClock;
