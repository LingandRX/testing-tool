import { Box, Button, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface QrCodePreviewProps {
  /** 二维码 Data URL */
  qrCodeDataUrl: string;
  /** 下载回调 */
  onDownload: () => void;
  /** 复制回调 */
  onCopy: () => void;
}

const QrCodePreview = ({ qrCodeDataUrl, onDownload, onCopy }: QrCodePreviewProps) => {
  const { t } = useLazyTranslation('qrCode');

  if (!qrCodeDataUrl) {
    return (
      <Box sx={qrCodePageStyles.QR_PREVIEW_CONTAINER}>
        <Typography variant="body2" color="text.secondary" sx={qrCodePageStyles.PLACEHOLDER_TEXT}>
          {t('qrCode:qrCodeWillShow')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={qrCodePageStyles.QR_PREVIEW_CONTAINER}>
      <Box sx={qrCodePageStyles.QR_PREVIEW_INNER}>
        <img src={qrCodeDataUrl} alt="QR Code" style={qrCodePageStyles.QR_PREVIEW_IMAGE} />
        <Box sx={qrCodePageStyles.QR_PREVIEW_ACTIONS}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            sx={qrCodePageStyles.DOWNLOAD_BUTTON}
          >
            {t('qrCode:downloadButton')}
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={onCopy}
            sx={qrCodePageStyles.COPY_BUTTON}
          >
            {t('qrCode:copyQrButton')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default QrCodePreview;
