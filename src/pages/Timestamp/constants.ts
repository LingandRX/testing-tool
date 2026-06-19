import type { Dayjs } from 'dayjs';
import dayjs from '@/utils/dayjs';

export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type ModeType = 'ts2dt' | 'dt2ts';
export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

export const MODE_OPTIONS: { value: ModeType; label: string }[] = [
  { value: 'ts2dt', label: '时间戳转日期' },
  { value: 'dt2ts', label: '日期转时间戳' },
];

export const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'ms', label: '毫秒' },
  { value: 's', label: '秒' },
];

export const INPUT_PLACEHOLDERS: Record<ModeType, string> = {
  ts2dt: '输入时间戳...',
  dt2ts: 'YYYY-MM-DD HH:mm:ss',
};

export const CARD_CLASS =
  'p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col';

const DIVISORS: Record<UnitType, number> = { ms: 1, s: 1000 };

export function msToUnit(ms: number, unit: UnitType): number {
  return Math.floor(ms / DIVISORS[unit]);
}

export function dayjsFromTimestamp(ts: number, unit: UnitType): Dayjs {
  return unit === 'ms' ? dayjs(ts) : dayjs.unix(ts);
}
