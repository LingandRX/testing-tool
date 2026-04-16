import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import {
  TextField,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  IconButton,
  alpha,
  Tooltip,
  Theme,
  Container,
  Fade,
  Divider,
} from '@mui/material';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Button from '@/components/Button';

// ================= 常量配置 =================
const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';
const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

type UnitType = 'ms' | 's';
type ZoneType = (typeof ZONES)[number];

const INPUT_STYLE = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'background.paper',
    borderRadius: 3.5,
    border: '1px solid',
    borderColor: 'grey.100',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'grey.300', bgcolor: 'grey.50' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      borderColor: 'primary.main',
      boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-error': {
      borderColor: 'error.main',
      boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.error.main, 0.1)}`,
    },
  },
  '& .MuiInputBase-input': { 
    py: 1.4, 
    px: 2,
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    fontWeight: 600
  },
};

// ================= 子组件：实时时钟 (优化交互) =================
interface LiveClockProps {
  unit: UnitType;
  onCopy: (val: string) => void;
  onUseNow: (val: number) => void;
  onUnitChange: (u: UnitType) => void;
}

const LiveClock = React.memo(({ 
  unit, 
  onCopy, 
  onUseNow,
  onUnitChange
}: LiveClockProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayVal = useMemo(() => 
    String(Math.floor(now / (unit === 'ms' ? 1 : 1000))), 
  [now, unit]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      p: 1.8,
      mb: 2.5,
      bgcolor: alpha('#2196f3', 0.04),
      borderRadius: 4,
      border: '1px solid',
      borderColor: alpha('#2196f3', 0.1)
    }}>
      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1 }}>
          当前时间戳
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          {displayVal}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {/* 胶囊式单位切换器 */}
        <Box sx={{ 
          display: 'flex', 
          p: 0.4, 
          bgcolor: alpha('#2196f3', 0.08), 
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: alpha('#2196f3', 0.1)
        }}>
          {(['ms', 's'] as const).map((u) => (
            <Box
              key={u}
              onClick={() => onUnitChange(u)}
              sx={{ 
                px: 1.2, 
                py: 0.35, 
                borderRadius: 2, 
                cursor: 'pointer',
                fontSize: '0.65rem', 
                fontWeight: 900,
                transition: 'all 0.2s',
                bgcolor: unit === u ? '#fff' : 'transparent',
                color: unit === u ? 'primary.main' : alpha('#2196f3', 0.4),
                boxShadow: unit === u ? '0 2px 6px rgba(33, 150, 243, 0.2)' : 'none',
              }}
            >
              {u.toUpperCase()}
            </Box>
          ))}
        </Box>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1, borderColor: alpha('#2196f3', 0.1) }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="填充到下方">
            <IconButton 
              size="small" 
              onClick={() => onUseNow(now)} 
              sx={{ color: 'primary.main', bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
            >
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton 
            size="small" 
            onClick={() => onCopy(displayVal)} 
            sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
});

LiveClock.displayName = 'LiveClock';

// ================= 子组件：多维度结果展示 =================
interface ResultViewProps {
  result: string;
  mode: 'ts2dt' | 'dt2ts';
  unit: UnitType;
  zone: string;
  onCopy: (val: string) => void;
}

const ResultView = React.memo(({ 
  result, 
  mode, 
  unit, 
  zone, 
  onCopy 
}: ResultViewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [onCopy, result]);

  const extraInfo = useMemo(() => {
    if (!result) return null;
    const d = mode === 'ts2dt' ? dayjs(result, DATE_FORMAT).tz(zone) : (unit === 'ms' ? dayjs(Number(result)) : dayjs.unix(Number(result)));
    
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
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.2, display: 'block', fontWeight: 800, fontSize: '0.7rem' }}>
          转换结果
        </Typography>
        
        <Box sx={{ 
          bgcolor: alpha('#2196f3', 0.05),
          p: 2,
          borderRadius: 4,
          position: 'relative',
          mb: 2.5,
          border: '1px solid',
          borderColor: alpha('#2196f3', 0.1)
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'monospace', 
              fontWeight: 700, 
              color: 'primary.main',
              wordBreak: 'break-all',
              pr: 4,
              fontSize: '1rem'
            }}
          >
            {result}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleCopy}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: copied ? 'success.main' : 'primary.main',
              bgcolor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: copied ? 'success.main' : 'primary.main', color: '#fff' }
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        <Stack spacing={1.2}>
          {[
            { label: '相对时间', value: extraInfo?.relative },
            { label: 'ISO 8601', value: extraInfo?.iso },
            { label: 'UTC 时间', value: extraInfo?.utc },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}>{item.label}</Typography>
              <Typography 
                variant="caption" 
                onClick={() => { if (item.value) onCopy(item.value); }}
                sx={{ 
                  fontFamily: 'monospace', 
                  color: 'text.secondary', 
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Fade>
  );
});

ResultView.displayName = 'ResultView';

// ================= 主页面组件 =================
export default function TimestampPage() {
  const [mode, setMode] = useState<'ts2dt' | 'dt2ts'>('ts2dt');
  const [tsInput, setTsInput] = useState(() => String(Date.now()));
  const [dtInput, setDtInput] = useState(() => dayjs().format(DATE_FORMAT));
  const [unit, setUnit] = useState<UnitType>('ms');
  const [zone, setZone] = useState<ZoneType>('Asia/Shanghai');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('已复制', { severity: 'success' });
    } catch {
      showMessage('复制失败', { severity: 'error' });
    }
  }, [showMessage]);

  const convert = useCallback(() => {
    if (mode === 'ts2dt') {
      const rawInput = tsInput.trim();
      if (!rawInput) return;
      const num = Number(rawInput);
      if (isNaN(num)) { setError('无效数字'); return; }
      const d = unit === 'ms' ? dayjs(num) : dayjs.unix(num);
      if (!d.isValid()) { setError('无效时间戳'); return; }
      setError('');
      setResult(d.tz(zone).format(DATE_FORMAT));
    } else {
      const rawInput = dtInput.trim();
      if (!rawInput) return;
      const d = dayjs.tz(rawInput, DATE_FORMAT, zone);
      if (!d.isValid()) { setError('格式错误'); return; }
      setError('');
      const ms = d.valueOf();
      setResult(unit === 'ms' ? String(ms) : String(Math.floor(ms / 1000)));
    }
  }, [mode, tsInput, dtInput, unit, zone]);

  useEffect(() => {
    const timer = setTimeout(convert, 400);
    return () => clearTimeout(timer);
  }, [convert]);

  const handleUseNow = useCallback((now: number) => {
    if (mode === 'ts2dt') {
      setTsInput(String(unit === 'ms' ? now : Math.floor(now / 1000)));
    } else {
      setDtInput(dayjs(now).tz(zone).format(DATE_FORMAT));
    }
  }, [mode, unit, zone]);

  return (
    <Box sx={{ pb: 3 }}>
      <Container sx={{ py: 2 }}>
        {/* Header with Icon */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: alpha('#2196f3', 0.1), color: 'primary.main', display: 'flex' }}>
            <AccessTimeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              时间戳转换
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Unix 毫秒数转换与格式化
            </Typography>
          </Box>
        </Stack>

        {/* Live Clock Card */}
        <LiveClock unit={unit} onCopy={copy} onUseNow={handleUseNow} onUnitChange={setUnit} />

        {/* Mode Switcher */}
        <Box sx={{ 
          position: 'relative', 
          display: 'flex', 
          p: 0.6, 
          bgcolor: 'grey.100', 
          borderRadius: 4, 
          mb: 2.5,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box sx={{
            position: 'absolute', 
            height: 'calc(100% - 10px)', 
            width: 'calc(50% - 5px)',
            bgcolor: '#fff', 
            borderRadius: 3.5, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: mode === 'ts2dt' ? 'translateX(0)' : 'translateX(100%)',
            top: 5, left: 5,
          }} />
          {(['ts2dt', 'dt2ts'] as const).map((m) => (
            <Box
              key={m}
              onClick={() => { setMode(m); setError(''); setResult(''); }}
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
                transition: 'color 0.3s'
              }}
            >
              {m === 'ts2dt' ? '时间戳 → 日期' : '日期 → 时间戳'}
            </Box>
          ))}
        </Box>

        {/* Input Area */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder={mode === 'ts2dt' ? "输入时间戳..." : DATE_FORMAT}
            value={mode === 'ts2dt' ? tsInput : dtInput}
            onChange={(e) => {
              const val = e.target.value;
              if (mode === 'ts2dt') {
                setTsInput(val);
              } else {
                setDtInput(val);
              }
              setError('');
            }}
            error={!!error}
            helperText={error}
            fullWidth
            sx={INPUT_STYLE}
          />

          <Stack direction="row" spacing={1.5}>
            {/* 优化后的单位选择按钮组 */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              bgcolor: 'grey.50', 
              p: 0.5, 
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'grey.100'
            }}>
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
              fullWidth value={zone}
              onChange={(e) => setZone(e.target.value as ZoneType)}
              sx={{ ...INPUT_STYLE, flex: 1 }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' } } }}
            >
              {ZONES.map((z) => (
                <MenuItem key={z} value={z} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{z}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        {/* Main Action */}
        <Button
          fullWidth 
          variant="contained" 
          onClick={convert}
          sx={{
            py: 1.4,
            borderRadius: 4,
            bgcolor: 'primary.main',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark', boxShadow: `0 8px 24px ${alpha('#2196f3', 0.2)}` }
          }}
        >
          立即转换
        </Button>

        {/* Result View */}
        <ResultView result={result} mode={mode} unit={unit} zone={zone} onCopy={copy} />
      </Container>

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
}
