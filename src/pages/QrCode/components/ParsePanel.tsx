import { useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TextInputArea from '@/components/TextInputArea';
import ImageUploader from './ImageUploader';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ParsePanel() {
  const { parserState, setParserState, handleFileChange, handleClearFile } = useQrCodeContext();

  const hasFile = parserState.selectedFile !== null;

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
            toast.success('图片粘贴成功，正在解析...');
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
          toast.success('图片粘贴成功，正在解析...');
        } catch (error) {
          console.error('处理 Base64 图片失败:', error);
          toast.error('粘贴图片失败，请重试');
        }
      }
    },
    [handleFileChange],
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  if (!hasFile) {
    return (
      <div className="w-full select-none p-0.5">
        <ImageUploader
          selectedFile={parserState.selectedFile}
          onFileChange={handleFileChange}
          onClearFile={handleClearFile}
          previewUrl={parserState.previewUrl}
          dragging={parserState.dragging}
          onDraggingChange={(dragging) => setParserState((prev) => ({ ...prev, dragging }))}
        />
      </div>
    );
  }

  return (
    <div className="w-full select-none p-0.5 flex flex-col">
      <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
            已上传图片
          </Label>
          <Button variant="ghost" size="sm" onClick={handleClearFile} className="h-6 px-2 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            重新上传
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
              <p className="text-xs text-primary animate-pulse mt-1">解析中...</p>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4',
          'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
        )}
      >
        <div className="flex flex-col space-y-2.5">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider pl-0.5">
            解析结果
          </Label>

          <TextInputArea
            value={parserState.decodedResult}
            readOnly={true}
            showClear={false}
            allowCopy={true}
            placeholder={parserState.parsing ? '' : '解析结果将显示在此处'}
            minRows={4}
            maxRows={8}
            externalError={parserState.parseError || undefined}
          />
        </div>
      </div>
    </div>
  );
}
