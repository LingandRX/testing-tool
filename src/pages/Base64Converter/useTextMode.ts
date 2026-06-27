import { useCallback, useEffect, useMemo, useState } from 'react';
import { base64ToText, textToBase64 } from '@/utils/base64Converter';
import { useContextMenuData } from '@/utils/useContextMenuData';

const IMAGE_DATA_URI_PATTERN = /^\s*data:image\//i;

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid Base64 string': '无效的 Base64 字符串',
  'Input appears to be binary data (e.g. an image). Please use the Image tab instead.':
    '检测到二进制数据（如图像），请使用图像选项卡',
};

export function useTextMode() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 200);
    return () => clearTimeout(handle);
  }, [input]);

  const handleContextMenuData = useCallback((payload: string) => {
    setInput(payload);
    setDebouncedInput(payload);
    setDirection('decode');
  }, []);

  useContextMenuData({ featureKey: 'base64Converter', onData: handleContextMenuData });

  const conversion = useMemo(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed) return { output: '', error: null };

    try {
      if (direction === 'encode') {
        const result = textToBase64(debouncedInput);
        return { output: result.output, error: null };
      }
      const decoded = base64ToText(trimmed);
      return { output: decoded, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      return {
        output: '',
        error: ERROR_MESSAGES[message] || message || '转换失败',
      };
    }
  }, [debouncedInput, direction]);

  const output = conversion.output;
  const error = conversion.error;

  const placeholder =
    direction === 'encode' ? '输入需要编码为 Base64 的文本...' : '输入需要解码的 Base64 字符串...';
  const outputLabel = direction === 'encode' ? 'Base64 编码结果' : '解码文本结果';

  const showImageHint = direction === 'decode' && IMAGE_DATA_URI_PATTERN.test(input);

  const handleDirectionChange = (value: 'encode' | 'decode') => {
    if (value === direction) return;
    setDirection(value);
    setInput('');
    setDebouncedInput('');
  };

  const handleClear = () => {
    setInput('');
    setDebouncedInput('');
  };

  return {
    input,
    setInput,
    direction,
    handleDirectionChange,
    placeholder,
    output,
    outputLabel,
    error,
    showImageHint,
    handleClear,
  };
}
