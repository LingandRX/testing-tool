import React, { useCallback } from 'react';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QRious from 'qrious';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useTranslation } from 'react-i18next';
import { useContextMenuData } from '@/utils/useContextMenuData';
import QrCodePreview from '@/components/QrCodePreview';
import type { QrCodeGeneratorProps } from './types';

const UrlToQrCodeSection = ({
  textToEncode,
  onTextChange,
  qrCodeDataUrl,
  onQrCodeDataUrlChange,
  generating,
  onGeneratingChange,
  inputError,
  onInputErrorChange,
  expanded,
  onExpandedChange,
  forceExpanded = false,
}: QrCodeGeneratorProps) => {
  const { t } = useTranslation(['qrCode']);
  const { showMessage } = useSnackbar();

  const generateQrCodeFromUrl = useCallback(
    async (url: string) => {
      try {
        onGeneratingChange(true);
        onInputErrorChange('');

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

        onQrCodeDataUrlChange(qr.toDataURL());
        showMessage(t('qrCode:qrCodeSuccess'), { severity: 'success', autoHideDuration: 1000 });
      } catch (error) {
        console.error('生成二维码失败:', error);
        showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
      } finally {
        onGeneratingChange(false);
      }
    },
    [t, showMessage, onGeneratingChange, onInputErrorChange, onQrCodeDataUrlChange],
  );

  const handleContextMenuData = useCallback(
    (payload: string) => {
      onTextChange(payload);
      onExpandedChange(true);
      generateQrCodeFromUrl(payload);
    },
    [onExpandedChange, generateQrCodeFromUrl, onTextChange],
  );

  useContextMenuData({ featureKey: 'qrCode', onData: handleContextMenuData });

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTextChange(e.target.value);
    onInputErrorChange('');
  };

  const generateQrCode = async () => {
    if (!textToEncode) {
      onInputErrorChange(t('qrCode:enterUrlError'));
      return;
    }
    await generateQrCodeFromUrl(textToEncode);
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
            value={textToEncode}
            onChange={handleUrlInputChange}
            fullWidth
            variant="outlined"
            error={!!inputError}
            helperText={inputError}
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

          <Box className="qr-flex-grow">
            <QrCodePreview
              qrCodeDataUrl={qrCodeDataUrl}
              onDownload={downloadQrCode}
              onCopy={copyQrCode}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default UrlToQrCodeSection;
