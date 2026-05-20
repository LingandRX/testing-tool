import { useCallback, useEffect, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import { qrCodePageStyles } from '@/config/pageTheme';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  /** 选中的文件 */
  selectedFile: File | null;
  /** 文件变更回调 */
  onFileChange: (file: File) => void;
  /** 清除文件回调 */
  onClearFile: () => void;
  /** 文件预览 URL */
  previewUrl: string;
  /** 预览 URL 变更回调 */
  onPreviewUrlChange: (url: string) => void;
  /** 是否正在拖拽 */
  dragging: boolean;
  /** 拖拽状态变更回调 */
  onDraggingChange: (dragging: boolean) => void;
}

const ImageUploader = ({
  selectedFile,
  onFileChange,
  onClearFile,
  previewUrl,
  onPreviewUrlChange,
  dragging,
  onDraggingChange,
}: ImageUploaderProps) => {
  const { t } = useTranslation(['qrCode']);
  const { showMessage } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File) => {
      onFileChange(file);
      onPreviewUrlChange(URL.createObjectURL(file));
    },
    [onFileChange, onPreviewUrlChange],
  );

  const handleClearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClearFile();
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
    onDraggingChange(true);
  };

  const handleDragLeave = () => {
    onDraggingChange(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDraggingChange(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
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
  }, [showMessage, handleFileChange, t]);

  return (
    <Box
      className="qr-flex-grow"
      sx={qrCodePageStyles.DROPZONE(dragging, !!selectedFile)}
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
        {selectedFile ? (
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
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('qrCode:clickToChange')}
            </Typography>
          </Box>
        ) : (
          <>
            <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
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
  );
};

export default ImageUploader;
