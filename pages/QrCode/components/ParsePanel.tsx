import { useEffect, useCallback } from 'react';
import TextInputArea from '@/components/TextInputArea';
import ImageUploader from '@/components/ImageUploader';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useQrCodeContext } from '../contexts/QrCodeContext';

export default function ParsePanel() {
  const { t } = useLazyTranslation('qrCode');
  const { showMessage } = useSnackbar();
  const { parserState, setParserState, handleFileChange, handleClearFile } = useQrCodeContext();

  // 全局粘贴事件监听
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // 检查是否有图片
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleFileChange(file);
            showMessage(t('qrCode:imagePasted'), { severity: 'success', autoHideDuration: 1000 });
          }
          return;
        }
      }

      // 检查是否有 Base64 字符串
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.startsWith('data:image/')) {
        e.preventDefault();
        try {
          const response = await fetch(text);
          const blob = await response.blob();
          const file = new File([blob], 'pasted-image.png', { type: blob.type });
          handleFileChange(file);
          showMessage(t('qrCode:imagePasted'), { severity: 'success', autoHideDuration: 1000 });
        } catch (error) {
          console.error('处理 Base64 图片失败:', error);
          showMessage(t('qrCode:imagePasteError'), { severity: 'error', autoHideDuration: 3000 });
        }
      }
    },
    [handleFileChange, showMessage, t],
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <ImageUploader
          selectedFile={parserState.selectedFile}
          onFileChange={handleFileChange}
          onClearFile={handleClearFile}
          previewUrl={parserState.previewUrl}
          onPreviewUrlChange={(url) => setParserState((prev) => ({ ...prev, previewUrl: url }))}
          dragging={parserState.dragging}
          onDraggingChange={(dragging) => setParserState((prev) => ({ ...prev, dragging }))}
        />
      </div>
      <div>
        <TextInputArea
          title={t('qrCode:resultLabel')}
          value={parserState.decodedResult}
          readOnly
          showClear={false}
          allowCopy
          placeholder=""
          externalError={parserState.parseError}
          showMessage={showMessage}
        />
      </div>
    </div>
  );
}
