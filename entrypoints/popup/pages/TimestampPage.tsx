import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from '@/utils/dayjs';
import {
  TextField,
  Select,
  MenuItem,
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  alpha,
  Tooltip,
  Theme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; 
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
    bgcolor: 'grey.50',
    borderRadius: 3,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': { border: 'none' },
    '&:hover': { bgcolor: 'grey.100' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      boxShadow: (theme: Theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 12px rgba(0,0,0,0.03)`,
    },
    '&.Mui-error': {
      boxShadow: (theme: Theme) => `0 0 0 2px ${alpha(theme.palette.error.main, 0.2)}`,
    },
  },
  '& .MuiInputBase-input': { py: 1.5, fontFamily: 'monospace' },
};

// ================= 子组件：实时时钟 =================
interface LiveClockProps {
  unit: UnitType;
  onCopy: (val: string) => void;
  onUseNow: (val: number) => void;
}

const LiveClock = React.memo(({ 
  unit, 
  onCopy, 
  onUseNow 
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography variant="h5" sx={{ fontWeight: 300, letterSpacing: '-1px', color: 'text.primary', fontFamily: 'monospace' }}>
          {displayVal}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
          {unit}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="填充到下方">
          <IconButton 
            aria-label="use current time"
            size="small" 
            onClick={() => onUseNow(now)} 
            sx={{ color: 'primary.main', transition: 'all 0.2s', '&:hover': { bgcolor: alpha('#2563eb', 0.08) } }}
          >
            <AccessTimeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="复制当前时间戳">
          <IconButton 
            aria-label="copy current timestamp"
            size="small" 
            onClick={() => onCopy(displayVal)} 
            sx={{ color: 'grey.400', transition: 'all 0.2s', '&:hover': { color: 'primary.main', transform: 'scale(1.1)' } }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
    <Box sx={{ 
      mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.50',
      animation: 'fadeIn 0.3s ease-out',
      '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
    }}>
      <Typography variant="caption" sx={{ color: 'text.disabled', mb: 1, display: 'block', ml: 1, fontWeight: 500 }}>
        转换结果
      </Typography>
      <TextField
        fullWidth
        value={result}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  aria-label="copy result"
                  size="small" 
                  onClick={handleCopy} 
                  sx={{ 
                    color: copied ? 'success.main' : 'primary.main',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: copied ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          ...INPUT_STYLE,
          mb: 2,
          '& .MuiOutlinedInput-root': {
            ...INPUT_STYLE['& .MuiOutlinedInput-root'],
            bgcolor: alpha('#2563eb', 0.03),
          },
        }}
      />
      
      {/* 辅助信息预览 */}
      <Stack spacing={1} sx={{ px: 1 }}>
        {[
          { label: '相对时间', value: extraInfo?.relative },
          { label: 'ISO 8601', value: extraInfo?.iso },
          { label: 'UTC 时间', value: extraInfo?.utc },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.label}</Typography>
            <Typography 
              variant="caption" 
              onClick={() => { if (item.value) onCopy(item.value); }}
              sx={{ 
                fontFamily: 'monospace', 
                color: 'text.primary', 
                cursor: 'pointer',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' }
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
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
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, msg: '已复制' });
    } catch {
      setSnack({ open: true, msg: '复制失败' });
    }
  }, []);

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

  // 智能实时转换 (Debounce Effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      convert();
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [convert]);

  const handleUseNow = useCallback((now: number) => {
    if (mode === 'ts2dt') {
      setTsInput(String(unit === 'ms' ? now : Math.floor(now / 1000)));
    } else {
      setDtInput(dayjs(now).tz(zone).format(DATE_FORMAT));
    }
  }, [mode, unit, zone]);

  return (
    <Box sx={{ p: 1, width: '100%', bgcolor: 'transparent', boxSizing: 'border-box' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'grey.100',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.06)', borderColor: 'grey.200' },
        }}
      >
        {/* 1. 实时时钟 */}
        <Box sx={{ position: 'relative' }}>
          <LiveClock unit={unit} onCopy={copy} onUseNow={handleUseNow} />
          <Tooltip title="切换单位">
            <IconButton 
              aria-label="switch unit"
              size="small" 
              onClick={() => { setUnit((u) => (u === 'ms' ? 's' : 'ms')); }} 
              sx={{ 
                position: 'absolute', right: 80, top: 4, color: 'grey.400',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'rotate(180deg)', color: 'primary.main' }
              }}
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 2. 模式切换 */}
        <Box sx={{ position: 'relative', display: 'flex', p: 0.5, bgcolor: 'grey.100', borderRadius: 3.5, mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute', height: 'calc(100% - 8px)', width: 'calc(50% - 4px)',
              bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: mode === 'ts2dt' ? 'translateX(0)' : 'translateX(100%)',
              top: 4, left: 4,
            }}
          />
          {(['ts2dt', 'dt2ts'] as const).map((m) => (
            <Button
              key={m} fullWidth disableRipple
              onClick={() => { setMode(m); setError(''); setResult(''); }}
            >
              {m === 'ts2dt' ? '时间戳 → 日期' : '日期 → 时间戳'}
            </Button>
          ))}
        </Box>

        {/* 3. 输入与设置 */}
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

          <Stack direction="row" spacing={2}>
            <Select
              fullWidth value={unit}
              onChange={(e) => { setUnit(e.target.value as UnitType); }}
              sx={{ ...INPUT_STYLE, flex: 1 }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' } } }}
            >
              <MenuItem value="ms">毫秒 (ms)</MenuItem>
              <MenuItem value="s">秒 (s)</MenuItem>
            </Select>

            <Select
              fullWidth value={zone}
              onChange={(e) => { setZone(e.target.value as ZoneType); }}
              sx={{ ...INPUT_STYLE, flex: 1.5 }}
              MenuProps={{ PaperProps: { sx: { borderRadius: 3, mt: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' } } }}
            >
              {ZONES.map((z) => (
                <MenuItem key={z} value={z}>{z}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        {/* 4. 转换操作 (作为手动确认) */}
        <Button
          fullWidth variant="contained" disableElevation disableRipple
          onClick={convert}
        >
          立即转换
        </Button>

        {/* 5. 结果展示 */}
        <ResultView result={result} mode={mode} unit={unit} zone={zone} onCopy={copy} />
      </Paper>

      <Snackbar 
        open={snack.open} autoHideDuration={1500} 
        onClose={() => { setSnack((s) => ({ ...s, open: false })); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" icon={false} sx={{ borderRadius: 2.5, bgcolor: 'grey.900' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
