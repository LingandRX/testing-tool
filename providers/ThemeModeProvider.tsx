import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storageUtil } from '@/utils/chromeStorage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

interface ThemeModeContextType {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
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
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [updateResolved]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
  }, [resolvedMode]);

  const contextValue = useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode, setMode],
  );

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeContextType {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return ctx;
}

export default ThemeModeProvider;
