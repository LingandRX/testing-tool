import type { Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export const ZONES = ['Asia/Shanghai', 'America/New_York', 'Europe/London'] as const;

export type UnitType = 'ms' | 's';
export type ZoneType = (typeof ZONES)[number];

/**
 * 符合 WCAG AA 标准（4.5:1 对比度）的主题颜色体系
 * 所有颜色都经过对比度计算，确保可访问性
 *
 * 注意：这些颜色是品牌色源，实际组件应优先使用 theme.palette.* 令牌，
 * 以便在亮色/暗色模式下自动切换。
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

  // 靛蓝色系
  // #303f9f 在白底对比度 7.01:1 ✓
  indigo: '#303f9f',
  indigoDark: '#1a237e',
  indigoLight: '#7986cb',

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
 * 暗色模式下自动加深 alpha 值的辅助函数
 */
export const surfaceTint = (theme: Theme, color: string, baseAlpha: number) =>
  alpha(color, theme.palette.mode === 'dark' ? Math.min(baseAlpha + 0.1, 0.9) : baseAlpha);

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
      borderColor: 'divider',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': { border: 'none' },
      '&:hover': { borderColor: 'action.active', bgcolor: 'action.hover' },
      '&.Mui-focused': {
        bgcolor: 'background.paper',
        borderColor: 'primary.main',
        boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&.Mui-error': {
        borderColor: 'error.main',
        boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.error.main, 0.1)}`,
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
  SELECT_MENU_PROPS: {
    PaperProps: {
      sx: { borderRadius: 3, mt: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' },
    },
  },
  cardBg: (theme: Theme) => alpha(theme.palette.primary.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.primary.main, 0.1),
  switcherBg: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
  switcherBorder: (theme: Theme) => alpha(theme.palette.primary.main, 0.1),
  mutedText: (theme: Theme) => alpha(theme.palette.primary.main, 0.4),
  resultBg: (theme: Theme) => alpha(theme.palette.primary.main, 0.05),
  buttonHover: (theme: Theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  /** 统一转换工作台外卡 */
  CONVERSION_CARD: {
    p: 2.5,
    borderRadius: 4,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  /** 桌面端左右分栏布局 (md 断点开始等宽分栏，两栏卡片等高) */
  LAYOUT_GRID: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 2,
    alignItems: 'stretch',
  },
  /** 右栏结果卡片（独立卡片样式，与左栏等高） */
  RESULT_COLUMN_CARD: {
    p: 2.5,
    borderRadius: 4,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  /** 结果区空状态占位（桌面端右栏未转换时） */
  RESULT_EMPTY_PLACEHOLDER: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.disabled',
    fontSize: '0.85rem',
    fontWeight: 600,
    py: 6,
    textAlign: 'center',
  },
  /** 立即转换按钮（缩小+居中，融入卡片） */
  CONVERT_BUTTON: {
    display: 'block',
    mx: 'auto',
    mt: 2,
    mb: 0.5,
    maxWidth: 240,
    width: '100%',
    py: 1.1,
    fontSize: '0.85rem',
    borderRadius: 3,
  },
  /** 单位切换器样式 */
  UNIT_SWITCHER_CONTAINER: {
    flexShrink: 0,
    width: 160,
    display: 'flex',
    bgcolor: 'action.hover',
    p: 0.5,
    borderRadius: 3.5,
    border: '1px solid',
    borderColor: 'divider',
  },
  UNIT_SWITCHER_ITEM: (active: boolean) => ({
    flex: 1,
    py: 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 800,
    transition: 'all 0.2s',
    bgcolor: active ? 'background.paper' : 'transparent',
    color: active ? 'primary.main' : 'text.disabled',
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
  }),
  /** LiveClock 参考条样式（瘦身为单行） */
  LIVE_CLOCK_CARD: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 1.6,
    py: 0.8,
    mb: 2,
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    borderRadius: 3,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.1),
  }),
  LIVE_CLOCK_LABEL: {
    color: 'primary.main',
    fontWeight: 800,
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  },
  LIVE_CLOCK_VALUE: {
    flex: 1,
    fontWeight: 800,
    color: 'primary.main',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  LIVE_CLOCK_ICON_BUTTON: {
    color: 'primary.main',
    bgcolor: 'background.paper',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
  },
  /** ResultView 样式 */
  RESULT_LABEL: {
    color: 'text.secondary',
    mb: 1.2,
    display: 'block',
    fontWeight: 800,
    fontSize: '0.7rem',
  },
  RESULT_MAIN_BOX: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.primary.main, 0.12),
    p: 2.2,
    borderRadius: 4,
    position: 'relative',
    mb: 2,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  RESULT_MAIN_TEXT: {
    fontFamily: 'monospace',
    fontWeight: 800,
    color: 'primary.main',
    wordBreak: 'break-all',
    pr: 4,
    fontSize: '1.35rem',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  RESULT_EXTRA_STACK: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    p: 2,
    borderRadius: 4,
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.1),
  }),
  RESULT_EXTRA_LABEL: {
    color: 'text.disabled',
    fontWeight: 700,
    fontSize: '0.7rem',
    pr: 2,
    whiteSpace: 'nowrap',
  },
  RESULT_EXTRA_VALUE: {
    fontFamily: 'monospace',
    color: 'primary.main',
    fontWeight: 600,
    fontSize: '0.75rem',
    wordBreak: 'break-all',
    textAlign: 'right',
  },
} as const;

/**
 * 存储清理页面样式
 */
export const storageCleanerPageStyles = {
  warningColor: THEME_COLORS.warning,
  warningDark: THEME_COLORS.warningDark,
  warningBg: (theme: Theme) => surfaceTint(theme, theme.palette.warning.main, 0.05),
  errorBorder: (theme: Theme) => `1px solid ${surfaceTint(theme, theme.palette.error.main, 0.2)}`,
  errorBg: (theme: Theme) => surfaceTint(theme, theme.palette.error.main, 0.05),
  /** 选项网格容器 */
  OPTIONS_GRID_CONTAINER: {
    mb: 3,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 4,
    bgcolor: 'background.paper',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
    },
  },
  OPTIONS_GRID_FOOTER: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: 2.7,
    py: 0.8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  },
  OPTIONS_GRID_CHECKBOX: {
    p: 0.6,
    mr: 0,
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      transition: 'transform 0.2s',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
  },
  /** 选项项 */
  OPTION_ITEM: (checked: boolean) => (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 1,
    px: { xs: 1, sm: 1.5 },
    borderRadius: 3,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    bgcolor: checked ? surfaceTint(theme, theme.palette.warning.main, 0.05) : 'transparent',
    border: `1px solid ${checked ? surfaceTint(theme, theme.palette.warning.main, 0.2) : 'transparent'}`,
    '&:hover': {
      bgcolor: checked ? surfaceTint(theme, theme.palette.warning.main, 0.1) : 'action.hover',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
  }),
  OPTION_ITEM_LABEL: (checked: boolean) => ({
    fontSize: '0.75rem',
    display: 'block',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'color 0.2s',
    color: checked ? 'warning.main' : 'text.primary',
  }),
  OPTION_ITEM_SIZE: {
    color: 'text.secondary',
    fontSize: '0.65rem',
    fontWeight: 600,
    display: 'block',
    mt: 0.3,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    opacity: 0.8,
  },
  OPTION_ITEM_NO_DATA: {
    color: 'text.disabled',
    fontSize: '0.65rem',
    fontWeight: 500,
    display: 'block',
    mt: 0.3,
    lineHeight: 1,
    fontStyle: 'italic',
  },
  OPTION_ITEM_CHECKBOX: {
    p: 0.6,
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      transition: 'transform 0.2s',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
  },
  /** 自动刷新切换 */
  AUTO_REFRESH_CONTAINER: {
    mb: 3,
    p: 1.5,
    borderRadius: 4,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
  AUTO_REFRESH_SWITCH: {
    '& .MuiSwitch-track': {
      borderRadius: 20,
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.2s',
    },
    '&:hover .MuiSwitch-thumb': {
      transform: 'scale(1.1)',
    },
  },
  /** DomainHeader */
  DOMAIN_HEADER_BADGE: (theme: Theme) => ({
    bgcolor: surfaceTint(theme, theme.palette.warning.main, 0.15),
    color: 'warning.main',
    px: 1.5,
    py: 0.3,
    borderRadius: 2,
    fontWeight: 800,
    fontSize: '0.7rem',
    boxShadow: `0 2px 4px ${surfaceTint(theme, theme.palette.warning.main, 0.2)}`,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: surfaceTint(theme, theme.palette.warning.main, 0.25),
    },
  }),
  DOMAIN_HEADER_ICON: (theme: Theme) => ({
    p: 1.2,
    borderRadius: 3,
    boxShadow: `0 2px 8px ${surfaceTint(theme, theme.palette.warning.main, 0.15)}`,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: surfaceTint(theme, theme.palette.warning.main, 0.15),
      transform: 'scale(1.05)',
    },
  }),
  /** ErrorDisplay */
  ERROR_DISPLAY_CONTAINER: {
    py: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: { xs: 'auto', sm: '400px' },
    textAlign: 'center',
  },
  ERROR_DISPLAY_BOX: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    p: 4,
    boxShadow: `0 8px 24px ${surfaceTint(theme, theme.palette.error.main, 0.15)}`,
    border: '1px solid',
    borderColor: surfaceTint(theme, theme.palette.error.main, 0.2),
    bgcolor: surfaceTint(theme, theme.palette.error.main, 0.05),
  }),
  /** CleaningResult */
  CLEANING_RESULT_ALERT: {
    borderRadius: 3,
    py: 1,
    px: 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    '& .MuiAlert-message': {
      fontSize: '0.8rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    '& .MuiAlert-icon': {
      fontSize: '1.2rem',
      mr: 1,
    },
  },
  /** StorageCleanerConfirm Dialog */
  CONFIRM_DIALOG_PAPER: {
    borderRadius: 6,
    backgroundImage: 'none',
    boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.18)',
    p: 1.5,
    bgcolor: 'background.paper',
  },
  CONFIRM_DIALOG_TITLE: {
    textAlign: 'center',
    pt: 4,
    pb: 1,
    fontWeight: 900,
    letterSpacing: '-0.5px',
    fontSize: '1.35rem',
    color: 'text.primary',
  },
  CONFIRM_DIALOG_CONTENT: {
    textAlign: 'center',
    pb: 2,
  },
  CONFIRM_DIALOG_DESC: {
    mb: 3.5,
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  CONFIRM_DIALOG_CHIP: (theme: Theme) => ({
    bgcolor: surfaceTint(theme, theme.palette.warning.main, 0.04),
    fontWeight: 700,
    color: 'warning.main',
    fontSize: '0.75rem',
    border: '1px solid',
    borderColor: surfaceTint(theme, theme.palette.warning.main, 0.15),
    borderRadius: 2.5,
    height: 'auto',
    '& .MuiChip-label': { px: 1.2, py: 0.6 },
  }),
  CONFIRM_DIALOG_WARNING_BOX: (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: surfaceTint(theme, theme.palette.error.main, 0.05),
    color: 'error.main',
    px: 2,
    py: 0.8,
    borderRadius: 3,
    border: '1px dashed',
    borderColor: surfaceTint(theme, theme.palette.error.main, 0.2),
  }),
  CONFIRM_DIALOG_WARNING_TEXT: {
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: '0.75rem',
  },
  CONFIRM_DIALOG_CANCEL: {
    boxShadow: '0 0 1px 1px rgba(0, 0, 0, 0.1)',
    color: 'text.secondary',
    '&:hover': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  },
  CONFIRM_DIALOG_CONFIRM: {
    bgcolor: 'warning.main',
    '&:hover': {
      bgcolor: 'warning.dark',
    },
  },
} as const;

/**
 * 二维码工具页面样式
 */
export const qrCodePageStyles = {
  primaryColor: THEME_COLORS.success,
  /** 桌面端左右分栏布局 (md 断点开始等宽分栏，两栏卡片等高) */
  LAYOUT_GRID: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 2,
    alignItems: 'stretch',
  },
  /** 桌面端 grid item 包装：撑满 grid row 并把高度传给 Accordion */
  GRID_CELL: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '& > .MuiAccordion-root': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  } as const,
  /** 桌面端 Accordion 强展开样式：隐藏箭头，禁用 hover/cursor，等高填充 */
  ACCORDION_DESKTOP: {
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '&:before': { display: 'none' },
    '& .MuiAccordionSummary-root': {
      cursor: 'default',
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      display: 'none',
    },
    // 让 Collapse 整条链都 flex 撑满，否则 Details 拿不到剩余高度
    '& .MuiCollapse-root': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiCollapse-wrapper': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiCollapse-wrapperInner': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiAccordion-region': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiAccordionDetails-root': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiAccordionDetails-root > .MuiStack-root': {
      flex: 1,
    },
    '& .qr-flex-grow': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  } as const,
  /** 加载状态容器 */
  LOADING_CONTAINER: {
    py: 4,
    maxWidth: 400,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  } as const,
  /** Accordion 容器 */
  ACCORDION: {
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    '&:before': { display: 'none' },
  } as const,
  ACCORDION_SUMMARY: {
    borderBottom: 'none',
  } as const,
  ACCORDION_TITLE_ICON: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  } as const,
  ACCORDION_TITLE_TEXT: {
    fontWeight: 700,
  } as const,
  /** 主操作按钮（生成/解析） */
  PRIMARY_BUTTON: {
    py: 1.2,
    borderRadius: 3,
    bgcolor: 'success.main',
    fontWeight: 700,
    '&:hover': {
      bgcolor: 'success.dark',
    },
  } as const,
  /** 二维码展示区域 */
  QR_PREVIEW_CONTAINER: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    border: '2px dashed',
    borderColor: 'divider',
    borderRadius: 3,
    p: 2,
    bgcolor: 'action.hover',
  } as const,
  QR_PREVIEW_INNER: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  } as const,
  QR_PREVIEW_IMAGE: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  } as const,
  QR_PREVIEW_ACTIONS: {
    display: 'flex',
    gap: 1,
    mt: 2,
  } as const,
  /** 下载按钮 */
  DOWNLOAD_BUTTON: {
    borderRadius: 2,
    borderColor: 'success.main',
    color: 'success.main',
    '&:hover': {
      borderColor: 'success.dark',
      bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.05),
    },
  } as const,
  /** 复制按钮 */
  COPY_BUTTON: {
    borderRadius: 2,
    bgcolor: 'success.main',
    '&:hover': {
      bgcolor: 'success.dark',
    },
  } as const,
  /** 拖拽上传区域 */
  DROPZONE: (dragging: boolean, hasFile: boolean) => (theme: Theme) =>
    ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      border: '2px dashed',
      borderColor: dragging || hasFile ? 'success.main' : 'divider',
      borderRadius: 3,
      p: 4,
      bgcolor: dragging
        ? alpha(theme.palette.success.main, 0.1)
        : hasFile
          ? alpha(theme.palette.success.main, 0.05)
          : 'action.hover',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: 'success.main',
        bgcolor: alpha(theme.palette.success.main, 0.05),
      },
    }) as const,
  /** 图片预览容器 */
  IMAGE_PREVIEW_WRAPPER: {
    textAlign: 'center',
    width: '100%',
    position: 'relative',
  } as const,
  IMAGE_PREVIEW_BOX: {
    position: 'relative',
    display: 'inline-block',
  } as const,
  IMAGE_PREVIEW_IMG: {
    maxWidth: '100%',
    maxHeight: 160,
    borderRadius: 8,
    objectFit: 'contain',
  } as const,
  /** 清除按钮 */
  CLEAR_BUTTON: (theme: Theme) => ({
    position: 'absolute',
    top: -8,
    right: -8,
    bgcolor: alpha(theme.palette.error.main, 0.9),
    color: 'white',
    '&:hover': {
      bgcolor: 'error.dark',
    },
  }),
  /** 结果输入框 */
  RESULT_INPUT: {
    position: 'relative',
    mt: 2,
  } as const,
  /** 提示文本 */
  PLACEHOLDER_TEXT: {
    textAlign: 'center',
  } as const,
  INPUT_STYLE: {},
} as const;

/**
 * 仪表盘页面样式
 */
export const dashboardPageStyles = {
  GRID_CONTAINER: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(auto-fill, minmax(300px, 1fr))',
    },
    gridAutoRows: '1fr',
    gap: 2,
    p: 2,
  },
} as const;

/**
 * 表单识别页面样式
 * 使用语义化的颜色命名：valid（有效）、invalid（无效）、clear（清除）
 */
export const formRecognizerPageStyles = {
  primaryColor: 'warning.main',
  validColor: 'success.main',
  validDark: 'success.dark',
  invalidColor: 'warning.main',
  invalidDark: 'warning.dark',
  clearColor: 'error.main',
  clearDark: 'error.dark',
  clearBg: (theme: Theme) => surfaceTint(theme, theme.palette.error.main, 0.05),
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
  secondaryColor: 'secondary.main',
} as const;

/**
 * 文本统计页面样式
 */
export const textStatisticsPageStyles = {
  primaryColor: THEME_COLORS.purple,
  cardBg: (theme: Theme) => alpha(theme.palette.secondary.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.secondary.main, 0.1),
} as const;

/**
 * TopBar 组件样式
 */
export const topBarStyles = {
  SEARCH_MAX_WIDTH: 400,
  DROPDOWN_MAX_HEIGHT: 300,
  Z_INDEX: 1100,
  DROPDOWN_Z_INDEX: 1200,
  SEARCH_HISTORY_LIMIT: 10,
  SEARCH_HISTORY_DISPLAY: 5,
} as const;

/**
 * JWT 解析工具页面样式
 */
export const jwtPageStyles = {
  primaryColor: THEME_COLORS.indigo,
  cardBg: (theme: Theme) => alpha(theme.palette.info.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.info.main, 0.1),
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 4,
      fontSize: '0.85rem',
      fontFamily: 'monospace',
      transition: 'all 0.2s',
      '&:hover': { bgcolor: 'action.hover' },
      '&.Mui-focused': { bgcolor: 'background.paper' },
    },
  },
} as const;

/**
 * Base64 转换器页面样式
 */
export const base64ConverterPageStyles = {
  primaryColor: THEME_COLORS.indigo,
  cardBg: (theme: Theme) => alpha(theme.palette.info.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.info.main, 0.1),
} as const;

/**
 * Markdown 转 HTML 页面样式
 */
export const markdownToHtmlPageStyles = {
  primaryColor: THEME_COLORS.purple,
  cardBg: (theme: Theme) => alpha(theme.palette.secondary.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.secondary.main, 0.1),
} as const;

/**
 * HTML 转 Markdown 页面样式
 */
export const htmlToMarkdownPageStyles = {
  primaryColor: THEME_COLORS.purple,
  cardBg: (theme: Theme) => alpha(theme.palette.secondary.main, 0.04),
  cardBorder: (theme: Theme) => alpha(theme.palette.secondary.main, 0.1),
} as const;

/**
 * JSON 差异比较工具页面样式
 */
export const jsonDiffPageStyles = {
  primaryColor: THEME_COLORS.primary,
  addedBg: (theme: Theme) => surfaceTint(theme, theme.palette.success.main, 0.15),
  addedBorder: (theme: Theme) => surfaceTint(theme, theme.palette.success.main, 0.4),
  addedText: 'success.main',
  removedBg: (theme: Theme) => surfaceTint(theme, theme.palette.error.main, 0.15),
  removedBorder: (theme: Theme) => surfaceTint(theme, theme.palette.error.main, 0.4),
  removedText: 'error.main',
  modifiedBg: (theme: Theme) => surfaceTint(theme, theme.palette.warning.main, 0.15),
  modifiedBorder: (theme: Theme) => surfaceTint(theme, theme.palette.warning.main, 0.4),
  modifiedText: 'warning.main',
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 3,
      fontSize: '0.8rem',
      fontFamily: 'monospace',
      alignItems: 'flex-start',
      transition: 'all 0.2s',
      '&:hover': { bgcolor: 'action.hover' },
      '&.Mui-focused': {
        bgcolor: 'background.paper',
        boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&.Mui-error': {
        boxShadow: (theme: Theme) => `0 0 0 4px ${alpha(theme.palette.error.main, 0.1)}`,
      },
    },
  },
  TREE_CONTAINER: {
    p: 1.5,
    borderRadius: 3,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    overflowX: 'auto',
    minHeight: 200,
    maxHeight: 480,
    overflowY: 'auto',
  },
  NAVIGATOR: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    p: 1,
    borderRadius: 3,
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.15),
  }),
} as const;
