import { useCallback, useMemo, useState } from 'react';
import dayjs from '@/utils/dayjs';
import type { UnitType, ZoneType } from './constants';
import { DATE_FORMAT } from './constants';
import { useI18n } from '@/utils/chromeI18n';
import { useContextMenuData } from '@/utils/useContextMenuData';

export interface UseTimestampConverterReturn {
  mode: 'ts2dt' | 'dt2ts';
  input: string; // 统一为单一受控输入源
  unit: UnitType;
  zone: ZoneType;
  result: string;
  error: string;

  setMode: (mode: 'ts2dt' | 'dt2ts') => void;
  setInput: (value: string) => void;
  setUnit: (unit: UnitType) => void;
  setZone: (zone: ZoneType) => void;
  handleUseNow: (now: number) => void;
}

function isTimestampLike(input: string): boolean {
  const trimmed = input.trim();
  return /^\d+$/.test(trimmed) && trimmed.length >= 10;
}

export function useTimestampConverter(): UseTimestampConverterReturn {
  const { t } = useI18n('timestamp');
  const [mode, setMode] = useState<'ts2dt' | 'dt2ts'>('ts2dt');
  const [unit, setUnit] = useState<UnitType>('ms');
  const [zone, setZone] = useState<ZoneType>('Asia/Shanghai');

  const [input, setInput] = useState(() => String(Date.now()));

  const conversionPipeline = useMemo(() => {
    const rawInput = input.trim();
    if (!rawInput) return { result: '', error: '' };

    if (mode === 'ts2dt') {
      const num = Number(rawInput);
      if (isNaN(num)) {
        return { result: '', error: t('timestamp:errors.invalidNumber') };
      }
      const d = unit === 'ms' ? dayjs(num) : dayjs.unix(num);
      if (!d.isValid()) {
        return { result: '', error: t('timestamp:errors.invalidTimestamp') };
      }
      return { result: d.tz(zone).format(DATE_FORMAT), error: '' };
    } else {
      const d = dayjs.tz(rawInput, DATE_FORMAT, zone);
      if (!d.isValid()) {
        return { result: '', error: t('timestamp:errors.invalidFormat') };
      }
      const ms = d.valueOf();
      const outputTs = unit === 'ms' ? String(ms) : String(Math.floor(ms / 1000));
      return { result: outputTs, error: '' };
    }
  }, [input, mode, unit, zone, t]);

  const { result, error } = conversionPipeline;

  const handleContextMenuData = useCallback((payload: string) => {
    const trimmed = payload.trim();
    if (isTimestampLike(trimmed)) {
      setMode('ts2dt');
      const detectedUnit: UnitType = trimmed.length >= 13 ? 'ms' : 's';
      setUnit(detectedUnit);
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
  }, []);

  useContextMenuData({ featureKey: 'timestamp', onData: handleContextMenuData });

  const handleUseNow = useCallback(
    (now: number) => {
      if (mode === 'ts2dt') {
        setInput(String(unit === 'ms' ? now : Math.floor(now / 1000)));
      } else {
        setInput(dayjs(now).tz(zone).format(DATE_FORMAT));
      }
    },
    [mode, unit, zone],
  );

  const handleSetMode = useCallback(
    (newMode: 'ts2dt' | 'dt2ts') => {
      setMode(newMode);
      if (result && !error) {
        setInput(result);
      }
    },
    [result, error],
  );

  return {
    mode,
    input,
    unit,
    zone,
    result,
    error,
    setMode: handleSetMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
  };
}
