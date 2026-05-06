import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, useRouter } from '@/providers/RouterProvider';
import { storageUtil } from '@/utils/chromeStorage';

// Mock storageUtil
vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

// Helper component to test useRouter
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
    // Mock chrome.storage.onChanged
    (global as any).chrome = {
      storage: {
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    };
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
      btn.click();
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

  it('应该独立支持 visiblePagesKey 和 pageOrderKey', async () => {
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
      expect(screen.getByTestId('visible-pages')).toHaveTextContent('timestamp,storageCleaner');
      expect(screen.getByTestId('page-order')).toHaveTextContent('storageCleaner,timestamp');
    });
  });
});
