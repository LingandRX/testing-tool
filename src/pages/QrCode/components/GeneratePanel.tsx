import { Loader2, Pencil, QrCode } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from './QrCodePreview';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TEXT_PREVIEW_MAX_LENGTH = 80;

export default function GeneratePanel() {
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

  const getTruncatedText = (text: string) => {
    if (text.length <= TEXT_PREVIEW_MAX_LENGTH) return text;
    return text.slice(0, TEXT_PREVIEW_MAX_LENGTH) + '...';
  };

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
              输入 URL 或文本
            </Label>

            <TextInputArea
              value={generatorState.textToEncode}
              onChange={setTextToEncode}
              placeholder="请输入 URL 或文本内容，将自动生成二维码"
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
                  生成中...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  生成二维码
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full select-none p-0.5 flex flex-col">
      <div className="border border-border rounded-xl bg-card text-card-foreground shadow-sm p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
            原始文本
          </Label>
          <Button variant="ghost" size="sm" onClick={backToEdit} className="h-6 px-2 text-xs">
            <Pencil className="w-3 h-3 mr-1" />
            编辑
          </Button>
        </div>
        <div
          className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2 cursor-default line-clamp-1"
          title={generatorState.savedText}
        >
          {getTruncatedText(generatorState.savedText)}
        </div>
      </div>

      <QrCodePreview
        qrCodeDataUrl={generatorState.qrCodeDataUrl}
        onDownload={downloadQrCode}
        onCopy={copyQrCode}
      />
    </div>
  );
}
