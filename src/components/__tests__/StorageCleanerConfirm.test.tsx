import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StorageCleanerConfirm } from '@/pages/StorageCleaner/StorageCleanerConfirm';
import type { StorageCleanerOptions } from '@/types/storage';
import React from 'react';

const storageOnChangedMock = { addListener: vi.fn(), removeListener: vi.fn() };
(globalThis as any).chrome = { storage: { onChanged: storageOnChangedMock } };
(globalThis as any).browser = { storage: { onChanged: storageOnChangedMock } };

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
      expect(screen.getByRole('heading', { name: /确认清理/ })).toBeInTheDocument();
    });

    it('应显示警告信息', () => {
      renderComponent();
      expect(screen.getByText(/不可撤销/)).toBeInTheDocument();
    });

    it('应将选中的选项显示为标签', () => {
      renderComponent();
      expect(screen.getByText(/Local Storage/)).toBeInTheDocument();
      expect(screen.getByText(/Session Storage/)).toBeInTheDocument();
      expect(screen.getByText(/Cookies/)).toBeInTheDocument();
    });

    it('应显示取消和确认按钮', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /确认清理/ })).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击取消时应调用 onClose', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /取消/ }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('点击确认时应调用 onConfirm', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /确认清理/ }));
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

      expect(screen.getByText(/Local Storage/)).toBeInTheDocument();
      expect(screen.getByText(/站点存储/)).toBeInTheDocument();
      expect(screen.queryByText(/Session Storage/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cookies$/)).not.toBeInTheDocument();
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
      expect(screen.queryByRole('heading', { name: /确认清理/ })).not.toBeInTheDocument();
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

      expect(screen.getByText(/Session Storage/)).toBeInTheDocument();
      expect(screen.getByText(/Cookies/)).toBeInTheDocument();
    });
  });
});
