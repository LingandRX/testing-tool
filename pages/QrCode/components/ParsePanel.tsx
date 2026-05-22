import { useCallback, useEffect } from 'react';
import TextInputArea from '@/components/TextInputArea';
import ImageUploader from '@/components/ImageUploader';
import { useSnackbar } from '@/components/GlobalSnackbar';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
    /* 💡 统一大视觉轴：
       - 追加 p-0.5 微隔离，配合 gap-6 建立与生成面板（GeneratePanel）绝对像素对齐的网格天平。
    */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch select-none p-0.5 animate-in fade-in duration-300">
      {/* 左翼：图片接收/拖拽/剪贴板上传终端 */}
      <div className="flex flex-col h-full">
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

      {/* 右翼：高阶解析出码只读终端 */}
      <div
        className={cn(
          'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4 transition-all duration-200',
          // 💡 视觉对称增强：加入相同的聚焦变量环联动，使双翼权重达成完美绝对平衡
          'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
        )}
      >
        <div className="flex flex-col space-y-2.5 h-full">
          {/* 💡 修复点：物理剔除 TextInputArea 上的违规 title，改用符合 Vercel 美学的极致大写极细原子标签 */}
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider pl-0.5">
            {t('qrCode:resultLabel')}
          </Label>

          <div className="flex-1 min-h-0">
            <TextInputArea
              value={parserState.decodedResult}
              readOnly={true}
              showClear={false}
              allowCopy={true}
              placeholder=""
              minRows={6}
              maxRows={12}
              externalError={parserState.parseError || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
