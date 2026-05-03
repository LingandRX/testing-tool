import { createTheme } from '@mui/material/styles';
import { THEME_COLORS } from './pageTheme';

/**
 * 统一的 MUI 主题配置
 * 整合了原有的外部 CSS 样式（滚动条、动画、基础重置）
 */
const theme = createTheme({
  palette: {
    primary: {
      main: THEME_COLORS.primary,
      dark: THEME_COLORS.primaryDark,
      light: THEME_COLORS.primaryLight,
    },
    success: {
      main: THEME_COLORS.success,
      dark: THEME_COLORS.successDark,
      light: THEME_COLORS.successLight,
    },
    warning: {
      main: THEME_COLORS.warning,
      dark: THEME_COLORS.warningDark,
      light: THEME_COLORS.warningLight,
    },
    error: {
      main: THEME_COLORS.error,
      dark: THEME_COLORS.errorDark,
      light: THEME_COLORS.errorLight,
    },
    secondary: {
      main: THEME_COLORS.purple,
      dark: THEME_COLORS.purpleDark,
      light: THEME_COLORS.purpleLight,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--sb-width': '6px',
          '--sb-thumb-color': 'rgba(0, 0, 0, 0.1)',
          '--sb-thumb-hover': 'rgba(0, 0, 0, 0.2)',
          '--sb-track-color': 'transparent',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          minHeight: '100%',
          backgroundColor: '#f5f5f5',
        },
        'body, #root': {
          margin: 0,
          padding: 0,
          width: '100%',
          minHeight: '100%',
        },
        // 针对 Popup 的特殊处理（如果需要固定宽高，可以在具体入口点或容器中处理，
        // 这里提供全局基础，具体尺寸在 App 容器中限制）
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        code: {
          fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
        },
        'h1, h2, h3, h4, h5, h6': {
          fontSize: 'inherit',
          fontWeight: 'inherit',
        },
        /* 全局极简滚动条定制 */
        '*::-webkit-scrollbar': {
          width: 'var(--sb-width)',
        },
        '*::-webkit-scrollbar-track': {
          background: 'var(--sb-track-color)',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'var(--sb-thumb-color)',
          borderRadius: '10px',
          backgroundClip: 'content-box',
          border: '1px solid transparent',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: 'var(--sb-thumb-hover)',
        },
        /* Animations */
        '@keyframes slideInRight': {
          from: {
            transform: 'translateX(30px)',
            opacity: 0,
          },
          to: {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        '.page-transition-enter': {
          animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        },
        '.page-transition-dashboard': {
          animation: 'fadeIn 0.3s ease-out forwards',
        },
      },
    },
  },
});

export default theme;
