import { useCallback, useMemo, useState } from 'react';
import QRious from 'qrious';
import { toast } from 'sonner';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useI18n } from '@/utils/chromeI18n';
import { useDebounce } from '@/utils/useDebounce';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

export function useQrCode(): QrCodeContextValue {
  const { t } = useI18n('qrCode');

  const [mode, setMode] = useState<QrCodeMode>('generate');

  const [generatorState, setGeneratorState] = useState<
    Omit<QrCodeGeneratorState, 'generating' | 'qrCodeDataUrl'>
  >({
    textToEncode: '',
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

  const debouncedTextToEncode = useDebounce(generatorState.textToEncode, 200);

  const qrCodeDataUrl = useMemo(() => {
    const text = debouncedTextToEncode.trim();
    if (!text) return '';

    try {
      let url = text;
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
      console.error('QR code generation sync task failed:', error);
      return '';
    }
  }, [debouncedTextToEncode]);

  const fullGeneratorState = useMemo<QrCodeGeneratorState>(
    () => ({
      ...generatorState,
      qrCodeDataUrl,
      generating: false,
    }),
    [generatorState, qrCodeDataUrl],
  );

  const setTextToEncode = useCallback((text: string) => {
    setGeneratorState((prev) => ({ ...prev, textToEncode: text, inputError: '' }));
  }, []);

  const handleContextMenuData = useCallback((payload: string) => {
    setMode('generate');
    setGeneratorState((prev) => ({ ...prev, textToEncode: payload, inputError: '' }));
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
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    toast.success(t('qrCode:qrCodeDownloadSuccess'));
  }, [qrCodeDataUrl, t]);

  const copyQrCode = useCallback(async () => {
    if (!qrCodeDataUrl) return;

    try {
      const response = await fetch(qrCodeDataUrl);
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
  }, [qrCodeDataUrl, t]);

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
    generatorState: fullGeneratorState,
    setTextToEncode,
    parseQrCode,
    downloadQrCode,
    copyQrCode,
    parserState,
    setParserState,
    handleFileChange,
    handleClearFile,
  };
}
