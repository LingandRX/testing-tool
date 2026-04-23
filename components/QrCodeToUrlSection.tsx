import { useState, useEffect } from 'react';
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
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import jsQR from 'jsqr';
import CopyButton from '@/components/CopyButton';
import { qrCodePageStyles } from '@/config/pageTheme';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setQrCodeFile(file);
      setParseError('');
      setParsedUrl('');
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

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法创建 canvas 上下文');
      }

      const image = new Image();
      image.src = URL.createObjectURL(qrCodeFile);

      await new Promise<void>((resolve, reject) => {
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          resolve();
        };
        image.onerror = () => reject(new Error('图片加载失败'));
      });

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setParsedUrl(code.data);
        showMessage('二维码解析成功', { severity: 'success', autoHideDuration: 1000 });
      } else {
        showMessage('未检测到二维码', { severity: 'error', autoHideDuration: 1000 });
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
              setQrCodeFile(file);
              setParseError('');
              setParsedUrl('');
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
  }, [expanded, showMessage]);

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
              borderColor: qrCodeFile ? qrCodePageStyles.successColor : 'grey.200',
              borderRadius: 3,
              p: 4,
              bgcolor: qrCodeFile ? 'rgba(76, 175, 80, 0.05)' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: qrCodePageStyles.successColor,
                bgcolor: 'rgba(76, 175, 80, 0.05)',
              },
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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
                    <Button
                      variant="contained"
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
                        minWidth: '32px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        bgcolor: 'rgba(244, 67, 54, 0.9)',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.95)',
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </Button>
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
