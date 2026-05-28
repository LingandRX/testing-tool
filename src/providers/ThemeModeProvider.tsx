import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { browser } from 'wxt/browser';
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

/**
 * 同步追溯 localStorage 级快照（首屏 0 闪烁核心防线）
 */
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

/**
 * 实时嗅探系统底层操作系统的明暗色轴
 */
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

      void storageUtil.set(THEME_MODE_KEY, next).catch((err) => {
        console.error('[Theme Storage Error] Failed to persistent theme state:', err);
      });

      try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('[Theme Snapshot Error] LocalStorage quota exceeded:', err);
      }
    },
    [updateResolved],
  );

  // Sync theme from storage on mount
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
      .catch((err) => {
        console.error('[Theme Restore Thread Failed]', err);
      });
    return () => {
      cancelled = true;
    };
  }, [updateResolved]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  // Sync theme across extension contexts (popup <-> sidepanel)
  useEffect(() => {
    const handleStorageChange = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[THEME_MODE_KEY]) {
        const next = changes[THEME_MODE_KEY].newValue;
        if (isValidMode(next)) {
          setModeState((currentMode) => {
            if (next !== currentMode) {
              updateResolved(next);
              return next;
            }
            return currentMode;
          });
        }
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [updateResolved]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
    }
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
    throw new Error(
      'useThemeMode must be used within a valid ThemeModeProvider sandboxed container',
    );
  }
  return ctx;
}

export default ThemeModeProvider;
