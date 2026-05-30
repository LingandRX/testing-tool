import { useCallback, useState } from 'react';
import QRious from 'qrious';
import { toast } from 'sonner';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useI18n } from '@/utils/chromeI18n';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

/** 生成二维码的核心逻辑 */
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
  const { t } = useI18n('qrCode');

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

  const setTextToEncode = useCallback((text: string) => {
    setGeneratorState((prev) => ({ ...prev, textToEncode: text, inputError: '' }));
  }, []);

  /** 显式触发生成二维码并切换到预览态 */
  const confirmGenerate = useCallback(() => {
    const text = generatorState.textToEncode.trim();

    if (!text) {
      setGeneratorState((prev) => ({ ...prev, inputError: t('qrCode:inputRequired') }));
      toast.error(t('qrCode:inputRequired'));
      return;
    }

    setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

    const qrCodeDataUrl = generateQrCodeDataUrl(text);

    if (!qrCodeDataUrl) {
      setGeneratorState((prev) => ({
        ...prev,
        generating: false,
        inputError: t('qrCode:generateError'),
      }));
      toast.error(t('qrCode:generateError'));
      return;
    }

    setGeneratorState((prev) => ({
      ...prev,
      step: 'preview',
      savedText: text,
      qrCodeDataUrl,
      generating: false,
    }));
  }, [generatorState.textToEncode, t]);

  /** 返回编辑态，保留上次输入内容 */
  const backToEdit = useCallback(() => {
    setGeneratorState((prev) => ({
      ...prev,
      step: 'input',
      textToEncode: prev.savedText,
      qrCodeDataUrl: '',
      inputError: '',
    }));
  }, []);

  const handleContextMenuData = useCallback((payload: string) => {
    setMode('generate');
    setGeneratorState((prev) => ({
      ...prev,
      step: 'input',
      textToEncode: payload,
      savedText: '',
      qrCodeDataUrl: '',
      inputError: '',
    }));
  }, []);

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  // 反向活态解析二维码算法
  const parseQrCode = useCallback(
    async (file: File) => {
      try {
        setParserState((prev) => ({ ...prev, parsing: true, parseError: '', decodedResult: '' }));

        const result = await parseQrCodeFromFile(file);

        if (result.success && result.data) {
          setParserState((prev) => ({ ...prev, decodedResult: result.data! }));
          toast.success(t('qrCode:parseSuccess'));
        } else {
          const errorMsg = result.error || t('qrCode:noQrDetected');
          setParserState((prev) => ({ ...prev, parseError: errorMsg }));
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error('解析二维码失败:', error);
        const errorMsg = error instanceof Error ? error.message : t('qrCode:parseError');
        setParserState((prev) => ({ ...prev, parseError: errorMsg }));
        toast.error(errorMsg);
      } finally {
        setParserState((prev) => ({ ...prev, parsing: false }));
      }
    },
    [t],
  );

  const downloadQrCode = useCallback(() => {
    if (!generatorState.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = generatorState.qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    toast.success(t('qrCode:qrCodeDownloadSuccess'));
  }, [generatorState.qrCodeDataUrl, t]);

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

      toast.success(t('qrCode:qrCodeCopySuccess'));
    } catch (error) {
      console.error('复制二维码失败:', error);
      toast.error(t('qrCode:copyError'));
    }
  }, [generatorState.qrCodeDataUrl, t]);

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

      // 触发解析安全的后台 Promise
      parseQrCode(file).catch((err) => {
        console.error('Parser standalone task thread exploded:', err);
      });
    },
    [parseQrCode],
  );

  // 清除解析受控文件
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
