import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/providers/ThemeModeProvider';

export interface UseThemeToggleReturn {
  ThemeIcon: typeof Sun;
  themeTitle: string;
  cycleThemeMode: () => void;
}

export function useThemeToggle(): UseThemeToggleReturn {
  const { mode, setMode } = useThemeMode();

  const cycleThemeMode = () => {
    const nextMap = { light: 'dark', dark: 'system', system: 'light' } as const;
    setMode(nextMap[mode]);
  };

  const ThemeIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;

  const themeTitle =
    mode === 'light' ? '切换到深色模式' : mode === 'dark' ? '切换到系统模式' : '切换到浅色模式';

  return { ThemeIcon, themeTitle, cycleThemeMode };
}
