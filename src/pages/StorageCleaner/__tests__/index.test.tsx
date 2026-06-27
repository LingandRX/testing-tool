import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { browser } from 'wxt/browser';
import Index from '../index';
import { clearStorage, getCookieSize, getCurrentTab } from '@/utils/storageCleaner';
import { toast } from 'sonner';

vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/utils/storageCleaner', () => ({
  getCurrentTab: vi.fn().mockResolvedValue({ id: 1, url: 'https://example.com' }),
  getCookieSize: vi.fn().mockResolvedValue(0),
  getLocalStorageSize: vi.fn().mockResolvedValue(0),
  getSessionStorageSize: vi.fn().mockResolvedValue(0),
  getOriginStorageEstimate: vi.fn().mockResolvedValue(0),
  getCacheStorageSize: vi.fn().mockResolvedValue(0),
  getServiceWorkerCount: vi.fn().mockResolvedValue(0),
  clearStorage: vi.fn().mockResolvedValue({ overallSuccess: true }),
  formatCleaningResult: vi.fn().mockReturnValue('Cleaned successfully'),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('StorageCleaner 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentTab).mockResolvedValue({ id: 1, url: 'https://example.com' } as any);
    vi.mocked(clearStorage).mockResolvedValue({ overallSuccess: true });
  });

  it('应该渲染初始化加载状态', () => {
    render(<Index />);
    expect(screen.getByText(/正在读取数据/)).toBeInTheDocument();
  });

  it('读取当前标签页失败时应显示错误提示', async () => {
    vi.mocked(getCurrentTab).mockRejectedValueOnce(new Error('Tabs unavailable'));

    render(<Index />);

    expect(await screen.findByText('读取数据失败')).toBeInTheDocument();
  });

  it('确认清理前如果当前标签页变为受限页面，不应执行清理', async () => {
    render(<Index />);

    const cleanButton = await screen.findByRole('button', { name: /立即清理/ });
    fireEvent.click(cleanButton);

    vi.mocked(getCurrentTab).mockResolvedValueOnce({
      id: 1,
      url: 'chrome://extensions',
    } as any);
    fireEvent.click(screen.getByRole('button', { name: /确认清理/ }));

    await waitFor(() => {
      expect(clearStorage).not.toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalledWith('存储清理功能不支持此页面');
    });
  });

  it('自动刷新后应等待标签页完成加载并重新读取信息后再允许再次清理', async () => {
    const tabUpdatedListeners: Array<(tabId: number, changeInfo: { status?: string }) => void> = [];
    (browser.tabs.onUpdated.addListener as any).mockImplementation((listener: any) => {
      tabUpdatedListeners.push(listener);
    });
    (browser.tabs.onUpdated.removeListener as any).mockImplementation((listener: any) => {
      const index = tabUpdatedListeners.indexOf(listener);
      if (index >= 0) tabUpdatedListeners.splice(index, 1);
    });

    render(<Index />);

    const cleanButton = await screen.findByRole('button', { name: /立即清理/ });
    fireEvent.click(cleanButton);
    fireEvent.click(screen.getByRole('button', { name: /确认清理/ }));

    await waitFor(() => expect(browser.tabs.reload).toHaveBeenCalledWith(1));

    const loadingButton = screen.getByRole('button', { name: /正在清理/ });
    expect(loadingButton).toBeDisabled();
    fireEvent.click(loadingButton);
    expect(clearStorage).toHaveBeenCalledTimes(1);

    const reloadListener = tabUpdatedListeners.at(-1);
    expect(reloadListener).toBeDefined();
    reloadListener?.(1, { status: 'complete' });

    await waitFor(() => {
      expect(getCookieSize).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('button', { name: /立即清理/ })).not.toBeDisabled();
    });
  });

  it('展示的数据与当前标签页不一致时不应执行清理', async () => {
    let currentTabId = 1;
    vi.mocked(getCurrentTab).mockImplementation(
      async () =>
        ({
          id: currentTabId,
          url: currentTabId === 1 ? 'https://a.example.com' : 'https://b.example.com',
        }) as any,
    );

    render(<Index />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /立即清理/ })).not.toBeDisabled();
    });

    currentTabId = 2;

    fireEvent.click(screen.getByRole('button', { name: /立即清理/ }));
    fireEvent.click(screen.getByRole('button', { name: /确认清理/ }));

    await waitFor(() => {
      expect(clearStorage).not.toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalledWith('当前页面已变更，请等待数据刷新后再清理');
    });
  });

  it('同一标签页 URL 变更后、数据刷新完成前不应执行清理', async () => {
    let currentUrl = 'https://a.example.com';
    vi.mocked(getCurrentTab).mockImplementation(
      async () =>
        ({
          id: 1,
          url: currentUrl,
        }) as any,
    );

    render(<Index />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /立即清理/ })).not.toBeDisabled();
    });

    currentUrl = 'https://b.example.com';

    fireEvent.click(screen.getByRole('button', { name: /立即清理/ }));
    fireEvent.click(screen.getByRole('button', { name: /确认清理/ }));

    await waitFor(() => {
      expect(clearStorage).not.toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalledWith('当前页面已变更，请等待数据刷新后再清理');
    });
  });
});
