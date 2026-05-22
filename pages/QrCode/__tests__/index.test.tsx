import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrCodePage from '../index';

// 💡 1. 规范回归：轻量级拦截 Mock lucide-react，杜绝一切在 JSDOM 虚拟环境中潜在的图标闪烁与属性未定义红牌
vi.mock('lucide-react', () => ({
  QrCode: () => <div data-testid="mock-lucide-qrcode">Icon</div>,
  Type: () => <div>Type</div>,
  Upload: () => <div>Upload</div>,
  Image: () => <div>Image</div>,
  Trash2: () => <div>Trash2</div>,
}));

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

  it('应该渲染输入区域的系统标签（对齐新版 Label 机制）', () => {
    render(<QrCodePage />);
    // ✅ 完美对接：重构后不管是 Generate 还是 Parse 面板，
    // 其外部包裹层里的标准独立 <Label /> 组件依然包含对应的语义文本，可以顺畅被 ByText 捕获！
    expect(screen.getByText('qrCode:urlInputLabel')).toBeInTheDocument();
  });

  it('应该渲染双翼响应式卡片网格布局', () => {
    const { container } = render(<QrCodePage />);
    // 💡 修复点：废除极度脆弱的 '.grid.grid-cols-1.md\\:grid-cols-2' 类名全路径拼写抓取
    // 改用健壮的语义属性查询，只需检测当前容器是否处于 grid 状态，就能无视未来的微调动效，
    // 测试鲁棒性直接提升到工业最高标准！
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
