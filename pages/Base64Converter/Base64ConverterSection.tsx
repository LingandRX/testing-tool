import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import CopyButton from '@/components/CopyButton';
import DecodeResultPaper from '@/components/DecodeResultPaper';
import { Button } from '@/components/ui/button';
import { downloadBlob, formatFileSize } from '@/utils/base64Converter';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConvertDirection } from '@/types/storage';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useBase64Converter } from './useBase64Converter';
import { cn } from '@/lib/utils';

const isValidDirection = (val: unknown): val is Base64ConvertDirection =>
  val === 'encode' || val === 'decode';

interface Base64ConverterSectionProps {
  mode: 'file' | 'image';
}

export default function Base64ConverterSection({ mode }: Base64ConverterSectionProps) {
  const { t } = useLazyTranslation('base64Converter');

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
    safeFileSelect,
    maxFileSizeStr,
  } = useBase64Converter({ mode });

  const handleDirectionChange = (next: Base64ConvertDirection) => {
    if (!next || next === direction) return;
    resetAll();
    setDirection(next);
  };

  const handleDownload = () => {
    if (decoded) downloadBlob(decoded.blob, decodedFileName);
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-300">
      <div className="flex h-11 items-center px-1.5 bg-secondary/40 rounded-xl border border-border/60 w-fit">
        <SwitchButtonGroup
          value={direction}
          options={[
            { value: 'encode', label: t('encode') },
            { value: 'decode', label: t('decode') },
          ]}
          onChange={handleDirectionChange}
          size="small"
        />
      </div>

      {direction === 'encode' ? (
        <div className="flex flex-col space-y-4">
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
              if (file) safeFileSelect(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300',
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
                if (file) safeFileSelect(file);
              }}
            />
            {isLoading ? (
              <div className="w-9 h-9 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : info ? (
              <div className="flex flex-col items-center gap-1.5 text-center w-full animate-in fade-in duration-200">
                {mode === 'image' && result && (
                  <div className="relative p-1 border border-border bg-background rounded-lg shadow-sm mb-1 max-w-[180px] overflow-hidden">
                    <img
                      src={result.output}
                      alt="preview"
                      className="max-h-32 w-full object-contain rounded"
                    />
                  </div>
                )}
                <Upload
                  className={cn('w-8 h-8 text-primary', mode === 'file' && 'animate-bounce')}
                />
                <span className="text-sm font-bold text-foreground/90 max-w-[280px] truncate">
                  {info.name}
                </span>
                <span className="text-xs text-muted-foreground/80 font-mono tabular-nums">
                  {formatFileSize(info.size)} · {info.type}
                </span>
                <span className="text-[11px] font-medium text-primary/80 mt-1">
                  {t('clickOrDropToReplace')}
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
                  {mode === 'image' ? t('clickOrDropToImage') : t('clickOrDropToFile')}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  {t('maxFileSize', { max: maxFileSizeStr })}
                </span>
                {mode === 'image' && (
                  <span className="text-[10px] font-medium text-muted-foreground/50">
                    {t('supportedFormats')}
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
            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col space-y-3">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                  {t('base64Output')}
                </span>
                <div className="flex gap-2">
                  <CopyButton
                    text={result.rawBase64}
                    tooltip={t('copyRaw')}
                    className="h-6 px-2 rounded-md border text-[10px] font-bold"
                  />
                  <CopyButton
                    text={result.output}
                    tooltip={t('copyDataUri')}
                    className="h-6 px-2 rounded-md border text-[10px] font-bold"
                  />
                </div>
              </div>
              <TextInputArea
                readOnly
                value={
                  result.output.length > 2000
                    ? `${result.output.substring(0, 2000)}...`
                    : result.output
                }
                showClear={false}
                minRows={4}
              />
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/70 select-none pt-1">
                <div className="flex gap-4 items-center tabular-nums">
                  <span>
                    {t('originalSize')}:{' '}
                    <span className="font-semibold text-foreground/80">
                      {formatFileSize(result.originalBytes)}
                    </span>
                  </span>
                  <span className="text-border/60">|</span>
                  <span>
                    {t('encodedSize')}:{' '}
                    <span className="font-semibold text-foreground/80">
                      {formatFileSize(result.outputBytes)}
                    </span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="h-7 rounded-md text-muted-foreground hover:text-destructive text-[11px] gap-1 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('clear')}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <TextInputArea
            placeholder={t('decodeBase64Placeholder')}
            value={decodeInput}
            onChange={setDecodeInput}
            externalError={decodeError || undefined}
            showClear={true}
            allowCopy={true}
            minRows={6}
            onClear={resetAll}
          />
          {decoded && (
            <DecodeResultPaper
              title={mode === 'image' ? t('decodedImageOutput') : t('decodedFileOutput')}
              mimeType={decoded.mimeType}
              blobSize={decoded.blob.size}
              fileName={decodedFileName}
              onFileNameChange={setCustomFileName}
              onDownload={handleDownload}
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
