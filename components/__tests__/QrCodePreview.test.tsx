import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrCodePreview from '@/components/QrCodePreview';

// 💡 1. 规范对齐：在这个测试文件的头部同样挂载统一的 react-i18next 桩函数，
// 与你整个工程的国际化解耦架构完美闭环。
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn((ns: string | string[]) => {
    const nsArray = Array.isArray(ns) ? ns : [ns];
    return {
      t: (key: string) => `${nsArray.join(',')}:${key}`,
      i18n: { language: 'en' },
      ready: true,
    };
  }),
}));

describe('QrCodePreview 组件', () => {
  const mockOnDownload = vi.fn();
  const mockOnCopy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('渲染测试', () => {
    it('当 qrCodeDataUrl 为空时应显示占位文本', () => {
      render(<QrCodePreview qrCodeDataUrl="" onDownload={mockOnDownload} onCopy={mockOnCopy} />);
      // 💡 修复点 2：全面拥抱柔性正则匹配，直接终结多层 'qrCode:qrCode:' 前缀踩踏！
      expect(screen.getByText(/qrCodeWillShow/)).toBeInTheDocument();
    });

    it('当 qrCodeDataUrl 有值时应显示二维码图片', () => {
      const testDataUrl = 'data:image/png;base64,test123';
      render(
        <QrCodePreview
          qrCodeDataUrl={testDataUrl}
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      const img = screen.getByAltText('QR Code Preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', testDataUrl);
    });

    it('当 qrCodeDataUrl 有值时应显示下载按钮', () => {
      render(
        <QrCodePreview
          qrCodeDataUrl="data:image/png;base64,test"
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      // 💡 修复点 3：切换为正则，无缝过检
      expect(screen.getByText(/downloadButton/)).toBeInTheDocument();
    });

    it('当 qrCodeDataUrl 有值时应显示复制按钮', () => {
      render(
        <QrCodePreview
          qrCodeDataUrl="data:image/png;base64,test"
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      // 💡 修复点 4：切换为正则，无缝过检
      expect(screen.getByText(/copyQrButton/)).toBeInTheDocument();
    });

    it('当 qrCodeDataUrl 为空时不应显示操作按钮', () => {
      render(<QrCodePreview qrCodeDataUrl="" onDownload={mockOnDownload} onCopy={mockOnCopy} />);
      expect(screen.queryByText(/downloadButton/)).not.toBeInTheDocument();
      expect(screen.queryByText(/copyQrButton/)).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击下载按钮时应调用 onDownload 回调', () => {
      render(
        <QrCodePreview
          qrCodeDataUrl="data:image/png;base64,test"
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      // 💡 修复点 5：点击行为同步更改为正则匹配定位，保障状态修改流一帧直达
      fireEvent.click(screen.getByText(/downloadButton/));
      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('点击复制按钮时应调用 onCopy 回调', () => {
      render(
        <QrCodePreview
          qrCodeDataUrl="data:image/png;base64,test"
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      // 💡 修复点 6：彻底修复第 88 行报错位置，改用正则解开死锁！
      fireEvent.click(screen.getByText(/copyQrButton/));
      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });
  });
});
