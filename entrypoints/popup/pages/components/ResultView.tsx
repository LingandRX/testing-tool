import React, { useMemo } from 'react';
import { Typography, Box, Fade, Stack, alpha } from '@mui/material';
import dayjs from '@/utils/dayjs';
import CopyButton from '@/components/CopyButton';
import { DATE_FORMAT, timestampPageStyles } from '@/config/pageTheme';
import type { UnitType } from '@/config/pageTheme';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

interface ResultViewProps {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  showMessage?: (message: string, options?: SnackbarOptions) => void;
}

const ResultView = React.memo(({ result, mode, unit, zone, showMessage }: ResultViewProps) => {
  const extraInfo = useMemo(() => {
    if (!result) return null;
    const d =
      mode === 'ts2dt'
        ? dayjs(result, DATE_FORMAT).tz(zone)
        : unit === 'ms'
          ? dayjs(Number(result))
          : dayjs.unix(Number(result));

    return {
      relative: d.fromNow(),
      iso: d.toISOString(),
      utc: d.utc().format(DATE_FORMAT) + ' UTC',
    };
  }, [result, mode, zone, unit]);

  if (!result) return null;

  return (
    <Fade in={!!result}>
      <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'grey.50' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mb: 1.2,
            display: 'block',
            fontWeight: 800,
            fontSize: '0.7rem',
          }}
        >
          转换结果
        </Typography>

        <Box
          sx={{
            bgcolor: alpha(timestampPageStyles.primaryColor, 0.05),
            p: 2,
            borderRadius: 4,
            position: 'relative',
            mb: 2.5,
            border: '1px solid',
            borderColor: alpha(timestampPageStyles.primaryColor, 0.1),
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              color: timestampPageStyles.primaryColor,
              wordBreak: 'break-all',
              pr: 4,
              fontSize: '1rem',
            }}
          >
            {result}
          </Typography>
          <CopyButton
            text={result}
            tooltip="复制结果"
            size="small"
            color={timestampPageStyles.primaryColor}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            showMessage={showMessage}
          />
        </Box>

        <Stack
          spacing={1.2}
          sx={{
            bgcolor: alpha(timestampPageStyles.primaryColor, 0.05),
            p: 2,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(timestampPageStyles.primaryColor, 0.1),
            mt: 2,
          }}
        >
          {[
            { label: '相对时间', value: extraInfo?.relative },
            { label: 'ISO 8601', value: extraInfo?.iso },
            { label: 'UTC 时间', value: extraInfo?.utc },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}
              >
                {item.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: timestampPageStyles.primaryColor,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                  }}
                >
                  {item.value}
                </Typography>
                {item.value && (
                  <CopyButton
                    text={item.value}
                    tooltip="复制"
                    size="small"
                    color={timestampPageStyles.primaryColor}
                    showMessage={showMessage}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Fade>
  );
});

ResultView.displayName = 'ResultView';

export default ResultView;
