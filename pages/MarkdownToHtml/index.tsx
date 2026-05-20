import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import CodeIcon from '@mui/icons-material/Code';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import PageHeader from '@/components/PageHeader';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useStorageState } from '@/utils/useStorageState';
import type { MarkdownToHtmlPreviewMode } from '@/types/storage';
import {
  markdownToHtml,
  wrapHtmlDocument,
  downloadHtmlFile,
  printHtml,
  SAMPLE_MARKDOWN,
} from '@/utils/markdownToHtml';

const isValidPreviewMode = (val: unknown): val is MarkdownToHtmlPreviewMode =>
  typeof val === 'string' && ['split', 'preview', 'html'].includes(val);

const PREVIEW_STYLES = `
  .markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: inherit;
  }
  .markdown-body h1, .markdown-body h2, .markdown-body h3,
  .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    margin-top: 20px;
    margin-bottom: 12px;
    font-weight: 600;
    line-height: 1.25;
  }
  .markdown-body h1 { font-size: 1.8em; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 0.3em; }
  .markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 0.3em; }
  .markdown-body h3 { font-size: 1.25em; }
  .markdown-body p { margin-top: 0; margin-bottom: 12px; }
  .markdown-body a { color: #1976d2; text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
  .markdown-body code {
    background-color: rgba(128,128,128,0.1);
    border-radius: 3px;
    font-size: 85%;
    padding: 0.2em 0.4em;
    font-family: 'SFMono-Regular', Consolas, monospace;
  }
  .markdown-body pre {
    background-color: rgba(128,128,128,0.08);
    border-radius: 6px;
    font-size: 85%;
    line-height: 1.45;
    overflow: auto;
    padding: 14px;
    margin: 0 0 12px;
  }
  .markdown-body pre code {
    background-color: transparent;
    border: 0;
    display: inline;
    line-height: inherit;
    margin: 0;
    padding: 0;
    word-wrap: normal;
  }
  .markdown-body blockquote {
    border-left: 0.25em solid rgba(128,128,128,0.3);
    color: rgba(128,128,128,0.7);
    margin: 0 0 12px;
    padding: 0 1em;
  }
  .markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 12px; padding-left: 2em; }
  .markdown-body li + li { margin-top: 0.25em; }
  .markdown-body img { max-width: 100%; box-sizing: content-box; }
  .markdown-body table {
    border-collapse: collapse;
    border-spacing: 0;
    display: block;
    overflow: auto;
    width: 100%;
    margin-bottom: 12px;
  }
  .markdown-body table th, .markdown-body table td {
    border: 1px solid rgba(128,128,128,0.25);
    padding: 6px 13px;
  }
  .markdown-body table tr:nth-child(2n) { background-color: rgba(128,128,128,0.05); }
  .markdown-body table th { font-weight: 600; background-color: rgba(128,128,128,0.05); }
  .markdown-body hr {
    background-color: rgba(128,128,128,0.2);
    border: 0;
    height: 0.25em;
    margin: 20px 0;
    padding: 0;
  }
  .markdown-body input[type="checkbox"] { margin-right: 0.5em; }
`;

export default function MarkdownToHtmlPage() {
  const { t } = useLazyTranslation('markdownToHtml');
  const [previewMode, setPreviewMode] = useStorageState(
    'markdownToHtml/previewMode',
    'split' as MarkdownToHtmlPreviewMode,
    isValidPreviewMode,
  );
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const result = useMemo(() => markdownToHtml(markdown), [markdown]);
  const error = result.hasError ? (result.error ?? null) : null;

  // 更新 iframe 预览内容
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PREVIEW_STYLES}</style>
</head>
<body class="markdown-body">${result.html}</body>
</html>`);
    doc.close();
  }, [result.html]);

  const handleModeChange = useCallback(
    (newMode: MarkdownToHtmlPreviewMode) => {
      setPreviewMode(newMode);
    },
    [setPreviewMode],
  );

  const handleClear = useCallback(() => {
    setMarkdown('');
  }, []);

  const handlePrint = useCallback(() => {
    printHtml(result.html, t('pageTitle'));
  }, [result.html, t]);

  const handleDownload = useCallback(() => {
    const doc = wrapHtmlDocument(result.html, t('pageTitle'));
    downloadHtmlFile(doc, 'markdown-export.html');
  }, [result.html, t]);

  const showInput = previewMode !== 'preview';
  const showPreview = previewMode !== 'html';

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
              { value: 'html', label: t('htmlMode') },
            ]}
            onChange={handleModeChange}
            size="small"
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClear}
              sx={{ borderRadius: 2 }}
            >
              {t('clear')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 2 }}
            >
              {t('print')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderRadius: 2 }}
            >
              {t('download')}
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
              md: showInput && showPreview ? '1fr 1fr' : '1fr',
            },
            gap: 2,
            minHeight: 500,
          }}
        >
          {/* Markdown 输入区 */}
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
                  {t('charCount', { count: markdown.length })}
                </Typography>
              </Box>
              <TextField
                multiline
                fullWidth
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
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

          {/* 预览/输出区 */}
          {showPreview && (
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
                  {(previewMode as string) === 'html' ? t('htmlOutputLabel') : t('previewLabel')}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {t('charCount', { count: result.htmlLength })}
                  </Typography>
                  <CopyButton text={result.html} size="small" />
                </Stack>
              </Box>

              {(previewMode as string) === 'html' ? (
                <TextField
                  multiline
                  fullWidth
                  value={result.html}
                  InputProps={{ readOnly: true }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
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
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    title="markdown-preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: 380,
                      border: 'none',
                      background: 'transparent',
                    }}
                  />
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
