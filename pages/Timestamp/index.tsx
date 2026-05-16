import { Box, Container, MenuItem, Select, Stack, TextField } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { timestampPageStyles, ZONES } from '@/config/pageTheme';
import LiveClock from './LiveClock';
import ResultView from './ResultView';
import { useTimestampConverter } from './useTimestampConverter';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation(['timestamp']);
  const {
    mode,
    tsInput,
    dtInput,
    unit,
    zone,
    result,
    error,
    setMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
    convert,
  } = useTimestampConverter();

  return (
    <Box>
      <Container maxWidth="lg" sx={{ p: 2 }}>
        {/* Header */}
        <PageHeader
          title={t('timestamp:pageTitle')}
          subtitle={t('timestamp:pageSubtitle')}
          icon={<AccessTimeIcon />}
        />

        {/* 参考信息：分栏上方全宽单行参考条 */}
        <LiveClock unit={unit} onUseNow={handleUseNow} />

        {/* 桌面端 md+ 左右分栏；移动端单栏堆叠 */}
        <Box sx={timestampPageStyles.LAYOUT_GRID}>
          {/* 左栏：转换工作台 */}
          <Box sx={timestampPageStyles.CONVERSION_CARD}>
            {/* 模式切换 */}
            <SwitchButtonGroup
              value={mode}
              options={[
                { value: 'ts2dt', label: t('timestamp:tsToDate') },
                { value: 'dt2ts', label: t('timestamp:dateToTs') },
              ]}
              onChange={(newMode) => setMode(newMode)}
            />

            {/* 输入区 */}
            <Stack spacing={1.5}>
              <TextField
                placeholder={
                  mode === 'ts2dt' ? t('timestamp:placeholderTs') : t('timestamp:placeholderDate')
                }
                value={mode === 'ts2dt' ? tsInput : dtInput}
                onChange={(e) => setInput(e.target.value)}
                error={!!error}
                helperText={error}
                fullWidth
                sx={timestampPageStyles.INPUT_STYLE}
              />

              {/* 单位+时区紧凑横排 */}
              <Stack direction="row" spacing={1.5}>
                <SwitchButtonGroup
                  value={unit}
                  options={[
                    { value: 'ms', label: t('timestamp:unitMs') },
                    { value: 's', label: t('timestamp:unitS') },
                  ]}
                  onChange={(v) => setUnit(v as 'ms' | 's')}
                  sx={{
                    width: 200,
                  }}
                />

                <Select
                  fullWidth
                  value={zone}
                  onChange={(e) => setZone(e.target.value as typeof zone)}
                  sx={{
                    ...timestampPageStyles.INPUT_STYLE,
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 4,
                    '& .MuiSelect-select': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                  MenuProps={timestampPageStyles.SELECT_MENU_PROPS}
                >
                  {ZONES.map((z) => (
                    <MenuItem key={z} value={z} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {z}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {/* 立即转换 */}
            <Button variant="contained" onClick={convert} sx={timestampPageStyles.CONVERT_BUTTON}>
              {t('timestamp:convertButton')}
            </Button>
          </Box>

          {/* 右栏：结果展示卡片 */}
          <Box sx={timestampPageStyles.RESULT_COLUMN_CARD}>
            <ResultView result={result} mode={mode} unit={unit} zone={zone} showEmptyPlaceholder />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
