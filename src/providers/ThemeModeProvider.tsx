import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { browser } from 'wxt/browser';
import { storageUtil } from '@/utils/chromeStorage';
import {
  applyResolvedThemeClass,
  getThemeSyncSnapshot,
  isValidThemeMode,
  persistThemeModeSnapshot,
  resolveThemeMode,
  THEME_MODE_STORAGE_KEY,
  type ResolvedThemeMode,
  type ThemeMode,
} from '@/utils/themeSnapshot';

export type { ResolvedThemeMode, ThemeMode };

interface ThemeModeContextType {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | null>(null);

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(getThemeSyncSnapshot);
  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(() =>
    resolveThemeMode(getThemeSyncSnapshot()),
  );
  const modeRef = useRef(mode);
  const hasUserSetMode = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const updateResolved = useCallback((nextMode: ThemeMode) => {
    setResolvedMode(resolveThemeMode(nextMode));
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      hasUserSetMode.current = true;
      setModeState(next);
      updateResolved(next);
      applyResolvedThemeClass(resolveThemeMode(next));

      void storageUtil.set(THEME_MODE_STORAGE_KEY, next).catch((err) => {
        console.error('[Theme Storage Error] Failed to persistent theme state:', err);
      });

      persistThemeModeSnapshot(next);
    },
    [updateResolved],
  );

  useEffect(() => {
    let cancelled = false;

    storageUtil
      .get(THEME_MODE_STORAGE_KEY, 'system')
      .then((saved) => {
        if (cancelled || hasUserSetMode.current) return;
        if (!isValidThemeMode(saved)) return;

        setModeState(saved);
        updateResolved(saved);
        persistThemeModeSnapshot(saved);
        applyResolvedThemeClass(resolveThemeMode(saved));
      })
      .catch((err) => {
        console.error('[Theme Restore Thread Failed]', err);
      });

    return () => {
      cancelled = true;
    };
  }, [updateResolved]);

  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setResolvedMode(event.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    const handleStorageChange = (changes: Record<string, { newValue?: unknown }>) => {
      if (!changes[THEME_MODE_STORAGE_KEY]) return;

      const next = changes[THEME_MODE_STORAGE_KEY].newValue;
      if (!isValidThemeMode(next) || next === modeRef.current) return;

      setModeState(next);
      updateResolved(next);
      persistThemeModeSnapshot(next);
      applyResolvedThemeClass(resolveThemeMode(next));
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [updateResolved]);

  useLayoutEffect(() => {
    applyResolvedThemeClass(resolvedMode);
  }, [resolvedMode]);

  return (
    <ThemeModeContext.Provider value={{ mode, resolvedMode, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
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
