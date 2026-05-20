import { useState, useCallback, useEffect, useRef } from 'react';
import QRious from 'qrious';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useDebounce } from '@/utils/useDebounce';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeMode, QrCodeGeneratorState, QrCodeParserState } from '../types';

export function useQrCode(): QrCodeContextValue {
  const { t } = useLazyTranslation('qrCode');
  const { showMessage } = useSnackbar();

  // 当前模式
  const [mode, setMode] = useState<QrCodeMode>('generate');

  // 二维码生成器状态
  const [generatorState, setGeneratorState] = useState<QrCodeGeneratorState>({
    textToEncode: '',
    qrCodeDataUrl: '',
    generating: false,
    inputError: '',
  });

  // 二维码解析器状态
  const [parserState, setParserState] = useState<QrCodeParserState>({
    decodedResult: '',
    parsing: false,
    parseError: '',
    selectedFile: null,
    previewUrl: '',
    dragging: false,
  });

  // 生成二维码
  const generateQrCode = useCallback(
    async (text: string) => {
      if (!text) {
        setGeneratorState((prev) => ({ ...prev, qrCodeDataUrl: '' }));
        return;
      }

      try {
        setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

        let url = text;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const qr = new QRious({
          value: url,
          size: 250,
          level: 'H',
          foreground: '#000000',
          background: '#FFFFFF',
        });

        setGeneratorState((prev) => ({ ...prev, qrCodeDataUrl: qr.toDataURL() }));
      } catch (error) {
        console.error('生成二维码失败:', error);
        setGeneratorState((prev) => ({
          ...prev,
          inputError: t('qrCode:generateError'),
        }));
        showMessage(t('qrCode:generateError'), { severity: 'error', autoHideDuration: 3000 });
      } finally {
        setGeneratorState((prev) => ({ ...prev, generating: false }));
      }
    },
    [t, showMessage],
  );

  // 使用 useRef 存储 generateQrCode 的最新引用，避免无限循环
  const generateQrCodeRef = useRef(generateQrCode);
  generateQrCodeRef.current = generateQrCode;

  // 防抖处理输入文本（200ms）
  const debouncedTextToEncode = useDebounce(generatorState.textToEncode, 200);

  // 当防抖后的文本变化时，自动生成二维码
  useEffect(() => {
    if (debouncedTextToEncode && mode === 'generate') {
      generateQrCodeRef.current(debouncedTextToEncode);
    }
  }, [debouncedTextToEncode, mode]);

  // 设置输入文本
  const setTextToEncode = useCallback((text: string) => {
    setGeneratorState((prev) => ({ ...prev, textToEncode: text }));
  }, []);

  // 处理右键菜单数据
  const handleContextMenuData = useCallback((payload: string) => {
    setMode('generate');
    setGeneratorState((prev) => ({ ...prev, textToEncode: payload }));
  }, []);

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  // 解析二维码
  const parseQrCode = useCallback(
    async (file: File) => {
      try {
        setParserState((prev) => ({ ...prev, parsing: true, parseError: '', decodedResult: '' }));

        const result = await parseQrCodeFromFile(file);

        if (result.success && result.data) {
          setParserState((prev) => ({ ...prev, decodedResult: result.data! }));
          showMessage(t('qrCode:parseSuccess'), { severity: 'success', autoHideDuration: 1000 });
        } else {
          const errorMsg = result.error || t('qrCode:noQrDetected');
          setParserState((prev) => ({ ...prev, parseError: errorMsg }));
          showMessage(errorMsg, { severity: 'error', autoHideDuration: 3000 });
        }
      } catch (error) {
        console.error('解析二维码失败:', error);
        const errorMsg = error instanceof Error ? error.message : t('qrCode:parseError');
        setParserState((prev) => ({ ...prev, parseError: errorMsg }));
        showMessage(errorMsg, { severity: 'error', autoHideDuration: 3000 });
      } finally {
        setParserState((prev) => ({ ...prev, parsing: false }));
      }
    },
    [t, showMessage],
  );

  // 下载二维码
  const downloadQrCode = useCallback(() => {
    if (!generatorState.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = generatorState.qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage(t('qrCode:qrCodeDownloadSuccess'), { severity: 'success', autoHideDuration: 1000 });
  }, [generatorState.qrCodeDataUrl, showMessage, t]);

  // 复制二维码
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

      showMessage(t('qrCode:qrCodeCopySuccess'), { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('复制二维码失败:', error);
      showMessage(t('qrCode:copyError'), { severity: 'error', autoHideDuration: 3000 });
    }
  }, [generatorState.qrCodeDataUrl, showMessage, t]);

  // 处理文件选择
  const handleFileChange = useCallback(
    (file: File) => {
      setParserState((prev) => {
        // 释放旧的预览 URL
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
      // 自动解析
      parseQrCode(file);
    },
    [parseQrCode],
  );

  // 清除文件
  const handleClearFile = useCallback(() => {
    if (parserState.previewUrl) {
      URL.revokeObjectURL(parserState.previewUrl);
    }
    setParserState((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: '',
      decodedResult: '',
      parseError: '',
    }));
  }, [parserState.previewUrl]);

  return {
    mode,
    setMode,
    generatorState,
    setTextToEncode,
    generateQrCode,
    downloadQrCode,
    copyQrCode,
    parserState,
    setParserState,
    parseQrCode,
    handleFileChange,
    handleClearFile,
  };
}
