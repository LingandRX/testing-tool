import type { Dayjs } from 'dayjs';
import dayjs from '@/utils/dayjs';

export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type ModeType = 'ts2dt' | 'dt2ts';
export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

const DIVISORS: Record<UnitType, number> = { ms: 1, s: 1000 };

export function msToUnit(ms: number, unit: UnitType): number {
  return Math.floor(ms / DIVISORS[unit]);
}

export function dayjsFromTimestamp(ts: number, unit: UnitType): Dayjs {
  return unit === 'ms' ? dayjs(ts) : dayjs.unix(ts);
}
