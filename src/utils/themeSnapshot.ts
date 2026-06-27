export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

export const THEME_MODE_STORAGE_KEY = 'app/themeMode' as const;
export const THEME_MODE_SNAPSHOT_KEY = 'snapshot/app/themeMode';

const VALID_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export const isValidThemeMode = (value: unknown): value is ThemeMode =>
  VALID_MODES.includes(value as ThemeMode);

/**
 * 同步读取 localStorage 快照（首屏防闪烁）
 */
export const getThemeSyncSnapshot = (): ThemeMode => {
  try {
    const raw = localStorage.getItem(THEME_MODE_SNAPSHOT_KEY);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw) as unknown;
    return isValidThemeMode(parsed) ? parsed : 'system';
  } catch {
    return 'system';
  }
};

export const getSystemThemeMode = (): ResolvedThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveThemeMode = (mode: ThemeMode): ResolvedThemeMode =>
  mode === 'system' ? getSystemThemeMode() : mode;

export const persistThemeModeSnapshot = (mode: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_MODE_SNAPSHOT_KEY, JSON.stringify(mode));
  } catch (error) {
    console.error('保存主题快照失败:', error);
  }
};

export const applyResolvedThemeClass = (resolved: ResolvedThemeMode): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

/** 在 React 挂载前同步应用快照主题，避免首帧闪烁 */
export const applyThemeFromSnapshot = (): void => {
  applyResolvedThemeClass(resolveThemeMode(getThemeSyncSnapshot()));
};
