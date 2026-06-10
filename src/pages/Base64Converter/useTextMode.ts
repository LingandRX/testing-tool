import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { base64ToText, textToBase64 } from '@/utils/base64Converter';
import { useContextMenuData } from '@/utils/useContextMenuData';

const IMAGE_DATA_URI_PATTERN = /^\s*data:image\//i;

const ERROR_MESSAGE_TO_I18N: Record<string, string> = {
  'Invalid Base64 string': 'invalidBase64',
  'Input appears to be binary data (e.g. an image). Please use the Image tab instead.':
    'binaryDataDetected',
};

export function useTextMode() {
  const { t } = useI18n('base64Converter');

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

  const conversionPipeline = useMemo(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed) return { output: '', error: null };

    try {
      if (direction === 'encode') {
        const result = textToBase64(debouncedInput);
        return { output: result.output, error: null };
      } else {
        const decoded = base64ToText(trimmed);
        return { output: decoded, error: null };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      const i18nKey = ERROR_MESSAGE_TO_I18N[message];
      return {
        output: '',
        error: i18nKey ? t(i18nKey) : message || t('conversionFailed'),
      };
    }
  }, [debouncedInput, direction, t]);

  const output = conversionPipeline.output;
  const error = conversionPipeline.error;

  const placeholder =
    direction === 'encode' ? t('textInputPlaceholder') : t('base64InputPlaceholder');
  const outputLabel = direction === 'encode' ? t('base64Output') : t('textOutput');

  const showImageHint = useMemo(
    () => direction === 'decode' && IMAGE_DATA_URI_PATTERN.test(input),
    [direction, input],
  );

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
    t,
  };
}
