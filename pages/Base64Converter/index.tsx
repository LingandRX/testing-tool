import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import CopyButton from '@/components/CopyButton';
import { base64ConverterPageStyles } from '@/config/pageTheme';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConverterPageMode } from '@/types/storage';
import {
  textToBase64,
  base64ToText,
  fileToBase64,
  isFileSizeValid,
  isSupportedImageType,
  isSupportedImageExtension,
  formatFileSize,
  MAX_FILE_SIZE,
} from '@/utils/base64Converter';
import type { FileToBase64Result } from '@/utils/base64Converter';

const VALID_PAGE_MODES: readonly Base64ConverterPageMode[] = ['text', 'file', 'image'];

const isValidPageMode = (val: unknown): val is Base64ConverterPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = Base64ConverterPageMode;

/** 文件信息 */
interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export default function Index() {
  const { t } = useTranslation(['base64Converter']);
  const [pageMode, setPageMode] = useStorageState(
    'base64Converter/pageMode',
    'text',
    isValidPageMode,
  );

  // 文本模式状态
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [textDirection, setTextDirection] = useState<'encode' | 'decode'>('encode');

  // 文件/图像模式状态
  const [fileResult, setFileResult] = useState<FileToBase64Result | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileSelectCancelRef = useRef(false);

  /** 清空文本模式 */
  const handleClearText = useCallback(() => {
    setTextInput('');
    setTextOutput('');
    setTextError(null);
  }, []);

  /** 文本编码/解码 */
  const handleTextConvert = useCallback(() => {
    setTextError(null);
    try {
      if (textDirection === 'encode') {
        const result = textToBase64(textInput);
        setTextOutput(result.output);
      } else {
        const decoded = base64ToText(textInput);
        setTextOutput(decoded);
      }
    } catch (e) {
      setTextError(e instanceof Error ? e.message : t('base64Converter:conversionFailed'));
    }
  }, [textInput, textDirection, t]);

  /** 处理文件选择 */
  const handleFileSelect = useCallback(
    async (file: File, isImageMode: boolean) => {
      fileSelectCancelRef.current = false;
      setFileError(null);
      setFileResult(null);
      setFileInfo(null);

      if (!isFileSizeValid(file.size)) {
        setFileError(
          t('base64Converter:fileSizeExceeded', { max: `${MAX_FILE_SIZE / 1024 / 1024} MB` }),
        );
        return;
      }

      if (
        isImageMode &&
        !isSupportedImageType(file.type) &&
        !isSupportedImageExtension(file.name)
      ) {
        setFileError(t('base64Converter:unsupportedImageType'));
        return;
      }

      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
      setIsLoading(true);

      try {
        const result = await fileToBase64(file);
        if (!fileSelectCancelRef.current) {
          setFileResult(result);
        }
      } catch (e) {
        if (!fileSelectCancelRef.current) {
          setFileError(e instanceof Error ? e.message : t('base64Converter:conversionFailed'));
        }
      } finally {
        if (!fileSelectCancelRef.current) {
          setIsLoading(false);
        }
      }
    },
    [t],
  );

  /** 清空文件/图像模式 */
  const handleClearFile = useCallback(() => {
    fileSelectCancelRef.current = true;
    setFileResult(null);
    setFileInfo(null);
    setFileError(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, []);

  /** 拖拽处理 */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, isImageMode: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file, isImageMode);
      }
    },
    [handleFileSelect],
  );

  /** 页面模式元数据 */
  const modeTitles: Record<PageMode, { title: string; subtitle: string }> = {
    text: { title: 'base64Converter:pageTitle', subtitle: 'base64Converter:pageSubtitle' },
    file: { title: 'base64Converter:pageTitle', subtitle: 'base64Converter:pageSubtitle' },
    image: { title: 'base64Converter:pageTitle', subtitle: 'base64Converter:pageSubtitle' },
  };

  const modeIcon: Record<PageMode, React.ReactNode> = {
    text: <TextFieldsIcon />,
    file: <UploadFileIcon />,
    image: <ImageIcon />,
  };

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader
          title={t(modeTitles[pageMode].title)}
          subtitle={t(modeTitles[pageMode].subtitle)}
          icon={modeIcon[pageMode]}
          iconColor={base64ConverterPageStyles.primaryColor}
        />

        <Stack spacing={2.5}>
          {/* 模式切换器 */}
          <ToggleButtonGroup
            size="small"
            exclusive
            value={pageMode}
            onChange={(_, v: PageMode | null) => {
              if (!v || v === pageMode) return;
              handleClearFile();
              setPageMode(v);
            }}
            sx={{ borderRadius: 3, flexWrap: 'wrap', gap: 0.5 }}
          >
            <ToggleButton value="text" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:textMode')}
            </ToggleButton>
            <ToggleButton value="file" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:fileMode')}
            </ToggleButton>
            <ToggleButton value="image" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
              {t('base64Converter:imageMode')}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* ===== 文本模式 ===== */}
          {pageMode === 'text' && (
            <>
              {/* 编码/解码切换 */}
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={textDirection}
                  onChange={(_, v: 'encode' | 'decode' | null) => {
                    if (!v || v === textDirection) return;
                    setTextDirection(v);
                    setTextOutput('');
                    setTextError(null);
                  }}
                  sx={{ borderRadius: 3 }}
                >
                  <ToggleButton value="encode" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
                    {t('base64Converter:encode')}
                  </ToggleButton>
                  <ToggleButton value="decode" sx={{ px: 2, fontWeight: 700, fontSize: '0.75rem' }}>
                    {t('base64Converter:decode')}
                  </ToggleButton>
                </ToggleButtonGroup>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="text"
                    onClick={handleClearText}
                    startIcon={<DeleteOutlineIcon />}
                    sx={{ borderRadius: 3 }}
                  >
                    {t('base64Converter:clear')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleTextConvert}
                    disabled={!textInput.trim()}
                    startIcon={<SwapHorizIcon />}
                    sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
                  >
                    {textDirection === 'encode'
                      ? t('base64Converter:encode')
                      : t('base64Converter:decode')}
                  </Button>
                </Stack>
              </Stack>

              {/* 输入区 */}
              <TextField
                multiline
                fullWidth
                minRows={4}
                maxRows={10}
                placeholder={
                  textDirection === 'encode'
                    ? t('base64Converter:textInputPlaceholder')
                    : t('base64Converter:base64InputPlaceholder')
                }
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setTextError(null);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focused': {
                      bgcolor: 'background.paper',
                      boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.info.main, 0.1)}`,
                    },
                  },
                }}
              />

              {textError && <Alert severity="error">{textError}</Alert>}

              {/* 输出区 */}
              {textOutput && (
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
                      {textDirection === 'encode'
                        ? t('base64Converter:base64Output')
                        : t('base64Converter:textOutput')}
                    </Typography>
                    <CopyButton text={textOutput} showMessage={(_msg, _opts) => {}} />
                  </Stack>
                  <Box
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      wordBreak: 'break-all',
                      maxHeight: 300,
                      overflowY: 'auto',
                      lineHeight: 1.6,
                      color: 'info.main',
                      fontWeight: 600,
                    }}
                  >
                    {textOutput}
                  </Box>
                </Paper>
              )}
            </>
          )}

          {/* ===== 文件模式 ===== */}
          {pageMode === 'file' && (
            <>
              {/* 拖拽/上传区 */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, false)}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 180,
                  border: '2px dashed',
                  borderColor: isDragging ? 'info.main' : fileInfo ? 'info.main' : 'divider',
                  borderRadius: 3,
                  p: 4,
                  bgcolor: (theme) =>
                    isDragging
                      ? alpha(theme.palette.info.main, 0.08)
                      : fileInfo
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
                    if (file) handleFileSelect(file, false);
                  }}
                />
                {isLoading ? (
                  <CircularProgress size={40} />
                ) : fileInfo ? (
                  <Stack spacing={1} alignItems="center">
                    <UploadFileIcon sx={{ fontSize: 40, color: 'info.main' }} />
                    <Typography variant="body2" fontWeight={700}>
                      {fileInfo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(fileInfo.size)} · {fileInfo.type}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:clickOrDropToReplace')}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <UploadFileIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {t('base64Converter:clickOrDropToFile')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:maxFileSize', {
                        max: `${MAX_FILE_SIZE / 1024 / 1024} MB`,
                      })}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {fileError && <Alert severity="error">{fileError}</Alert>}

              {/* 文件转换结果 */}
              {fileResult && (
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
                      {t('base64Converter:base64Output')}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <CopyButton
                        text={fileResult.rawBase64}
                        tooltip={t('base64Converter:copyRaw')}
                        showMessage={() => {}}
                      />
                      <CopyButton
                        text={fileResult.output}
                        tooltip={t('base64Converter:copyDataUri')}
                        color="info"
                        showMessage={() => {}}
                      />
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all',
                      maxHeight: 200,
                      overflowY: 'auto',
                      lineHeight: 1.6,
                      color: 'info.main',
                      fontWeight: 600,
                    }}
                  >
                    {fileResult.output.length > 2000
                      ? `${fileResult.output.substring(0, 2000)}...`
                      : fileResult.output}
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:originalSize')}:{' '}
                      {formatFileSize(fileResult.originalBytes)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:encodedSize')}: {formatFileSize(fileResult.outputBytes)}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {fileInfo && (
                <Button
                  variant="text"
                  onClick={handleClearFile}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  {t('base64Converter:clear')}
                </Button>
              )}
            </>
          )}

          {/* ===== 图像模式 ===== */}
          {pageMode === 'image' && (
            <>
              {/* 拖拽/上传区 */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, true)}
                onClick={() => imageInputRef.current?.click()}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 180,
                  border: '2px dashed',
                  borderColor: isDragging ? 'info.main' : fileInfo ? 'info.main' : 'divider',
                  borderRadius: 3,
                  p: 4,
                  bgcolor: (theme) =>
                    isDragging
                      ? alpha(theme.palette.info.main, 0.08)
                      : fileInfo
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
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, true);
                  }}
                />
                {isLoading ? (
                  <CircularProgress size={40} />
                ) : fileInfo ? (
                  <Stack spacing={1} alignItems="center">
                    {fileResult && (
                      <Box
                        component="img"
                        src={fileResult.output}
                        alt="preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 160,
                          borderRadius: 2,
                          objectFit: 'contain',
                        }}
                      />
                    )}
                    <Typography variant="body2" fontWeight={700}>
                      {fileInfo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(fileInfo.size)} · {fileInfo.type}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:clickOrDropToReplace')}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {t('base64Converter:clickOrDropToImage')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:supportedFormats')}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {fileError && <Alert severity="error">{fileError}</Alert>}

              {/* 图像转换结果 */}
              {fileResult && (
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
                      {t('base64Converter:base64Output')}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <CopyButton
                        text={fileResult.rawBase64}
                        tooltip={t('base64Converter:copyRaw')}
                        showMessage={() => {}}
                      />
                      <CopyButton
                        text={fileResult.output}
                        tooltip={t('base64Converter:copyDataUri')}
                        color="info"
                        showMessage={() => {}}
                      />
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all',
                      maxHeight: 200,
                      overflowY: 'auto',
                      lineHeight: 1.6,
                      color: 'info.main',
                      fontWeight: 600,
                    }}
                  >
                    {fileResult.output.length > 2000
                      ? `${fileResult.output.substring(0, 2000)}...`
                      : fileResult.output}
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:originalSize')}:{' '}
                      {formatFileSize(fileResult.originalBytes)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t('base64Converter:encodedSize')}: {formatFileSize(fileResult.outputBytes)}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {fileInfo && (
                <Button
                  variant="text"
                  onClick={handleClearFile}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  {t('base64Converter:clear')}
                </Button>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
