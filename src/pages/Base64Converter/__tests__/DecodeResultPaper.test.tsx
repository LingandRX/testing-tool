import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DecodeResultPaper from '../components/DecodeResultPaper';

describe('DecodeResultPaper 组件', () => {
  const defaultProps = {
    title: 'decodedFileOutput',
    mimeType: 'image/png',
    blobSize: 1024,
    fileName: 'decoded.png',
    onFileNameChange: vi.fn(),
    onDownload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应渲染标题', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      expect(screen.getByText('decodedFileOutput')).toBeInTheDocument();
    });

    it('应渲染 MIME 类型信息', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      expect(screen.getByText(/image\/png/)).toBeInTheDocument();
    });

    it('应通过 formatBytes 渲染文件大小', () => {
      render(<DecodeResultPaper {...{ ...defaultProps, blobSize: 1536 }} />);
      expect(screen.getByText(/1\.5 KB/)).toBeInTheDocument();
    });

    it('应渲染文件名输入框', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      const input = screen.getByDisplayValue('decoded.png');
      expect(input).toBeInTheDocument();
    });

    it('应渲染下载按钮', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      expect(screen.getByRole('button', { name: '下载' })).toBeInTheDocument();
    });

    it('应渲染 children 内容', () => {
      render(
        <DecodeResultPaper {...defaultProps}>
          <div data-testid="preview">预览内容</div>
        </DecodeResultPaper>,
      );
      expect(screen.getByTestId('preview')).toBeInTheDocument();
      expect(screen.getByText('预览内容')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('修改文件名时应调用 onFileNameChange', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      const input = screen.getByDisplayValue('decoded.png');
      fireEvent.change(input, { target: { value: 'new-name.png' } });
      expect(defaultProps.onFileNameChange).toHaveBeenCalledWith('new-name.png');
    });

    it('点击下载按钮时应调用 onDownload', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: '下载' }));
      expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
    });
  });

  describe('按钮状态', () => {
    it('文件名为空时下载按钮应禁用', () => {
      render(<DecodeResultPaper {...{ ...defaultProps, fileName: '' }} />);
      expect(screen.getByRole('button', { name: '下载' })).toBeDisabled();
    });

    it('文件名不为空时下载按钮应启用', () => {
      render(<DecodeResultPaper {...defaultProps} />);
      expect(screen.getByRole('button', { name: '下载' })).toBeEnabled();
    });
  });
});
