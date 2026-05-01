import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import qrcode from 'qrcode';
import { qrCodePageStyles } from '@/config/pageTheme';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

interface UrlToQrCodeSectionProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

const UrlToQrCodeSection = ({
  expanded,
  onExpandedChange,
  showMessage,
}: UrlToQrCodeSectionProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setUrlError('');
  };

  const generateQrCode = async () => {
    if (!urlInput) {
      setUrlError('请输入 URL');
      return;
    }

    try {
      setGenerating(true);
      setUrlError('');

      let url = urlInput;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const dataUrl = await qrcode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: qrCodePageStyles.black,
          light: qrCodePageStyles.white,
        },
      });

      setQrCodeDataUrl(dataUrl);
      showMessage('二维码生成成功', { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('生成二维码失败:', error);
      showMessage('生成二维码失败，请重试', { severity: 'error', autoHideDuration: 300 });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage('二维码下载成功', { severity: 'success', autoHideDuration: 300 });
  };

  const copyQrCode = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      showMessage('二维码已复制到剪贴板', { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('复制二维码失败:', error);
      showMessage('复制二维码失败，请重试', { severity: 'error', autoHideDuration: 300 });
    }
  };

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
          <QrCodeIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            URL 转二维码
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <TextField
            label="输入 URL"
            placeholder="https://example.com"
            value={urlInput}
            onChange={handleUrlInputChange}
            fullWidth
            variant="outlined"
            error={!!urlError}
            helperText={urlError}
            sx={qrCodePageStyles.INPUT_STYLE}
          />

          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <QrCodeIcon />}
            onClick={generateQrCode}
            disabled={generating}
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
            {generating ? '生成中...' : '生成二维码'}
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
              border: '2px dashed',
              borderColor: 'grey.200',
              borderRadius: 3,
              p: 2,
              bgcolor: 'grey.50',
            }}
          >
            {qrCodeDataUrl ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadQrCode}
                    sx={{
                      borderRadius: 2,
                      borderColor: qrCodePageStyles.successColor,
                      color: qrCodePageStyles.successColor,
                      '&:hover': {
                        borderColor: qrCodePageStyles.successDark,
                        bgcolor: 'rgba(76, 175, 80, 0.05)',
                      },
                    }}
                  >
                    下载二维码
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyQrCode}
                    sx={{
                      borderRadius: 2,
                      bgcolor: qrCodePageStyles.successColor,
                      '&:hover': {
                        bgcolor: qrCodePageStyles.successDark,
                      },
                    }}
                  >
                    复制二维码
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                二维码将显示在这里
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default UrlToQrCodeSection;
