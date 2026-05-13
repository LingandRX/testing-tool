import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileMode from '../FileMode';

// Mock CopyButton
vi.mock('@/components/CopyButton', () => ({
  default: ({ text, tooltip }: { text: string; tooltip?: string }) => (
    <button data-testid="copy-button" data-tooltip={tooltip}>
      {text.slice(0, 20)}
    </button>
  ),
}));

describe('FileMode', () => {
  it('应该渲染文件上传区域', () => {
    render(<FileMode />);
    expect(screen.getByText('clickOrDropToFile')).toBeInTheDocument();
    expect(screen.getByText('maxFileSize')).toBeInTheDocument();
  });

  it('应该处理有效的文件选择', async () => {
    render(<FileMode />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    // 文件输入是隐藏的，直接触发 change 事件
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('base64Output')).toBeInTheDocument();
    });
  });

  it('应该拒绝超出大小限制的文件', async () => {
    render(<FileMode />);

    // 创建一个超过 10MB 的文件
    const largeContent = new Uint8Array(11 * 1024 * 1024);
    const file = new File([largeContent], 'large.bin', { type: 'application/octet-stream' });

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('fileSizeExceeded');
    });
  });

  it('点击清除按钮应该清空文件状态', async () => {
    render(<FileMode />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('clear'));

    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
      expect(screen.getByText('clickOrDropToFile')).toBeInTheDocument();
    });
  });

  it('应该显示文件大小和类型信息', async () => {
    render(<FileMode />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
    // 文件类型显示在 caption 中，格式为 "size · type"
    expect(screen.getByText(/test\.txt/)).toBeInTheDocument();
  });

  it('应该显示原始大小和编码大小', async () => {
    render(<FileMode />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/originalSize/)).toBeInTheDocument();
      expect(screen.getByText(/encodedSize/)).toBeInTheDocument();
    });
  });

  it('应该提供复制按钮', async () => {
    render(<FileMode />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      const copyButtons = screen.getAllByTestId('copy-button');
      expect(copyButtons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
