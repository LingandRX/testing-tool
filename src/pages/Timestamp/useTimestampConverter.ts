import { useMemo, useState } from 'react';
import dayjs from '@/utils/dayjs';
import type { UnitType, ZoneType, ModeType } from './constants';
import { DATE_FORMAT, msToUnit, dayjsFromTimestamp } from './constants';
import { useContextMenuData } from '@/utils/useContextMenuData';

export interface UseTimestampConverterReturn {
  mode: ModeType;
  input: string;
  unit: UnitType;
  zone: ZoneType;
  result: string;
  error: string;

  setMode: (mode: ModeType) => void;
  setInput: (value: string) => void;
  setUnit: (unit: UnitType) => void;
  setZone: (zone: ZoneType) => void;
  handleUseNow: (now: number) => void;
}

const TIMESTAMP_REGEX = /^\d+$/;
const MS_TIMESTAMP_MIN_LENGTH = 13;

function isTimestampLike(input: string): boolean {
  const trimmed = input.trim();
  return TIMESTAMP_REGEX.test(trimmed) && trimmed.length >= 10;
}

export function useTimestampConverter(): UseTimestampConverterReturn {
  const [mode, setMode] = useState<ModeType>('ts2dt');
  const [unit, setUnit] = useState<UnitType>('ms');
  const [zone, setZone] = useState<ZoneType>('Asia/Shanghai');

  const [input, setInput] = useState(() => String(Date.now()));

  const { result, error } = useMemo(() => {
    const rawInput = input.trim();
    if (!rawInput) return { result: '', error: '' };

    if (mode === 'ts2dt') {
      const num = Number(rawInput);
      if (isNaN(num)) {
        return { result: '', error: '请输入有效数字' };
      }
      try {
        const d = dayjsFromTimestamp(num, unit);
        if (!d.isValid() || d.year() < 0 || d.year() > 9999) {
          return { result: '', error: '无效时间戳' };
        }
        return { result: d.tz(zone).format(DATE_FORMAT), error: '' };
      } catch {
        return { result: '', error: '无效时间戳' };
      }
    } else {
      try {
        const d = dayjs.tz(rawInput, DATE_FORMAT, zone);
        if (!d.isValid() || d.year() < 0 || d.year() > 9999) {
          return { result: '', error: '无效的日期格式' };
        }
        const ms = d.valueOf();
        if (isNaN(ms)) {
          return { result: '', error: '无效的日期格式' };
        }
        return { result: String(msToUnit(ms, unit)), error: '' };
      } catch {
        return { result: '', error: '无效的日期格式' };
      }
    }
  }, [input, mode, unit, zone]);

  const handleContextMenuData = (payload: string) => {
    const trimmed = payload.trim();
    if (isTimestampLike(trimmed)) {
      setMode('ts2dt');
      setUnit(trimmed.length >= MS_TIMESTAMP_MIN_LENGTH ? 'ms' : 's');
      setInput(trimmed);
    } else {
      const d = dayjs(trimmed);
      if (d.isValid()) {
        setMode('dt2ts');
        setInput(d.format(DATE_FORMAT));
      } else {
        setMode('ts2dt');
        setInput(trimmed);
      }
    }
  };

  useContextMenuData({ featureKey: 'timestamp', onData: handleContextMenuData });

  const handleUseNow = (now: number) => {
    if (mode === 'ts2dt') {
      setInput(String(msToUnit(now, unit)));
    } else {
      setInput(dayjs(now).tz(zone).format(DATE_FORMAT));
    }
  };

  const handleSetMode = (newMode: ModeType) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (result && !error) {
      setInput(result);
    }
  };

  const handleSetUnit = (newUnit: UnitType) => {
    if (newUnit === unit) return;

    if (mode === 'ts2dt') {
      const trimmed = input.trim();
      if (TIMESTAMP_REGEX.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num)) {
          // ms -> s: 仅当长度 >= 13 位（毫秒级）时自动换算除以 1000
          if (unit === 'ms' && newUnit === 's' && trimmed.length >= MS_TIMESTAMP_MIN_LENGTH) {
            setInput(String(Math.floor(num / 1000)));
          }
          // s -> ms: 仅当长度 <= 10 位（秒级）时自动换算乘以 1000
          else if (unit === 's' && newUnit === 'ms' && trimmed.length <= 10) {
            setInput(String(num * 1000));
          }
        }
      }
    }

    setUnit(newUnit);
  };

  return {
    mode,
    input,
    unit,
    zone,
    result,
    error,
    setMode: handleSetMode,
    setInput,
    setUnit: handleSetUnit,
    setZone,
    handleUseNow,
  };
}
