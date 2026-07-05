import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PageType } from '@/types/storage';
import FeatureNav from '@/layout/FeatureNav';

const mockNavigateTo = vi.fn();

const mockRouterValue = {
  currentPage: 'timestamp' as PageType,
  visiblePages: ['timestamp', 'jwt', 'storageCleaner'] as PageType[],
  pageOrder: ['jwt', 'timestamp', 'storageCleaner'] as PageType[],
  recentlyUsedTools: [] as PageType[],
  isLoaded: true,
  navigateTo: mockNavigateTo,
  setVisiblePages: vi.fn(),
  setPageOrder: vi.fn(),
};

vi.mock('@/providers/RouterProvider', () => ({
  useRouter: () => mockRouterValue,
}));

describe('FeatureNav 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterValue.currentPage = 'timestamp';
    mockRouterValue.pageOrder = ['jwt', 'timestamp', 'storageCleaner'];
    mockRouterValue.visiblePages = ['timestamp', 'jwt', 'storageCleaner'];
  });

  it('应渲染全部可见工具图标', () => {
    render(<FeatureNav />);

    expect(screen.getByLabelText('JWT 解析')).toBeInTheDocument();
    expect(screen.getByLabelText('时间戳')).toBeInTheDocument();
    expect(screen.getByLabelText('存储清理')).toBeInTheDocument();
  });

  it('点击图标应调用 navigateTo', () => {
    render(<FeatureNav />);

    fireEvent.click(screen.getByLabelText('JWT 解析'));
    expect(mockNavigateTo).toHaveBeenCalledWith('jwt');
  });

  it('当前页对应项应有 active 样式与 aria-current', () => {
    render(<FeatureNav />);

    const activeButton = screen.getByLabelText('时间戳');
    expect(activeButton).toHaveAttribute('aria-current', 'page');
    expect(activeButton).toHaveClass('bg-muted');
    expect(activeButton).toHaveClass('border-primary');
  });
});
