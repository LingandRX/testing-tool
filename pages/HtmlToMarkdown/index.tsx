import { useCallback, useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Button } from '@/components/ui/button'; // 💡 1. 全面回归规范：引入原生的 shadcn 原子 Button
import { useStorageState } from '@/utils/useStorageState';
import type { HtmlToMarkdownPreviewMode } from '@/types/storage';
import { downloadMarkdownFile, htmlToMarkdown, SAMPLE_HTML } from '@/utils/htmlToMarkdown';
import { cn } from '@/lib/utils';

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
    /* 💡 统一间距尺寸：
      - 彻底清除多余的 container max-w-7xl 这种网页大边距，
      - 统一收拢为我们先前在 Dashboard 页、JSON 工具箱制定的 p-4 space-y-4 标准极客桌面规格。
    */
    <div className="p-4 w-full flex flex-col space-y-4 select-none animate-in fade-in duration-300">
      <div className="flex flex-col gap-4">
        {/* 工具栏集成区 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-secondary/40 rounded-xl border border-border/60 px-1.5 py-1.5 sm:h-12">
          <SwitchButtonGroup
            value={previewMode}
            options={[
              { value: 'split', label: t('splitMode') },
              { value: 'preview', label: t('previewMode') },
              { value: 'markdown', label: t('markdownMode') },
            ]}
            onChange={handleModeChange}
            size="small"
            className="w-full sm:w-auto"
          />

          <div className="flex gap-2 shrink-0">
            {/* 2. 重塑下载按钮：接入受控 Button，追加 active 物理微缩放动效 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!result.markdown}
              className="h-8 rounded-md font-medium text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              {t('download')}
            </Button>

            {/* 重塑清空按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 rounded-md font-medium text-xs gap-1.5 shadow-sm active:scale-95 text-destructive hover:text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10 border-input/60 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('clear')}
            </Button>
          </div>
        </div>

        {/* 错误提示：
          - 💡 核心修复点：将硬编码的 bg-red-50 实色，完美超进化为系统的全自适应透明色变体
        */}
        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-semibold tracking-wide animate-in shake duration-300">
            {error}
          </div>
        )}

        {/* 双翼/单栏联动面板展示区 */}
        <div
          className={cn(
            'grid gap-4 min-h-[460px] w-full',
            showInput && showOutput ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
          )}
        >
          {/* HTML 输入端卡片面板 */}
          {showInput && (
            /* 3. 智能聚焦框联动（Focus Ring Clamping）：
              - 外层容器追加 focus-within 变量追踪大闸。
              - 只要用户用鼠标点击了内部的 textarea，外层整块精巧的圆角大边框会一帧内亮起 primary 系统的深色呼吸发光环，
              - 这种“全外包裹层框聚焦”的体验极大模仿了本地原生 IDE 的硬核专业体验！
            */
            <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col transition-all duration-200 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              {/* 卡片头部：改用标准的灰色 bg-muted/50 */}
              <div className="flex h-9 items-center justify-between px-4 bg-muted/50 border-b border-border select-none">
                <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
                  {t('inputLabel')}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                  {t('charCount', { count: html.length })}
                </span>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="flex-1 min-h-[380px] p-4 bg-transparent font-mono text-xs leading-relaxed resize-none focus:outline-none text-foreground/90 select-text"
              />
            </div>
          )}

          {/* Markdown 输出端卡片面板 */}
          {showOutput && (
            <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
              <div className="flex h-9 items-center justify-between px-4 bg-muted/50 border-b border-border select-none">
                <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
                  {(previewMode as string) === 'markdown'
                    ? t('markdownOutputLabel')
                    : t('previewLabel')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                    {t('charCount', { count: result.markdownLength })}
                  </span>
                  <CopyButton
                    text={result.markdown}
                    className="h-6 w-6 rounded-md border text-muted-foreground"
                  />
                </div>
              </div>

              {(previewMode as string) === 'markdown' ? (
                <textarea
                  value={result.markdown}
                  readOnly
                  className="flex-1 min-h-[380px] p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none bg-muted/30 dark:bg-muted/10 text-foreground/80 select-text"
                />
              ) : (
                <div className="flex-1 p-4 min-h-[380px] overflow-auto bg-transparent font-mono text-xs leading-relaxed whitespace-pre-wrap break-all text-foreground/90 select-text">
                  {result.markdown || (
                    <span className="text-muted-foreground/70 italic text-[11px] font-sans">
                      {t('emptyHint')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
