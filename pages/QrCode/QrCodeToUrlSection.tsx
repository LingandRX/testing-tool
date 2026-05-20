import { useCallback } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CopyButton from '@/components/CopyButton';
import ImageUploader from '@/components/ImageUploader';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useTranslation } from 'react-i18next';
import type { QrCodeParserProps } from './types';

const QrCodeToUrlSection = ({
  decodedResult,
  onDecodedResultChange,
  parsing,
  onParsingChange,
  parseError,
  onParseErrorChange,
  selectedFile,
  onFileChange,
  onClearFile,
  previewUrl,
  onPreviewUrlChange,
  dragging,
  onDraggingChange,
  expanded,
  onExpandedChange,
  forceExpanded = false,
}: QrCodeParserProps) => {
  const { t } = useTranslation(['qrCode']);
  const { showMessage } = useSnackbar();

  const handleClearFile = useCallback(() => {
    onClearFile();
    onDecodedResultChange('');
    onParseErrorChange('');
  }, [onClearFile, onDecodedResultChange, onParseErrorChange]);

  const parseQrCode = async () => {
    if (!selectedFile) {
      showMessage(t('qrCode:selectImage'), { severity: 'error', autoHideDuration: 300 });
      return;
    }

    try {
      onParsingChange(true);
      onParseErrorChange('');
      onDecodedResultChange('');

      const result = await parseQrCodeFromFile(selectedFile);

      if (result.success && result.data) {
        onDecodedResultChange(result.data);
        showMessage(t('qrCode:parseSuccess'), { severity: 'success', autoHideDuration: 1000 });
      } else {
        onParseErrorChange(result.error || t('qrCode:noQrDetected'));
        showMessage(result.error || t('qrCode:noQrDetected'), {
          severity: 'error',
          autoHideDuration: 1000,
        });
      }
    } catch (error) {
      console.error('解析二维码失败:', error);
      onParseErrorChange(t('qrCode:parseError'));
      showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
    } finally {
      onParsingChange(false);
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
          <LinkIcon color="success" />
          <Typography variant="subtitle1" sx={qrCodePageStyles.ACCORDION_TITLE_TEXT}>
            {t('qrCode:qrToUrl')}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <ImageUploader
            selectedFile={selectedFile}
            onFileChange={onFileChange}
            onClearFile={handleClearFile}
            previewUrl={previewUrl}
            onPreviewUrlChange={onPreviewUrlChange}
            dragging={dragging}
            onDraggingChange={onDraggingChange}
          />

          <Button
            variant="contained"
            startIcon={parsing ? <CircularProgress size={16} color="inherit" /> : <LinkIcon />}
            onClick={parseQrCode}
            disabled={parsing}
            sx={qrCodePageStyles.PRIMARY_BUTTON}
          >
            {parsing ? t('qrCode:parsing') : t('qrCode:parseButton')}
          </Button>

          <Box sx={qrCodePageStyles.RESULT_INPUT}>
            <TextField
              label={t('qrCode:resultLabel')}
              value={decodedResult}
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <CopyButton
                        text={decodedResult}
                        tooltip={t('qrCode:copyTooltip')}
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
