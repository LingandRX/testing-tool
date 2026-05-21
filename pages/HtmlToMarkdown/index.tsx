import { useCallback, useMemo, useState } from 'react';
import { Code, Download, Trash2 } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import PageHeader from '@/components/PageHeader';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useStorageState } from '@/utils/useStorageState';
import type { HtmlToMarkdownPreviewMode } from '@/types/storage';
import { htmlToMarkdown, downloadMarkdownFile, SAMPLE_HTML } from '@/utils/htmlToMarkdown';

const isValidPreviewMode = (val: unknown): val is HtmlToMarkdownPreviewMode =>
  typeof val === 'string' && ['split', 'preview', 'markdown'].includes(val);

export default function HtmlToMarkdownPage() {
  const { t } = useLazyTranslation('htmlToMarkdown');
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
              { value: 'markdown', label: t('markdownMode') },
            ]}
            onChange={handleModeChange}
            size="small"
          />

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!result.markdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={14} />
              {t('download')}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 size={14} />
              {t('clear')}
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
            showInput && showOutput ? 'md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* HTML 输入区 */}
          {showInput && (
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">{t('inputLabel')}</span>
                <span className="text-xs text-gray-400">
                  {t('charCount', { count: html.length })}
                </span>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="flex-1 min-h-[400px] p-4 font-mono text-[0.85rem] leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}

          {/* Markdown 输出区 */}
          {showOutput && (
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">
                  {(previewMode as string) === 'markdown'
                    ? t('markdownOutputLabel')
                    : t('previewLabel')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    {t('charCount', { count: result.markdownLength })}
                  </span>
                  <CopyButton text={result.markdown} size="small" />
                </div>
              </div>

              {(previewMode as string) === 'markdown' ? (
                <textarea
                  value={result.markdown}
                  readOnly
                  className="flex-1 min-h-[400px] p-4 font-mono text-[0.85rem] leading-relaxed resize-none focus:outline-none bg-gray-50"
                />
              ) : (
                <div className="flex-1 p-4 min-h-[400px] overflow-auto bg-white font-mono text-[0.85rem] leading-relaxed whitespace-pre-wrap break-words">
                  {result.markdown || <span className="text-gray-400">{t('emptyHint')}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
