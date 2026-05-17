import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/config/theme';
import { storageUtil } from '@/utils/chromeStorage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

interface ThemeModeContextType {
  /** 用户显式选择的模式（含 system） */
  mode: ThemeMode;
  /** 实际解析后的模式（不含 system） */
  resolvedMode: ResolvedThemeMode;
  /** 切换模式 */
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | null>(null);

const THEME_MODE_KEY = 'app/themeMode' as const;
const SNAPSHOT_KEY = 'snapshot/app/themeMode';

const VALID_MODES: ThemeMode[] = ['light', 'dark', 'system'];
const isValidMode = (v: unknown): v is ThemeMode => VALID_MODES.includes(v as ThemeMode);

const getSyncSnapshot = (): ThemeMode => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw) as unknown;
    return isValidMode(parsed) ? parsed : 'system';
  } catch {
    return 'system';
  }
};

const getSystemMode = (): ResolvedThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(getSyncSnapshot);
  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(
    mode === 'system' ? getSystemMode() : mode,
  );
  const [, setIsLoaded] = useState(false);

  const muiTheme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  const updateResolved = useCallback((nextMode: ThemeMode) => {
    setResolvedMode(nextMode === 'system' ? getSystemMode() : nextMode);
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      updateResolved(next);
      storageUtil.set(THEME_MODE_KEY, next).catch(console.error);
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
    },
    [updateResolved],
  );

  // 异步校准：从 chrome.storage 读取持久化值
  useEffect(() => {
    let cancelled = false;
    storageUtil
      .get(THEME_MODE_KEY, 'system')
      .then((saved) => {
        if (cancelled) return;
        if (isValidMode(saved)) {
          setModeState(saved);
          updateResolved(saved);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [updateResolved]);

  // 监听系统主题变化（仅在 system 模式下生效）
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  // 跨入口同步：监听 chrome.storage.onChanged
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[THEME_MODE_KEY]) {
        const next = changes[THEME_MODE_KEY].newValue as unknown;
        if (isValidMode(next) && next !== mode) {
          setModeState(next);
          updateResolved(next);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [mode, updateResolved]);

  const contextValue = useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode, setMode],
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextType {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return ctx;
}

export default ThemeModeProvider;
