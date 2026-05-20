import { useCallback, useMemo, useState } from 'react';
import { Alert, alpha, Button, Paper, Stack, Typography } from '@mui/material';
import TextInputArea, { type ToolbarAction } from '@/components/TextInputArea';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useTranslation } from 'react-i18next';
import CopyButton from '@/components/CopyButton';
import { textToBase64, base64ToText } from '@/utils/base64Converter';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

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
        icon: <SwapHorizIcon />,
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
        <Alert
          severity="info"
          action={
            <Button color="info" size="small" onClick={onSwitchToImageMode}>
              {t('switchToImageMode')}
            </Button>
          }
        >
          {t('imageDataUriHint')}
        </Alert>
      )}

      {output && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.info.main, 0.15),
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {outputLabel}
            </Typography>
            <CopyButton text={output} />
          </Stack>
          <TextInputArea
            readOnly
            value={output.length > 2000 ? `${output.substring(0, 2000)}...` : output}
            showClear={false}
            showCount
          />
        </Paper>
      )}
    </>
  );
}
