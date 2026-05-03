import { useState, useEffect, useCallback } from 'react';
import dayjs from '@/utils/dayjs';
import { DATE_FORMAT } from '@/config/pageTheme';
import type { UnitType, ZoneType } from '@/config/pageTheme';

export interface UseTimestampConverterReturn {
  // State
  mode: 'ts2dt' | 'dt2ts';
  tsInput: string;
  dtInput: string;
  unit: UnitType;
  zone: ZoneType;
  result: string;
  error: string;

  // Actions
  setMode: (mode: 'ts2dt' | 'dt2ts') => void;
  setTsInput: (value: string) => void;
  setDtInput: (value: string) => void;
  setUnit: (unit: UnitType) => void;
  setZone: (zone: ZoneType) => void;
  handleUseNow: (now: number) => void;
  convert: () => void;
}

export function useTimestampConverter(): UseTimestampConverterReturn {
  const [mode, setMode] = useState<'ts2dt' | 'dt2ts'>('ts2dt');
  const [tsInput, setTsInput] = useState(() => String(Date.now()));
  const [dtInput, setDtInput] = useState(() => dayjs().format(DATE_FORMAT));
  const [unit, setUnit] = useState<UnitType>('ms');
  const [zone, setZone] = useState<ZoneType>('Asia/Shanghai');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const convert = useCallback(() => {
    if (mode === 'ts2dt') {
      const rawInput = tsInput.trim();
      if (!rawInput) return;
      const num = Number(rawInput);
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
      setResult(d.tz(zone).format(DATE_FORMAT));
    } else {
      const rawInput = dtInput.trim();
      if (!rawInput) return;
      const d = dayjs.tz(rawInput, DATE_FORMAT, zone);
      if (!d.isValid()) {
        setError('格式错误');
        return;
      }
      setError('');
      const ms = d.valueOf();
      setResult(unit === 'ms' ? String(ms) : String(Math.floor(ms / 1000)));
    }
  }, [mode, tsInput, dtInput, unit, zone]);

  useEffect(() => {
    const timer = setTimeout(convert, 400);
    return () => clearTimeout(timer);
  }, [convert]);

  const handleUseNow = useCallback(
    (now: number) => {
      if (mode === 'ts2dt') {
        setTsInput(String(unit === 'ms' ? now : Math.floor(now / 1000)));
      } else {
        setDtInput(dayjs(now).tz(zone).format(DATE_FORMAT));
      }
    },
    [mode, unit, zone],
  );

  const handleSetMode = useCallback((newMode: 'ts2dt' | 'dt2ts') => {
    setMode(newMode);
    setError('');
    setResult('');
  }, []);

  const handleSetTsInput = useCallback((value: string) => {
    setTsInput(value);
    setError('');
  }, []);

  const handleSetDtInput = useCallback((value: string) => {
    setDtInput(value);
    setError('');
  }, []);

  return {
    mode,
    tsInput,
    dtInput,
    unit,
    zone,
    result,
    error,
    setMode: handleSetMode,
    setTsInput: handleSetTsInput,
    setDtInput: handleSetDtInput,
    setUnit,
    setZone,
    handleUseNow,
    convert,
  };
}
