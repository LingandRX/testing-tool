import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PageType } from '@/types/storage';
import React from 'react';
import TopBar from '@/layout/TopBar';
import { RouterProvider } from '@/providers/RouterProvider';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';

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
  currentPage: 'timestamp' as PageType,
  visiblePages: ['timestamp', 'jwt'] as PageType[],
  pageOrder: ['timestamp'] as PageType[],
  recentlyUsedTools: [] as PageType[],
  isLoaded: true,
  navigateTo: vi.fn(),
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
    it('不应渲染返回首页按钮', () => {
      renderWithProvider(<TopBar />);
      expect(screen.queryByLabelText('返回首页')).not.toBeInTheDocument();
    });

    it('应渲染搜索输入框', () => {
      renderWithProvider(<TopBar />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
