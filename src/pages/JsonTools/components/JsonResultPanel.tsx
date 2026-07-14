import { formatBytes } from '@/utils/format';
import { CopyButton } from '@/components/CopyButton';
import { cn } from '@/lib/utils';

export interface JsonResultPanelProps {
  title: string;
  content: string;
  originalBytes: number;
  outputBytes: number;
  outputSizeLabel?: string;
  maxHeight?: string;
  /**
   * 撑满父容器剩余高度并启用内部滚动（而非按 maxHeight 截断）。
   * 用于 popup / sidepanel 等固定高度场景下与折叠输入面板共享垂直空间。
   */
  fill?: boolean;
}

export default function JsonResultPanel({
  title,
  content,
  originalBytes,
  outputBytes,
  outputSizeLabel = '格式化后大小',
  maxHeight = '420px',
  fill = false,
}: JsonResultPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden',
        fill ? 'flex flex-col flex-1 min-h-0' : 'flex flex-col',
      )}
    >
      <div className="flex h-9 items-center justify-between px-4 border-b border-border bg-muted/50 select-none">
        <div className="flex gap-4 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
            {title}
          </span>

          <div className="hidden sm:flex gap-3 items-center font-mono text-[10px] text-muted-foreground/70 tabular-nums">
            <span>
              原始大小:{' '}
              <span className="font-semibold text-foreground/80">{formatBytes(originalBytes)}</span>
            </span>
            <span className="text-border/60">|</span>
            <span>
              {outputSizeLabel}:{' '}
              <span className="font-semibold text-foreground/80">{formatBytes(outputBytes)}</span>
            </span>
          </div>
        </div>

        <CopyButton text={content} className="h-6 w-6 rounded-md border text-muted-foreground" />
      </div>

      <div
        className={cn(
          'p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all overflow-y-auto leading-relaxed select-text',
          fill && 'flex-1 min-h-0',
        )}
        style={fill ? undefined : { maxHeight }}
      >
        {content}
      </div>
    </div>
  );
}
