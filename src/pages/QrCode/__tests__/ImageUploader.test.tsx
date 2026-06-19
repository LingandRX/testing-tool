import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ImageUploader from '../components/ImageUploader';

// 配置多端一致性常驻桩（WXT 规范）
const storageOnChangedMock = { addListener: vi.fn(), removeListener: vi.fn() };
(globalThis as any).chrome = { storage: { onChanged: storageOnChangedMock } };
(globalThis as any).browser = { storage: { onChanged: storageOnChangedMock } };

// 模拟 URL API
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ImageUploader 组件', () => {
  const mockOnFileChange = vi.fn();
  const mockOnClearFile = vi.fn();
  const mockOnDraggingChange = vi.fn();

  const defaultProps = {
    selectedFile: null,
    onFileChange: mockOnFileChange,
    onClearFile: mockOnClearFile,
    previewUrl: '',
    dragging: false,
    onDraggingChange: mockOnDraggingChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:test-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('渲染测试', () => {
    it('当没有选中文件时应显示上传提示', () => {
      render(<ImageUploader {...defaultProps} />);
      expect(screen.getByText(/点击.*拖拽/)).toBeInTheDocument();
      expect(screen.getByText(/格式/)).toBeInTheDocument();
    });

    it('当没有选中文件时应显示 ImageIcon', () => {
      render(<ImageUploader {...defaultProps} />);
      expect(screen.getByTestId('ImageIcon')).toBeInTheDocument();
    });

    it('当选中文件时应显示文件预览', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      render(
        <ImageUploader {...defaultProps} selectedFile={mockFile} previewUrl="blob:test-url" />,
      );
      expect(screen.getByText('test.png')).toBeInTheDocument();
      expect(screen.getByText(/点击更换/)).toBeInTheDocument();
    });

    it('当选中文件时应显示预览图片', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      render(
        <ImageUploader {...defaultProps} selectedFile={mockFile} previewUrl="blob:test-url" />,
      );
      const img = screen.getByAltText('QR Code Preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'blob:test-url');
    });

    it('当选中文件时应显示清除按钮', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      render(
        <ImageUploader {...defaultProps} selectedFile={mockFile} previewUrl="blob:test-url" />,
      );
      expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
    });

    it('应包含隐藏的文件输入框', () => {
      render(<ImageUploader {...defaultProps} />);
      const input = document.getElementById('qr-code-upload') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('文件选择交互', () => {
    it('选择文件时应调用 onFileChange', async () => {
      render(<ImageUploader {...defaultProps} />);
      const input = document.getElementById('qr-code-upload') as HTMLInputElement;
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      await act(async () => {
        fireEvent.change(input, { target: { files: [mockFile] } });
      });

      expect(mockOnFileChange).toHaveBeenCalledWith(mockFile);
      expect(mockOnFileChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('拖拽交互', () => {
    it('拖拽进入时应调用 onDraggingChange(true)', () => {
      const { container } = render(<ImageUploader {...defaultProps} />);
      const dropzone = container.firstChild as HTMLElement;

      fireEvent.dragOver(dropzone);
      expect(mockOnDraggingChange).toHaveBeenCalledWith(true);
    });

    it('拖拽离开时应调用 onDraggingChange(false)', () => {
      const { container } = render(<ImageUploader {...defaultProps} />);
      const dropzone = container.firstChild as HTMLElement;

      fireEvent.dragLeave(dropzone);
      expect(mockOnDraggingChange).toHaveBeenCalledWith(false);
    });

    it('放置文件时应调用 onFileChange', () => {
      const { container } = render(<ImageUploader {...defaultProps} />);
      const dropzone = container.firstChild as HTMLElement;
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [mockFile],
        },
      });
      Object.defineProperty(dropEvent, 'preventDefault', {
        value: vi.fn(),
      });

      fireEvent(dropzone, dropEvent);

      expect(mockOnDraggingChange).toHaveBeenCalledWith(false);
      expect(mockOnFileChange).toHaveBeenCalledWith(mockFile);
      expect(mockOnFileChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('清除文件功能', () => {
    it('点击清除按钮时应调用 onClearFile', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      render(
        <ImageUploader {...defaultProps} selectedFile={mockFile} previewUrl="blob:test-url" />,
      );

      const clearButton = screen.getByTestId('ClearIcon').closest('button')!;
      fireEvent.click(clearButton);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
      expect(mockOnClearFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('粘贴功能', () => {
    it('不应注册 document 粘贴事件监听（由 ParsePanel 统一处理）', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      render(<ImageUploader {...defaultProps} />);

      const pasteListeners = addEventListenerSpy.mock.calls.filter(([event]) => event === 'paste');
      expect(pasteListeners).toHaveLength(0);
    });
  });

  describe('样式测试', () => {
    it('拖拽状态时应应用拖拽样式', () => {
      const { container } = render(<ImageUploader {...defaultProps} dragging={true} />);
      const dropzone = container.firstChild as HTMLElement;
      expect(dropzone).toBeInTheDocument();
    });

    it('有文件时应应用有文件样式', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const { container } = render(
        <ImageUploader {...defaultProps} selectedFile={mockFile} previewUrl="blob:test-url" />,
      );
      const dropzone = container.firstChild as HTMLElement;
      expect(dropzone).toBeInTheDocument();
    });
  });
});
