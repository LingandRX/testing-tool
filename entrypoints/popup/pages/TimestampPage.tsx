import { useState, useEffect, useCallback } from 'react';
import dayjs from '@/utils/dayjs';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export default function TimestampPage() {
  const [now, setNow] = useState(() => Date.now());
  const [mode, setMode] = useState<'ts2dt' | 'dt2ts'>('ts2dt');
  const [tsInput, setTsInput] = useState(() => String(Date.now()));
  const [dtInput, setDtInput] = useState(() => dayjs().format('YYYY/MM/DD HH:mm:ss'));
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState<'ms' | 's'>('ms');
  const [zone, setZone] = useState<(typeof ZONES)[number]>('Asia/Shanghai');
  const [error, setError] = useState('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, msg: '已复制' });
    } catch {
      setSnack({ open: true, msg: '复制失败' });
    }
  }, []);

  const convertTs2Dt = useCallback(() => {
    if (!tsInput) {
      setError('请输入时间戳');
      return;
    }
    const num = Number(tsInput);
    if (isNaN(num)) {
      setError('无效数字');
      return;
    }
    const d = unit === 'ms' ? dayjs(num) : dayjs.unix(num);
    if (!d.isValid()) {
      setError('无效时间戳');
      return;
    }
    setError('');
    setResult(d.tz(zone).format('YYYY/MM/DD HH:mm:ss'));
  }, [tsInput, unit, zone]);

  const convertDt2Ts = useCallback(() => {
    if (!dtInput) {
      setError('请输入日期时间');
      return;
    }
    const d = dayjs.tz(dtInput, 'YYYY/MM/DD HH:mm:ss', zone);
    if (!d.isValid()) {
      setError('无效格式 (YYYY/MM/DD HH:mm:ss)');
      return;
    }
    setError('');
    const ms = d.valueOf();
    setResult(unit === 'ms' ? String(ms) : String(Math.floor(ms / 1000)));
  }, [dtInput, zone, unit]);

  return (
    <Paper sx={{ p: 2, m: 1, borderRadius: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="span" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
          {Math.floor(now / (unit === 'ms' ? 1 : 1000))}
        </Typography>
        <Typography variant="body1" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
          {unit === 'ms' ? '毫秒' : '秒'}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setUnit(unit === 'ms' ? 's' : 'ms')} sx={{ mr: 1 }}>
            切换单位
          </Button>
          <Button size="small" onClick={() => copy(String(Math.floor(now / (unit === 'ms' ? 1 : 1000))))}>
            复制
          </Button>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'center' }}>
        <Button
          variant={mode === 'ts2dt' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => {
            setMode('ts2dt');
            setError('');
            setResult('');
          }}
        >
          时间戳 → 日期
        </Button>
        <Button
          variant={mode === 'dt2ts' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => {
            setMode('dt2ts');
            setError('');
            setResult('');
          }}
        >
          日期 → 时间戳
        </Button>
      </Stack>

      <Stack spacing={2}>
        {mode === 'ts2dt' ? (
          <>
            <TextField
              label="时间戳"
              value={tsInput}
              onChange={(e) => {
                setTsInput(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>单位</InputLabel>
              <Select value={unit} label="单位" onChange={(e) => setUnit(e.target.value as 'ms' | 's')}>
                <MenuItem value="ms">毫秒</MenuItem>
                <MenuItem value="s">秒</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={convertTs2Dt} fullWidth>
              转换
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="日期时间"
              value={dtInput}
              onChange={(e) => {
                setDtInput(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error || '格式: YYYY/MM/DD HH:mm:ss'}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>单位</InputLabel>
              <Select value={unit} label="单位" onChange={(e) => setUnit(e.target.value as 'ms' | 's')}>
                <MenuItem value="ms">毫秒</MenuItem>
                <MenuItem value="s">秒</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={convertDt2Ts} fullWidth>
              转换
            </Button>
          </>
        )}

        <FormControl fullWidth size="small">
          <InputLabel>时区</InputLabel>
          <Select value={zone} label="时区" onChange={(e) => setZone(e.target.value as (typeof ZONES)[number])}>
            {ZONES.map((z) => (
              <MenuItem key={z} value={z}>
                {z}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="结果"
          value={result}
          fullWidth
          size="small"
          InputProps={{
            readOnly: true,
            endAdornment: result ? (
              <IconButton size="small" onClick={() => copy(result)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            ) : undefined,
          }}
        />
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={1500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
