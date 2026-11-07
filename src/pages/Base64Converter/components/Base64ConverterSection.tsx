import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import { CopyButton } from '@/components/CopyButton';
import { Spinner } from '@/components/loading/Spinner';
import DecodeResultPaper from './DecodeResultPaper';
import { Button } from '@/components/ui/button';
import { downloadBlob } from '@/utils/base64Converter';
import { formatBytes } from '@/utils/format';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConvertDirection } from '@/types/storage';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useBase64Converter } from '../useBase64Converter';
import { cn } from '@/lib/utils';

const isValidDirection = (val: unknown): val is Base64ConvertDirection =>
  val === 'encode' || val === 'decode';

interface Base64ConverterSectionProps {
  mode: 'file' | 'image';
}

export default function Base64ConverterSection({ mode }: Base64ConverterSectionProps) {
  const [direction, setDirection] = useStorageState(
    `base64Converter/${mode}Mode/direction`,
    'encode',
    isValidDirection,
  );

  const {
    result,
    info,
    isLoading,
    isDragging,
    setIsDragging,
    fileInputRef,
    encodeError,
    decodeInput,
    setDecodeInput,
    decoded,
    decodeError,
    decodedFileName,
    setCustomFileName,
    resetAll,
    handleFileSelect,
    maxFileSizeStr,
  } = useBase64Converter({ mode });

  const handleDirectionChange = (next: Base64ConvertDirection) => {
    if (next === direction) return;
    resetAll();
    setDirection(next);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-1">
      <SwitchButtonGroup
        value={direction}
        options={[
          { value: 'encode', label: '编码' },
          { value: 'decode', label: '解码' },
        ]}
        onChange={handleDirectionChange}
        size="small"
        className="w-full shrink-0"
      />

      {direction === 'encode' ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) void handleFileSelect(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center overflow-y-auto rounded-xl border-2 border-dashed p-4',
              isDragging
                ? 'border-primary bg-primary/10'
                : info
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border bg-muted/40 hover:border-primary/80 hover:bg-muted/70',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === 'image' ? 'image/*' : undefined}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelect(file);
              }}
            />
            {isLoading ? (
              <Spinner size="lg" className="text-primary" />
            ) : info ? (
              <div className="flex flex-col items-center gap-1.5 text-center w-full">
                {mode === 'image' && result && (
                  <div className="relative p-1 border border-border bg-background rounded-lg shadow-sm mb-1 max-w-[180px] overflow-hidden">
                    <img
                      src={result.output}
                      alt="preview"
                      className="max-h-32 w-full object-contain rounded"
                    />
                  </div>
                )}
                <Upload className="w-8 h-8 text-primary" />
                <span className="text-sm font-bold text-foreground/90 max-w-[280px] truncate">
                  {info.name}
                </span>
                <span className="text-xs text-muted-foreground/80 font-mono tabular-nums">
                  {formatBytes(info.size)} · {info.type}
                </span>
                <span className="text-[11px] font-medium text-primary/80 mt-1">
                  点击或拖拽以替换文件
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                {mode === 'image' ? (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground/60" />
                )}
                <span className="text-xs font-bold text-foreground/80">
                  {mode === 'image' ? '点击或拖拽图像到此处' : '点击或拖拽文件到此处'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  最大文件大小：{maxFileSizeStr}
                </span>
                {mode === 'image' && (
                  <span className="text-[10px] font-medium text-muted-foreground/50">
                    支持 PNG、JPG、WEBP、GIF、BMP、SVG 等格式
                  </span>
                )}
              </div>
            )}
          </div>

          {encodeError && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs font-semibold text-destructive">
              {encodeError}
            </div>
          )}

          {result && (
            <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
              <span className="shrink-0 select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                Base64 编码结果
              </span>
              <TextInputArea
                readOnly
                fill
                value={
                  result.output.length > 2000
                    ? `${result.output.substring(0, 2000)}...`
                    : result.output
                }
                showClear={false}
                className="min-h-0 flex-1"
              />
              <div className="flex h-10 items-center justify-between gap-2 border-t border-border/50 px-1 font-mono text-[10px] text-muted-foreground/70 select-none">
                <div className="flex min-w-0 items-center gap-3 tabular-nums">
                  <span className="truncate">
                    原始大小:{' '}
                    <span className="font-semibold text-foreground/80">
                      {formatBytes(result.originalBytes)}
                    </span>
                  </span>
                  <span className="text-border/60">|</span>
                  <span className="truncate">
                    编码大小:{' '}
                    <span className="font-semibold text-foreground/80">
                      {formatBytes(result.outputBytes)}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <CopyButton
                    text={result.rawBase64}
                    tooltip="复制纯 Base64"
                    variant="ghost"
                    size="iconSm"
                    className="text-muted-foreground hover:text-foreground"
                  />
                  <CopyButton
                    text={result.output}
                    tooltip="复制 Data URI"
                    variant="ghost"
                    size="iconSm"
                    className="text-muted-foreground hover:text-foreground"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAll}
                    aria-label="清空"
                    className="h-7 gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    清空
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          <TextInputArea
            placeholder="输入需要解码的 Base64 或 data URI..."
            value={decodeInput}
            onChange={setDecodeInput}
            externalError={decodeError || undefined}
            showClear={true}
            allowCopy={true}
            minRows={4}
            onClear={resetAll}
          />
          {decoded && (
            <DecodeResultPaper
              title={mode === 'image' ? '解码图像' : '解码文件'}
              mimeType={decoded.mimeType}
              blobSize={decoded.blob.size}
              fileName={decodedFileName}
              onFileNameChange={setCustomFileName}
              onDownload={() => downloadBlob(decoded.blob, decodedFileName)}
            >
              {mode === 'image' && (
                <div className="relative p-1.5 border border-border bg-background dark:bg-muted/10 rounded-xl max-w-[220px] mb-3 overflow-hidden shadow-sm">
                  <img
                    src={`data:${decoded.mimeType};base64,${decoded.rawBase64}`}
                    alt="decoded preview"
                    className="max-h-40 w-full rounded-lg object-contain bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] dark:bg-none"
                  />
                </div>
              )}
            </DecodeResultPaper>
          )}
        </div>
      )}
    </div>
  );
}
