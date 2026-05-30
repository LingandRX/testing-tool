import { Loader2, Pencil, QrCode } from 'lucide-react';
import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import { useI18n } from '@/utils/chromeI18n';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch select-none p-0.5">
      {/* 左侧：输入态显示输入框，预览态显示文本预览 */}
      <div
        className={cn(
          'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4',
          isInputStep && 'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
        )}
      >
        <div className="flex flex-col space-y-2.5 h-full">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
              {isInputStep ? t('qrCode:urlInputLabel') : t('qrCode:textPreviewLabel')}
            </Label>

            {/* 预览态显示编辑按钮 */}
            {!isInputStep && (
              <Button variant="ghost" size="sm" onClick={backToEdit} className="h-7 px-2 text-xs">
                <Pencil className="w-3 h-3 mr-1" />
                {t('qrCode:editButton')}
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0">
            {isInputStep ? (
              /* 输入态：可编辑的输入框 */
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
            ) : (
              /* 预览态：只读文本预览 */
              <div
                className="h-full min-h-[150px] p-3 rounded-md border border-input bg-muted/50 overflow-auto"
                title={generatorState.savedText}
              >
                <p className="text-sm text-foreground whitespace-pre-wrap break-all">
                  {generatorState.savedText}
                </p>
              </div>
            )}
          </div>

          {/* 输入态显示生成按钮 */}
          {isInputStep && (
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
          )}
        </div>
      </div>

      {/* 右侧：二维码预览区域 */}
      <div className="flex flex-col h-full">
        <QrCodePreview
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onDownload={downloadQrCode}
          onCopy={copyQrCode}
          placeholderText={isInputStep ? t('qrCode:generateFirstHint') : undefined}
        />
      </div>
    </div>
  );
}
