import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrCodePage from '../index';

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    QrCode: () => <div data-testid="mock-lucide-qrcode">Icon</div>,
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

vi.mock('@/components/QrCodePreview', () => ({
  default: () => <div data-testid="qr-code-preview">QrCodePreview</div>,
}));

vi.mock('@/components/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

vi.mock('qrious', () => ({
  default: vi.fn().mockImplementation(() => ({
    toDataURL: () => 'data:image/png;base64,mock',
  })),
}));

describe('QrCodePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该默认渲染生成模式', () => {
    render(<QrCodePage />);
    expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
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
    expect(screen.queryByTestId('qr-code-preview')).not.toBeInTheDocument();
  });

  it('切换回生成模式应该渲染 QrCodePreview', () => {
    render(<QrCodePage />);
    // 先切换到解析模式
    fireEvent.click(screen.getByText('二维码转文本'));
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    // 再切换回生成模式
    fireEvent.click(screen.getByText('文本转二维码'));
    expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
  });

  it('应该渲染输入区域的系统标签（对齐新版 Label 机制）', () => {
    render(<QrCodePage />);
    expect(screen.getByText('输入 URL 或文本')).toBeInTheDocument();
  });

  it('应该渲染双翼响应式卡片网格布局', () => {
    const { container } = render(<QrCodePage />);
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
