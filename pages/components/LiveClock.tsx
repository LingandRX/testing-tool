import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alpha, Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from '@/config/pageTheme';
import { timestampPageStyles } from '@/config/pageTheme';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

interface LiveClockProps {
  unit: UnitType;
  onUseNow: (val: number) => void;
  onUnitChange: (u: UnitType) => void;
  showMessage?: (message: string, options?: SnackbarOptions) => void;
}

const LiveClock = React.memo(({ unit, onUseNow, onUnitChange, showMessage }: LiveClockProps) => {
  const [now, setNow] = useState(() => Date.now());
  const onUseNowRef = useRef(onUseNow);
  const showMessageRef = useRef(showMessage);

  useEffect(() => {
    onUseNowRef.current = onUseNow;
    showMessageRef.current = showMessage;
  }, [onUseNow, showMessage]);

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
    showMessageRef.current?.('已使用当前时间戳', { severity: 'success' });
  }, [now, showMessageRef]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.8,
        mb: 2.5,
        bgcolor: alpha(timestampPageStyles.primaryColor, 0.04),
        borderRadius: 4,
        border: '1px solid',
        borderColor: alpha(timestampPageStyles.primaryColor, 0.1),
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: { xs: 100, sm: 120 } }}>
        <Typography
          variant="caption"
          sx={{
            color: timestampPageStyles.primaryColor,
            fontWeight: 800,
            fontSize: '0.6rem',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          当前时间戳
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: timestampPageStyles.primaryColor,
            fontFamily: 'monospace',
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          {displayVal}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
        {/* 胶囊式单位切换器 */}
        <Box
          sx={{
            display: 'flex',
            p: 0.4,
            bgcolor: alpha(timestampPageStyles.primaryColor, 0.08),
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: alpha(timestampPageStyles.primaryColor, 0.1),
          }}
        >
          {(['ms', 's'] as const).map((u) => (
            <Box
              key={u}
              onClick={() => onUnitChange(u)}
              sx={{
                px: { xs: 1, sm: 1.2 },
                py: 0.35,
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: 900,
                transition: 'all 0.2s',
                bgcolor: unit === u ? '#fff' : 'transparent',
                color: unit === u ? 'primary.main' : alpha(timestampPageStyles.primaryColor, 0.4),
                boxShadow: unit === u ? '0 2px 6px rgba(33, 150, 243, 0.2)' : 'none',
              }}
            >
              {u.toUpperCase()}
            </Box>
          ))}
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, my: 1, borderColor: alpha(timestampPageStyles.primaryColor, 0.1) }}
        />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="填充到下方">
            <IconButton
              size="small"
              onClick={handleUseNow}
              sx={{
                color: timestampPageStyles.primaryColor,
                bgcolor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: timestampPageStyles.primaryColor, color: '#fff' },
              }}
            >
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <CopyButton
            text={displayVal}
            tooltip="复制时间戳"
            size="small"
            color={timestampPageStyles.primaryColor}
            showMessage={showMessage}
          />
        </Stack>
      </Stack>
    </Box>
  );
});

LiveClock.displayName = 'LiveClock';

export default LiveClock;
