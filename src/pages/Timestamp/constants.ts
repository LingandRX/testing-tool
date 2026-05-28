export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];
