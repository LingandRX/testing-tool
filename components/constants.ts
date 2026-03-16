export const TIME_ZONE_LIST = [
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
] as const;

export const TIMESTAMP_UNITS = [
  { value: 'milliseconds', label: '毫秒 (ms)' },
  { value: 'seconds', label: '秒 (s)' },
] as const;

export type TimeZone = (typeof TIME_ZONE_LIST)[number];
export type TimestampUnit = (typeof TIMESTAMP_UNITS)[number]['value'];
