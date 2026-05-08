import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles';
import { THEME_COLORS } from './pageTheme';

/**
 * 按模式生成 MUI 主题
 *
 * - light：使用 THEME_COLORS 中饱和度较高的版本作为 main
 * - dark：使用 *Light 变体作为 main，保证暗底对比度满足 WCAG AA
 *
 * 所有调色板槽位均显式指定，不依赖 MUI 默认值。
 */
export function getTheme(mode: PaletteMode): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? THEME_COLORS.primaryLight : THEME_COLORS.primary,
        dark: THEME_COLORS.primaryDark,
        light: THEME_COLORS.primaryLight,
      },
      secondary: {
        main: isDark ? THEME_COLORS.purpleLight : THEME_COLORS.purple,
        dark: THEME_COLORS.purpleDark,
        light: THEME_COLORS.purpleLight,
      },
      success: {
        main: isDark ? THEME_COLORS.successLight : THEME_COLORS.success,
        dark: THEME_COLORS.successDark,
        light: THEME_COLORS.successLight,
      },
      warning: {
        main: isDark ? THEME_COLORS.warningLight : THEME_COLORS.warning,
        dark: THEME_COLORS.warningDark,
        light: THEME_COLORS.warningLight,
      },
      error: {
        main: isDark ? THEME_COLORS.errorLight : THEME_COLORS.error,
        dark: THEME_COLORS.errorDark,
        light: THEME_COLORS.errorLight,
      },
      info: {
        main: isDark ? THEME_COLORS.indigoLight : THEME_COLORS.indigo,
        dark: THEME_COLORS.indigoDark,
        light: THEME_COLORS.indigoLight,
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
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
        styleOverrides: (theme) => ({
          ':root': {
            '--sb-width': '6px',
            '--sb-thumb-color':
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
            '--sb-thumb-hover':
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
            '--sb-track-color': 'transparent',
          },
          html: {
            margin: 0,
            padding: 0,
            width: '100%',
            minHeight: '100%',
            backgroundColor: theme.palette.background.default,
          },
          'body, #root': {
            margin: 0,
            padding: 0,
            width: '100%',
            minHeight: '100%',
          },
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
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
        }),
      },
    },
  });
}

const theme = getTheme('light');
export default theme;
