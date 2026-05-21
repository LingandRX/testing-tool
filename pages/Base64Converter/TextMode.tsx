import { useCallback, useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import TextInputArea, { type ToolbarAction } from '@/components/TextInputArea';
import { useTranslation } from 'react-i18next';
import CopyButton from '@/components/CopyButton';
import { textToBase64, base64ToText } from '@/utils/base64Converter';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useContextMenuData } from '@/utils/useContextMenuData';

const IMAGE_DATA_URI_PATTERN = /^\s*data:image\//i;

const ERROR_MESSAGE_TO_I18N: Record<string, string> = {
  'Invalid Base64 string': 'invalidBase64',
  'Input appears to be binary data (e.g. an image). Please use the Image tab instead.':
    'binaryDataDetected',
};

interface TextModeProps {
  onSwitchToImageMode?: () => void;
}

export default function TextMode({ onSwitchToImageMode }: TextModeProps = {}) {
  const { t } = useTranslation('base64Converter');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');

  const handleContextMenuData = useCallback(
    (payload: string) => {
      setInput(payload);
      setDirection('decode');
      setError(null);
      try {
        const decoded = base64ToText(payload);
        setOutput(decoded);
      } catch (e) {
        const message = e instanceof Error ? e.message : '';
        const i18nKey = ERROR_MESSAGE_TO_I18N[message];
        setError(i18nKey ? t(i18nKey) : message || t('conversionFailed'));
      }
    },
    [t],
  );

  useContextMenuData({ featureKey: 'base64Converter', onData: handleContextMenuData });

  const actionLabel = direction === 'encode' ? t('encode') : t('decode');
  const placeholder =
    direction === 'encode' ? t('textInputPlaceholder') : t('base64InputPlaceholder');
  const outputLabel = direction === 'encode' ? t('base64Output') : t('textOutput');

  const showImageHint = useMemo(
    () => direction === 'decode' && IMAGE_DATA_URI_PATTERN.test(input),
    [direction, input],
  );

  const handleDirectionChange = useCallback(
    (value: 'encode' | 'decode') => {
      if (value === direction) return;
      setDirection(value);
      setOutput('');
      setError(null);
    },
    [direction],
  );

  const actions: ToolbarAction[] = useMemo(
    () => [
      {
        key: 'convert',
        label: actionLabel,
        icon: <ArrowLeftRight />,
        type: 'primary',
        position: 'bottom',
        disabled: (value: string) => !value.trim(),
        onClick: (value: string) => {
          setError(null);
          try {
            if (direction === 'encode') {
              const result = textToBase64(value);
              setOutput(result.output);
            } else {
              const decoded = base64ToText(value);
              setOutput(decoded);
            }
          } catch (e) {
            const message = e instanceof Error ? e.message : '';
            const i18nKey = ERROR_MESSAGE_TO_I18N[message];
            setError(i18nKey ? t(i18nKey) : message || t('conversionFailed'));
          }
        },
      },
    ],
    [direction, t, actionLabel],
  );

  return (
    <>
      <SwitchButtonGroup
        value={direction}
        options={[
          { value: 'encode', label: t('encode') },
          { value: 'decode', label: t('decode') },
        ]}
        onChange={handleDirectionChange}
        size="small"
      />

      <TextInputArea
        placeholder={placeholder}
        value={input}
        onChange={(v) => {
          setInput(v);
          setError(null);
        }}
        actions={actions}
        externalError={error || undefined}
        onClear={() => setOutput('')}
      />

      {showImageHint && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-sm text-blue-700">{t('imageDataUriHint')}</span>
          <button
            type="button"
            onClick={onSwitchToImageMode}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
          >
            {t('switchToImageMode')}
          </button>
        </div>
      )}

      {output && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500">{outputLabel}</span>
            <CopyButton text={output} />
          </div>
          <TextInputArea
            readOnly
            value={output.length > 2000 ? `${output.substring(0, 2000)}...` : output}
            showClear={false}
            showCount
          />
        </div>
      )}
    </>
  );
}
