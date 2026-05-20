import { useCallback, useState } from 'react';
import dayjs from '@/utils/dayjs';
import type { UnitType, ZoneType } from '@/config/pageTheme';
import { DATE_FORMAT } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';
import { useContextMenuData } from '@/utils/useContextMenuData';

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
  setInput: (value: string) => void;
  setUnit: (unit: UnitType) => void;
  setZone: (zone: ZoneType) => void;
  handleUseNow: (now: number) => void;
  convert: () => void;
}

/**
 * 判断输入是否为时间戳（纯数字或长度 >= 10 的数字字符串）
 */
function isTimestampLike(input: string): boolean {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  return trimmed.length >= 10;
}

export function useTimestampConverter(): UseTimestampConverterReturn {
  const { t } = useTranslation(['timestamp']);
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
        setError(t('timestamp:errors.invalidNumber'));
        return;
      }
      const d = unit === 'ms' ? dayjs(num) : dayjs.unix(num);
      if (!d.isValid()) {
        setError(t('timestamp:errors.invalidTimestamp'));
        return;
      }
      setError('');
      setResult(d.tz(zone).format(DATE_FORMAT));
    } else {
      const rawInput = dtInput.trim();
      if (!rawInput) return;
      const d = dayjs.tz(rawInput, DATE_FORMAT, zone);
      if (!d.isValid()) {
        setError(t('timestamp:errors.invalidFormat'));
        return;
      }
      setError('');
      const ms = d.valueOf();
      setResult(unit === 'ms' ? String(ms) : String(Math.floor(ms / 1000)));
    }
  }, [mode, tsInput, dtInput, unit, zone, t]);

  // 处理右键菜单传递的数据
  const handleContextMenuData = useCallback(
    (payload: string) => {
      const trimmed = payload.trim();
      if (isTimestampLike(trimmed)) {
        // 看起来是时间戳，切换到 ts2dt 模式
        setMode('ts2dt');
        setTsInput(trimmed);
        // 如果是 13 位毫秒级时间戳，自动选择 ms 单位
        const detectedUnit: UnitType = trimmed.length >= 13 ? 'ms' : 's';
        setUnit(detectedUnit);
        // 直接执行转换
        const num = Number(trimmed);
        if (!isNaN(num)) {
          const d = detectedUnit === 'ms' ? dayjs(num) : dayjs.unix(num);
          if (d.isValid()) {
            setError('');
            setResult(d.tz(zone).format(DATE_FORMAT));
          }
        }
      } else {
        // 尝试作为日期时间解析
        const d = dayjs(trimmed);
        if (d.isValid()) {
          setMode('dt2ts');
          setDtInput(d.format(DATE_FORMAT));
          // 直接执行转换
          const ms = d.valueOf();
          setError('');
          setResult(String(ms));
        } else {
          // 无法识别，作为时间戳处理
          setMode('ts2dt');
          setTsInput(trimmed);
        }
      }
    },
    [zone],
  );

  useContextMenuData({ featureKey: 'timestamp', onData: handleContextMenuData });

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

  const setInput = useCallback(
    (value: string) => {
      if (mode === 'ts2dt') {
        setTsInput(value);
      } else {
        setDtInput(value);
      }
      setError('');
    },
    [mode],
  );

  return {
    mode,
    tsInput,
    dtInput,
    unit,
    zone,
    result,
    error,
    setMode: handleSetMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
    convert,
  };
}
