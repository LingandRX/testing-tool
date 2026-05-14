import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ImageMode from '../ImageMode';

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
});

const waitForStorageReady = () => act(() => Promise.resolve());

describe('ImageMode', () => {
  it('应该渲染图像上传区域', () => {
    render(<ImageMode />);
    expect(screen.getByText('clickOrDropToImage')).toBeInTheDocument();
    expect(screen.getByText('supportedFormats')).toBeInTheDocument();
  });

  it('应该接受有效的图像文件', async () => {
    render(<ImageMode />);

    const file = new File(['fake-image-data'], 'test.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
      expect(screen.getByText('base64Output')).toBeInTheDocument();
    });
  });

  it('应该拒绝非图像文件', async () => {
    render(<ImageMode />);

    const file = new File(['not an image'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('unsupportedImageType');
    });
  });

  it('应该拒绝超出大小限制的图像', async () => {
    render(<ImageMode />);

    const largeContent = new Uint8Array(11 * 1024 * 1024);
    const file = new File([largeContent], 'large.png', { type: 'image/png' });

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('fileSizeExceeded');
    });
  });

  it('应该通过扩展名识别图像', async () => {
    render(<ImageMode />);

    // 没有 MIME 类型但有正确扩展名
    const file = new File(['fake'], 'test.jpg');
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('点击清除按钮应该清空图像状态', async () => {
    render(<ImageMode />);

    const file = new File(['fake'], 'test.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('clear'));

    await waitFor(() => {
      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
      expect(screen.getByText('clickOrDropToImage')).toBeInTheDocument();
    });
  });

  it('应该显示图像预览', async () => {
    render(<ImageMode />);

    const file = new File(['fake-image'], 'test.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText('preview');
      expect(img).toBeInTheDocument();
      expect(img.tagName.toLowerCase()).toBe('img');
    });
  });

  it('应该渲染 encode/decode 切换按钮', async () => {
    render(<ImageMode />);
    await waitForStorageReady();
    expect(screen.getAllByText('encode').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('decode')).toBeInTheDocument();
  });

  it('解码 PNG Base64 后应该显示图像预览', async () => {
    render(<ImageMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'iVBORw0KGgo=' } });
    fireEvent.click(screen.getAllByText('decode')[1]);

    await waitFor(() => {
      expect(screen.getByText('decodedImageOutput')).toBeInTheDocument();
      const img = screen.getByAltText('decoded preview');
      expect(img).toBeInTheDocument();
      expect(img.tagName.toLowerCase()).toBe('img');
    });
  });

  it('解码后默认文件名应该为 decoded.png', async () => {
    render(<ImageMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: 'iVBORw0KGgo=' } });
    fireEvent.click(screen.getAllByText('decode')[1]);

    expect(await screen.findByDisplayValue('decoded.png')).toBeInTheDocument();
  });

  it('解码非法 Base64 应该显示 invalidBase64 错误', async () => {
    render(<ImageMode />);
    await waitForStorageReady();
    fireEvent.click(screen.getByText('decode'));

    const input = await screen.findByPlaceholderText('decodeBase64Placeholder');
    fireEvent.change(input, { target: { value: '!!!not base64' } });
    fireEvent.click(screen.getAllByText('decode')[1]);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('invalidBase64');
    });
  });
});
