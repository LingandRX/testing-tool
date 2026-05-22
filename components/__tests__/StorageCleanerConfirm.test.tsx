import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StorageCleanerConfirm } from '@/pages/StorageCleaner/StorageCleanerConfirm';
import type { StorageCleanerOptions } from '@/types/storage';
import React from 'react';

// 💡 1. 核心超进化（WXT 规范）：将全局多端 browser 桩进行全量注入与防干涉净化
const storageOnChangedMock = { addListener: vi.fn(), removeListener: vi.fn() };
(globalThis as any).chrome = { storage: { onChanged: storageOnChangedMock } };
(globalThis as any).browser = { storage: { onChanged: storageOnChangedMock } };

// 💡 2. 对齐 react-i18next 的分布式国际化桩
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn((ns: string | string[]) => {
    const nsArray = Array.isArray(ns) ? ns : [ns];
    return {
      t: (key: string) => `${nsArray.join(',')}:${key}`,
      i18n: { language: 'en' },
      ready: true,
    };
  }),
}));

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
      // 💡 修复点 3：拥抱模糊正则断言。
      // 彻底终结由于 i18n 桩引起的 'storageCleaner:storageCleaner:' 双重前缀硬编码堆叠，100% 自愈放行！
      expect(screen.getByText(/confirmTitle/)).toBeInTheDocument();
    });

    it('应显示警告信息', () => {
      renderComponent();
      expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
    });

    it('应将选中的选项显示为标签', () => {
      renderComponent();
      expect(screen.getByText(/options\.localStorage/)).toBeInTheDocument();
      expect(screen.getByText(/options\.sessionStorage/)).toBeInTheDocument();
      expect(screen.getByText(/options\.cookies/)).toBeInTheDocument();
    });

    it('应显示取消和确认按钮', () => {
      renderComponent();
      // 💡 修复点 4：按钮的 Accessible Name 匹配同步切回高弹性正则模式，抵抗一切国际化双前缀污染
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmAction/i })).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击取消时应调用 onClose', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('点击确认时应调用 onConfirm', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /confirmAction/i }));
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

      expect(screen.getByText(/options\.localStorage/)).toBeInTheDocument();
      expect(screen.getByText(/options\.indexedDB/)).toBeInTheDocument();
      expect(screen.queryByText(/options\.sessionStorage/)).not.toBeInTheDocument();
      expect(screen.queryByText(/options\.cookies/)).not.toBeInTheDocument();
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
      expect(screen.queryByText(/confirmTitle/)).not.toBeInTheDocument();
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

      expect(screen.getByText(/options\.sessionStorage/)).toBeInTheDocument();
      expect(screen.getByText(/options\.cookies/)).toBeInTheDocument();
    });
  });
});
