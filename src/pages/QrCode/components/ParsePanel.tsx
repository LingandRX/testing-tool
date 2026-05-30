import { useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TextInputArea from '@/components/TextInputArea';
import ImageUploader from '@/components/ImageUploader';
import { useI18n } from '@/utils/chromeI18n';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ParsePanel() {
  const { t } = useI18n('qrCode');
  const { parserState, setParserState, handleFileChange, handleClearFile } = useQrCodeContext();

  const hasFile = parserState.selectedFile !== null;

  // 全局粘贴事件监听
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleFileChange(file);
            toast.success(t('qrCode:imagePasted'));
          }
          return;
        }
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text && text.startsWith('data:image/')) {
        e.preventDefault();
        try {
          const response = await fetch(text);
          const blob = await response.blob();
          const file = new File([blob], 'pasted-image.png', { type: blob.type });
          handleFileChange(file);
          toast.success(t('qrCode:imagePasted'));
        } catch (error) {
          console.error('处理 Base64 图片失败:', error);
          toast.error(t('qrCode:imagePasteError'));
        }
      }
    },
    [handleFileChange, t],
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // 未上传图片：只显示上传区域
  if (!hasFile) {
    return (
      <div className="w-full select-none p-0.5">
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
    );
  }

  // 已上传图片：显示图片预览 + 解析结果
  return (
    <div className="w-full select-none p-0.5 flex flex-col">
      {/* 图片预览区域（小图预览） */}
      <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
            {t('qrCode:uploadedImage')}
          </Label>
          <Button variant="ghost" size="sm" onClick={handleClearFile} className="h-6 px-2 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('qrCode:reuploadButton')}
          </Button>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 rounded-md p-2">
          <img
            src={parserState.previewUrl}
            alt="Uploaded QR Code"
            className="w-16 h-16 object-contain rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{parserState.selectedFile?.name}</p>
            {parserState.parsing && (
              <p className="text-xs text-primary animate-pulse mt-1">{t('qrCode:parsing')}</p>
            )}
          </div>
        </div>
      </div>

      {/* 解析结果区域 */}
      <div
        className={cn(
          'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4',
          'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
        )}
      >
        <div className="flex flex-col space-y-2.5">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider pl-0.5">
            {t('qrCode:resultLabel')}
          </Label>

          <TextInputArea
            value={parserState.decodedResult}
            readOnly={true}
            showClear={false}
            allowCopy={true}
            placeholder={parserState.parsing ? '' : t('qrCode:resultPlaceholder')}
            minRows={4}
            maxRows={8}
            externalError={parserState.parseError || undefined}
          />
        </div>
      </div>
    </div>
  );
}
