import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import FileMode from '../FileMode';

// Mock CopyButton
vi.mock('@/components/CopyButton', () => ({
  default: ({ text, tooltip }: { text: string; tooltip?: string }) => (
    <button data-testid="copy-button" data-tooltip={tooltip}>
      {text.slice(0, 20)}
    </button>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

// useStorageState's async loadState may overwrite user toggle if we click before the
// initial chrome.storage read settles. Flush pending microtasks first.
const waitForStorageReady = () => act(() => Promise.resolve());

describe('FileMode', () => {
  it('应该渲染文件上传区域', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    expect(screen.getByText('clickOrDropToFile')).toBeInTheDocument();
    expect(screen.getByText('maxFileSize')).toBeInTheDocument();
  });

  it('应该处理有效的文件选择', async () => {
    render(<FileMode />);
    await waitForStorageReady();

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
    await waitForStorageReady();

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
    await waitForStorageReady();

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
    await waitForStorageReady();

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
    await waitForStorageReady();

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
    await waitForStorageReady();

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      const copyButtons = screen.getAllByTestId('copy-button');
      expect(copyButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('应该渲染 encode/decode 切换按钮', () => {
    render(<FileMode />);
    expect(screen.getByText('encode')).toBeInTheDocument();
    expect(screen.getByText('decode')).toBeInTheDocument();
  });

  it('切到 decode 应该显示 Base64 输入框', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));
    expect(await screen.findByPlaceholderText('decodeBase64Placeholder')).toBeInTheDocument();
  });

  it('解码 PDF Base64 后应该显示 application/pdf 与默认文件名 decoded.pdf', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'JVBERi0K' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(screen.getByText('decodedFileOutput')).toBeInTheDocument();
      expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('decoded.pdf')).toBeInTheDocument();
    });
  });

  it('解码后的文件名应该可编辑', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'JVBERi0K' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const filenameInput = (await screen.findByDisplayValue('decoded.pdf')) as HTMLInputElement;
    fireEvent.change(filenameInput, { target: { value: 'my-report.pdf' } });
    expect(filenameInput.value).toBe('my-report.pdf');
  });

  it('解码后应该显示下载按钮', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'JVBERi0K' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(await screen.findByText('download')).toBeInTheDocument();
  });

  it('解码非法 Base64 应该显示 invalidBase64 错误', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: '!!!not base64' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(screen.getByText('invalidBase64')).toBeInTheDocument();
    });
  });

  it('切换方向时应该清空解码状态', async () => {
    render(<FileMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'JVBERi0K' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(screen.getByText('decodedFileOutput')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('encode'));

    await waitFor(() => {
      expect(screen.queryByText('decodedFileOutput')).not.toBeInTheDocument();
    });
  });
});
