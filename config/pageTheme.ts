import type { Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

export const THEME_COLORS = {
  primary: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  purple: '#9c27b0',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const timestampPageStyles = {
  primaryColor: THEME_COLORS.primary,
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 3.5,
      border: '1px solid',
      borderColor: 'grey.100',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': { border: 'none' },
      '&:hover': { borderColor: 'grey.300', bgcolor: 'grey.50' },
      '&.Mui-focused': {
        bgcolor: '#fff',
        borderColor: 'primary.main',
        boxShadow: (theme: Theme) => `0 0 0 4px ${theme.palette.primary.main}1a`,
      },
      '&.Mui-error': {
        borderColor: 'error.main',
        boxShadow: (theme: Theme) => `0 0 0 4px ${theme.palette.error.main}1a`,
      },
    },
    '& .MuiInputBase-input': {
      py: 1.4,
      px: 2,
      fontSize: '0.9rem',
      fontFamily: 'monospace',
      fontWeight: 600,
    },
  },
  cardBg: alpha(THEME_COLORS.primary, 0.04),
  cardBorder: alpha(THEME_COLORS.primary, 0.1),
  switcherBg: alpha(THEME_COLORS.primary, 0.08),
  switcherBorder: alpha(THEME_COLORS.primary, 0.1),
  mutedText: alpha(THEME_COLORS.primary, 0.4),
  resultBg: alpha(THEME_COLORS.primary, 0.05),
  buttonHover: `0 8px 24px ${alpha(THEME_COLORS.primary, 0.2)}`,
} as const;

export const openUrlPageStyles = {
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 3.5,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': {
        border: '1px solid',
        borderColor: 'grey.100',
      },
      '&:hover fieldset': {
        borderColor: 'grey.300',
      },
      '&:hover': { bgcolor: 'grey.50' },
      '&.Mui-focused fieldset': {
        borderColor: THEME_COLORS.purple,
      },
      '&.Mui-focused': {
        bgcolor: '#fff',
        boxShadow: (_theme: Theme) => `0 0 0 4px ${alpha(THEME_COLORS.purple, 0.1)}`,
      },
    },
    '& .MuiInputBase-input': {
      py: 1.2,
      px: 2,
      fontSize: '0.85rem',
      fontWeight: 600,
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: 'text.secondary',
      '&.Mui-focused': { color: THEME_COLORS.purple },
    },
  },
  themeColor: THEME_COLORS.purple,
  themeBg: alpha(THEME_COLORS.purple, 0.1),
  buttonBg: alpha(THEME_COLORS.purple, 0.85),
  buttonHover: `0 8px 24px ${alpha(THEME_COLORS.purple, 0.2)}`,
  errorColor: THEME_COLORS.error,
  errorBg: alpha(THEME_COLORS.error, 0.05),
} as const;

export const storageCleanerPageStyles = {
  warningColor: THEME_COLORS.warning,
  warningDark: '#f57c00',
  warningBg: alpha(THEME_COLORS.warning, 0.05),
  warningBorder: `1px solid ${alpha(THEME_COLORS.warning, 0.2)}`,
  errorBorder: `1px solid ${alpha(THEME_COLORS.error, 0.2)}`,
  errorBg: alpha(THEME_COLORS.error, 0.05),
} as const;

export const qrCodePageStyles = {
  primaryColor: THEME_COLORS.success,
  primaryDark: '#388e3c',
  successColor: THEME_COLORS.success,
  successDark: '#388e3c',
  white: THEME_COLORS.white,
  black: THEME_COLORS.black,
} as const;

export const dashboardPageStyles = {
  primaryColor: THEME_COLORS.primary,
  backgroundColor: '#f5f5f5',
  cardBackgroundColor: '#ffffff',
} as const;

export const formRecognizerPageStyles = {
  validColor: THEME_COLORS.success,
  validDark: '#388e3c',
  invalidColor: THEME_COLORS.warning,
  invalidDark: '#f57c00',
  clearColor: THEME_COLORS.error,
  clearDark: '#d32f2f',
  clearBg: alpha(THEME_COLORS.error, 0.05),
  buttonStyle: {
    py: 1.2,
    borderRadius: 3,
    fontWeight: 700,
  },
} as const;
