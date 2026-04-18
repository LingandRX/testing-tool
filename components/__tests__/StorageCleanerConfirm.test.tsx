import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StorageCleanerConfirm } from '../StorageCleanerConfirm';
import type { StorageCleanerOptions } from '@/types/storage';

describe('StorageCleanerConfirm Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultOptions: StorageCleanerOptions = {
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    cookies: true,
    cacheStorage: true,
    serviceWorkers: true,
  };

  const renderComponent = (props?: Partial<React.ComponentProps<typeof StorageCleanerConfirm>>) => {
    return render(
      <StorageCleanerConfirm
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        options={defaultOptions}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      renderComponent();
      expect(screen.getByText('确认清理数据？')).toBeInTheDocument();
    });

    it('should display warning message', () => {
      renderComponent();
      expect(screen.getByText(/此操作不可撤销/i)).toBeInTheDocument();
    });

    it('should display selected options as chips', () => {
      renderComponent();
      expect(screen.getByText('localStorage')).toBeInTheDocument();
      expect(screen.getByText('sessionStorage')).toBeInTheDocument();
      expect(screen.getByText('cookies')).toBeInTheDocument();
    });

    it('should display cancel and confirm buttons', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /确认清理/i })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClose when cancel is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /取消/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when confirm is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /确认清理/i }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Options filtering', () => {
    it('should only show selected options', () => {
      const partialOptions: StorageCleanerOptions = {
        localStorage: true,
        sessionStorage: false,
        indexedDB: true,
        cookies: false,
        cacheStorage: false,
        serviceWorkers: false,
      };

      renderComponent({ options: partialOptions });

      expect(screen.getByText('localStorage')).toBeInTheDocument();
      expect(screen.getByText('indexedDB')).toBeInTheDocument();
      expect(screen.queryByText('sessionStorage')).not.toBeInTheDocument();
      expect(screen.queryByText('cookies')).not.toBeInTheDocument();
    });

    it('should handle empty options', () => {
      const emptyOptions: StorageCleanerOptions = {
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        cookies: false,
        cacheStorage: false,
        serviceWorkers: false,
      };

      renderComponent({ options: emptyOptions });

      const chips = screen.queryAllByRole('button');
      expect(chips.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Dialog behavior', () => {
    it('should not render when open is false', () => {
      renderComponent({ open: false });
      expect(screen.queryByText('确认清理数据？')).not.toBeInTheDocument();
    });

    it('should render with different options', () => {
      const customOptions: StorageCleanerOptions = {
        localStorage: false,
        sessionStorage: true,
        indexedDB: false,
        cookies: true,
        cacheStorage: false,
        serviceWorkers: false,
      };

      renderComponent({ options: customOptions });

      expect(screen.getByText('sessionStorage')).toBeInTheDocument();
      expect(screen.getByText('cookies')).toBeInTheDocument();
    });
  });
});