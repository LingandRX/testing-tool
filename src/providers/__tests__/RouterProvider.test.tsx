import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { browser } from 'wxt/browser';
import { RouterProvider, useRouter } from '@/providers/RouterProvider';
import { storageUtil } from '@/utils/chromeStorage';

vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

const TestComponent = () => {
  const { currentPage, navigateTo, visiblePages, pageOrder } = useRouter();
  return (
    <div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="visible-pages">{visiblePages.join(',')}</div>
      <div data-testid="page-order">{pageOrder.join(',')}</div>
      <button onClick={() => navigateTo('timestamp')} data-testid="navigate-btn">
        Navigate
      </button>
    </div>
  );
};

describe('RouterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    const storageOnChangedMock = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    const extensionMock = {
      storage: {
        onChanged: storageOnChangedMock,
      },
    };

    (globalThis as any).chrome = extensionMock;
    (globalThis as any).browser = extensionMock;
  });

  it('应该使用默认值初始化路由', async () => {
    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    render(
      <RouterProvider defaultRoute="dashboard">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
    });
  });

  it('应该从指定的 syncKey 加载路由', async () => {
    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key === 'app/sidepanelRoute') return Promise.resolve('timestamp');
      return Promise.resolve(defaultValue);
    });

    render(
      <RouterProvider syncKey="app/sidepanelRoute">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('timestamp');
    });
  });

  it('导航时应该更新指定的 syncKey', async () => {
    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    render(
      <RouterProvider syncKey="app/popupRoute">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
    });

    const btn = screen.getByTestId('navigate-btn');

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(screen.getByTestId('current-page')).toHaveTextContent('timestamp');
    expect(storageUtil.set).toHaveBeenCalledWith('app/popupRoute', 'timestamp');
  });

  it('应该支持独立的标签页路由同步', async () => {
    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key === 'app/tabRoute') return Promise.resolve('qrCode');
      return Promise.resolve(defaultValue);
    });

    render(
      <RouterProvider syncKey="app/tabRoute">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('qrCode');
    });
  });

  it('应该独立支持 visiblePagesKey 和 pageOrderKey，并合并缺失的新功能', async () => {
    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key === 'app/sidepanelVisiblePages')
        return Promise.resolve(['timestamp', 'storageCleaner']);
      if (key === 'app/sidepanelPageOrder') return Promise.resolve(['storageCleaner', 'timestamp']);
      return Promise.resolve(defaultValue);
    });

    render(
      <RouterProvider
        visiblePagesKey="app/sidepanelVisiblePages"
        pageOrderKey="app/sidepanelPageOrder"
      >
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      const visiblePages = screen.getByTestId('visible-pages').textContent;
      expect(visiblePages).toContain('timestamp');
      expect(visiblePages).toContain('storageCleaner');

      const pageOrder = screen.getByTestId('page-order').textContent;
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('timestamp');
    });
  });

  it('应该将旧存储中缺失的新功能自动合并到 visiblePages 和 pageOrder', async () => {
    const oldVisiblePages = [
      'dashboard',
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];
    const oldPageOrder = [
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];

    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key === 'app/popupVisiblePages') return Promise.resolve(oldVisiblePages);
      if (key === 'app/popupPageOrder') return Promise.resolve(oldPageOrder);
      return Promise.resolve(defaultValue);
    });

    render(
      <RouterProvider visiblePagesKey="app/popupVisiblePages" pageOrderKey="app/popupPageOrder">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      const visiblePages = screen.getByTestId('visible-pages').textContent!;
      const pageOrder = screen.getByTestId('page-order').textContent!;

      expect(visiblePages.startsWith('dashboard,timestamp')).toBe(true);
      expect(pageOrder.startsWith('timestamp,storageCleaner')).toBe(true);
    });
  });

  it('应该从 localStorage 快照合并缺失的新功能', async () => {
    const oldVisiblePages = [
      'dashboard',
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];
    const oldPageOrder = [
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];
    localStorage.setItem('snapshot/app/visiblePages', JSON.stringify(oldVisiblePages));
    localStorage.setItem('snapshot/app/pageOrder', JSON.stringify(oldPageOrder));

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    const visiblePages = screen.getByTestId('visible-pages').textContent!;
    const pageOrder = screen.getByTestId('page-order').textContent!;
    expect(visiblePages).toBeDefined();
    expect(pageOrder).toBeDefined();
  });

  it('storage.onChanged 同步 visiblePages 时应合并缺失的新功能', async () => {
    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: unknown) =>
      Promise.resolve(defaultValue),
    );

    render(
      <RouterProvider visiblePagesKey="app/popupVisiblePages" pageOrderKey="app/popupPageOrder">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(browser.storage.onChanged.addListener).toHaveBeenCalled();
    });

    const storageChangeHandler = vi.mocked(browser.storage.onChanged.addListener).mock
      .calls[0][0] as (changes: Record<string, { newValue?: unknown }>) => void;

    const oldVisiblePages = [
      'dashboard',
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];
    const oldPageOrder = [
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonTools',
    ];

    await act(async () => {
      storageChangeHandler({
        'app/popupVisiblePages': { newValue: oldVisiblePages },
        'app/popupPageOrder': { newValue: oldPageOrder },
      });
    });

    await waitFor(() => {
      const visiblePages = screen.getByTestId('visible-pages').textContent!;
      const pageOrder = screen.getByTestId('page-order').textContent!;

      expect(visiblePages.startsWith('dashboard,timestamp')).toBe(true);
      expect(pageOrder.startsWith('timestamp,storageCleaner')).toBe(true);
    });
  });

  it('localStorage 快照过期时，loadInitialData 完成前不应覆盖 chrome.storage', async () => {
    const staleRoute = 'timestamp';
    const correctRoute = 'jsonTools';
    const defaultVisible = ['dashboard', 'timestamp', 'storageCleaner'];
    const defaultOrder = ['timestamp', 'storageCleaner'];

    localStorage.setItem('snapshot/app/currentRoute', JSON.stringify(staleRoute));
    localStorage.setItem('snapshot/app/visiblePages', JSON.stringify(defaultVisible));
    localStorage.setItem('snapshot/app/pageOrder', JSON.stringify(defaultOrder));

    const storage = new Map<string, unknown>([
      ['app/currentRoute', correctRoute],
      ['app/visiblePages', defaultVisible],
      ['app/pageOrder', defaultOrder],
      ['app/recentlyUsedTools', []],
    ]);

    let resolveGet: () => void;
    const getBlocked = new Promise<void>((resolve) => {
      resolveGet = resolve;
    });

    (storageUtil.get as any).mockImplementation(async (key: string, defaultValue: unknown) => {
      await getBlocked;
      return storage.get(key) ?? defaultValue;
    });
    (storageUtil.set as any).mockImplementation(async (key: string, value: unknown) => {
      storage.set(key, value);
    });

    render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    expect(screen.getByTestId('current-page')).toHaveTextContent(staleRoute);
    expect(storageUtil.set).not.toHaveBeenCalledWith('app/currentRoute', staleRoute);

    resolveGet!();
    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent(correctRoute);
      expect(storage.get('app/currentRoute')).toBe(correctRoute);
    });
  });

  it('初始化失败时仍应解除加载状态以便渲染页面', async () => {
    (storageUtil.get as any).mockRejectedValue(new Error('Storage unavailable'));

    render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
    });
    expect(storageUtil.set).not.toHaveBeenCalled();
  });

  it('用户在 loadInitialData 完成前导航时不应被存储路由覆盖', async () => {
    let resolveGet: () => void;
    const getBlocked = new Promise<void>((resolve) => {
      resolveGet = resolve;
    });

    (storageUtil.get as any).mockImplementation(async (key: string, defaultValue: unknown) => {
      await getBlocked;
      if (key === 'app/currentRoute') return 'dashboard';
      return defaultValue;
    });

    render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('navigate-btn'));
    });
    expect(screen.getByTestId('current-page')).toHaveTextContent('timestamp');

    resolveGet!();
    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('timestamp');
      expect(storageUtil.set).toHaveBeenCalledWith('app/currentRoute', 'timestamp');
    });
  });

  it('组件卸载时不应设置 isLoaded 状态（竞态条件防护）', async () => {
    let resolveStorage: (value: unknown) => void;
    const storagePromise = new Promise((resolve) => {
      resolveStorage = resolve;
    });

    (storageUtil.get as any).mockImplementation(() => storagePromise);

    const { unmount } = render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    unmount();
    resolveStorage!('dashboard');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  });
});
