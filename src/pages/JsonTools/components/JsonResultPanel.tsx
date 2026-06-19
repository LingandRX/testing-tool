import { formatBytes } from '@/utils/format';
import { CopyButton } from '@/components/CopyButton';

export interface JsonResultPanelProps {
  title: string;
  content: string;
  originalBytes: number;
  outputBytes: number;
  outputSizeLabel?: string;
  maxHeight?: string;
}

export default function JsonResultPanel({
  title,
  content,
  originalBytes,
  outputBytes,
  outputSizeLabel = '格式化后大小',
  maxHeight = '420px',
}: JsonResultPanelProps) {
  return (
    <div className="relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex h-9 items-center justify-between px-4 border-b border-border bg-muted/50 select-none">
        <div className="flex gap-4 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
            {title}
          </span>

          <div className="hidden sm:flex gap-3 items-center font-mono text-[10px] text-muted-foreground/70 tabular-nums">
            <span>
              {'原始大小'}:{' '}
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
        className="p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all overflow-y-auto leading-relaxed select-text"
        style={{ maxHeight }}
      >
        {content}
      </div>
    </div>
  );
}
