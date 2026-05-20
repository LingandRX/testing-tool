import React, { useCallback, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QRious from 'qrious';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useTranslation } from 'react-i18next';
import { useContextMenuData } from '@/utils/useContextMenuData';

interface UrlToQrCodeSectionProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** 桌面端强制展开（隐藏折叠交互） */
  forceExpanded?: boolean;
}

const UrlToQrCodeSection = ({
  expanded,
  onExpandedChange,
  forceExpanded = false,
}: UrlToQrCodeSectionProps) => {
  const { t } = useTranslation(['qrCode']);
  const { showMessage } = useSnackbar();
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateQrCodeFromUrl = useCallback(
    async (url: string) => {
      try {
        setGenerating(true);
        setUrlError('');

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        const qr = new QRious({
          value: url,
          size: 250,
          level: 'H',
          foreground: '#000000',
          background: '#FFFFFF',
        });

        setQrCodeDataUrl(qr.toDataURL());
        showMessage(t('qrCode:qrCodeSuccess'), { severity: 'success', autoHideDuration: 1000 });
      } catch (error) {
        console.error('生成二维码失败:', error);
        showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
      } finally {
        setGenerating(false);
      }
    },
    [t, showMessage],
  );

  const handleContextMenuData = useCallback(
    (payload: string) => {
      setUrlInput(payload);
      onExpandedChange(true);
      generateQrCodeFromUrl(payload);
    },
    [onExpandedChange, generateQrCodeFromUrl],
  );

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setUrlError('');
  };

  const generateQrCode = async () => {
    if (!urlInput) {
      setUrlError(t('qrCode:enterUrlError'));
      return;
    }
    await generateQrCodeFromUrl(urlInput);
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    link.click();
    showMessage(t('qrCode:qrCodeDownloadSuccess'), { severity: 'success', autoHideDuration: 300 });
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

      showMessage(t('qrCode:qrCodeCopySuccess'), { severity: 'success', autoHideDuration: 1000 });
    } catch (error) {
      console.error('复制二维码失败:', error);
      showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
    }
  };

  return (
    <Accordion
      expanded={forceExpanded ? true : expanded}
      onChange={forceExpanded ? undefined : (_, isExpanded) => onExpandedChange(isExpanded)}
      sx={forceExpanded ? qrCodePageStyles.ACCORDION_DESKTOP : qrCodePageStyles.ACCORDION}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={qrCodePageStyles.ACCORDION_SUMMARY}>
        <Box sx={qrCodePageStyles.ACCORDION_TITLE_ICON}>
          <QrCodeIcon color="primary" />
          <Typography variant="subtitle1" sx={qrCodePageStyles.ACCORDION_TITLE_TEXT}>
            {t('qrCode:urlToQr')}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <TextField
            label={t('qrCode:urlInputLabel')}
            placeholder={t('qrCode:urlInputPlaceholder')}
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
            sx={qrCodePageStyles.PRIMARY_BUTTON}
          >
            {generating ? t('qrCode:generating') : t('qrCode:generateButton')}
          </Button>

          <Box className="qr-flex-grow" sx={qrCodePageStyles.QR_PREVIEW_CONTAINER}>
            {qrCodeDataUrl ? (
              <Box sx={qrCodePageStyles.QR_PREVIEW_INNER}>
                <img src={qrCodeDataUrl} alt="QR Code" style={qrCodePageStyles.QR_PREVIEW_IMAGE} />
                <Box sx={qrCodePageStyles.QR_PREVIEW_ACTIONS}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadQrCode}
                    sx={qrCodePageStyles.DOWNLOAD_BUTTON}
                  >
                    {t('qrCode:downloadButton')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyQrCode}
                    sx={qrCodePageStyles.COPY_BUTTON}
                  >
                    {t('qrCode:copyQrButton')}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={qrCodePageStyles.PLACEHOLDER_TEXT}
              >
                {t('qrCode:qrCodeWillShow')}
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default UrlToQrCodeSection;
