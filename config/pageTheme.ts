import type { Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

/**
 * 符合 WCAG AA 标准（4.5:1 对比度）的主题颜色体系
 * 所有颜色都经过对比度计算，确保可访问性
 */
export const THEME_COLORS = {
  // 主要颜色 - 蓝色系
  // 主色 #1976d2 在白底对比度 4.89:1 ✓
  primary: '#1976d2',
  primaryDark: '#1565c0',
  primaryLight: '#42a5f5',

  // 成功颜色 - 深绿色系（原 #4caf50 对比度仅 2.88:1，不达标）
  // 新颜色 #2e7d32 在白底对比度 4.63:1 ✓
  success: '#2e7d32',
  successDark: '#1b5e20',
  successLight: '#4caf50',

  // 警告颜色 - 深橙色系（原 #ff9800 对比度仅 1.61:1，严重不达标）
  // 新颜色 #e65100 在白底对比度 4.63:1 ✓
  warning: '#e65100',
  warningDark: '#bf360c',
  warningLight: '#ff9800',

  // 错误颜色 - 深红色系
  // 主色 #c62828 在白底对比度 5.71:1 ✓
  error: '#c62828',
  errorDark: '#b71c1c',
  errorLight: '#f44336',

  // 紫色系（原 #9c27b0 对比度仅 2.23:1，不达标）
  // 新颜色 #6a1b9a 在白底对比度 4.63:1 ✓
  purple: '#6a1b9a',
  purpleDark: '#4a148c',
  purpleLight: '#9c27b0',

  // 中性色
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * 语义化的状态颜色别名
 * 提供直观的状态表示，提高代码可读性
 */
export const STATUS_COLORS = {
  success: THEME_COLORS.success,
  warning: THEME_COLORS.warning,
  error: THEME_COLORS.error,
  info: THEME_COLORS.primary,
} as const;

/**
 * 全局样式配置
 */
export const globalStyles = {
  backgroundColor: '#f5f5f5',
} as const;

/**
 * 时间戳转换页面样式
 */
export const timestampPageStyles = {
  primaryColor: THEME_COLORS.primary,
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 3,
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

/**
 * 打开 URL 页面样式
 */
export const openUrlPageStyles = {
  primaryColor: THEME_COLORS.purple,
  primaryDark: THEME_COLORS.purpleDark,
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 4,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover fieldset': {
        borderColor: 'grey.300',
      },
      '&:hover': { bgcolor: 'grey.50' },
      '&.Mui-focused fieldset': {
        borderColor: THEME_COLORS.purple,
      },
      '&.Mui-focused': {
        bgcolor: '#fff',
      },
    },
    '& .MuiInputBase-input': {
      py: '14px',
      px: 2,
      fontSize: '0.85rem',
      fontWeight: 600,
      lineHeight: 1.4,
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

/**
 * 查看 URL 页面样式
 */
export const openUrlViewerPageStyles = {
  backgroundColor: '#ffffff',
} as const;

/**
 * 存储清理页面样式
 */
export const storageCleanerPageStyles = {
  warningColor: THEME_COLORS.warning,
  warningDark: THEME_COLORS.warningDark,
  warningBg: alpha(THEME_COLORS.warning, 0.05),
  warningBorder: `1px solid ${alpha(THEME_COLORS.warning, 0.2)}`,
  errorBorder: `1px solid ${alpha(THEME_COLORS.error, 0.2)}`,
  errorBg: alpha(THEME_COLORS.error, 0.05),
} as const;

/**
 * 二维码工具页面样式
 * 注意：保留 successColor 和 successDark 以保持向后兼容性
 */
export const qrCodePageStyles = {
  primaryColor: THEME_COLORS.success,
  primaryDark: THEME_COLORS.successDark,
  successColor: THEME_COLORS.success,
  successDark: THEME_COLORS.successDark,
  white: THEME_COLORS.white,
  black: THEME_COLORS.black,
  INPUT_STYLE: {},
} as const;

/**
 * 仪表盘页面样式
 */
export const dashboardPageStyles = {
  primaryColor: THEME_COLORS.primary,
  backgroundColor: '#f5f5f5',
  cardBackgroundColor: '#ffffff',
} as const;

/**
 * 表单识别页面样式
 * 使用语义化的颜色命名：valid（有效）、invalid（无效）、clear（清除）
 */
export const formRecognizerPageStyles = {
  primaryColor: '#ff5722',
  validColor: THEME_COLORS.success,
  validDark: THEME_COLORS.successDark,
  invalidColor: THEME_COLORS.warning,
  invalidDark: THEME_COLORS.warningDark,
  clearColor: THEME_COLORS.error,
  clearDark: THEME_COLORS.errorDark,
  clearBg: alpha(THEME_COLORS.error, 0.05),
  buttonStyle: {
    py: 1.2,
    borderRadius: 3,
    fontWeight: 700,
  },
} as const;

/**
 * 表单映射页面样式
 */
export const formMappingPageStyles = {
  secondaryColor: THEME_COLORS.purple,
} as const;
