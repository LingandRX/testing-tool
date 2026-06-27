import { useCallback, useEffect, useRef, useState } from 'react';
import QRious from 'qrious';
import { toast } from 'sonner';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

const DEBOUNCE_DELAY = 500;

function isUrl(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }

  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+([/:].*)?$/;
  return domainPattern.test(trimmed);
}

function isImageUrl(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();

  if (trimmedUrl.startsWith('data:image/')) {
    return true;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  if (imageExtensions.some((ext) => trimmedUrl.includes(ext))) {
    return true;
  }

  const imageKeywords = ['/image/', '/img/', '/photo/', '/pic/', '/upload/'];
  if (imageKeywords.some((keyword) => trimmedUrl.includes(keyword))) {
    return true;
  }

  return false;
}

function generateQrCodeDataUrl(text: string): string {
  const trimmedText = text.trim();
  if (!trimmedText) return '';

  try {
    let url = trimmedText;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const isDark = document.documentElement.classList.contains('dark');

    const qr = new QRious({
      value: url,
      size: 260,
      level: 'H',
      foreground: isDark ? '#f3f4f6' : '#0f172a',
      background: isDark ? 'transparent' : '#ffffff',
    });

    return qr.toDataURL();
  } catch (error) {
    console.error('QR code generation failed:', error);
    return '';
  }
}

export function useQrCode(): QrCodeContextValue {
  const [mode, setMode] = useState<QrCodeMode>('generate');

  const [generatorState, setGeneratorState] = useState<QrCodeGeneratorState>({
    step: 'input',
    textToEncode: '',
    savedText: '',
    qrCodeDataUrl: '',
    generating: false,
    inputError: '',
  });

  const [parserState, setParserState] = useState<QrCodeParserState>({
    decodedResult: '',
    parsing: false,
    parseError: '',
    selectedFile: null,
    previewUrl: '',
    dragging: false,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const autoGenerateIfUrl = useCallback((text: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isUrl(text)) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

      const qrCodeDataUrl = generateQrCodeDataUrl(text);

      if (qrCodeDataUrl) {
        setGeneratorState((prev) => ({
          ...prev,
          step: 'preview',
          savedText: text.trim(),
          qrCodeDataUrl,
          generating: false,
        }));
      } else {
        setGeneratorState((prev) => ({
          ...prev,
          generating: false,
          inputError: '生成二维码失败，请重试',
        }));
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const setTextToEncode = useCallback(
    (text: string) => {
      setGeneratorState((prev) => ({ ...prev, textToEncode: text, inputError: '' }));
      autoGenerateIfUrl(text);
    },
    [autoGenerateIfUrl],
  );

  const confirmGenerate = useCallback(() => {
    const text = generatorState.textToEncode.trim();

    if (!text) {
      setGeneratorState((prev) => ({ ...prev, inputError: '请输入内容' }));
      toast.error('请输入内容');
      return;
    }

    setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

    setTimeout(() => {
      const qrCodeDataUrl = generateQrCodeDataUrl(text);

      if (!qrCodeDataUrl) {
        setGeneratorState((prev) => ({
          ...prev,
          generating: false,
          inputError: '生成二维码失败，请重试',
        }));
        toast.error('生成二维码失败，请重试');
        return;
      }

      setGeneratorState((prev) => ({
        ...prev,
        step: 'preview',
        savedText: text,
        qrCodeDataUrl,
        generating: false,
      }));
    }, 0);
  }, [generatorState.textToEncode]);

  const backToEdit = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setGeneratorState((prev) => ({
      ...prev,
      step: 'input',
      textToEncode: prev.savedText,
      qrCodeDataUrl: '',
      inputError: '',
    }));
  }, []);

  const parseQrCodeFromUrl = useCallback(async (imageUrl: string) => {
    try {
      setParserState((prev) => ({
        ...prev,
        parsing: true,
        parseError: '',
        decodedResult: '',
        previewUrl: imageUrl,
        selectedFile: null,
      }));

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode-image.png', { type: blob.type });

      setParserState((prev) => ({ ...prev, selectedFile: file }));

      const result = await parseQrCodeFromFile(file);

      if (result.success && result.data) {
        setParserState((prev) => ({ ...prev, decodedResult: result.data! }));
        toast.success('二维码解析成功');
      } else {
        const errorMsg = result.error || '未检测到二维码，请确保图片清晰且包含二维码';
        setParserState((prev) => ({ ...prev, parseError: errorMsg }));
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('解析图片二维码失败:', error);
      const errorMsg = error instanceof Error ? error.message : '解析二维码失败，请重试';
      setParserState((prev) => ({ ...prev, parseError: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setParserState((prev) => ({ ...prev, parsing: false }));
    }
  }, []);

  const handleContextMenuData = useCallback(
    (payload: string) => {
      if (isImageUrl(payload)) {
        setMode('parse');
        void parseQrCodeFromUrl(payload);
        return;
      }

      setMode('generate');

      const qrCodeDataUrl = generateQrCodeDataUrl(payload);

      if (qrCodeDataUrl) {
        setGeneratorState((prev) => ({
          ...prev,
          step: 'preview',
          textToEncode: payload,
          savedText: payload.trim(),
          qrCodeDataUrl,
          generating: false,
          inputError: '',
        }));
      } else {
        setGeneratorState((prev) => ({
          ...prev,
          step: 'input',
          textToEncode: payload,
          savedText: '',
          qrCodeDataUrl: '',
          generating: false,
          inputError: '',
        }));
      }
    },
    [parseQrCodeFromUrl],
  );

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  const parseQrCode = useCallback(async (file: File) => {
    try {
      setParserState((prev) => ({ ...prev, parsing: true, parseError: '', decodedResult: '' }));

      const result = await parseQrCodeFromFile(file);

      if (result.success && result.data) {
        setParserState((prev) => ({ ...prev, decodedResult: result.data! }));
        toast.success('二维码解析成功');
      } else {
        const errorMsg = result.error || '未检测到二维码，请确保图片清晰且包含二维码';
        setParserState((prev) => ({ ...prev, parseError: errorMsg }));
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('解析二维码失败:', error);
      const errorMsg = error instanceof Error ? error.message : '解析二维码失败，请重试';
      setParserState((prev) => ({ ...prev, parseError: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setParserState((prev) => ({ ...prev, parsing: false }));
    }
  }, []);

  const downloadQrCode = useCallback(() => {
    if (!generatorState.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = generatorState.qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    toast.success('二维码下载成功');
  }, [generatorState.qrCodeDataUrl]);

  const copyQrCode = useCallback(async () => {
    if (!generatorState.qrCodeDataUrl) return;

    try {
      const response = await fetch(generatorState.qrCodeDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      toast.success('二维码已复制到剪贴板');
    } catch (error) {
      console.error('复制二维码失败:', error);
      toast.error('复制失败，请重试');
    }
  }, [generatorState.qrCodeDataUrl]);

  const handleFileChange = useCallback(
    (file: File) => {
      setParserState((prev) => {
        if (prev.previewUrl) {
          URL.revokeObjectURL(prev.previewUrl);
        }
        return {
          ...prev,
          selectedFile: file,
          previewUrl: URL.createObjectURL(file),
          decodedResult: '',
          parseError: '',
        };
      });

      parseQrCode(file).catch((err) => {
        console.error('解析二维码失败:', err);
      });
    },
    [parseQrCode],
  );

  const handleClearFile = useCallback(() => {
    setParserState((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return {
        ...prev,
        selectedFile: null,
        previewUrl: '',
        decodedResult: '',
        parseError: '',
      };
    });
  }, []);

  return {
    mode,
    setMode,
    generatorState,
    setTextToEncode,
    confirmGenerate,
    backToEdit,
    parseQrCode,
    downloadQrCode,
    copyQrCode,
    parserState,
    setParserState,
    handleFileChange,
    handleClearFile,
  };
}
