import { useCallback, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import CopyButton from '@/components/CopyButton';
import { textToBase64, base64ToText } from '@/utils/base64Converter';

export default function TextMode() {
  const { t } = useTranslation('base64Converter');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');

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
      setError(e instanceof Error ? e.message : t('conversionFailed'));
    }
  }, [input, direction, t]);

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={direction}
          onChange={(_, v: 'encode' | 'decode' | null) => {
            if (!v || v === direction) return;
            setDirection(v);
            setOutput('');
            setError(null);
          }}
          sx={{ borderRadius: 3 }}
        >
          <ToggleButton value="encode" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
            {t('encode')}
          </ToggleButton>
          <ToggleButton value="decode" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
            {t('decode')}
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1}>
          <Button
            variant="text"
            onClick={handleClear}
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: 3 }}
          >
            {t('clear')}
          </Button>
          <Button
            variant="contained"
            onClick={handleConvert}
            disabled={!input.trim()}
            startIcon={<SwapHorizIcon />}
            sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
          >
            {direction === 'encode' ? t('encode') : t('decode')}
          </Button>
        </Stack>
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
    </>
  );
}
