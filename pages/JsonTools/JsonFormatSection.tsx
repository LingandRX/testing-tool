import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  formatJson,
  validateJson,
  type JsonFormatOptions,
  type JsonFormatResult,
} from '@/utils/jsonFormatter';
import { formatByteSize } from '@/utils/textStatistics';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { jsonDiffPageStyles } from '@/config/pageTheme';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

/** 缩进大小选项 */
const INDENT_OPTIONS = [2, 4, 6, 8] as const;

/**
 * JSON 格式化工具区域组件
 *
 * 提供输入区域、格式化选项（缩进大小、键名排序）和格式化结果展示，
 * 支持一键复制格式化后的 JSON。
 */
export default function JsonFormatSection() {
  const { t } = useTranslation(['jsonFormat']);
  const { showMessage } = useSnackbar();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState<JsonFormatResult | null>(null);

  // 防抖校验输入
  useEffect(() => {
    const handle = setTimeout(() => {
      setError(validateJson(input));
    }, 300);
    return () => clearTimeout(handle);
  }, [input]);

  const canFormat = useMemo(() => {
    return input.trim() !== '' && !error;
  }, [input, error]);

  const handleFormat = () => {
    const validationError = validateJson(input);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    try {
      const options: JsonFormatOptions = { indentSize, sortKeys };
      const formatResult = formatJson(input, options);
      setResult(formatResult);
    } catch (e) {
      setError(e instanceof SyntaxError ? e.message : String(e));
      setResult(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setError(null);
    setResult(null);
  };

  return (
    <Stack spacing={2.5}>
      {/* 工具栏 */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* 缩进选择 */}
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem' }}
          >
            {t('jsonFormat:indentSize')}
          </Typography>
          <SwitchButtonGroup
            value={indentSize}
            onChange={(v) => setIndentSize(v)}
            options={INDENT_OPTIONS.map((size) => ({ value: size, label: String(size) }))}
            sx={{ width: 'auto', mb: 0, flexShrink: 0 }}
            size="small"
          />

          {/* 键名排序开关 */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                {t('jsonFormat:sortKeys')}
              </Typography>
            }
            sx={{ ml: 1 }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="text" onClick={handleClear} sx={{ borderRadius: 3 }}>
            {t('jsonFormat:clearButton')}
          </Button>
          <Button
            variant="contained"
            disabled={!canFormat}
            onClick={handleFormat}
            sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
          >
            {t('jsonFormat:formatButton')}
          </Button>
        </Stack>
      </Stack>

      {/* 输入区 */}
      <Box>
        <TextField
          multiline
          rows={6}
          fullWidth
          placeholder={t('jsonFormat:inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          error={Boolean(error)}
          sx={jsonDiffPageStyles.INPUT_STYLE}
        />
        {error && (
          <FormHelperText error sx={{ mx: 1.5, mt: 0.5, fontWeight: 600 }}>
            {t('jsonFormat:invalidJson')}
          </FormHelperText>
        )}
      </Box>

      {/* 格式化结果 */}
      {result && result.formatted ? (
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* 结果头部 */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem' }}
              >
                {t('jsonFormat:outputLabel')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                {t('jsonFormat:originalSize')}: {formatByteSize(result.originalBytes)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                {t('jsonFormat:formattedSize')}: {formatByteSize(result.formattedBytes)}
              </Typography>
            </Stack>
            <CopyButton text={result.formatted} showMessage={showMessage} />
          </Stack>

          {/* 格式化内容 */}
          <Box
            sx={{
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 400,
              overflowY: 'auto',
              lineHeight: 1.6,
            }}
          >
            {result.formatted}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
            border: '1px dashed',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'grey.300',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('jsonFormat:emptyHint')}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
