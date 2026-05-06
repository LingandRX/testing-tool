import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouterContainer from '@/components/RouterContainer';
import { RouterProvider } from '@/providers/RouterProvider';
import { SnackbarProvider } from '@/components/GlobalSnackbar';
import type { PageType } from '@/types/storage';
import React from 'react';

const mockRouterValue = {
  currentPage: 'dashboard' as PageType,
  visiblePages: ['dashboard', 'timestamp'] as PageType[],
  pageOrder: ['timestamp'] as PageType[],
  isLoaded: true,
  navigateTo: vi.fn(),
  navigateLocal: vi.fn(),
  syncNavigation: vi.fn(),
  goBack: vi.fn(),
  setVisiblePages: vi.fn(),
  setPageOrder: vi.fn(),
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
    return render(
      <SnackbarProvider>
        <RouterProvider>{ui}</RouterProvider>
      </SnackbarProvider>,
    );
  };

  describe('渲染测试', () => {
    it('isLoaded 为 false 时应渲染加载状态', () => {
      mockRouterValue.isLoaded = false;
      renderWithProvider(<RouterContainer />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('isLoaded 为 true 时应渲染页面内容', () => {
      mockRouterValue.isLoaded = true;
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
      rerender(
        <SnackbarProvider>
          <RouterProvider>{<RouterContainer />}</RouterProvider>
        </SnackbarProvider>,
      );

      const box = document.querySelector('.page-transition-enter');
      expect(box).toBeInTheDocument();
    });
  });
});
