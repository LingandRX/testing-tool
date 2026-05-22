import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Trash2 } from 'lucide-react';
import TextInputArea, { type ToolbarAction } from '@/components/TextInputArea';
import { useTranslation } from 'react-i18next';
import CopyButton from '@/components/CopyButton';
import DecodeResultPaper from '@/components/DecodeResultPaper';
import {
  fileToBase64,
  isFileSizeValid,
  isSupportedImageType,
  isSupportedImageExtension,
  formatFileSize,
  base64ToBlob,
  downloadBlob,
  MAX_FILE_SIZE,
} from '@/utils/base64Converter';
import type { Base64ToBlobResult, FileToBase64Result } from '@/utils/base64Converter';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConvertDirection } from '@/types/storage';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

const ERROR_MESSAGE_TO_I18N: Record<string, string> = {
  'Invalid Base64 string': 'invalidBase64',
};

const isValidDirection = (val: unknown): val is Base64ConvertDirection =>
  val === 'encode' || val === 'decode';

export default function ImageMode() {
  const { t } = useTranslation('base64Converter');
  const [direction, setDirection] = useStorageState(
    'base64Converter/imageMode/direction',
    'encode',
    isValidDirection,
  );

  // encode state
  const [result, setResult] = useState<FileToBase64Result | null>(null);
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  // decode state
  const [decodeInput, setDecodeInput] = useState('');
  const [decoded, setDecoded] = useState<Base64ToBlobResult | null>(null);
  const [decodedFileName, setDecodedFileName] = useState('');

  // shared
  const [error, setError] = useState<string | null>(null);

  const resetAll = useCallback(() => {
    cancelRef.current = true;
    setResult(null);
    setInfo(null);
    setIsLoading(false);
    setDecodeInput('');
    setDecoded(null);
    setDecodedFileName('');
    setError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, []);

  const handleClear = () => {
    resetAll();
  };

  const handleDirectionChange = (next: Base64ConvertDirection) => {
    if (!next || next === direction) return;
    resetAll();
    setDirection(next);
  };

  const handleFileSelect = async (file: File) => {
    cancelRef.current = false;
    setError(null);
    setResult(null);
    setInfo(null);

    if (!isFileSizeValid(file.size)) {
      setError(t('fileSizeExceeded', { max: `${MAX_FILE_SIZE / 1024 / 1024} MB` }));
      return;
    }

    if (!isSupportedImageType(file.type) && !isSupportedImageExtension(file.name)) {
      setError(t('unsupportedImageType'));
      return;
    }

    setInfo({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
    setIsLoading(true);

    try {
      const res = await fileToBase64(file);
      if (!cancelRef.current) setResult(res);
    } catch (e) {
      if (!cancelRef.current) {
        setError(e instanceof Error ? e.message : t('conversionFailed'));
      }
    } finally {
      if (!cancelRef.current) setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDownload = () => {
    if (!decoded) return;
    downloadBlob(decoded.blob, decodedFileName || `decoded${decoded.suggestedExtension}`);
  };

  const actions: ToolbarAction[] = useMemo(
    () => [
      {
        key: 'decode',
        label: t('decode'),
        type: 'primary',
        position: 'bottom',
        disabled: (value: string) => !value.trim(),
        onClick: (value: string, helpers) => {
          helpers.setError('');
          setDecoded(null);
          try {
            const res = base64ToBlob(value);
            setDecoded(res);
            setDecodedFileName(`decoded${res.suggestedExtension}`);
          } catch (e) {
            const message = e instanceof Error ? e.message : '';
            const i18nKey = ERROR_MESSAGE_TO_I18N[message];
            helpers.setError(i18nKey ? t(i18nKey) : message || t('conversionFailed'));
          }
        },
      },
    ],
    [t],
  );

  return (
    <>
      <SwitchButtonGroup
        value={direction}
        options={[
          { value: 'encode', label: t('encode') },
          { value: 'decode', label: t('decode') },
        ]}
        onChange={handleDirectionChange}
        size="small"
      />

      {direction === 'encode' && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => imageInputRef.current?.click()}
            className={`flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/10'
                : info
                  ? 'border-primary bg-primary/5'
                  : 'border-input bg-muted hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            {isLoading ? (
              <div className="w-10 h-10 border-4 border-primary/30 border-t-blue-600 rounded-full animate-spin" />
            ) : info ? (
              <div className="flex flex-col items-center gap-1">
                {result && (
                  <img
                    src={result.output}
                    alt="preview"
                    className="max-w-full max-h-40 rounded-lg object-contain mb-2"
                  />
                )}
                <span className="text-sm font-bold">{info.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(info.size)} · {info.type}
                </span>
                <span className="text-xs text-muted-foreground">{t('clickOrDropToReplace')}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Image className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-semibold">
                  {t('clickOrDropToImage')}
                </span>
                <span className="text-xs text-muted-foreground">{t('supportedFormats')}</span>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-muted-foreground">{t('base64Output')}</span>
                <div className="flex gap-1">
                  <CopyButton text={result.rawBase64} tooltip={t('copyRaw')} />
                  <CopyButton text={result.output} tooltip={t('copyDataUri')} color="info" />
                </div>
              </div>
              <div className="font-mono text-xs break-all max-h-[200px] overflow-y-auto leading-relaxed text-primary font-semibold">
                {result.output.length > 2000
                  ? `${result.output.substring(0, 2000)}...`
                  : result.output}
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-muted-foreground">
                  {t('originalSize')}: {formatFileSize(result.originalBytes)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('encodedSize')}: {formatFileSize(result.outputBytes)}
                </span>
              </div>
            </div>
          )}

          {info && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('clear')}
            </button>
          )}
        </>
      )}

      {direction === 'decode' && (
        <>
          <TextInputArea
            placeholder={t('decodeBase64Placeholder')}
            value={decodeInput}
            onChange={(v) => {
              setDecodeInput(v);
              setError(null);
            }}
            actions={actions}
            externalError={error || undefined}
            onClear={() => {
              setDecoded(null);
              setDecodedFileName('');
            }}
          />

          {decoded && (
            <DecodeResultPaper
              title={t('decodedImageOutput')}
              mimeType={decoded.mimeType}
              blobSize={decoded.blob.size}
              fileName={decodedFileName}
              onFileNameChange={setDecodedFileName}
              onDownload={handleDownload}
            >
              <img
                src={`data:${decoded.mimeType};base64,${decoded.rawBase64}`}
                alt="decoded preview"
                className="max-w-full max-h-40 rounded-lg object-contain mb-3"
              />
            </DecodeResultPaper>
          )}
        </>
      )}
    </>
  );
}
