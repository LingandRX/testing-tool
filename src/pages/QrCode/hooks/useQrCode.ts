import { useCallback, useEffect, useRef, useState } from 'react';
import QRious from 'qrious';
import { toast } from 'sonner';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useI18n } from '@/utils/chromeI18n';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

/** 防抖延迟时间（毫秒） */
const DEBOUNCE_DELAY = 500;

/** 检测文本是否为URL格式 */
function isUrl(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 检查是否以 http:// 或 https:// 开头
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }

  // 检查是否为域名格式（包含.且不以特殊字符开头）
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+([/:].*)?$/;
  return domainPattern.test(trimmed);
}

/** 检测URL是否为图片格式 */
function isImageUrl(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();

  // 检查是否为 data:image 格式
  if (trimmedUrl.startsWith('data:image/')) {
    return true;
  }

  // 检查是否包含图片扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  if (imageExtensions.some((ext) => trimmedUrl.includes(ext))) {
    return true;
  }

  // 检查URL路径中是否包含图片相关关键词
  const imageKeywords = ['/image/', '/img/', '/photo/', '/pic/', '/upload/'];
  if (imageKeywords.some((keyword) => trimmedUrl.includes(keyword))) {
    return true;
  }

  return false;
}

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

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清除防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /** 自动检测URL并生成二维码 */
  const autoGenerateIfUrl = useCallback(
    (text: string) => {
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
            inputError: t('qrCode:generateError'),
          }));
        }
      }, DEBOUNCE_DELAY);
    },
    [t],
  );

  const setTextToEncode = useCallback(
    (text: string) => {
      setGeneratorState((prev) => ({ ...prev, textToEncode: text, inputError: '' }));
      autoGenerateIfUrl(text);
    },
    [autoGenerateIfUrl],
  );

  /** 手动触发生成二维码（用于非URL文本） */
  const confirmGenerate = useCallback(() => {
    const text = generatorState.textToEncode.trim();

    if (!text) {
      setGeneratorState((prev) => ({ ...prev, inputError: t('qrCode:inputRequired') }));
      toast.error(t('qrCode:inputRequired'));
      return;
    }

    // 先设置 loading 状态，让 React 渲染加载动画
    setGeneratorState((prev) => ({ ...prev, generating: true, inputError: '' }));

    // 延迟到下一帧生成，确保 loading 状态先被渲染显示
    setTimeout(() => {
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
    }, 0);
  }, [generatorState.textToEncode, t]);

  /** 返回编辑态，保留上次输入内容 */
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

  /** 从图片URL解析二维码 */
  const parseQrCodeFromUrl = useCallback(
    async (imageUrl: string) => {
      try {
        setParserState((prev) => ({
          ...prev,
          parsing: true,
          parseError: '',
          decodedResult: '',
          previewUrl: imageUrl,
          selectedFile: null,
        }));

        // 从URL获取图片并转换为File对象
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode-image.png', { type: blob.type });

        setParserState((prev) => ({ ...prev, selectedFile: file }));

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
        console.error('解析图片二维码失败:', error);
        const errorMsg = error instanceof Error ? error.message : t('qrCode:parseError');
        setParserState((prev) => ({ ...prev, parseError: errorMsg }));
        toast.error(errorMsg);
      } finally {
        setParserState((prev) => ({ ...prev, parsing: false }));
      }
    },
    [t],
  );

  /** 右键菜单传入URL时，自动生成二维码或解析图片 */
  const handleContextMenuData = useCallback(
    (payload: string) => {
      // 检测是否为图片URL，如果是则切换到解析模式
      if (isImageUrl(payload)) {
        setMode('parse');
        void parseQrCodeFromUrl(payload);
        return;
      }

      // 非图片URL，生成二维码
      setMode('generate');

      // 直接生成二维码，无需等待
      const qrCodeDataUrl = generateQrCodeDataUrl(payload);

      if (qrCodeDataUrl) {
        // 生成成功，直接跳转到预览态
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
        // 生成失败，停留在输入态，显示文本供用户编辑
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
