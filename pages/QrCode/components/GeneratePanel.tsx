import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import { useI18n } from '@/utils/chromeI18n';
import { useQrCodeContext } from '../contexts/QrCodeContext';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function GeneratePanel() {
  const { t } = useI18n('qrCode');
  const { generatorState, setTextToEncode, downloadQrCode, copyQrCode } = useQrCodeContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch select-none p-0.5">
      {/* 左翼：高性能受控输入翼终端 */}
      <div
        className={cn(
          'border border-border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col p-4',
          'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
        )}
      >
        {/* 💡 2. 独立外置标签架（A11y 无障碍对齐）：
           - 彻底删掉 TextInputArea 上引发崩溃的违规属性。
           - 改用正统的 <Label />，并注入标准的高度无障碍样式，间距比例极度平滑。
        */}
        <div className="flex flex-col space-y-2.5 h-full">
          <Label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider select-none pl-0.5">
            {t('qrCode:urlInputLabel')}
          </Label>

          <div className="flex-1 min-h-0">
            <TextInputArea
              value={generatorState.textToEncode}
              onChange={setTextToEncode}
              placeholder={t('qrCode:urlInputPlaceholder')}
              showCount={true}
              showClear={true}
              allowCopy={true}
              minRows={6}
              maxRows={12}
              externalError={generatorState.inputError || undefined}
              onClear={() => setTextToEncode('')}
            />
          </div>
        </div>
      </div>

      {/* 右翼：活态二维码高精生成区 */}
      <div className="flex flex-col h-full">
        <QrCodePreview
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onDownload={downloadQrCode}
          onCopy={copyQrCode}
        />
      </div>
    </div>
  );
}
