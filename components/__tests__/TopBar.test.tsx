import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopBar from '../TopBar';
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

describe('TopBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<RouterProvider>{ui}</RouterProvider>);
  };

  describe('Rendering', () => {
    it('should render with default title', () => {
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByText('Testing Tools')).toBeInTheDocument();
    });

    it('should render back button when not on dashboard', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByTestId('ArrowBackIosNewIcon')).toBeInTheDocument();
    });

    it('should not render back button on dashboard', () => {
      mockRouterValue.currentPage = 'dashboard';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.queryByTestId('ArrowBackIosNewIcon')).not.toBeInTheDocument();
    });

    it('should render settings button', () => {
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);
      expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onOpenOptions when settings button is clicked', () => {
      const handleOpenOptions = vi.fn();
      renderWithProvider(<TopBar onOpenOptions={handleOpenOptions} />);

      fireEvent.click(screen.getByTestId('SettingsIcon'));
      expect(handleOpenOptions).toHaveBeenCalledTimes(1);
    });

    it('should call goBack when back button is clicked', () => {
      mockRouterValue.currentPage = 'timestamp';
      renderWithProvider(<TopBar onOpenOptions={vi.fn()} />);

      fireEvent.click(screen.getByTestId('ArrowBackIosNewIcon'));
      expect(mockRouterValue.goBack).toHaveBeenCalledTimes(1);
    });
  });
});