import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TextMode from '../TextMode';

// Mock CopyButton
vi.mock('@/components/CopyButton', () => ({
  default: ({ text }: { text: string }) => <button data-testid="copy-button">{text}</button>,
}));

describe('TextMode', () => {
  it('应该渲染编码/解码切换按钮', () => {
    render(<TextMode />);
    expect(screen.getAllByText('encode').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('decode')).toBeInTheDocument();
  });

  it('应该渲染输入框和转换按钮', () => {
    render(<TextMode />);
    expect(screen.getByPlaceholderText('textInputPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('clear')).toBeInTheDocument();
  });

  it('应该将文本编码为 Base64', async () => {
    render(<TextMode />);
    const input = screen.getByPlaceholderText('textInputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello' } });

    const convertBtn = screen.getAllByText('encode')[1];
    fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(screen.getByText('base64Output')).toBeInTheDocument();
    });
    // 输出内容在 CopyButton 的 data-testid 中
    expect(screen.getByTestId('copy-button')).toHaveTextContent('SGVsbG8=');
  });

  it('应该解码 Base64 文本', async () => {
    render(<TextMode />);

    // 切换到解码模式
    fireEvent.click(screen.getByText('decode'));

    const input = screen.getByPlaceholderText('base64InputPlaceholder');
    fireEvent.change(input, { target: { value: 'SGVsbG8=' } });

    const convertBtn = screen.getAllByText('decode')[1];
    fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(screen.getByText('textOutput')).toBeInTheDocument();
    });
    expect(screen.getByTestId('copy-button')).toHaveTextContent('Hello');
  });

  it('应该对无效 Base64 显示错误', async () => {
    render(<TextMode />);

    // 切换到解码模式
    fireEvent.click(screen.getByText('decode'));

    const input = screen.getByPlaceholderText('base64InputPlaceholder');
    fireEvent.change(input, { target: { value: 'invalid!!!' } });

    const convertBtn = screen.getAllByText('decode')[1];
    fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid Base64 string');
    });
  });

  it('切换方向时应该清除输出', async () => {
    render(<TextMode />);

    // 先编码
    const input = screen.getByPlaceholderText('textInputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getAllByText('encode')[1]);

    await waitFor(() => {
      expect(screen.getByTestId('copy-button')).toHaveTextContent('SGVsbG8=');
    });

    // 切换方向
    await act(async () => {
      fireEvent.click(screen.getByText('decode'));
    });

    // 输出应该被清除
    await waitFor(() => {
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
    });
  });

  it('点击清除按钮应该清空所有内容', async () => {
    render(<TextMode />);

    const input = screen.getByPlaceholderText('textInputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getAllByText('encode')[1]);

    await waitFor(() => {
      expect(screen.getByTestId('copy-button')).toHaveTextContent('SGVsbG8=');
    });

    fireEvent.click(screen.getByText('clear'));

    await waitFor(() => {
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });

  it('空输入时转换按钮应该禁用', () => {
    render(<TextMode />);
    const convertBtn = screen.getAllByText('encode')[1];
    expect(convertBtn).toBeDisabled();
  });

  it('输入非空时转换按钮应该启用', () => {
    render(<TextMode />);
    const input = screen.getByPlaceholderText('textInputPlaceholder');
    fireEvent.change(input, { target: { value: 'Hello' } });
    const convertBtn = screen.getAllByText('encode')[1];
    expect(convertBtn).not.toBeDisabled();
  });
});
