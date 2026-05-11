import {
  Box,
  Container,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
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
      <Container sx={{ p: 2 }}>
        {/* Header */}
        <PageHeader
          title={t('timestamp:pageTitle')}
          subtitle={t('timestamp:pageSubtitle')}
          icon={<AccessTimeIcon />}
        />

        {/* 参考信息：极简单行参考条 */}
        <LiveClock unit={unit} onUseNow={handleUseNow} />

        {/* 转换工作台：统一卡片 */}
        <Box sx={timestampPageStyles.CONVERSION_CARD}>
          {/* 模式切换（紧贴输入区上方） */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode) => newMode && setMode(newMode)}
            sx={timestampPageStyles.MODE_SWITCHER}
          >
            <ToggleButton value="ts2dt">{t('timestamp:tsToDate')}</ToggleButton>
            <ToggleButton value="dt2ts">{t('timestamp:dateToTs')}</ToggleButton>
          </ToggleButtonGroup>

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
              <Box sx={timestampPageStyles.UNIT_SWITCHER_CONTAINER}>
                {(['ms', 's'] as const).map((u) => (
                  <Box
                    key={u}
                    onClick={() => setUnit(u)}
                    sx={timestampPageStyles.UNIT_SWITCHER_ITEM(unit === u)}
                  >
                    {u === 'ms' ? t('timestamp:unitMs') : t('timestamp:unitS')}
                  </Box>
                ))}
              </Box>

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

          {/* 立即转换：缩小+居中融入卡片 */}
          <Button variant="contained" onClick={convert} sx={timestampPageStyles.CONVERT_BUTTON}>
            {t('timestamp:convertButton')}
          </Button>

          {/* 结果区：深色 tint 高亮 */}
          <ResultView result={result} mode={mode} unit={unit} zone={zone} />
        </Box>
      </Container>
    </Box>
  );
}
