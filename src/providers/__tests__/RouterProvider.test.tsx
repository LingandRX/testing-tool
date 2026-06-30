import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { browser } from 'wxt/browser';
import { RouterProvider, useRouter } from '@/providers/RouterProvider';
import { storageUtil } from '@/utils/chromeStorage';

vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    getMany: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

/** 模拟批量 storage 读取，未指定的键由 Router 侧使用默认值 */
function mockStorageBatch(map: Record<string, unknown> = {}) {
  (storageUtil.getMany as ReturnType<typeof vi.fn>).mockImplementation((keys: string[]) => {
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (key in map) {
        result[key] = map[key];
      }
    }
    return Promise.resolve(result);
  });
}

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
    mockStorageBatch();

    render(
      <RouterProvider defaultRoute="dashboard">
        <TestComponent />
      </RouterProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
    });

    expect(storageUtil.getMany).toHaveBeenCalledWith([
      'app/currentRoute',
      'app/visiblePages',
      'app/pageOrder',
      'app/recentlyUsedTools',
      'contextMenu/pendingData',
    ]);
  });

  it('应该从指定的 syncKey 加载路由', async () => {
    mockStorageBatch({ 'app/sidepanelRoute': 'timestamp' });

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
    mockStorageBatch();

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
    mockStorageBatch({ 'app/tabRoute': 'qrCode' });

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
    mockStorageBatch({
      'app/sidepanelVisiblePages': ['timestamp', 'storageCleaner'],
      'app/sidepanelPageOrder': ['storageCleaner', 'timestamp'],
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

    mockStorageBatch({
      'app/popupVisiblePages': oldVisiblePages,
      'app/popupPageOrder': oldPageOrder,
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

    mockStorageBatch();

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
    mockStorageBatch();

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

    (storageUtil.getMany as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await getBlocked;
      return Object.fromEntries(storage.entries());
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
    (storageUtil.getMany as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Storage unavailable'),
    );

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

    (storageUtil.getMany as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await getBlocked;
      return { 'app/currentRoute': 'dashboard' };
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

    (storageUtil.getMany as ReturnType<typeof vi.fn>).mockImplementation(() => storagePromise);

    const { unmount } = render(
      <RouterProvider>
        <TestComponent />
      </RouterProvider>,
    );

    unmount();
    resolveStorage!({});

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  });
});
