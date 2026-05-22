import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrCodePage from '../index';

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    // 增量伪造需要高精嗅探的 QrCode 核心定位图标
    QrCode: () => <div data-testid="mock-lucide-qrcode">Icon</div>,
  };
});

// Mock useLazyTranslation
vi.mock('@/utils/useLazyTranslation', () => ({
  useLazyTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'zh-CN' },
    isLoaded: true,
  }),
}));

// Mock useSnackbar
vi.mock('@/components/GlobalSnackbar', () => ({
  useSnackbar: () => ({
    showMessage: vi.fn(),
  }),
}));

// Mock getEntryPointType（保留原厂其他特征配置，仅模拟入口路由环境）
vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>();
  return {
    ...actual,
    getEntryPointType: () => 'sidepanel',
  };
});

// Mock 高频变化的子组件，收拢断言边界
vi.mock('@/components/QrCodePreview', () => ({
  default: () => <div data-testid="qr-code-preview">QrCodePreview</div>,
}));

vi.mock('@/components/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

// Mock QRious 动态图像离屏生成引擎
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

  it('应该渲染输入区域的系统标签（对齐新版 Label 机制）', () => {
    render(<QrCodePage />);
    expect(screen.getByText('qrCode:urlInputLabel')).toBeInTheDocument();
  });

  it('应该渲染双翼响应式卡片网格布局', () => {
    const { container } = render(<QrCodePage />);
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
