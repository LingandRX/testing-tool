import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from '@/providers/RouterProvider';
import { useDashboard } from '../useDashboard';
import type { PageType } from '@/types/storage';

vi.mock('@/providers/RouterProvider', () => ({
  useRouter: vi.fn(),
}));

const mockNavigateTo = vi.fn();

function mockRouterState(
  overrides: {
    visiblePages?: PageType[];
    pageOrder?: PageType[];
    recentlyUsedTools?: PageType[];
  } = {},
) {
  vi.mocked(useRouter).mockReturnValue({
    currentPage: 'dashboard',
    visiblePages: overrides.visiblePages ?? ['dashboard', 'timestamp', 'jwt'],
    pageOrder: overrides.pageOrder ?? ['jwt', 'timestamp'],
    recentlyUsedTools: overrides.recentlyUsedTools ?? [],
    isLoaded: true,
    navigateTo: mockNavigateTo,
    goHome: vi.fn(),
    setVisiblePages: vi.fn(),
    setPageOrder: vi.fn(),
  });
}

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应透传 router 中的 navigateTo', () => {
    mockRouterState();

    const { result } = renderHook(() => useDashboard());

    expect(result.current.navigateTo).toBe(mockNavigateTo);
  });

  it('recentlyUsedTools 有可见工具时应显示最近使用', () => {
    mockRouterState({
      visiblePages: ['dashboard', 'timestamp', 'jwt'],
      recentlyUsedTools: ['timestamp', 'jwt'],
    });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.showRecent).toBe(true);
    expect(result.current.recentFeatures.map((item) => item.key)).toEqual(['timestamp', 'jwt']);
  });

  it('recentlyUsedTools 为空时不应显示最近使用', () => {
    mockRouterState({ recentlyUsedTools: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.showRecent).toBe(false);
    expect(result.current.recentFeatures).toEqual([]);
  });

  it('最近使用中的不可见工具应被过滤', () => {
    mockRouterState({
      visiblePages: ['dashboard', 'timestamp'],
      recentlyUsedTools: ['jwt', 'timestamp'],
    });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.showRecent).toBe(true);
    expect(result.current.recentFeatures.map((item) => item.key)).toEqual(['timestamp']);
  });
});
