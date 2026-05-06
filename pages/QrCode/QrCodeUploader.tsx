import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import GlobalSnackbar, { useSnackbarState } from '@/components/GlobalSnackbar';
import CopyButton from '@/components/CopyButton';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';

interface QrCodeUploaderProps {
  onQrCodeDetected?: (data: string) => void;
  supportedFormats?: string[];
  maxFileSize?: number; // in bytes
  timeout?: number; // in milliseconds
  showPreview?: boolean;
  showProgress?: boolean;
  className?: string;
}

const QrCodeUploader: React.FC<QrCodeUploaderProps> = ({
  onQrCodeDetected,
  supportedFormats = ['image/png', 'image/jpeg', 'image/webp'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  showPreview = true,
  showProgress = true,
  className,
}) => {
  const { snackbarProps, showMessage } = useSnackbarState({ autoHideDuration: 3000 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // 清理预览 URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // 处理文件
  const processFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const result = await parseQrCodeFromFile(file);

        clearInterval(progressInterval);
        setProgress(100);

        if (result.success && result.data) {
          setResult(result.data);
          showMessage('二维码解析成功', { severity: 'success' });
          if (onQrCodeDetected) {
            onQrCodeDetected(result.data);
          }
        } else {
          setError(result.error || '未检测到二维码');
          showMessage(result.error || '未检测到二维码', { severity: 'error' });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '解析失败');
        showMessage('解析失败: ' + (err instanceof Error ? err.message : '未知错误'), {
          severity: 'error',
        });
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [showMessage, onQrCodeDetected],
  );

  // 处理文件
  const handleFile = useCallback(
    (selectedFile: File) => {
      // 检查文件格式
      if (!supportedFormats.includes(selectedFile.type)) {
        setError(
          `不支持的文件格式。支持的格式: ${supportedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')}`,
        );
        showMessage('不支持的文件格式', { severity: 'error' });
        return;
      }

      // 检查文件大小
      if (selectedFile.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        setError(`文件大小超过限制。最大支持 ${maxSizeMB}MB`);
        showMessage(`文件大小超过限制，最大支持 ${maxSizeMB}MB`, { severity: 'error' });
        return;
      }

      // 重置状态
      setError(null);
      setResult(null);
      setFile(selectedFile);

      // 创建预览
      if (showPreview) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      }

      // 开始处理
      processFile(selectedFile).catch(console.error);
    },
    [supportedFormats, maxFileSize, showPreview, showMessage, processFile],
  );

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            handleFile(pastedFile);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  // 清除文件
  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box className={className}>
      {/* 上传区域 */}
      <Paper
        ref={uploadAreaRef}
        elevation={0}
        sx={{
          p: isMobile ? 3 : 4,
          borderRadius: 4,
          border: `2px dashed ${dragging ? 'primary.main' : 'grey.300'}`,
          bgcolor: dragging ? 'primary.lighter' : 'grey.50',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!file && !uploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ImageIcon sx={{ fontSize: isMobile ? 36 : 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              点击、拖拽或粘贴上传二维码图片
            </Typography>
            <Typography variant="caption" color="text.secondary">
              支持 {supportedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')} 格式
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              最大文件大小: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
            </Typography>
          </Box>
        ) : file && showPreview && preview ? (
          <Box sx={{ position: 'relative' }}>
            <img
              src={preview}
              alt="QR Code Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 8,
                objectFit: 'contain',
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'rgba(244, 67, 54, 0.9)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(211, 47, 47, 0.95)',
                },
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {file.name}
            </Typography>
          </Box>
        ) : uploading && showProgress ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              处理中...
            </Typography>
            {progress > 0 && (
              <Box sx={{ width: '80%', mt: 2 }}>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      bgcolor: 'primary.main',
                      width: `${progress}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {progress}%
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </Paper>

      {/* 结果展示 */}
      {(result || error) && (
        <Box sx={{ mt: 3 }}>
          {result && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'success.light',
                bgcolor: 'success.lighter',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    二维码内容
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        pr: 8,
                      }}
                    >
                      {result}
                    </Typography>
                    <CopyButton
                      text={result}
                      tooltip="复制"
                      size="small"
                      color="success"
                      showMessage={showMessage}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 4 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
        </Box>
      )}

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
};

export default QrCodeUploader;
