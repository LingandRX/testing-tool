import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_ZONE_LIST = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const TIMESTAMP_UNITS = [
  { value: 'milliseconds', label: '毫秒 (ms)' },
  { value: 'seconds', label: '秒 (s)' },
];

export function TimestampToDatetime() {
  const [timestampValue, setTimestampValue] = useState(() => dayjs().valueOf().toString());
  const [timestampResult, setTimestampResult] = useState('');
  const [unit, setUnit] = useState('milliseconds');
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');
  const [error, setError] = useState('');

  const performConversion = useCallback((val: string, zone: string, u: string) => {
    if (!val || val.trim() === '') {
      setError('请输入有效的时间戳');
      return '';
    }
    const numberValue = Number(val);
    if (isNaN(numberValue)) {
      setError('时间戳必须是数字');
      return '';
    }
    const d = u === 'milliseconds' ? dayjs(numberValue) : dayjs.unix(numberValue);
    if (!d.isValid()) {
      setError('无效的时间戳格式');
      return '';
    }
    setError('');
    return d.tz(zone).format('YYYY/MM/DD HH:mm:ss');
  }, []);

  const handleConvert = useCallback(() => {
    const newResult = performConversion(timestampValue, selectedZone, unit);
    setTimestampResult(newResult);
  }, [timestampValue, selectedZone, unit, performConversion]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimestampValue(e.target.value);
      if (error) setError('');
    },
    [error],
  );

  const handleZoneChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const newZone = e.target.value;
      setSelectedZone(newZone);
      if (timestampResult) {
        const newResult = performConversion(timestampValue, newZone, unit);
        setTimestampResult(newResult || '');
      }
    },
    [performConversion, timestampResult, timestampValue, unit],
  );

  const handleUnitChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const newUnit = e.target.value;
      setUnit(newUnit);
      if (timestampResult) {
        const newResult = performConversion(timestampValue, selectedZone, newUnit);
        setTimestampResult(newResult || '');
      }
    },
    [performConversion, timestampResult, timestampValue, selectedZone],
  );

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2, borderRadius: 2 }}>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="输入时间戳"
            placeholder="如: 1704067200000"
            value={timestampValue}
            onChange={handleInputChange}
            error={!!error}
            helperText={error}
            fullWidth
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel>单位</InputLabel>
            <Select
              value={unit}
              label="单位"
              onChange={handleUnitChange}
              MenuProps={{ disableScrollLock: true }}
            >
              {TIMESTAMP_UNITS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" size="medium" color="primary" onClick={handleConvert}>
            转换
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="转换结果"
            value={timestampResult}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
          <FormControl fullWidth>
            <InputLabel>时区</InputLabel>
            <Select
              value={selectedZone}
              label="时区"
              onChange={handleZoneChange}
              MenuProps={{ disableScrollLock: true }}
            >
              {TIME_ZONE_LIST.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Paper>
  );
}
