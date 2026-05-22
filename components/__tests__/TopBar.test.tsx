import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PageType } from '@/types/storage';
import React from 'react';
import TopBar from '@/components/TopBar';
import { RouterProvider } from '@/providers/RouterProvider';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';

// matchMedia must be mocked before ThemeModeProvider is imported
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockRouterValue = {
  currentPage: 'dashboard' as PageType,
  visiblePages: ['dashboard', 'timestamp'] as PageType[],
  pageOrder: ['timestamp'] as PageType[],
  isLoaded: true,
  navigateTo: vi.fn(),
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
    return render(
      <ThemeModeProvider>
        <RouterProvider>{ui}</RouterProvider>
      </ThemeModeProvider>,
    );
  };

  describe('渲染测试', () => {
    it('不在 dashboard 时应渲染返回按钮', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByLabelText('common:buttons.back')).toBeInTheDocument();
    });

    it('在 dashboard 上不应渲染返回按钮', () => {
      mockRouterValue.currentPage = 'dashboard';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.queryByLabelText('common:buttons.back')).not.toBeInTheDocument();
    });

    it('应渲染设置按钮', () => {
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByLabelText('common:buttons.settings')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击设置按钮时应调用 onOpenOptions', () => {
      const handleOpenOptions = vi.fn();
      renderWithProvider(<TopBar onOpenOptions={handleOpenOptions} />);

      fireEvent.click(screen.getByLabelText('common:buttons.settings'));
      expect(handleOpenOptions).toHaveBeenCalledTimes(1);
    });

    it('点击返回按钮时应调用 goBack', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);

      fireEvent.click(screen.getByLabelText('common:buttons.back'));
      expect(mockRouterValue.goBack).toHaveBeenCalledTimes(1);
    });
  });
});
