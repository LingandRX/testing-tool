import React, { useMemo } from 'react';
import { Box, Fade, Stack, Typography } from '@mui/material';
import dayjs from '@/utils/dayjs';
import CopyButton from '@/components/CopyButton';
import type { UnitType } from '@/config/pageTheme';
import { DATE_FORMAT, timestampPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

interface ResultViewProps {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  /** 无结果时是否渲染占位（桌面端右栏使用），默认 false（移动端单栏隐藏） */
  showEmptyPlaceholder?: boolean;
}

const ResultView = React.memo(
  ({ result, mode, unit, zone, showEmptyPlaceholder = false }: ResultViewProps) => {
    const { t } = useTranslation(['timestamp']);

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

    if (!result) {
      if (!showEmptyPlaceholder) return null;
      return (
        <Box sx={timestampPageStyles.RESULT_EMPTY_PLACEHOLDER}>{t('timestamp:resultEmpty')}</Box>
      );
    }

    return (
      <Fade in={!!result}>
        <Box>
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

          <Stack spacing={1.2} sx={timestampPageStyles.RESULT_EXTRA_STACK}>
            {[
              { label: t('timestamp:relativeTime'), value: extraInfo?.relative },
              { label: t('timestamp:iso8601'), value: extraInfo?.iso },
              { label: t('timestamp:utcTime'), value: extraInfo?.utc },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="caption" sx={timestampPageStyles.RESULT_EXTRA_LABEL}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={timestampPageStyles.RESULT_EXTRA_VALUE}>
                    {item.value}
                  </Typography>
                  {item.value && (
                    <CopyButton
                      text={item.value}
                      tooltip={t('timestamp:copyTooltip')}
                      size="small"
                      color={timestampPageStyles.primaryColor}
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Fade>
    );
  },
);

ResultView.displayName = 'ResultView';

export default ResultView;
