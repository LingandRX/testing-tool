import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import type { FileToBase64Result } from '@/utils/base64Converter';
import {
  base64ToBlob,
  fileToBase64,
  isFileSizeValid,
  isSupportedImageExtension,
  isSupportedImageType,
  MAX_FILE_SIZE,
} from '@/utils/base64Converter';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface UseBase64ConverterProps {
  mode: 'file' | 'image';
}

export function useBase64Converter({ mode }: UseBase64ConverterProps) {
  const { t } = useI18n('base64Converter');

  const [result, setResult] = useState<FileToBase64Result | null>(null);
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  const [decodeInput, setDecodeInput] = useState('');
  const [debouncedDecodeInput, setDebouncedDecodeInput] = useState('');
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedDecodeInput(decodeInput);
    }, 250);
    return () => clearTimeout(handle);
  }, [decodeInput]);

  const resetAll = useCallback(() => {
    cancelRef.current = true;
    setResult(null);
    setInfo(null);
    setIsLoading(false);
    setDecodeInput('');
    setDebouncedDecodeInput('');
    setCustomFileName('');
    setEncodeError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      cancelRef.current = false;
      setEncodeError(null);
      setResult(null);
      setInfo(null);

      if (!isFileSizeValid(file.size)) {
        setEncodeError(t('fileSizeExceeded', { max: `${MAX_FILE_SIZE / 1024 / 1024} MB` }));
        return;
      }

      if (
        mode === 'image' &&
        !isSupportedImageType(file.type) &&
        !isSupportedImageExtension(file.name)
      ) {
        setEncodeError(t('unsupportedImageType'));
        return;
      }

      setInfo({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
      setIsLoading(true);

      try {
        const res = await fileToBase64(file);
        if (!cancelRef.current) setResult(res);
      } catch (e) {
        if (!cancelRef.current) {
          setEncodeError(e instanceof Error ? e.message : t('conversionFailed'));
        }
      } finally {
        if (!cancelRef.current) setIsLoading(false);
      }
    },
    [mode, t],
  );

  const safeFileSelect = useCallback(
    (file: File) => {
      handleFileSelect(file).catch((err) => {
        console.error(`Base64 [${mode}] pipeline crash:`, err);
      });
    },
    [handleFileSelect, mode],
  );

  const decodePipeline = useMemo(() => {
    const cleanedInput = debouncedDecodeInput.replace(/^data:image\/[a-z+]+;base64,/i, '').trim();
    if (!cleanedInput) return { decoded: null, error: null };

    try {
      const res = base64ToBlob(cleanedInput);
      return { decoded: res, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      return {
        decoded: null,
        error: message === 'Invalid Base64 string' ? t('invalidBase64') : t('conversionFailed'),
      };
    }
  }, [debouncedDecodeInput, t]);

  const decoded = decodePipeline.decoded;
  const decodeError = decodePipeline.error;

  const decodedFileName = useMemo(() => {
    if (customFileName) return customFileName;
    if (decoded) return `decoded${decoded.suggestedExtension}`;
    return '';
  }, [customFileName, decoded]);

  // 💡 托管最大文件体积字符串算子，清除下游引入风险
  const maxFileSizeStr = `${MAX_FILE_SIZE / 1024 / 1024} MB`;

  return {
    result,
    info,
    isLoading,
    isDragging,
    setIsDragging,
    fileInputRef,
    encodeError,
    decodeInput,
    setDecodeInput,
    decoded,
    decodeError,
    decodedFileName,
    setCustomFileName,
    resetAll,
    safeFileSelect,
    maxFileSizeStr,
  };
}
