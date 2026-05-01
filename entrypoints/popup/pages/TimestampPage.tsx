import { TextField, Select, MenuItem, Stack, Box, Container } from '@mui/material';
import { useSnackbar as useGlobalSnackbar } from '@/components/SnackbarProvider';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import { ZONES, timestampPageStyles } from '@/config/pageTheme';
import LiveClock from './components/LiveClock';
import ResultView from './components/ResultView';
import { useTimestampConverter } from './hooks/useTimestampConverter';

export default function TimestampPage() {
  const { showMessage } = useGlobalSnackbar({ autoHideDuration: 1500 });
  const {
    mode,
    tsInput,
    dtInput,
    unit,
    zone,
    result,
    error,
    setMode,
    setTsInput,
    setDtInput,
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
          title="时间戳转换"
          subtitle="Unix 毫秒数转换与格式化"
          icon={<AccessTimeIcon />}
        />

        {/* Live Clock Card */}
        <LiveClock
          unit={unit}
          onUseNow={handleUseNow}
          onUnitChange={setUnit}
          showMessage={showMessage}
        />

        {/* Mode Switcher */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            p: 0.6,
            bgcolor: 'grey.100',
            borderRadius: 4,
            mb: 2.5,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              height: 'calc(100% - 10px)',
              width: 'calc(50% - 5px)',
              bgcolor: '#fff',
              borderRadius: 3.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: mode === 'ts2dt' ? 'translateX(0)' : 'translateX(100%)',
              top: 5,
              left: 5,
            }}
          />
          {(['ts2dt', 'dt2ts'] as const).map((m) => (
            <Box
              key={m}
              onClick={() => setMode(m)}
              sx={{
                flex: 1,
                py: 1,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: mode === m ? 'primary.main' : 'text.secondary',
                transition: 'color 0.3s',
              }}
            >
              {m === 'ts2dt' ? '时间戳 → 日期' : '日期 → 时间戳'}
            </Box>
          ))}
        </Box>

        {/* Input Area */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder={mode === 'ts2dt' ? '输入时间戳...' : 'YYYY-MM-DD HH:mm:ss'}
            value={mode === 'ts2dt' ? tsInput : dtInput}
            onChange={(e) => {
              const val = e.target.value;
              if (mode === 'ts2dt') {
                setTsInput(val);
              } else {
                setDtInput(val);
              }
            }}
            error={!!error}
            helperText={error}
            fullWidth
            sx={timestampPageStyles.INPUT_STYLE}
          />

          <Stack direction="row" spacing={1.5}>
            {/* 优化后的单位选择按钮组 */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                bgcolor: 'grey.50',
                p: 0.5,
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'grey.100',
              }}
            >
              {(['ms', 's'] as const).map((u) => (
                <Box
                  key={u}
                  onClick={() => setUnit(u)}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    textAlign: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    transition: 'all 0.2s',
                    bgcolor: unit === u ? '#fff' : 'transparent',
                    color: unit === u ? 'primary.main' : 'text.disabled',
                    boxShadow: unit === u ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {u === 'ms' ? '毫秒 (ms)' : '秒 (s)'}
                </Box>
              ))}
            </Box>

            <Select
              fullWidth
              value={zone}
              onChange={(e) => setZone(e.target.value as typeof zone)}
              sx={{ ...timestampPageStyles.INPUT_STYLE, flex: 1, borderRadius: 4 }}
              MenuProps={{
                PaperProps: {
                  sx: { borderRadius: 3, mt: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' },
                },
              }}
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
          立即转换
        </Button>

        {/* Result View */}
        <ResultView result={result} mode={mode} unit={unit} zone={zone} showMessage={showMessage} />
      </Container>
    </Box>
  );
}
