import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatByteSize } from '@/utils/textStatistics';
import { useSnackbar } from '@/components/GlobalSnackbar';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { validateJson } from '@/utils/jsonFormatter';

/** 转换结果通用接口 */
export interface ConvertResult {
  /** 转换后的输出字符串 */
  output: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 转换后的字节大小 */
  outputBytes: number;
}

/** 转换函数类型 */
export type ConvertFunction = (text: string) => ConvertResult;

/**
 * JSON 转换工具区域组件属性
 */
interface JsonConvertSectionProps {
  /** i18n 命名空间内翻译键的前缀，如 'yamlMode' / 'tomlMode' / 'minifyMode' */
  translationPrefix: string;
  /** 转换函数 */
  convertFunction: ConvertFunction;
  /** 转换按钮的翻译键后缀，默认 'convertButton' */
  convertButtonKey?: string;
}

/**
 * JSON 转换工具共享组件
 *
 * 适用于 JSON->YAML、JSON->TOML、JSON 压缩等场景，
 * 提供输入区域、转换按钮和结果展示（含一键复制）。
 */
export default function JsonConvertSection({
  translationPrefix,
  convertFunction,
  convertButtonKey = 'convertButton',
}: JsonConvertSectionProps) {
  const { t } = useTranslation(['jsonFormat']);
  const { showMessage } = useSnackbar();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const pk = translationPrefix;

  // 防抖校验输入
  useEffect(() => {
    const handle = setTimeout(() => {
      setError(validateJson(input));
    }, 300);
    return () => clearTimeout(handle);
  }, [input]);

  const canConvert = useMemo(() => {
    return input.trim() !== '' && !error;
  }, [input, error]);

  const handleConvert = () => {
    const validationError = validateJson(input);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    try {
      const convertResult = convertFunction(input);
      setResult(convertResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
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
        <Box />
        <Stack direction="row" spacing={1}>
          <Button variant="text" onClick={handleClear} sx={{ borderRadius: 3 }}>
            {t('jsonFormat:clearButton')}
          </Button>
          <Button
            variant="contained"
            disabled={!canConvert}
            onClick={handleConvert}
            sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
          >
            {t(`jsonFormat:${convertButtonKey}`)}
          </Button>
        </Stack>
      </Stack>

      {/* 输入区 */}
      <TextInputArea
        placeholder={t(`jsonFormat:${pk}InputPlaceholder`)}
        value={input}
        onChange={setInput}
        externalError={error || undefined}
        onClear={() => {
          setResult(null);
        }}
      />

      {/* 转换结果 */}
      {result && result.output ? (
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
                {t(`jsonFormat:${pk}OutputLabel`)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                {t('jsonFormat:originalSize')}: {formatByteSize(result.originalBytes)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                {t('jsonFormat:formattedSize')}: {formatByteSize(result.outputBytes)}
              </Typography>
            </Stack>
            <CopyButton text={result.output} showMessage={showMessage} />
          </Stack>

          {/* 转换内容 */}
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
            {result.output}
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
            {t(`jsonFormat:${pk}EmptyHint`)}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
