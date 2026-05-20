import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QrCodePage from '../index';

// Mock useLazyTranslation
vi.mock('@/utils/useLazyTranslation', () => ({
  useLazyTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'zh-CN' },
    isLoaded: true,
  }),
}));

// Mock getEntryPointType
vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>();
  return {
    ...actual,
    getEntryPointType: () => 'sidepanel',
  };
});

// Mock 子组件
vi.mock('@/components/QrCodePreview', () => ({
  default: () => <div data-testid="qr-code-preview">QrCodePreview</div>,
}));

vi.mock('@/components/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

// Mock QRious
vi.mock('qrious', () => ({
  default: vi.fn().mockImplementation(() => ({
    toDataURL: () => 'data:image/png;base64,mock',
  })),
}));

// Mock useSnackbar
vi.mock('@/components/GlobalSnackbar', () => ({
  useSnackbar: () => ({
    showMessage: vi.fn(),
  }),
}));

describe('QrCodePage', () => {
  it('应该默认渲染生成模式', () => {
    render(<QrCodePage />);
    expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
  });

  it('应该渲染模式切换按钮', () => {
    render(<QrCodePage />);
    expect(screen.getByText('qrCode:urlToQr')).toBeInTheDocument();
    expect(screen.getByText('qrCode:qrToUrl')).toBeInTheDocument();
  });

  it('应该渲染页面标题', () => {
    render(<QrCodePage />);
    expect(screen.getByText('qrCode:pageTitle')).toBeInTheDocument();
    expect(screen.getByText('qrCode:pageSubtitle')).toBeInTheDocument();
  });

  it('切换到解析模式应该渲染 ImageUploader', () => {
    render(<QrCodePage />);
    fireEvent.click(screen.getByText('qrCode:qrToUrl'));
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    expect(screen.queryByTestId('qr-code-preview')).not.toBeInTheDocument();
  });

  it('切换回生成模式应该渲染 QrCodePreview', () => {
    render(<QrCodePage />);
    // 先切换到解析模式
    fireEvent.click(screen.getByText('qrCode:qrToUrl'));
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
    // 再切换回生成模式
    fireEvent.click(screen.getByText('qrCode:urlToQr'));
    expect(screen.getByTestId('qr-code-preview')).toBeInTheDocument();
  });

  it('应该渲染输入区域', () => {
    render(<QrCodePage />);
    expect(screen.getByText('qrCode:urlInputLabel')).toBeInTheDocument();
  });

  it('应该渲染双栏布局容器', () => {
    const { container } = render(<QrCodePage />);
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });
});
