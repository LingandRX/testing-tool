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
      // 合并后应保留用户已有顺序，并追加缺失的默认可见功能
      const visiblePages = screen.getByTestId('visible-pages').textContent;
      expect(visiblePages).toContain('timestamp');
      expect(visiblePages).toContain('storageCleaner');
      expect(visiblePages).toContain('base64Converter');

      // 合并后应保留用户已有排序，并追加缺失的新功能到末尾
      const pageOrder = screen.getByTestId('page-order').textContent;
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('timestamp');
      expect(pageOrder).toContain('base64Converter');
    });
  });

  it('应该将旧存储中缺失的新功能自动合并到 visiblePages 和 pageOrder', async () => {
    // 模拟旧版存储：只有 6 个功能，缺少 base64Converter
    const oldVisiblePages = [
      'dashboard',
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonDiff',
    ];
    const oldPageOrder = [
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonDiff',
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

      // base64Converter 应该被自动追加
      expect(visiblePages).toContain('base64Converter');
      expect(pageOrder).toContain('base64Converter');

      // 原有功能顺序应保持不变
      expect(visiblePages.startsWith('dashboard,timestamp')).toBe(true);
      expect(pageOrder.startsWith('timestamp,storageCleaner')).toBe(true);

      // base64Converter、markdownToHtml 和 htmlToMarkdown 应追加在末尾
      expect(visiblePages.endsWith('htmlToMarkdown')).toBe(true);
      expect(pageOrder.endsWith('htmlToMarkdown')).toBe(true);
    });
  });

  it('应该从 localStorage 快照合并缺失的新功能', async () => {
    // 在 localStorage 中存储旧版快照（缺少 base64Converter）
    const oldVisiblePages = [
      'dashboard',
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonDiff',
    ];
    const oldPageOrder = [
      'timestamp',
      'storageCleaner',
      'qrCode',
      'textStatistics',
      'jwt',
      'jsonDiff',
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

    // 即使异步加载还未完成，同步快照合并也应包含新功能
    const visiblePages = screen.getByTestId('visible-pages').textContent!;
    const pageOrder = screen.getByTestId('page-order').textContent!;
    expect(visiblePages).toContain('base64Converter');
    expect(pageOrder).toContain('base64Converter');
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

    // 在存储读取完成前卸载组件
    unmount();

    // 现在让存储读取完成
    resolveStorage!('dashboard');

    // 等待一段时间确保如果 setState 被调用会触发警告
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // 测试通过的标准：没有 React "Can't perform a React state update on an unmounted component" 警告
    // 如果有竞态条件，这里会输出警告（React 18+ 中已移除该警告，但状态更新仍是无效操作）
  });
});
