import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { browser } from 'wxt/browser'; // 💡 1. 规范回归：引入 WXT 标准多端一致性代理，消灭裸奔的 chrome 空间
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

  // 统一的实态转换调度中枢
  const updateResolved = useCallback((nextMode: ThemeMode) => {
    setResolvedMode(nextMode === 'system' ? getSystemMode() : nextMode);
  }, []);

  // 主动切流触发大闸
  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      updateResolved(next);

      // 💡 修复点：对异步微任务链追加标准的显式 void 断链安全隔离，彻底净化 Linter 悬空 Promise 警告
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

  // 副作用 1：冷启动时异步对齐来自长期存储的权威配置，自愈快照偏差
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

  // 副作用 2：当处于跟随系统模式下，动态监听操作系统级别的高级霓虹换色
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  // 副作用 3：跨上下文广播事件同步大闸（Popup <-> Sidepanel 联动核心）
  useEffect(() => {
    // 💡 2. 强类型对齐修复：对齐标准的 browser.storage.onChanged.addListener 签名规范
    const handleStorageChange = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[THEME_MODE_KEY]) {
        const next = changes[THEME_MODE_KEY].newValue;
        if (isValidMode(next)) {
          // 💡 3. 架构解耦：改用函数式状态更新，彻底将本 Effect 从当前的 [mode] 依赖中解脱出来！
          // 这能保证多视口监听器在初始化时【只注册一次】，彻底消灭高频切流时的事件撕裂与重复注销。
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
  }, [updateResolved]); // 👈 完美剔除 mode 脏依赖！

  // 副作用 4：宿主 DOM 的 class 样式原子映射注入（一帧直出）
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
