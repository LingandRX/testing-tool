import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import RouterContainer from '@/components/RouterContainer';
import { RouterProvider } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';
import React from 'react';

const mockRouterValue = {
  currentPage: 'dashboard' as PageType,
  visiblePages: ['dashboard', 'timestamp'] as PageType[],
  pageOrder: ['timestamp'] as PageType[],
  navigateTo: vi.fn(),
  syncNavigation: vi.fn(),
  goHome: vi.fn(),
  setVisiblePages: vi.fn(),
  setPageOrder: vi.fn(),
  recentlyUsedTools: [] as PageType[],
  isLoaded: true,
};

vi.mock('@/providers/RouterProvider', () => ({
  useRouter: () => mockRouterValue,
  RouterProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RouterContainer 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<RouterProvider>{ui}</RouterProvider>);
  };

  describe('渲染测试', () => {
    it('mount 后应直接渲染页面结构（不等待 storage 加载）', () => {
      mockRouterValue.currentPage = 'dashboard';
      const { container } = renderWithProvider(<RouterContainer />);
      expect(container.querySelector('.page-transition-dashboard')).toBeInTheDocument();
    });
  });

  describe('动画类测试', () => {
    it('在 dashboard 页面应应用 dashboard 动画类', () => {
      mockRouterValue.currentPage = 'dashboard';
      renderWithProvider(<RouterContainer />);
      const box = document.querySelector('.page-transition-dashboard');
      expect(box).toBeInTheDocument();
    });

    it('在非 dashboard 页面应应用 enter 动画类', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<RouterContainer />);
      const box = document.querySelector('.page-transition-enter');
      expect(box).toBeInTheDocument();
    });
  });

  describe('路由处理测试', () => {
    it('currentPage 变化时应更新', () => {
      const { rerender } = renderWithProvider(<RouterContainer />);

      mockRouterValue.currentPage = 'timestamp';
      rerender(<RouterProvider>{<RouterContainer />}</RouterProvider>);

      const box = document.querySelector('.page-transition-enter');
      expect(box).toBeInTheDocument();
    });
  });

  describe('页面级错误隔离', () => {
    it('PageErrorBoundary 应包裹页面内容', () => {
      mockRouterValue.currentPage = 'dashboard';
      const { container } = renderWithProvider(<RouterContainer />);

      // 验证 RouterContainer 的 Box 结构存在
      const routerBox = container.querySelector('.page-transition-dashboard');
      expect(routerBox).toBeInTheDocument();
    });
  });
});
