import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrCodePreview from '@/components/QrCodePreview';

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
      expect(screen.getByText('qrCode:qrCodeWillShow')).toBeInTheDocument();
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
      expect(screen.getByText('qrCode:downloadButton')).toBeInTheDocument();
    });

    it('当 qrCodeDataUrl 有值时应显示复制按钮', () => {
      render(
        <QrCodePreview
          qrCodeDataUrl="data:image/png;base64,test"
          onDownload={mockOnDownload}
          onCopy={mockOnCopy}
        />,
      );
      expect(screen.getByText('qrCode:copyQrButton')).toBeInTheDocument();
    });

    it('当 qrCodeDataUrl 为空时不应显示操作按钮', () => {
      render(<QrCodePreview qrCodeDataUrl="" onDownload={mockOnDownload} onCopy={mockOnCopy} />);
      expect(screen.queryByText('qrCode:downloadButton')).not.toBeInTheDocument();
      expect(screen.queryByText('qrCode:copyQrButton')).not.toBeInTheDocument();
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
      fireEvent.click(screen.getByText('qrCode:downloadButton'));
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
      fireEvent.click(screen.getByText('qrCode:copyQrButton'));
      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });
  });
});
