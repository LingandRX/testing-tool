import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import ParsePanel from '../components/ParsePanel';
import type { QrCodeParserState } from '../types';

const mockHandleFileChange = vi.fn();
const mockHandleClearFile = vi.fn();
const mockSetParserState = vi.fn();

let mockParserState: QrCodeParserState = {
  selectedFile: null,
  previewUrl: '',
  dragging: false,
  decodedResult: '',
  parsing: false,
  parseError: '',
};

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../contexts/QrCodeContext', () => ({
  useQrCodeContext: () => ({
    parserState: mockParserState,
    setParserState: mockSetParserState,
    handleFileChange: mockHandleFileChange,
    handleClearFile: mockHandleClearFile,
  }),
}));

function createImagePasteEvent(file: File) {
  const pasteEvent = new Event('paste', { bubbles: true }) as ClipboardEvent;
  Object.defineProperty(pasteEvent, 'clipboardData', {
    value: {
      items: [
        {
          type: file.type,
          getAsFile: () => file,
        },
      ],
      getData: () => '',
    },
  });
  Object.defineProperty(pasteEvent, 'preventDefault', { value: vi.fn() });
  return pasteEvent;
}

function createBase64PasteEvent(dataUrl: string) {
  const pasteEvent = new Event('paste', { bubbles: true }) as ClipboardEvent;
  Object.defineProperty(pasteEvent, 'clipboardData', {
    value: {
      items: [],
      getData: (type: string) => (type === 'text/plain' ? dataUrl : ''),
    },
  });
  Object.defineProperty(pasteEvent, 'preventDefault', { value: vi.fn() });
  return pasteEvent;
}

describe('ParsePanel 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParserState = {
      selectedFile: null,
      previewUrl: '',
      dragging: false,
      decodedResult: '',
      parsing: false,
      parseError: '',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('粘贴功能', () => {
    it('粘贴图片时应只处理一次', async () => {
      render(<ParsePanel />);
      const mockFile = new File(['img'], 'paste.png', { type: 'image/png' });

      await act(async () => {
        document.dispatchEvent(createImagePasteEvent(mockFile));
      });

      expect(mockHandleFileChange).toHaveBeenCalledTimes(1);
      expect(mockHandleFileChange).toHaveBeenCalledWith(mockFile);
      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('图片粘贴成功，正在解析...');
    });

    it('与 ImageUploader 同时挂载时 document 上只应有一个 paste 监听', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      render(<ParsePanel />);

      const pasteListeners = addEventListenerSpy.mock.calls.filter(([event]) => event === 'paste');
      expect(pasteListeners).toHaveLength(1);
    });

    it('粘贴 Base64 data URI 时应转换为文件并只处理一次', async () => {
      const dataUrl = 'data:image/png;base64,abcd';
      const mockBlob = new Blob(['img'], { type: 'image/png' });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          blob: () => Promise.resolve(mockBlob),
        }),
      );

      render(<ParsePanel />);

      await act(async () => {
        document.dispatchEvent(createBase64PasteEvent(dataUrl));
      });

      expect(fetch).toHaveBeenCalledWith(dataUrl);
      expect(mockHandleFileChange).toHaveBeenCalledTimes(1);
      expect(mockHandleFileChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'pasted-image.png', type: 'image/png' }),
      );
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    it('已上传图片时粘贴仍应只处理一次', async () => {
      mockParserState = {
        selectedFile: new File(['existing'], 'existing.png', { type: 'image/png' }),
        previewUrl: 'blob:existing',
        dragging: false,
        decodedResult: 'decoded-text',
        parsing: false,
        parseError: '',
      };

      render(<ParsePanel />);
      expect(screen.getByText('已上传图片')).toBeInTheDocument();

      const mockFile = new File(['new'], 'new.png', { type: 'image/png' });
      await act(async () => {
        document.dispatchEvent(createImagePasteEvent(mockFile));
      });

      expect(mockHandleFileChange).toHaveBeenCalledTimes(1);
      expect(mockHandleFileChange).toHaveBeenCalledWith(mockFile);
    });
  });
});
