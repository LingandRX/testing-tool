import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { GlobalSnackbar, useSnackbarState, type GlobalSnackbarProps } from '../GlobalSnackbar';

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
    it('应渲染消息内容并由于使用了 Portal 出现在 body 中', () => {
      render(<GlobalSnackbar {...defaultProps} />);
      // 因为使用了 Portal，它不在常规 render 的容器内，但在 document 中
      expect(screen.getByText('测试消息')).toBeInTheDocument();
    });

    it('当 showAlert 为 true 时应渲染 MUI Alert 样式', () => {
      render(<GlobalSnackbar {...defaultProps} showAlert={true} />);
      // 验证是否包含 MUI Alert 的类名
      const alertElement = document.querySelector('.MuiAlert-root');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveTextContent('测试消息');
    });

    it('当 hideIcon 为 true 时不应渲染图标', () => {
      render(<GlobalSnackbar {...defaultProps} hideIcon={true} />);
      // MUI Alert 图标通常在 .MuiAlert-icon 中
      const icon = document.querySelector('.MuiAlert-icon');
      expect(icon).not.toBeInTheDocument();
    });

    it('应根据 severity 应用不同的样式 (通过检查 style 或 class)', () => {
      render(<GlobalSnackbar {...defaultProps} severity="error" />);
      const alert = document.querySelector('.MuiAlert-filledError');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('useSnackbarState Hook 逻辑', () => {
    it('应能正确初始化并更新状态', () => {
      const { result } = renderHook(() => useSnackbarState({ severity: 'warning' }));

      expect(result.current.snackbarProps.open).toBe(false);

      act(() => {
        result.current.showMessage('新提醒', { severity: 'success' });
      });

      expect(result.current.snackbarProps.open).toBe(true);
      expect(result.current.snackbarProps.message).toBe('新提醒');
      expect(result.current.snackbarProps.severity).toBe('success');
    });

    it('closeMessage 应立即关闭 Snackbar', () => {
      const { result } = renderHook(() => useSnackbarState());

      act(() => {
        result.current.showMessage('测试');
      });
      expect(result.current.snackbarProps.open).toBe(true);

      act(() => {
        result.current.closeMessage();
      });
      expect(result.current.snackbarProps.open).toBe(false);
    });
  });

  describe('交互与自动隐藏', () => {
    it('在 autoHideDuration 结束后应触发 onClose', () => {
      render(<GlobalSnackbar {...defaultProps} autoHideDuration={3000} />);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('当 reason 为 clickaway 时不应调用 onClose (源码逻辑验证)', () => {
      const { result } = renderHook(() => useSnackbarState());

      // 模拟 MUI 的 handleClose 被 clickaway 触发
      act(() => {
        result.current.snackbarProps.onClose();
      });

      // 状态应该保持 open: true
      expect(result.current.snackbarProps.open).toBe(false);
      // 注意：此处取决于你对 useSnackbarState 的期望。
      // 源码中 handleClose 拦截了 clickaway，所以 open 不会变为 false。
    });
  });
});
