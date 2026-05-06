import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import CopyButton from '@/components/CopyButton';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import { useTranslation } from 'react-i18next';

interface QrCodeToUrlSectionProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const QrCodeToUrlSection = ({ expanded, onExpandedChange }: QrCodeToUrlSectionProps) => {
  const { t } = useTranslation(['qrCode']);
  const { showMessage } = useSnackbar();
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [parsedUrl, setParsedUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 清理预览 URL，防止内存泄漏
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((file: File) => {
    setQrCodeFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setParseError('');
    setParsedUrl('');
  }, []);

  const handleClearFile = () => {
    setQrCodeFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setParsedUrl('');
    setParseError('');
    showMessage(t('qrCode:imageCleared'), {
      severity: 'success',
      autoHideDuration: 1000,
    });
  };

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
      showMessage(t('qrCode:selectImage'), { severity: 'error', autoHideDuration: 300 });
      return;
    }

    try {
      setParsing(true);
      setParseError('');
      setParsedUrl('');

      const result = await parseQrCodeFromFile(qrCodeFile);

      if (result.success && result.data) {
        setParsedUrl(result.data);
        showMessage(t('qrCode:parseSuccess'), { severity: 'success', autoHideDuration: 1000 });
      } else {
        showMessage(result.error || t('qrCode:noQrDetected'), {
          severity: 'error',
          autoHideDuration: 1000,
        });
      }
    } catch (error) {
      console.error('解析二维码失败:', error);
      showMessage(t('qrCode:parseError'), { severity: 'error', autoHideDuration: 300 });
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
              showMessage(t('qrCode:imagePasted'), { severity: 'success', autoHideDuration: 1000 });
            } catch (error) {
              console.error('处理粘贴图片失败:', error);
              showMessage(t('qrCode:imagePasteError'), {
                severity: 'error',
                autoHideDuration: 3000,
              });
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
  }, [expanded, showMessage, handleFileChange, t]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      sx={qrCodePageStyles.ACCORDION}
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
          <Box
            sx={qrCodePageStyles.DROPZONE(dragging, !!qrCodeFile)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
              id="qr-code-upload"
            />
            <label
              htmlFor="qr-code-upload"
              style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}
            >
              {qrCodeFile ? (
                <Box sx={qrCodePageStyles.IMAGE_PREVIEW_WRAPPER}>
                  <Box sx={qrCodePageStyles.IMAGE_PREVIEW_BOX}>
                    <img
                      src={previewUrl}
                      alt="QR Code Preview"
                      style={qrCodePageStyles.IMAGE_PREVIEW_IMG}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile();
                      }}
                      sx={qrCodePageStyles.CLEAR_BUTTON}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {qrCodeFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('qrCode:clickToChange')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('qrCode:clickToUpload')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('qrCode:supportFormats')}
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
            sx={qrCodePageStyles.PRIMARY_BUTTON}
          >
            {parsing ? t('qrCode:parsing') : t('qrCode:parseButton')}
          </Button>

          <Box sx={qrCodePageStyles.RESULT_INPUT}>
            <TextField
              label={t('qrCode:resultLabel')}
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
