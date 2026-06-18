import {
  applyResolvedThemeClass,
  applyThemeFromSnapshot,
  getThemeSyncSnapshot,
  persistThemeModeSnapshot,
  resolveThemeMode,
  THEME_MODE_SNAPSHOT_KEY,
} from '@/utils/themeSnapshot';

describe('themeSnapshot', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('应从未知快照值回退到 system', () => {
    localStorage.setItem(THEME_MODE_SNAPSHOT_KEY, JSON.stringify('invalid'));
    expect(getThemeSyncSnapshot()).toBe('system');
  });

  it('resolveThemeMode 应解析 system 为当前系统主题', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);

    expect(resolveThemeMode('dark')).toBe('dark');
    expect(resolveThemeMode('system')).toBe('dark');
  });

  it('applyThemeFromSnapshot 应根据快照同步 dark 类', () => {
    persistThemeModeSnapshot('dark');
    applyThemeFromSnapshot();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applyResolvedThemeClass 移除 dark 时应清理 class', () => {
    document.documentElement.classList.add('dark');
    applyResolvedThemeClass('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
