import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useStorageState } from '@/utils/useStorageState';
import type { HtmlToMarkdownPreviewMode } from '@/types/storage';
import { htmlToMarkdown, downloadMarkdownFile, SAMPLE_HTML } from '@/utils/htmlToMarkdown';

const isValidPreviewMode = (val: unknown): val is HtmlToMarkdownPreviewMode =>
  typeof val === 'string' && ['split', 'preview', 'markdown'].includes(val);

export default function HtmlToMarkdownPage() {
  const { t } = useTranslation('htmlToMarkdown');
  const [previewMode, setPreviewMode] = useStorageState(
    'htmlToMarkdown/previewMode',
    'split' as HtmlToMarkdownPreviewMode,
    isValidPreviewMode,
  );
  const [html, setHtml] = useState(SAMPLE_HTML);

  const result = useMemo(() => htmlToMarkdown(html), [html]);
  const error = result.hasError ? (result.error ?? null) : null;

  const handleModeChange = useCallback(
    (newMode: HtmlToMarkdownPreviewMode) => {
      setPreviewMode(newMode);
    },
    [setPreviewMode],
  );

  const handleClear = useCallback(() => {
    setHtml('');
  }, []);

  const handleDownload = useCallback(() => {
    if (result.markdown) {
      downloadMarkdownFile(result.markdown, 'converted.md');
    }
  }, [result.markdown]);

  const showInput = previewMode !== 'preview';
  const showOutput = previewMode !== 'markdown';

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title={t('pageTitle')} subtitle={t('pageSubtitle')} icon={<CodeIcon />} />

      <Stack spacing={2}>
        {/* 工具栏 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
        >
          <SwitchButtonGroup
            value={previewMode}
            options={[
              { value: 'split', label: t('splitMode') },
              { value: 'preview', label: t('previewMode') },
              { value: 'markdown', label: t('markdownMode') },
            ]}
            onChange={handleModeChange}
            size="small"
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!result.markdown}
              sx={{ borderRadius: 2 }}
            >
              {t('download')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClear}
              sx={{ borderRadius: 2 }}
            >
              {t('clear')}
            </Button>
          </Stack>
        </Stack>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* 主内容区 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: showInput && showOutput ? '1fr 1fr' : '1fr',
            },
            gap: 2,
            minHeight: 500,
          }}
        >
          {/* HTML 输入区 */}
          {showInput && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {t('inputLabel')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {t('charCount', { count: html.length })}
                </Typography>
              </Box>
              <TextField
                multiline
                fullWidth
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={t('inputPlaceholder')}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    alignItems: 'flex-start',
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    py: 2,
                    px: 2,
                    minHeight: 400,
                  },
                }}
              />
            </Paper>
          )}

          {/* Markdown 输出区 */}
          {showOutput && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {(previewMode as string) === 'markdown'
                    ? t('markdownOutputLabel')
                    : t('previewLabel')}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {t('charCount', { count: result.markdownLength })}
                  </Typography>
                  <CopyButton text={result.markdown} size="small" />
                </Stack>
              </Box>

              {(previewMode as string) === 'markdown' ? (
                <TextField
                  multiline
                  fullWidth
                  value={result.markdown}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      alignItems: 'flex-start',
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      py: 2,
                      px: 2,
                      minHeight: 400,
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    minHeight: 400,
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {result.markdown || (
                    <Typography variant="body2" color="text.disabled">
                      {t('emptyHint')}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
