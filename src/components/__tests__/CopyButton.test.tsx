import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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

  it('初始渲染时带有默认 aria-label', () => {
    render(<CopyButton text="initial" />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '复制');
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

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(() => unmount()).not.toThrow();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });

  it('快速连续点击不会创建多个重叠定时器', async () => {
    mockedCopy.mockResolvedValue(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton text="rapid-click" />);

    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(mockedCopy).toHaveBeenCalledTimes(3);

    act(() => {
      vi.advanceTimersByTime(1500);
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
