import { act, render, screen, waitFor } from '@testing-library/react';
import { browser } from 'wxt/browser';
import { ThemeModeProvider, useThemeMode } from '@/providers/ThemeModeProvider';
import { storageUtil } from '@/utils/chromeStorage';
import { THEME_MODE_SNAPSHOT_KEY, THEME_MODE_STORAGE_KEY } from '@/utils/themeSnapshot';

vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

const TestComponent = () => {
  const { mode, resolvedMode, setMode } = useThemeMode();
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="resolved-mode">{resolvedMode}</div>
      <button type="button" data-testid="set-dark" onClick={() => setMode('dark')}>
        Set Dark
      </button>
    </div>
  );
};

describe('ThemeModeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    (storageUtil.get as ReturnType<typeof vi.fn>).mockImplementation(
      (_key: string, defaultValue: unknown) => Promise.resolve(defaultValue),
    );
  });

  it('应从 localStorage 快照初始化主题', () => {
    localStorage.setItem(THEME_MODE_SNAPSHOT_KEY, JSON.stringify('dark'));

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(storageUtil.get).not.toHaveBeenCalled();
  });

  it('异步恢复 storage 后应写回 snapshot', async () => {
    (storageUtil.get as ReturnType<typeof vi.fn>).mockResolvedValue('dark');

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    await waitFor(() => {
      expect(localStorage.getItem(THEME_MODE_SNAPSHOT_KEY)).toBe(JSON.stringify('dark'));
    });
  });

  it('用户已切换主题时不应被较慢的 storage 恢复覆盖', async () => {
    let resolveStorage: (value: 'light' | 'dark' | 'system') => void;
    const storagePromise = new Promise<'light' | 'dark' | 'system'>((resolve) => {
      resolveStorage = resolve;
    });

    (storageUtil.get as ReturnType<typeof vi.fn>).mockImplementation(() => storagePromise);

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    await act(async () => {
      screen.getByTestId('set-dark').click();
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');

    await act(async () => {
      resolveStorage!('light');
      await storagePromise;
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('storage.onChanged 同步时应更新 mode 与 snapshot', async () => {
    (storageUtil.get as ReturnType<typeof vi.fn>).mockResolvedValue('system');

    render(
      <ThemeModeProvider>
        <TestComponent />
      </ThemeModeProvider>,
    );

    await waitFor(() => {
      expect(browser.storage.onChanged.addListener).toHaveBeenCalled();
    });

    const storageChangeHandler = vi.mocked(browser.storage.onChanged.addListener).mock
      .calls[0][0] as (changes: Record<string, { newValue?: unknown }>) => void;

    await act(async () => {
      storageChangeHandler({
        [THEME_MODE_STORAGE_KEY]: { newValue: 'dark' },
      });
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(localStorage.getItem(THEME_MODE_SNAPSHOT_KEY)).toBe(JSON.stringify('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
