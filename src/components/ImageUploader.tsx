import { useCallback, useEffect, useRef } from 'react';
import { Image, X } from 'lucide-react';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useI18n } from '@/utils/chromeI18n';

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
  const { t } = useI18n('qrCode');
  const { showMessage } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File) => {
      onFileChange(file);
      onPreviewUrlChange(URL.createObjectURL(file));
    },
    [onFileChange, onPreviewUrlChange],
  );

  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClearFile();
    showMessage(t('qrCode:imageCleared'), {
      severity: 'success',
      autoHideDuration: 1000,
    });
  }, [previewUrl, onClearFile, showMessage, t]);

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
    <div
      className={`flex flex-col items-center justify-center h-[250px] border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-green-600 bg-green-50'
          : selectedFile
            ? 'border-green-600 bg-green-50/50'
            : 'border-input bg-muted hover:border-green-600 hover:bg-green-500/10/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        id="qr-code-upload"
      />
      <label htmlFor="qr-code-upload" className="cursor-pointer text-center w-full">
        {selectedFile ? (
          <div className="text-center w-full relative">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="QR Code Preview"
                className="max-w-full max-h-40 rounded-lg object-contain"
              />
              <button
                type="button"
                data-testid="ClearIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="block text-sm text-muted-foreground mt-2">{selectedFile.name}</span>
            <span className="block text-xs text-muted-foreground">{t('qrCode:clickToChange')}</span>
          </div>
        ) : (
          <>
            <Image
              data-testid="ImageIcon"
              className="w-12 h-12 text-muted-foreground mx-auto mb-2"
            />
            <span className="block text-sm text-muted-foreground mb-1">
              {t('qrCode:clickToUpload')}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t('qrCode:supportFormats')}
            </span>
          </>
        )}
      </label>
    </div>
  );
};

export default ImageUploader;
