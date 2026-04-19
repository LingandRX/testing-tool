import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouterContainer from '../RouterContainer';
import { RouterProvider } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';

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

describe('RouterContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<RouterProvider>{ui}</RouterProvider>);
  };

  describe('Rendering', () => {
    it('should render loading state when isLoaded is false', () => {
      mockRouterValue.isLoaded = false;
      renderWithProvider(<RouterContainer />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render page content when isLoaded is true', () => {
      mockRouterValue.isLoaded = true;
      mockRouterValue.currentPage = 'dashboard';
      const { container } = renderWithProvider(<RouterContainer />);
      expect(container.querySelector('.page-transition-dashboard')).toBeInTheDocument();
    });
  });

  describe('Animation classes', () => {
    it('should apply dashboard animation class on dashboard page', () => {
      mockRouterValue.currentPage = 'dashboard';
      renderWithProvider(<RouterContainer />);
      const box = document.querySelector('.page-transition-dashboard');
      expect(box).toBeInTheDocument();
    });

    it('should apply enter animation class on non-dashboard page', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<RouterContainer />);
      const box = document.querySelector('.page-transition-enter');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Route handling', () => {
    it('should update when currentPage changes', () => {
      const { rerender } = renderWithProvider(<RouterContainer />);

      mockRouterValue.currentPage = 'timestamp';
      rerender(<RouterProvider>{<RouterContainer />}</RouterProvider>);

      const box = document.querySelector('.page-transition-enter');
      expect(box).toBeInTheDocument();
    });
  });
});