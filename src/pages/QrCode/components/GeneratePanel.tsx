import { Loader2, Pencil, QrCode } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import { useI18n } from '@/utils/chromeI18n';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** 文本预览的最大显示字符数 */
const TEXT_PREVIEW_MAX_LENGTH = 100;

export default function GeneratePanel() {
  const { t } = useI18n('qrCode');
  const {
    generatorState,
    setTextToEncode,
    confirmGenerate,
    backToEdit,
    downloadQrCode,
    copyQrCode,
  } = useQrCodeContext();

  const isInputStep = generatorState.step === 'input';
  const hasText = generatorState.textToEncode.trim().length > 0;

  /** 截断文本用于预览显示 */
  const getTruncatedText = (text: string) => {
    if (text.length <= TEXT_PREVIEW_MAX_LENGTH) return text;
    return text.slice(0, TEXT_PREVIEW_MAX_LENGTH) + '...';
  };

  // 输入态：只显示输入框和生成按钮
  if (isInputStep) {
    return (
      <div className="w-full select-none p-0.5">
        <div
          className={cn(
            'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4',
            'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
          )}
        >
          <div className="flex flex-col space-y-2.5">
            <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
              {t('qrCode:urlInputLabel')}
            </Label>

            <TextInputArea
              value={generatorState.textToEncode}
              onChange={setTextToEncode}
              placeholder={t('qrCode:urlInputPlaceholder')}
              showCount={true}
              showClear={true}
              allowCopy={false}
              minRows={6}
              maxRows={12}
              externalError={generatorState.inputError || undefined}
              onClear={() => setTextToEncode('')}
            />

            <Button
              onClick={confirmGenerate}
              disabled={!hasText || generatorState.generating}
              className="w-full"
            >
              {generatorState.generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('qrCode:generating')}
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  {t('qrCode:generateButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 预览态：显示文本预览 + 二维码
  return (
    <div className="w-full select-none p-0.5 space-y-4">
      {/* 文本预览区域 */}
      <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
            {t('qrCode:textPreviewLabel')}
          </Label>
          <Button variant="ghost" size="sm" onClick={backToEdit} className="h-7 px-2 text-xs">
            <Pencil className="w-3 h-3 mr-1" />
            {t('qrCode:editButton')}
          </Button>
        </div>
        <div
          className="text-sm text-foreground bg-muted/50 rounded-md p-3 cursor-default"
          title={generatorState.savedText}
        >
          {getTruncatedText(generatorState.savedText)}
        </div>
      </div>

      {/* 二维码预览区域 */}
      <QrCodePreview
        qrCodeDataUrl={generatorState.qrCodeDataUrl}
        onDownload={downloadQrCode}
        onCopy={copyQrCode}
      />
    </div>
  );
}
