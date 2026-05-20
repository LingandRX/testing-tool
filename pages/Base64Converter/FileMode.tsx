import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TextInputArea from '@/components/TextInputArea';
import type { ToolbarAction } from '@/components/TextInputArea';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import CopyButton from '@/components/CopyButton';
import DecodeResultPaper from '@/components/DecodeResultPaper';
import {
  fileToBase64,
  isFileSizeValid,
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

export default function FileMode() {
  const { t } = useTranslation('base64Converter');
  const [direction, setDirection] = useStorageState(
    'base64Converter/fileMode/direction',
    'encode',
    isValidDirection,
  );

  // encode state
  const [result, setResult] = useState<FileToBase64Result | null>(null);
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClear = () => {
    resetAll();
  };

  const handleDirectionChange = (next: Base64ConvertDirection) => {
    if (next === direction) return;
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
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 180,
              border: '2px dashed',
              borderColor: isDragging ? 'info.main' : info ? 'info.main' : 'divider',
              borderRadius: 3,
              p: 4,
              bgcolor: (theme) =>
                isDragging
                  ? alpha(theme.palette.info.main, 0.08)
                  : info
                    ? alpha(theme.palette.info.main, 0.04)
                    : 'action.hover',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'info.main',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            {isLoading ? (
              <CircularProgress size={40} />
            ) : info ? (
              <Stack spacing={1} alignItems="center">
                <UploadFileIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Typography variant="body2" fontWeight={700}>
                  {info.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(info.size)} · {info.type}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {t('clickOrDropToReplace')}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1} alignItems="center">
                <UploadFileIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {t('clickOrDropToFile')}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {t('maxFileSize', { max: `${MAX_FILE_SIZE / 1024 / 1024} MB` })}
                </Typography>
              </Stack>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {result && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.info.main, 0.15),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {t('base64Output')}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <CopyButton text={result.rawBase64} tooltip={t('copyRaw')} />
                  <CopyButton text={result.output} tooltip={t('copyDataUri')} color="info" />
                </Stack>
              </Stack>
              <TextInputArea
                readOnly
                value={
                  result.output.length > 2000
                    ? `${result.output.substring(0, 2000)}...`
                    : result.output
                }
                showClear={false}
                showCount
              />
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.disabled">
                  {t('originalSize')}: {formatFileSize(result.originalBytes)}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {t('encodedSize')}: {formatFileSize(result.outputBytes)}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClear}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ borderRadius: 2, minWidth: 0 }}
                >
                  {t('clear')}
                </Button>
              </Stack>
            </Paper>
          )}

          {info && !result && (
            <Button
              variant="text"
              onClick={handleClear}
              startIcon={<DeleteOutlineIcon />}
              sx={{ borderRadius: 3 }}
            >
              {t('clear')}
            </Button>
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
              title={t('decodedFileOutput')}
              mimeType={decoded.mimeType}
              blobSize={decoded.blob.size}
              fileName={decodedFileName}
              onFileNameChange={setDecodedFileName}
              onDownload={handleDownload}
            />
          )}
        </>
      )}
    </>
  );
}
