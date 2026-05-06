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

        {/* Live Clock Card */}
        <LiveClock unit={unit} onUseNow={handleUseNow} onUnitChange={setUnit} />

        {/* Mode Switcher */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && setMode(newMode)}
          sx={timestampPageStyles.MODE_SWITCHER}
        >
          <ToggleButton value="ts2dt">{t('timestamp:tsToDate')}</ToggleButton>
          <ToggleButton value="dt2ts">{t('timestamp:dateToTs')}</ToggleButton>
        </ToggleButtonGroup>

        {/* Input Area */}
        <Stack spacing={2} sx={{ mb: 3 }}>
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

          <Stack direction="row" spacing={1.5}>
            {/* 单位选择按钮组 */}
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
              sx={{ ...timestampPageStyles.INPUT_STYLE, flex: 1, borderRadius: 4 }}
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

        {/* Main Action */}
        <Button fullWidth variant="contained" onClick={convert}>
          {t('timestamp:convertButton')}
        </Button>

        {/* Result View */}
        <ResultView result={result} mode={mode} unit={unit} zone={zone} />
      </Container>
    </Box>
  );
}
