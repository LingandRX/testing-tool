import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import CopyButton from '@/components/CopyButton';
import { qrCodePageStyles } from '@/config/pageTheme';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';

interface QrCodeToUrlSectionProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

const QrCodeToUrlSection = ({
  expanded,
  onExpandedChange,
  showMessage,
}: QrCodeToUrlSectionProps) => {
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [parsedUrl, setParsedUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File) => {
    setQrCodeFile(file);
    setParseError('');
    setParsedUrl('');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

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
      handleFileChange(droppedFile);
    }
  };

  const parseQrCode = async () => {
    if (!qrCodeFile) {
      showMessage('请选择二维码图片', { severity: 'error', autoHideDuration: 300 });
      return;
    }

    try {
      setParsing(true);
      setParseError('');
      setParsedUrl('');

      const result = await parseQrCodeFromFile(qrCodeFile);

      if (result.success && result.data) {
        setParsedUrl(result.data);
        showMessage('二维码解析成功', { severity: 'success', autoHideDuration: 1000 });
      } else {
        showMessage(result.error || '未检测到二维码', {
          severity: 'error',
          autoHideDuration: 1000,
        });
      }
    } catch (error) {
      console.error('解析二维码失败:', error);
      showMessage('解析二维码失败，请重试', { severity: 'error', autoHideDuration: 300 });
    } finally {
      setParsing(false);
    }
  };

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!expanded) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();

          const file = items[i].getAsFile();
          if (file) {
            try {
              handleFileChange(file);
              showMessage('图片粘贴成功', { severity: 'success', autoHideDuration: 1000 });
            } catch (error) {
              console.error('处理粘贴图片失败:', error);
              showMessage('粘贴图片失败，请重试', { severity: 'error', autoHideDuration: 3000 });
            }
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [expanded, showMessage, handleFileChange]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      sx={{
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinkIcon color="success" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            二维码转 URL
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              border: '2px dashed',
              borderColor: dragging
                ? qrCodePageStyles.successColor
                : qrCodeFile
                  ? qrCodePageStyles.successColor
                  : 'grey.200',
              borderRadius: 3,
              p: 4,
              bgcolor: dragging
                ? 'rgba(76, 175, 80, 0.1)'
                : qrCodeFile
                  ? 'rgba(76, 175, 80, 0.05)'
                  : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: qrCodePageStyles.successColor,
                bgcolor: 'rgba(76, 175, 80, 0.05)',
              },
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{
                display: 'none',
              }}
              id="qr-code-upload"
            />
            <label
              htmlFor="qr-code-upload"
              style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}
            >
              {qrCodeFile ? (
                <Box sx={{ textAlign: 'center', width: '100%', position: 'relative' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={URL.createObjectURL(qrCodeFile)}
                      alt="QR Code Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 160,
                        borderRadius: 8,
                        objectFit: 'contain',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrCodeFile(null);
                        setParsedUrl('');
                        setParseError('');
                        showMessage('图片已清除', {
                          severity: 'success',
                          autoHideDuration: 1000,
                        });
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
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {qrCodeFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    点击更换图片
                  </Typography>
                </Box>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    点击、拖拽或粘贴上传二维码图片
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    支持 PNG、JPG、WEBP 格式
                  </Typography>
                </>
              )}
            </label>
          </Box>

          <Button
            variant="contained"
            startIcon={parsing ? <CircularProgress size={16} color="inherit" /> : <LinkIcon />}
            onClick={parseQrCode}
            disabled={parsing}
            sx={{
              py: 1.2,
              borderRadius: 3,
              bgcolor: qrCodePageStyles.successColor,
              fontWeight: 700,
              '&:hover': {
                bgcolor: qrCodePageStyles.successDark,
              },
            }}
          >
            {parsing ? '解析中...' : '解析二维码'}
          </Button>

          <Box
            sx={{
              position: 'relative',
              mt: 2,
            }}
          >
            <TextField
              label="解析结果"
              value={parsedUrl}
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <CopyButton
                        text={parsedUrl}
                        tooltip="复制"
                        size="small"
                        color={qrCodePageStyles.primaryColor}
                        showMessage={showMessage}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={qrCodePageStyles.INPUT_STYLE}
            />
          </Box>

          {parseError && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {parseError}
            </Alert>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default QrCodeToUrlSection;
