import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StorageCleanerConfirm } from '../../pages/StorageCleaner/StorageCleanerConfirm';
import type { StorageCleanerOptions } from '@/types/storage';
import React from 'react';

describe('StorageCleanerConfirm 组件', () => {
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
      />,
    );
  };

  describe('渲染测试', () => {
    it('open 为 true 时应渲染对话框', () => {
      renderComponent();
      expect(screen.getByText('storageCleaner:confirmTitle')).toBeInTheDocument();
    });

    it('应显示警告信息', () => {
      renderComponent();
      expect(screen.getByText(/storageCleaner:irreversible/i)).toBeInTheDocument();
    });

    it('应将选中的选项显示为标签', () => {
      renderComponent();
      expect(screen.getByText('storageCleaner:options.localStorage')).toBeInTheDocument();
      expect(screen.getByText('storageCleaner:options.sessionStorage')).toBeInTheDocument();
      expect(screen.getByText('storageCleaner:options.cookies')).toBeInTheDocument();
    });

    it('应显示取消和确认按钮', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /common:buttons.cancel/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /storageCleaner:confirmAction/i }),
      ).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击取消时应调用 onClose', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /common:buttons.cancel/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('点击确认时应调用 onConfirm', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /storageCleaner:confirmAction/i }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('选项过滤测试', () => {
    it('应仅显示选中的选项', () => {
      const partialOptions: StorageCleanerOptions = {
        localStorage: true,
        sessionStorage: false,
        indexedDB: true,
        cookies: false,
        cacheStorage: false,
        serviceWorkers: false,
      };

      renderComponent({ options: partialOptions });

      expect(screen.getByText('storageCleaner:options.localStorage')).toBeInTheDocument();
      expect(screen.getByText('storageCleaner:options.indexedDB')).toBeInTheDocument();
      expect(screen.queryByText('storageCleaner:options.sessionStorage')).not.toBeInTheDocument();
      expect(screen.queryByText('storageCleaner:options.cookies')).not.toBeInTheDocument();
    });

    it('应处理空选项', () => {
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

  describe('对话框行为测试', () => {
    it('open 为 false 时不应渲染', () => {
      renderComponent({ open: false });
      expect(screen.queryByText('storageCleaner:confirmTitle')).not.toBeInTheDocument();
    });

    it('应使用不同选项渲染', () => {
      const customOptions: StorageCleanerOptions = {
        localStorage: false,
        sessionStorage: true,
        indexedDB: false,
        cookies: true,
        cacheStorage: false,
        serviceWorkers: false,
      };

      renderComponent({ options: customOptions });

      expect(screen.getByText('storageCleaner:options.sessionStorage')).toBeInTheDocument();
      expect(screen.getByText('storageCleaner:options.cookies')).toBeInTheDocument();
    });
  });
});
