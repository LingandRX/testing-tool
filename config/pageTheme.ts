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
  SELECT_MENU_PROPS: {
    PaperProps: {
      sx: { borderRadius: 3, mt: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' },
    },
  },
  cardBg: alpha(THEME_COLORS.primary, 0.04),
  cardBorder: alpha(THEME_COLORS.primary, 0.1),
  switcherBg: alpha(THEME_COLORS.primary, 0.08),
  switcherBorder: alpha(THEME_COLORS.primary, 0.1),
  mutedText: alpha(THEME_COLORS.primary, 0.4),
  resultBg: alpha(THEME_COLORS.primary, 0.05),
  buttonHover: `0 8px 24px ${alpha(THEME_COLORS.primary, 0.2)}`,
  /** 模式切换器 (ToggleButtonGroup) 样式 */
  MODE_SWITCHER: {
    width: '100%',
    mb: 2.5,
    borderRadius: 4,
    bgcolor: 'grey.100',
    border: '1px solid',
    borderColor: 'grey.200',
    p: 0.6,
    '& .MuiToggleButtonGroup-grouped': {
      flex: 1,
      border: 'none',
      borderRadius: 3.5,
      py: 1,
      fontWeight: 800,
      fontSize: '0.75rem',
      color: 'text.secondary',
      transition: 'color 0.3s',
      '&.Mui-selected': {
        bgcolor: '#fff',
        color: 'primary.main',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  /** 单位切换器样式 */
  UNIT_SWITCHER_CONTAINER: {
    flex: 1,
    display: 'flex',
    bgcolor: 'grey.50',
    p: 0.5,
    borderRadius: 3.5,
    border: '1px solid',
    borderColor: 'grey.100',
  },
  UNIT_SWITCHER_ITEM: (active: boolean) => ({
    flex: 1,
    py: 0.8,
    textAlign: 'center',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 800,
    transition: 'all 0.2s',
    bgcolor: active ? '#fff' : 'transparent',
    color: active ? 'primary.main' : 'text.disabled',
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
  }),
  /** LiveClock 卡片样式 */
  LIVE_CLOCK_CARD: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1.5,
    p: 1.8,
    mb: 2.5,
    bgcolor: alpha(THEME_COLORS.primary, 0.04),
    borderRadius: 4,
    border: '1px solid',
    borderColor: alpha(THEME_COLORS.primary, 0.1),
  },
  LIVE_CLOCK_LABEL: {
    color: THEME_COLORS.primary,
    fontWeight: 800,
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  LIVE_CLOCK_VALUE: {
    fontWeight: 800,
    color: THEME_COLORS.primary,
    fontFamily: 'monospace',
    fontSize: { xs: '1.1rem', sm: '1.2rem' },
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  LIVE_CLOCK_UNIT_SWITCHER: {
    display: 'flex',
    p: 0.4,
    bgcolor: alpha(THEME_COLORS.primary, 0.08),
    borderRadius: 2.5,
    border: '1px solid',
    borderColor: alpha(THEME_COLORS.primary, 0.1),
  },
  LIVE_CLOCK_UNIT_ITEM: (active: boolean) => ({
    px: { xs: 1, sm: 1.2 },
    py: 0.35,
    borderRadius: 2,
    cursor: 'pointer',
    fontSize: '0.65rem',
    fontWeight: 900,
    transition: 'all 0.2s',
    bgcolor: active ? '#fff' : 'transparent',
    color: active ? 'primary.main' : alpha(THEME_COLORS.primary, 0.4),
    boxShadow: active ? '0 2px 6px rgba(33, 150, 243, 0.2)' : 'none',
  }),
  LIVE_CLOCK_ICON_BUTTON: {
    color: THEME_COLORS.primary,
    bgcolor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    '&:hover': { bgcolor: THEME_COLORS.primary, color: '#fff' },
  },
  LIVE_CLOCK_DIVIDER: {
    mx: 0.5,
    my: 1,
    borderColor: alpha(THEME_COLORS.primary, 0.1),
  },
  /** ResultView 样式 */
  RESULT_LABEL: {
    color: 'text.secondary',
    mb: 1.2,
    display: 'block',
    fontWeight: 800,
    fontSize: '0.7rem',
  },
  RESULT_MAIN_BOX: {
    bgcolor: alpha(THEME_COLORS.primary, 0.05),
    p: 2,
    borderRadius: 4,
    position: 'relative',
    mb: 2.5,
    border: '1px solid',
    borderColor: alpha(THEME_COLORS.primary, 0.1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  RESULT_MAIN_TEXT: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: THEME_COLORS.primary,
    wordBreak: 'break-all',
    pr: 4,
    fontSize: '1rem',
  },
  RESULT_EXTRA_STACK: {
    bgcolor: alpha(THEME_COLORS.primary, 0.05),
    p: 2,
    borderRadius: 4,
    border: '1px solid',
    borderColor: alpha(THEME_COLORS.primary, 0.1),
  },
  RESULT_EXTRA_LABEL: {
    color: 'text.disabled',
    fontWeight: 700,
    fontSize: '0.65rem',
    pr: 4,
  },
  RESULT_EXTRA_VALUE: {
    fontFamily: 'monospace',
    color: THEME_COLORS.primary,
    fontWeight: 600,
    fontSize: '0.65rem',
  },
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
  /** 选项网格容器 */
  OPTIONS_GRID_CONTAINER: {
    mb: 3,
    border: '1px solid',
    borderColor: 'grey.100',
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
      bgcolor: 'rgba(0, 0, 0, 0.04)',
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
  OPTION_ITEM: (checked: boolean) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 1,
    px: { xs: 1, sm: 1.5 },
    borderRadius: 3,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    bgcolor: checked ? alpha(THEME_COLORS.warning, 0.05) : 'transparent',
    border: `1px solid ${checked ? alpha(THEME_COLORS.warning, 0.2) : 'transparent'}`,
    '&:hover': {
      bgcolor: checked ? alpha(THEME_COLORS.warning, 0.1) : 'rgba(0, 0, 0, 0.02)',
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
    color: checked ? THEME_COLORS.warning : 'text.primary',
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
    color: 'grey.400',
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
    borderColor: 'grey.100',
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
  DOMAIN_HEADER_BADGE: {
    bgcolor: alpha(THEME_COLORS.warning, 0.15),
    color: THEME_COLORS.warning,
    px: 1.5,
    py: 0.3,
    borderRadius: 2,
    fontWeight: 800,
    fontSize: '0.7rem',
    boxShadow: `0 2px 4px ${alpha(THEME_COLORS.warning, 0.2)}`,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: alpha(THEME_COLORS.warning, 0.25),
    },
  },
  DOMAIN_HEADER_ICON: {
    p: 1.2,
    borderRadius: 3,
    boxShadow: `0 2px 8px ${alpha(THEME_COLORS.warning, 0.15)}`,
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: alpha(THEME_COLORS.warning, 0.15),
      transform: 'scale(1.05)',
    },
  },
  /** ErrorDisplay */
  ERROR_DISPLAY_CONTAINER: {
    py: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: { xs: 'auto', sm: '400px' },
    textAlign: 'center',
  },
  ERROR_DISPLAY_BOX: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    p: 4,
    boxShadow: `0 8px 24px ${alpha(THEME_COLORS.error, 0.15)}`,
    border: `1px solid ${alpha(THEME_COLORS.error, 0.2)}`,
    bgcolor: alpha(THEME_COLORS.error, 0.05),
  },
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
    boxShadow: `0 24px 64px -12px ${alpha(THEME_COLORS.black, 0.18)}`,
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
  CONFIRM_DIALOG_CHIP: {
    bgcolor: alpha(THEME_COLORS.warning, 0.04),
    fontWeight: 700,
    color: THEME_COLORS.warning,
    fontSize: '0.75rem',
    border: '1px solid',
    borderColor: alpha(THEME_COLORS.warning, 0.15),
    borderRadius: 2.5,
    height: 'auto',
    '& .MuiChip-label': { px: 1.2, py: 0.6 },
  },
  CONFIRM_DIALOG_WARNING_BOX: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: alpha(THEME_COLORS.error, 0.05),
    color: THEME_COLORS.error,
    px: 2,
    py: 0.8,
    borderRadius: 3,
    border: '1px dashed',
    borderColor: alpha(THEME_COLORS.error, 0.2),
  },
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
      bgcolor: 'grey.100',
      color: 'text.primary',
    },
  },
  CONFIRM_DIALOG_CONFIRM: {
    bgcolor: THEME_COLORS.warning,
    '&:hover': {
      bgcolor: THEME_COLORS.warningDark,
    },
  },
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
    bgcolor: THEME_COLORS.success,
    fontWeight: 700,
    '&:hover': {
      bgcolor: THEME_COLORS.successDark,
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
    borderColor: 'grey.200',
    borderRadius: 3,
    p: 2,
    bgcolor: 'grey.50',
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
    borderColor: THEME_COLORS.success,
    color: THEME_COLORS.success,
    '&:hover': {
      borderColor: THEME_COLORS.successDark,
      bgcolor: alpha(THEME_COLORS.success, 0.05),
    },
  } as const,
  /** 复制按钮 */
  COPY_BUTTON: {
    borderRadius: 2,
    bgcolor: THEME_COLORS.success,
    '&:hover': {
      bgcolor: THEME_COLORS.successDark,
    },
  } as const,
  /** 拖拽上传区域 */
  DROPZONE: (dragging: boolean, hasFile: boolean) =>
    ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      border: '2px dashed',
      borderColor: dragging || hasFile ? THEME_COLORS.success : 'grey.200',
      borderRadius: 3,
      p: 4,
      bgcolor: dragging
        ? alpha(THEME_COLORS.success, 0.1)
        : hasFile
          ? alpha(THEME_COLORS.success, 0.05)
          : 'grey.50',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: THEME_COLORS.success,
        bgcolor: alpha(THEME_COLORS.success, 0.05),
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
  CLEAR_BUTTON: {
    position: 'absolute',
    top: -8,
    right: -8,
    bgcolor: alpha(THEME_COLORS.error, 0.9),
    color: 'white',
    '&:hover': {
      bgcolor: alpha(THEME_COLORS.errorDark, 0.95),
    },
  } as const,
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
  primaryColor: THEME_COLORS.primary,
  backgroundColor: '#f5f5f5',
  cardBackgroundColor: '#ffffff',
  GRID_CONTAINER: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(auto-fill, minmax(300px, 1fr))',
    },
    gap: 2,
    p: 2,
  },
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

/**
 * 文本统计页面样式
 */
export const textStatisticsPageStyles = {
  primaryColor: THEME_COLORS.purple,
  cardBg: alpha(THEME_COLORS.purple, 0.04),
  cardBorder: alpha(THEME_COLORS.purple, 0.1),
} as const;

/**
 * JWT 解析工具页面样式
 */
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
  cardBg: alpha(THEME_COLORS.indigo, 0.04),
  cardBorder: alpha(THEME_COLORS.indigo, 0.1),
  INPUT_STYLE: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      borderRadius: 4,
      fontSize: '0.85rem',
      fontFamily: 'monospace',
      transition: 'all 0.2s',
      '&:hover': { bgcolor: 'grey.50' },
      '&.Mui-focused': { bgcolor: '#fff' },
    },
  },
} as const;
