import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useStorageState } from '@/utils/useStorageState';
import { storageUtil } from '@/utils/chromeStorage';
import type { JsonToolsPageMode } from '@/types/storage';

// Mock storageUtil
vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

describe('useStorageState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('应该使用默认值初始化', () => {
    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    // 初始值应为默认值（无快照时）
    expect(result.current[0]).toBe(true);
  });

  it('应该从 localStorage 快照同步恢复初始值', () => {
    localStorage.setItem('snapshot/qrCode/urlExpanded', JSON.stringify(false));

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    // 初始值应从快照恢复，而非默认值
    expect(result.current[0]).toBe(false);
  });

  it('应该从 Chrome Storage 异步加载并覆盖初始值', async () => {
    (storageUtil.get as any).mockImplementation((_key: string, _defaultValue: any) =>
      Promise.resolve(false),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    // 初始值为默认值（无快照）
    expect(result.current[0]).toBe(true);

    await waitFor(() => {
      // 异步加载后应覆盖为存储值
      expect(result.current[0]).toBe(false);
      expect(result.current[2]).toBe(true);
    });
  });

  it('状态变化时应该保存到 Chrome Storage 和 localStorage 快照', async () => {
    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(storageUtil.set).toHaveBeenCalledWith('qrCode/urlExpanded', false);

    expect(localStorage.getItem('snapshot/qrCode/urlExpanded')).toBe(JSON.stringify(false));
  });

  it('应该支持验证器 - 合法值通过', async () => {
    const validator = (val: unknown): val is JsonToolsPageMode =>
      typeof val === 'string' &&
      (['diff', 'format', 'yaml', 'toml', 'minify'] as string[]).includes(val);

    (storageUtil.get as any).mockImplementation(() => Promise.resolve('yaml'));

    const { result } = renderHook(() => useStorageState('jsonTools/pageMode', 'diff', validator));

    await waitFor(() => {
      expect(result.current[0]).toBe('yaml');
    });
  });

  it('应该支持验证器 - 非法值回退到默认值', async () => {
    const validator = (val: unknown): val is JsonToolsPageMode =>
      typeof val === 'string' &&
      (['diff', 'format', 'yaml', 'toml', 'minify'] as string[]).includes(val);

    (storageUtil.get as any).mockImplementation(() => Promise.resolve('invalidMode'));

    const { result } = renderHook(() => useStorageState('jsonTools/pageMode', 'diff', validator));

    await waitFor(() => {
      // 非法值应回退到默认值
      expect(result.current[0]).toBe('diff');
    });
  });

  it('快照中的非法值应被验证器拒绝，回退到默认值', () => {
    const validator = (val: unknown): val is JsonToolsPageMode =>
      typeof val === 'string' &&
      (['diff', 'format', 'yaml', 'toml', 'minify'] as string[]).includes(val);

    // 在 localStorage 中存入一个非法值
    localStorage.setItem('snapshot/jsonTools/pageMode', JSON.stringify('invalidMode'));

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('jsonTools/pageMode', 'diff', validator));

    // 快照中的非法值应被拒绝，使用默认值
    expect(result.current[0]).toBe('diff');
  });

  it('快照中的合法值应被验证器接受', () => {
    const validator = (val: unknown): val is JsonToolsPageMode =>
      typeof val === 'string' &&
      (['diff', 'format', 'yaml', 'toml', 'minify'] as string[]).includes(val);

    // 在 localStorage 中存入一个合法值
    localStorage.setItem('snapshot/jsonTools/pageMode', JSON.stringify('minify'));

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('jsonTools/pageMode', 'diff', validator));

    // 快照中的合法值应被接受
    expect(result.current[0]).toBe('minify');
  });

  it('快照中损坏的 JSON 应被忽略，回退到默认值', () => {
    localStorage.setItem('snapshot/qrCode/urlExpanded', 'not-valid-json{');

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    // 损坏的快照应被忽略
    expect(result.current[0]).toBe(true);
  });

  it('isInitialized 在异步加载完成前应为 false', () => {
    // 让 Chrome Storage 永远不 resolve
    (storageUtil.get as any).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    expect(result.current[2]).toBe(false);
  });

  it('用户在异步加载完成前修改状态时，不应被存储值覆盖', async () => {
    let resolveLoad: (value: boolean) => void = () => {};
    (storageUtil.get as any).mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    const { result } = renderHook(() => useStorageState('qrCode/urlExpanded', true));

    expect(result.current[0]).toBe(true);

    await act(async () => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);

    await act(async () => {
      resolveLoad(true);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toBe(false);
    expect(storageUtil.set).toHaveBeenCalledWith('qrCode/urlExpanded', false);
  });

  it('加载失败时不应把快照默认值写回 Chrome Storage', async () => {
    localStorage.setItem('snapshot/app/searchHistory', JSON.stringify([]));

    (storageUtil.get as any).mockRejectedValue(new Error('Storage read failed'));

    renderHook(() =>
      useStorageState('app/searchHistory', [], (val): val is string[] => Array.isArray(val)),
    );

    await waitFor(() => {
      expect(storageUtil.set).not.toHaveBeenCalled();
    });
  });
});
