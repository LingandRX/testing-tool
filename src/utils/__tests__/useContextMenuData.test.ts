import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContextMenuData, saveContextMenuData } from '@/utils/useContextMenuData';

describe('useContextMenuData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('saveContextMenuData', () => {
    it('应该保存数据到 storage 并添加时间戳', async () => {
      const data = { featureKey: 'jwt' as const, payload: 'test-token' };
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

      await saveContextMenuData(data);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'contextMenu/pendingData': {
          featureKey: 'jwt',
          payload: 'test-token',
          timestamp: 1704110400000,
        },
      });
    });

    it('应该正确处理不同的 featureKey', async () => {
      const data = { featureKey: 'timestamp' as const, payload: '1234567890' };

      await saveContextMenuData(data);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'contextMenu/pendingData': expect.objectContaining({
            featureKey: 'timestamp',
            payload: '1234567890',
          }),
        }),
      );
    });
  });

  describe('useContextMenuData Hook', () => {
    it('当 storage 中有匹配数据时应调用 onData 回调', async () => {
      const mockData = {
        featureKey: 'jwt',
        payload: 'test-token',
        timestamp: Date.now(),
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'contextMenu/pendingData': mockData,
      });

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      await vi.waitFor(() => {
        expect(onData).toHaveBeenCalledWith('test-token');
      });
    });

    it('当 storage 中没有数据时不应调用 onData 回调', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      await vi.waitFor(() => {
        expect(onData).not.toHaveBeenCalled();
      });
    });

    it('当 featureKey 不匹配时不应调用 onData 回调', async () => {
      const mockData = {
        featureKey: 'timestamp',
        payload: '1234567890',
        timestamp: Date.now(),
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'contextMenu/pendingData': mockData,
      });

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      await vi.waitFor(() => {
        expect(onData).not.toHaveBeenCalled();
      });
    });

    it('当数据过期时不应调用 onData 回调并删除数据', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const mockData = {
        featureKey: 'jwt',
        payload: 'test-token',
        timestamp: now - 6000,
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'contextMenu/pendingData': mockData,
      });

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      await vi.waitFor(() => {
        expect(onData).not.toHaveBeenCalled();
        expect(chrome.storage.local.remove).toHaveBeenCalledWith(['contextMenu/pendingData']);
      });
    });

    it('消费数据后应删除 storage 中的数据', async () => {
      const mockData = {
        featureKey: 'jwt',
        payload: 'test-token',
        timestamp: Date.now(),
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'contextMenu/pendingData': mockData,
      });

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      await vi.waitFor(() => {
        expect(chrome.storage.local.remove).toHaveBeenCalledWith(['contextMenu/pendingData']);
      });
    });

    it('当 storage 变化且 featureKey 匹配时应调用 onData 回调', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      const storageChangeHandler = (chrome.storage.onChanged.addListener as any).mock.calls[0][0];

      const mockData = {
        featureKey: 'jwt',
        payload: 'new-token',
        timestamp: Date.now(),
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'contextMenu/pendingData': mockData,
      });

      await act(async () => {
        storageChangeHandler({
          'contextMenu/pendingData': { newValue: mockData },
        });
      });

      await vi.waitFor(() => {
        expect(onData).toHaveBeenCalledWith('new-token');
      });
    });

    it('当 storage 变化但 featureKey 不匹配时不应调用 onData 回调', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      const storageChangeHandler = (chrome.storage.onChanged.addListener as any).mock.calls[0][0];

      const mockData = {
        featureKey: 'timestamp',
        payload: '1234567890',
        timestamp: Date.now(),
      };

      await act(async () => {
        storageChangeHandler({
          'contextMenu/pendingData': { newValue: mockData },
        });
      });

      expect(onData).not.toHaveBeenCalled();
    });

    it('当 storage 变化但数据被删除时不应调用 onData 回调', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const onData = vi.fn();
      renderHook(() => useContextMenuData({ featureKey: 'jwt', onData }));

      const storageChangeHandler = (chrome.storage.onChanged.addListener as any).mock.calls[0][0];

      await act(async () => {
        storageChangeHandler({
          'contextMenu/pendingData': { newValue: null },
        });
      });

      expect(onData).not.toHaveBeenCalled();
    });

    it('组件卸载时应移除 storage 变化监听器', () => {
      const { unmount } = renderHook(() =>
        useContextMenuData({ featureKey: 'jwt', onData: vi.fn() }),
      );

      unmount();

      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
    });
  });
});
