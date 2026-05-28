import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import TextMode from '../TextMode';

// Mock CopyButton
vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({ text }: { text: string }) => <button data-testid="copy-button">{text}</button>,
  default: ({ text }: { text: string }) => <button data-testid="copy-button">{text}</button>,
}));

describe('TextMode', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染编码/解码切换按钮', () => {
    render(<TextMode />);
    expect(screen.getByText('编码')).toBeInTheDocument();
    expect(screen.getByText('解码')).toBeInTheDocument();
  });

  it('应该渲染输入框和转换按钮', () => {
    render(<TextMode />);
    expect(screen.getByPlaceholderText('输入需要编码为 Base64 的文本...')).toBeInTheDocument();
  });

  it('应该将文本编码为 Base64', async () => {
    render(<TextMode />);
    const input = screen.getByPlaceholderText('输入需要编码为 Base64 的文本...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByText('Base64 编码结果')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'SGVsbG8=' })).toBeInTheDocument();
  });

  it('应该解码 Base64 文本', async () => {
    render(<TextMode />);

    // 切换到解码模式
    fireEvent.click(screen.getByText('解码'));

    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, { target: { value: 'SGVsbG8=' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByText('解码文本结果')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument();
  });

  it('应该对无效 Base64 显示错误', async () => {
    render(<TextMode />);

    // 切换到解码模式
    fireEvent.click(screen.getByText('解码'));

    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, { target: { value: 'invalid!!!' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByText('Base64 字符串无效')).toBeInTheDocument();
    });
  });

  it('切换方向时应该清除输出', async () => {
    render(<TextMode />);

    // 先编码
    const input = screen.getByPlaceholderText('输入需要编码为 Base64 的文本...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SGVsbG8=' })).toBeInTheDocument();
    });

    // 切换方向
    fireEvent.click(screen.getByText('解码'));

    // 输出应该被清除
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'SGVsbG8=' })).not.toBeInTheDocument();
    });
  });

  it('点击清除按钮应该清空所有内容', async () => {
    render(<TextMode />);

    const input = screen.getByPlaceholderText('输入需要编码为 Base64 的文本...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SGVsbG8=' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'textInputArea.clear' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'SGVsbG8=' })).not.toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });

  it('解码模式下粘贴图片 data URI 时应该显示切换图像模式的提示', () => {
    render(<TextMode />);

    fireEvent.click(screen.getByText('解码'));

    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, {
      target: { value: 'data:image/png;base64,iVBORw0KGgo=' },
    });

    expect(
      screen.getByText('检测到图片的 data URI，请使用「图像」选项卡进行解码。'),
    ).toBeInTheDocument();
    expect(screen.getByText('切换到图像模式')).toBeInTheDocument();
  });

  it('粘贴非图片 data URI 时不应该显示图像模式提示', () => {
    render(<TextMode />);

    fireEvent.click(screen.getByText('解码'));

    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, { target: { value: 'SGVsbG8=' } });

    expect(
      screen.queryByText('检测到图片的 data URI，请使用「图像」选项卡进行解码。'),
    ).not.toBeInTheDocument();
  });

  it('点击切换图像模式按钮应该调用 onSwitchToImageMode 回调', () => {
    const onSwitch = vi.fn();
    render(<TextMode onSwitchToImageMode={onSwitch} />);

    fireEvent.click(screen.getByText('解码'));
    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, {
      target: { value: 'data:image/png;base64,iVBORw0KGgo=' },
    });

    fireEvent.click(screen.getByText('切换到图像模式'));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it('解码模式下对二进制数据应该显示更清晰的错误', async () => {
    render(<TextMode />);

    fireEvent.click(screen.getByText('解码'));

    const input = screen.getByPlaceholderText('输入需要解码的 Base64 字符串...');
    fireEvent.change(input, { target: { value: 'iVBORw0KGgo=' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(
        screen.getByText('输入似乎是二进制数据（如图片）。请切换到「图像」选项卡。'),
      ).toBeInTheDocument();
    });
  });
});
