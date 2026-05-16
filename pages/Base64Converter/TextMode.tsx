import { useCallback, useMemo, useState } from 'react';
import { Alert, alpha, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handleConvert = useCallback(() => {
    setError(null);
    try {
      if (direction === 'encode') {
        const result = textToBase64(input);
        setOutput(result.output);
      } else {
        const decoded = base64ToText(input);
        setOutput(decoded);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      const i18nKey = ERROR_MESSAGE_TO_I18N[message];
      setError(i18nKey ? t(i18nKey) : message || t('conversionFailed'));
    }
  }, [input, direction, t]);

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
        <SwitchButtonGroup
          value={direction}
          options={[
            { value: 'encode', label: t('encode') },
            { value: 'decode', label: t('decode') },
          ]}
          onChange={handleDirectionChange}
        />
      </Stack>

      <TextField
        multiline
        fullWidth
        minRows={4}
        maxRows={10}
        placeholder={
          direction === 'encode' ? t('textInputPlaceholder') : t('base64InputPlaceholder')
        }
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError(null);
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            borderRadius: 3,
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'action.hover' },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.info.main, 0.1)}`,
            },
          },
        }}
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

      {error && <Alert severity="error">{error}</Alert>}

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
              {direction === 'encode' ? t('base64Output') : t('textOutput')}
            </Typography>
            <CopyButton text={output} showMessage={(_msg, _opts) => {}} />
          </Stack>
          <Box
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              maxHeight: 300,
              overflowY: 'auto',
              lineHeight: 1.6,
              color: 'info.main',
              fontWeight: 600,
            }}
          >
            {output}
          </Box>
        </Paper>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          onClick={handleConvert}
          disabled={!input.trim()}
          startIcon={<SwapHorizIcon />}
          sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
        >
          {direction === 'encode' ? t('encode') : t('decode')}
        </Button>
        <Button
          variant="text"
          onClick={handleClear}
          startIcon={<DeleteOutlineIcon />}
          sx={{ borderRadius: 3 }}
        >
          {t('clear')}
        </Button>
      </Stack>
    </>
  );
}
