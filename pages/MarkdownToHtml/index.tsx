import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Code, Trash2, Printer, Download } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeader title={t('pageTitle')} subtitle={t('pageSubtitle')} icon={<Code size={20} />} />

      <div className="flex flex-col gap-4">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 size={14} />
              {t('clear')}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer size={14} />
              {t('print')}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              {t('download')}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 主内容区 */}
        <div
          className={`grid gap-4 min-h-[500px] ${
            showInput && showPreview ? 'md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Markdown 输入区 */}
          {showInput && (
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">{t('inputLabel')}</span>
                <span className="text-xs text-gray-400">
                  {t('charCount', { count: markdown.length })}
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="flex-1 min-h-[400px] p-4 font-mono text-[0.85rem] leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}

          {/* 预览/输出区 */}
          {showPreview && (
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  {(previewMode as string) === 'html' ? t('htmlOutputLabel') : t('previewLabel')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    {t('charCount', { count: result.htmlLength })}
                  </span>
                  <CopyButton text={result.html} size="small" />
                </div>
              </div>

              {(previewMode as string) === 'html' ? (
                <textarea
                  value={result.html}
                  readOnly
                  className="flex-1 min-h-[400px] p-4 font-mono text-[0.8rem] leading-relaxed resize-none focus:outline-none bg-gray-50"
                />
              ) : (
                <div className="flex-1 p-4 min-h-[400px] overflow-auto bg-white">
                  <iframe
                    ref={iframeRef}
                    title="markdown-preview"
                    className="w-full h-full min-h-[380px] border-none bg-transparent"
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
