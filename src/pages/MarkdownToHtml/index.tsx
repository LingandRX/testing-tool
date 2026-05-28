import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Printer, Trash2 } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Button } from '@/components/ui/button';
import { useStorageState } from '@/utils/useStorageState';
import type { MarkdownToHtmlPreviewMode } from '@/types/storage';
import {
  downloadHtmlFile,
  markdownToHtml,
  printHtml,
  SAMPLE_MARKDOWN,
  wrapHtmlDocument,
} from '@/utils/markdownToHtml';
import { cn } from '@/lib/utils';

const isValidPreviewMode = (val: unknown): val is MarkdownToHtmlPreviewMode =>
  typeof val === 'string' && ['split', 'preview', 'html'].includes(val);

const PREVIEW_STYLES = `
  .markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--md-foreground);
    background-color: transparent;
    font-size: 14px;
  }
  .markdown-body h1, .markdown-body h2, .markdown-body h3 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: var(--md-foreground);
  }
  .markdown-body h1 { border-bottom: 1px solid var(--md-border); padding-bottom: 0.3em; font-size: 1.6em; }
  .markdown-body h2 { border-bottom: 1px solid var(--md-border); padding-bottom: 0.3em; font-size: 1.35em; }
  .markdown-body p { margin-top: 0; margin-bottom: 16px; }
  .markdown-body a { color: var(--md-link-color); text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
  .markdown-body code {
    background-color: var(--md-code-bg);
    border-radius: 4px;
    font-size: 85%;
    padding: 0.2em 0.4em;
    font-family: Menlo, Consolas, monospace;
  }
  .markdown-body pre {
    background-color: var(--md-pre-bg);
    border-radius: 8px;
    font-size: 85%;
    line-height: 1.45;
    overflow: auto;
    padding: 16px;
    margin: 0 0 16px;
    border: 1px solid var(--md-border);
  }
  .markdown-body pre code {
    background-color: transparent;
    border: 0;
    padding: 0;
  }
  .markdown-body blockquote {
    border-left: 0.25em solid var(--md-quote-line);
    color: var(--md-muted);
    margin: 0 0 16px;
    padding: 0 1em;
  }
  .markdown-body table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
    font-size: 13px;
  }
  .markdown-body table th, .markdown-body table td {
    border: 1px solid var(--md-border);
    padding: 6px 13px;
  }
  .markdown-body table tr:nth-child(2n) { background-color: var(--md-code-bg); }
  .markdown-body table th { font-weight: 600; background-color: var(--md-code-bg); }
`;

export default function MarkdownToHtmlPage() {
  const { t } = useI18n('markdownToHtml');
  const [previewMode, setPreviewMode] = useStorageState(
    'markdownToHtml/previewMode',
    'split' as MarkdownToHtmlPreviewMode,
    isValidPreviewMode,
  );
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const result = useMemo(() => markdownToHtml(markdown), [markdown]);
  const error = result.hasError ? (result.error ?? null) : null;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const isDarkMode = document.documentElement.classList.contains('dark');

    const themeVariables = isDarkMode
      ? `:root { 
          --md-bg: #090d16;
          --md-foreground: #e6edf3; 
          --md-border: rgba(255,255,255,0.15); 
          --md-code-bg: rgba(255,255,255,0.12); 
          --md-pre-bg: rgba(255,255,255,0.04); 
          --md-muted: #8b949e;
          --md-quote-line: rgba(255,255,255,0.25);
          --md-link-color: #58a6ff;
        }`
      : `:root { 
          --md-bg: #ffffff;
          --md-foreground: #1f2328; 
          --md-border: rgba(128,128,128,0.2); 
          --md-code-bg: rgba(128,128,128,0.08); 
          --md-pre-bg: rgba(128,128,128,0.03); 
          --md-muted: #4b5563;
          --md-quote-line: rgba(128,128,128,0.3);
          --md-link-color: #3b82f6;
        }`;

    const baseGlobalStyles = `
      html, body { 
        margin: 0; 
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: var(--md-bg);
        color: var(--md-foreground);
      }
      body {
        padding: 16px;
        box-sizing: border-box;
      }
    `;

    iframe.srcdoc = `<!DOCTYPE html>
<html lang="zh" style="background-color: ${isDarkMode ? '#090d16' : '#ffffff'};">
<head>
<meta charset="UTF-8">
<style>
  ${themeVariables}
  ${PREVIEW_STYLES}
  ${baseGlobalStyles}
</style>
</head>
<body class="markdown-body">${result.html}</body>
</html>`;
  }, [result.html, previewMode]);

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
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      <div className="flex flex-col space-y-4">
        {/* 工具集成控制中枢 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-secondary/40 rounded-xl border border-border/60 px-1.5 py-1.5 sm:h-12">
          <SwitchButtonGroup
            value={previewMode}
            options={[
              { value: 'split', label: t('splitMode') },
              { value: 'preview', label: t('previewMode') },
              { value: 'html', label: t('htmlMode') },
            ]}
            onChange={handleModeChange}
            size="small"
            className="w-full sm:w-auto"
          />

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 rounded-md font-medium text-xs gap-1.5 shadow-sm text-destructive hover:text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10 border-input/60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('clear')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!result.html}
              className="h-8 rounded-md font-medium text-xs gap-1.5 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              {t('print')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!result.html}
              className="h-8 rounded-md font-medium text-xs gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              {t('download')}
            </Button>
          </div>
        </div>

        {/* 错误拦截提示框 */}
        {error && (
          <div
            role="alert"
            className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-semibold tracking-wide"
          >
            {error}
          </div>
        )}

        {/* 主框架多栏联动排版轴 */}
        <div
          className={cn(
            'grid gap-4 min-h-[480px] w-full',
            showInput && showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
          )}
        >
          {/* Markdown 输入翼终端 */}
          {showInput && (
            <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <div className="flex h-9 items-center justify-between px-4 bg-muted/50 border-b border-border select-none">
                <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
                  {t('inputLabel')}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                  {t('charCount', { count: markdown.length })}
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="flex-1 min-h-[390px] p-4 bg-transparent font-mono text-xs leading-relaxed resize-none focus:outline-none text-foreground/90 select-text"
              />
            </div>
          )}

          {/* 实时 HTML/Iframe 预览翼终端 */}
          {showPreview && (
            <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
              <div className="flex h-9 items-center justify-between px-4 bg-muted/50 border-b border-border select-none">
                <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
                  {(previewMode as string) === 'html' ? t('htmlOutputLabel') : t('previewLabel')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                    {t('charCount', { count: result.htmlLength })}
                  </span>
                  <CopyButton
                    text={result.html}
                    className="h-6 w-6 rounded-md border text-muted-foreground"
                  />
                </div>
              </div>

              {(previewMode as string) === 'html' ? (
                <textarea
                  value={result.html}
                  readOnly
                  className="flex-1 min-h-[390px] p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none bg-muted/30 dark:bg-muted/10 text-foreground/80 select-text"
                />
              ) : (
                <div className="flex-1 min-h-[390px] overflow-hidden bg-transparent">
                  <iframe
                    ref={iframeRef}
                    title="markdown-preview"
                    className="w-full h-full min-h-[360px] border-none bg-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
