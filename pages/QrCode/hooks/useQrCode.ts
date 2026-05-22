import { useCallback, useMemo, useState } from 'react';
import QRious from 'qrious';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useDebounce } from '@/utils/useDebounce';
import type { QrCodeContextValue } from '../contexts/QrCodeContext';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

export function useQrCode(): QrCodeContextValue {
  const { t } = useLazyTranslation('qrCode');
  const { showMessage } = useSnackbar();

  // 核心路由视图模式
  const [mode, setMode] = useState<QrCodeMode>('generate');

  // 1. 生成器状态流（大幅瘦身：剔除 generating 状态）
  const [generatorState, setGeneratorState] = useState<
    Omit<QrCodeGeneratorState, 'generating' | 'qrCodeDataUrl'>
  >({
    textToEncode: '',
    inputError: '',
  });

  // 2. 解析器状态流
  const [parserState, setParserState] = useState<QrCodeParserState>({
    decodedResult: '',
    parsing: false,
    parseError: '',
    selectedFile: null,
    previewUrl: '',
    dragging: false,
  });

  // 3. 高频打字极速防抖
  const debouncedTextToEncode = useDebounce(generatorState.textToEncode, 200);

  // 💡 4. 贯彻方案 A（无副作用超导管线）：
  // 彻底删除原有的 generateQrCodeRef、3个 useEffect、1个 useRef 以及相关的复杂状态机。
  // 二维码画布纯粹作为防抖文本的派生变量同步算出，0重绘死循环风险，体验平滑如镜！
  const qrCodeDataUrl = useMemo(() => {
    const text = debouncedTextToEncode.trim();
    if (!text) return '';

    try {
      let url = text;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // 💡 暗黑模式自适应大闸：实时嗅探系统 DOM 阶度
      const isDark = document.documentElement.classList.contains('dark');

      const qr = new QRious({
        value: url,
        size: 260,
        level: 'H',
        // 暗黑模式下使用透明底、月白前景色；白天模式下使用标准现代黑白配
        foreground: isDark ? '#f3f4f6' : '#0f172a',
        background: isDark ? 'transparent' : '#ffffff',
      });

      return qr.toDataURL();
    } catch (error) {
      console.error('QR code generation sync task failed:', error);
      return '';
    }
  }, [debouncedTextToEncode]);

  // 融合派生数据至完整状态体，满足外部组件强类型契合
  const fullGeneratorState = useMemo<QrCodeGeneratorState>(
    () => ({
      ...generatorState,
      qrCodeDataUrl,
      generating: false,
    }),
    [generatorState, qrCodeDataUrl],
  );

  // 设置输入文本
  const setTextToEncode = useCallback((text: string) => {
    setGeneratorState((prev) => ({ ...prev, textToEncode: text, inputError: '' }));
  }, []);

  // 处理右键菜单数据上下文
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
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage(t('qrCode:qrCodeDownloadSuccess'), { severity: 'success', autoHideDuration: 1000 });
  }, [qrCodeDataUrl, showMessage, t]);

  // 复制二维码至剪贴板
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

      showMessage(t('qrCode:qrCodeCopySuccess'), { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('复制二维码失败:', error);
      showMessage(t('qrCode:copyError'), { severity: 'error', autoHideDuration: 3000 });
    }
  }, [qrCodeDataUrl, showMessage, t]);

  // 处理文件选择
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
