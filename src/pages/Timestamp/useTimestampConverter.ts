import { useMemo, useState } from 'react';
import dayjs from '@/utils/dayjs';
import type { UnitType, ZoneType, ModeType } from './constants';
import { DATE_FORMAT, msToUnit, dayjsFromTimestamp } from './constants';
import { useI18n } from '@/utils/chromeI18n';
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
  const { t } = useI18n('timestamp');
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
        return { result: '', error: t('timestamp:errors.invalidNumber') };
      }
      const d = dayjsFromTimestamp(num, unit);
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
      return { result: String(msToUnit(ms, unit)), error: '' };
    }
  }, [input, mode, unit, zone, t]);

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
    setMode(newMode);
    if (result && !error) {
      setInput(result);
    }
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
    setUnit,
    setZone,
    handleUseNow,
  };
}
