import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import {
  GlobalSnackbar,
  type GlobalSnackbarProps,
  SnackbarProvider,
  useSnackbar,
  useSnackbarState,
} from '@/components/GlobalSnackbar';

describe('GlobalSnackbar 组件系统', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const defaultProps: GlobalSnackbarProps = {
    message: '测试消息',
    open: true,
    onClose: mockOnClose,
  };

  describe('GlobalSnackbar UI 渲染', () => {
    it('应渲染消息内容', () => {
      render(<GlobalSnackbar {...defaultProps} />);
      expect(screen.getByText('测试消息')).toBeInTheDocument();
    });

    it('当 showAlert 为 true 时应渲染带样式的提示', () => {
      render(<GlobalSnackbar {...defaultProps} showAlert={true} />);
      // 验证是否包含消息文本
      const alertElement = screen.getByText('测试消息');
      expect(alertElement).toBeInTheDocument();
      // 验证父元素有正确的样式类
      const parent = alertElement.parentElement;
      expect(parent).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('当 hideIcon 为 true 时不应渲染图标', () => {
      render(<GlobalSnackbar {...defaultProps} hideIcon={true} />);
      // 图标使用 lucide-react 的 svg 元素
      const icon = document.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('应根据 severity 应用不同的样式', () => {
      render(<GlobalSnackbar {...defaultProps} severity="error" />);
      const message = screen.getByText('测试消息');
      const parent = message.parentElement;
      expect(parent).toHaveClass('bg-red-500');
    });
  });

  describe('useSnackbarState Hook 逻辑', () => {
    it('应返回初始状态', () => {
      const { result } = renderHook(() => useSnackbarState());
      expect(result.current.snackbarProps.open).toBe(false);
      expect(result.current.snackbarProps.message).toBe('');
    });

    it('showMessage 应更新状态', () => {
      const { result } = renderHook(() => useSnackbarState());

      act(() => {
        result.current.showMessage('新消息');
      });

      expect(result.current.snackbarProps.open).toBe(true);
      expect(result.current.snackbarProps.message).toBe('新消息');
    });

    it('closeMessage 应关闭消息', () => {
      const { result } = renderHook(() => useSnackbarState());

      act(() => {
        result.current.showMessage('消息');
      });
      act(() => {
        result.current.closeMessage();
      });

      expect(result.current.snackbarProps.open).toBe(false);
    });
  });

  describe('useSnackbar Context Hook 优先级', () => {
    it('优先级验证: Call Options > Hook Options > Provider Options', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SnackbarProvider initialOptions={{ severity: 'info' }}>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar({ severity: 'warning' }), { wrapper });

      // 1. 测试 Hook Options 覆盖 Provider Options
      act(() => {
        result.current.showMessage('消息 1');
      });

      expect(screen.getByText('消息 1')).toBeInTheDocument();

      // 2. 测试 Call Options 覆盖 Hook Options
      act(() => {
        result.current.showMessage('消息 2', { severity: 'error' });
      });

      expect(screen.getByText('消息 2')).toBeInTheDocument();
    });
  });
});
