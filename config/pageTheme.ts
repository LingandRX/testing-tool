export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

export const THEME_COLORS = {
  primary: '#1976d2',
  primaryDark: '#1565c0',
  primaryLight: '#42a5f5',
  success: '#2e7d32',
  successDark: '#1b5e20',
  successLight: '#4caf50',
  warning: '#e65100',
  warningDark: '#bf360c',
  warningLight: '#ff9800',
  error: '#c62828',
  errorDark: '#b71c1c',
  errorLight: '#f44336',
  purple: '#6a1b9a',
  purpleDark: '#4a148c',
  purpleLight: '#9c27b0',
  indigo: '#303f9f',
  indigoDark: '#1a237e',
  indigoLight: '#7986cb',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const STATUS_COLORS = {
  success: THEME_COLORS.success,
  warning: THEME_COLORS.warning,
  error: THEME_COLORS.error,
  info: THEME_COLORS.primary,
} as const;

export const timestampPageStyles = {
  primaryColor: THEME_COLORS.primary,
};

export const storageCleanerPageStyles = {
  warningColor: THEME_COLORS.warning,
};

export const qrCodePageStyles = {
  primaryColor: THEME_COLORS.success,
};

export const textStatisticsPageStyles = {
  primaryColor: THEME_COLORS.purple,
};

export const base64ConverterPageStyles = {
  primaryColor: THEME_COLORS.indigo,
};
