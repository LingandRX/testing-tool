import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QrCodePage from '../index';

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    QrCode: () => <div data-testid="mock-lucide-qrcode">Icon</div>,
    Pencil: () => <div data-testid="mock-lucide-pencil">Icon</div>,
    Loader2: () => <div data-testid="mock-lucide-loader">Icon</div>,
  };
});

vi.mock('@/components/GlobalSnackbar', () => ({
  useSnackbar: () => ({
    showMessage: vi.fn(),
  }),
}));

vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>();
  return {
    ...actual,
    getEntryPointType: () => 'sidepanel',
  };
});

vi.mock('../components/QrCodePreview', () => ({
  default: () => <div data-testid="qr-code-preview">QrCodePreview</div>,
}));

vi.mock('../components/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

vi.mock('qrious', () => {
  return {
    default: class QRious {
      constructor() {
        return {
          toDataURL: () => 'data:image/png;base64,mock',
        };
      }
    },
  };
});

describe('QrCodePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该默认渲染生成模式的输入态', () => {
    render(<QrCodePage />);
    expect(screen.getByText('输入 URL 或文本')).toBeInTheDocument();
    expect(screen.getByText('生成二维码')).toBeInTheDocument();
    // 输入态应该隐藏二维码预览
    expect(screen.queryByTestId('qr-code-preview')).not.toBeInTheDocument();
  });

  it('应该渲染模式切换按钮', () => {
    render(<QrCodePage />);
    expect(screen.getByText('文本转二维码')).toBeInTheDocument();
    expect(screen.getByText('二维码转文本')).toBeInTheDocument();
  });

  it('切换到解析模式应该渲染 ImageUploader', () => {
    render(<QrCodePage />);
    fireEvent.click(screen.getByText('二维码转文本'));
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('切换回生成模式应该渲染输入态', () => {
    render(<QrCodePage />);
    // 先切换到解析模式
    fireEvent.click(screen.getByText('二维码转文本'));
    // 再切换回生成模式
    fireEvent.click(screen.getByText('文本转二维码'));
    expect(screen.getByText('输入 URL 或文本')).toBeInTheDocument();
    expect(screen.getByText('生成二维码')).toBeInTheDocument();
  });

  it('应该渲染输入区域的系统标签', () => {
    render(<QrCodePage />);
    expect(screen.getByText('输入 URL 或文本')).toBeInTheDocument();
  });

  it('输入态应该显示生成按钮', () => {
    render(<QrCodePage />);
    const generateButton = screen.getByText('生成二维码');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toBeDisabled(); // 空输入时按钮应该禁用
  });

  it('有输入内容时生成按钮应该可用', () => {
    render(<QrCodePage />);
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    const generateButton = screen.getByText('生成二维码');
    expect(generateButton).not.toBeDisabled();
  });

  it('点击生成按钮应该切换到预览态', async () => {
    render(<QrCodePage />);

    // 输入文本
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    // 点击生成按钮
    const generateButton = screen.getByText('生成二维码');
    fireEvent.click(generateButton);

    // 验证切换到预览态
    await waitFor(() => {
      expect(screen.getByText('原始文本')).toBeInTheDocument();
      expect(screen.getByText('编辑')).toBeInTheDocument();
      expect(screen.queryByText('生成二维码')).not.toBeInTheDocument();
      // 预览态应该显示二维码
      expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
    });
  });

  it('预览态应该显示截断的文本', async () => {
    render(<QrCodePage />);

    // 输入长文本
    const longText =
      'https://example.com/very/long/path/that/should/be/truncated/in/the/preview/because/it/exceeds/the/maximum/length';
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: longText } });

    // 点击生成按钮
    fireEvent.click(screen.getByText('生成二维码'));

    // 验证显示截断的文本（80字符 + "..."）
    const truncatedText = longText.slice(0, 80) + '...';
    await waitFor(() => {
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });
  });

  it('预览态应该显示完整的短文本', async () => {
    render(<QrCodePage />);

    // 输入短文本
    const shortText = 'https://example.com';
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: shortText } });

    // 点击生成按钮
    fireEvent.click(screen.getByText('生成二维码'));

    // 验证显示完整文本
    await waitFor(() => {
      expect(screen.getByText(shortText)).toBeInTheDocument();
    });
  });

  it('点击编辑按钮应该返回输入态', async () => {
    render(<QrCodePage />);

    // 输入文本并生成
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('生成二维码'));

    // 等待生成完成
    await waitFor(() => {
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    // 点击编辑按钮
    fireEvent.click(screen.getByText('编辑'));

    // 验证返回输入态
    expect(screen.getByText('输入 URL 或文本')).toBeInTheDocument();
    expect(screen.getByText('生成二维码')).toBeInTheDocument();
    expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    // 输入态应该隐藏二维码预览
    expect(screen.queryByTestId('qr-code-preview')).not.toBeInTheDocument();
  });

  it('返回编辑态应该保留上次输入的内容', async () => {
    render(<QrCodePage />);

    // 输入文本并生成
    const textarea = screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('生成二维码'));

    // 等待生成完成
    await waitFor(() => {
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    // 点击编辑按钮
    fireEvent.click(screen.getByText('编辑'));

    // 验证输入框保留了上次的内容
    const textareaAfterEdit =
      screen.getByPlaceholderText('请输入 URL 或文本内容，将自动生成二维码');
    expect(textareaAfterEdit).toHaveValue('https://example.com');
  });
});
