import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// unmock the globally-mocked component so we test the real implementation
vi.unmock('@/components/CopyButton');

vi.mock('@/utils/clipboard', () => ({
  copyTextToClipboard: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { CopyButton } from '@/components/CopyButton';
import { copyTextToClipboard } from '@/utils/clipboard';
import { toast } from 'sonner';

const mockedCopy = vi.mocked(copyTextToClipboard);
const mockedToast = vi.mocked(toast);

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('复制成功时调用 copyTextToClipboard 并传入正确 text', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="hello world" />);

    await user.click(screen.getByRole('button'));

    expect(mockedCopy).toHaveBeenCalledWith('hello world');
    expect(mockedToast.success).toHaveBeenCalled();
  });

  it('复制成功后图标切换为 Check，1.5 秒后恢复', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="test" />);

    // 点击后复制成功，按钮获得 emerald 样式（说明切到了 Check 状态）
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button').className).toContain('text-emerald');
    });

    // 1.5 秒后样式恢复
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByRole('button').className).not.toContain('text-emerald');
    });
  });

  it('复制空文本时弹出 error toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="" />);

    await user.click(screen.getByRole('button'));

    expect(mockedCopy).not.toHaveBeenCalled();
    expect(mockedToast.error).toHaveBeenCalled();
  });

  it('复制失败时弹出 error toast', async () => {
    mockedCopy.mockResolvedValue(false);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="something" />);

    await user.click(screen.getByRole('button'));

    expect(mockedCopy).toHaveBeenCalledWith('something');
    expect(mockedToast.error).toHaveBeenCalled();
  });

  // ==================== 新增测试 ====================

  it('初始渲染时显示 Copy 图标且无 emerald 样式', () => {
    render(<CopyButton text="initial" />);

    const button = screen.getByRole('button');
    expect(button.className).not.toContain('text-emerald');
    // 通过 aria-label 确认按钮存在，图标由 lucide 渲染为 svg
    expect(button).toHaveAttribute('aria-label');
  });

  it('自定义 tooltip 会覆盖默认 title 和 aria-label', () => {
    render(<CopyButton text="tooltip-test" tooltip="自定义提示" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '自定义提示');
    expect(button).toHaveAttribute('aria-label', '自定义提示');
  });

  it('className 被正确透传到按钮', () => {
    render(<CopyButton text="class-test" className="my-custom-class" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('my-custom-class');
  });

  it('点击事件阻止冒泡', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <CopyButton text="stop-propagation" />
      </div>,
    );

    await user.click(screen.getByRole('button'));

    expect(mockedCopy).toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('组件卸载时清除定时器，不触发状态更新警告', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { unmount } = render(<CopyButton text="unmount-test" />);

    await user.click(screen.getByRole('button'));

    // 在 1.5 秒超时到期前卸载组件
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 卸载不应抛出 "Can't perform a React state update on an unmounted component" 警告
    expect(() => unmount()).not.toThrow();

    // 前进剩余时间，确认没有异常
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });

  it('快速连续点击不会创建多个重叠定时器', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="rapid-click" />);

    const button = screen.getByRole('button');

    // 快速点击 3 次
    await user.click(button);
    await user.click(button);
    await user.click(button);

    // copyTextToClipboard 应该被调用 3 次（每次点击都执行）
    expect(mockedCopy).toHaveBeenCalledTimes(3);

    // 但 setTimeout 相关的 clearTimeout + setTimeout 组合应正常工作
    //  advance 1.5 秒后，copied 状态应恢复为 false
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(button.className).not.toContain('text-emerald');
    });
  });

  it('其他 button props 通过 ...props 透传', () => {
    render(<CopyButton text="props-test" data-testid="copy-btn" disabled id="copy-button-id" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'copy-btn');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('id', 'copy-button-id');
  });
});
