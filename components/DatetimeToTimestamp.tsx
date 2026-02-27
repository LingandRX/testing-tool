import { useState, useCallback } from 'react';
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
  Box,
  SelectChangeEvent,
} from '@mui/material';

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

export function DatetimeToTimestamp() {
  const [dateValue, setDateValue] = useState(() => dayjs().format('YYYY/MM/DD HH:mm:ss'));
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState('milliseconds');
  const [error, setError] = useState('');

  const performConversion = useCallback(
    (currentDate: string, zone: string, currentUnit: string) => {
      if (!currentDate) {
        setError('请输入有效的日期时间');
        return '';
      }
      const timestamp = dayjs.tz(currentDate, zone);
      if (!timestamp.isValid()) {
        setError('无效的日期时间格式');
        return '';
      }
      setError('');
      const ms = timestamp.valueOf();
      return currentUnit === 'milliseconds' ? ms.toString() : Math.floor(ms / 1000).toString();
    },
    [],
  );

  const handleConvert = useCallback(() => {
    const newResult = performConversion(dateValue, selectedZone, unit);
    setResult(newResult);
  }, [dateValue, selectedZone, unit, performConversion]);

  const handleUnitChange = useCallback(
    (e: SelectChangeEvent) => {
      const newUnit = e.target.value;
      setUnit(newUnit);
      if (result) {
        setResult(performConversion(dateValue, selectedZone, newUnit) || '');
      }
    },
    [dateValue, selectedZone, result, performConversion],
  );

  const handleZoneChange = useCallback((e: SelectChangeEvent) => {
    setSelectedZone(e.target.value);
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2, borderRadius: 2 }}>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="输入日期时间"
            value={dateValue}
            onChange={(e) => {
              setDateValue(e.target.value);
              if (error) setError('');
            }}
            error={!!error}
            helperText={error || '格式: YYYY/MM/DD HH:mm:ss'}
            fullWidth
            variant="outlined"
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

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" size="medium" color="primary" onClick={handleConvert}>
            转换
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="转换结果"
            value={result}
            fullWidth
            variant="outlined"
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
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
      </Stack>
    </Paper>
  );
}
