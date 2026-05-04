import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TopBar from '../TopBar';
import { RouterProvider } from '@/providers/RouterProvider';
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

describe('TopBar 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<RouterProvider>{ui}</RouterProvider>);
  };

  describe('渲染测试', () => {
    it('应使用默认标题渲染', () => {
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByText('Testing Tools')).toBeInTheDocument();
    });

    it('不在 dashboard 时应渲染返回按钮', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByTestId('ArrowBackIosNewIcon')).toBeInTheDocument();
    });

    it('在 dashboard 上不应渲染返回按钮', () => {
      mockRouterValue.currentPage = 'dashboard';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.queryByTestId('ArrowBackIosNewIcon')).not.toBeInTheDocument();
    });

    it('应渲染设置按钮', () => {
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击设置按钮时应调用 onOpenOptions', () => {
      const handleOpenOptions = vi.fn();
      renderWithProvider(<TopBar onOpenOptions={handleOpenOptions} />);

      fireEvent.click(screen.getByTestId('SettingsIcon'));
      expect(handleOpenOptions).toHaveBeenCalledTimes(1);
    });

    it('点击返回按钮时应调用 goBack', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);

      fireEvent.click(screen.getByTestId('ArrowBackIosNewIcon'));
      expect(mockRouterValue.goBack).toHaveBeenCalledTimes(1);
    });
  });
});
