import TextInputArea from '@/components/TextInputArea';
import QrCodePreview from '@/components/QrCodePreview';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useQrCodeContext } from '../contexts/QrCodeContext';

export default function GeneratePanel() {
  const { t } = useLazyTranslation('qrCode');
  const { generatorState, setTextToEncode, downloadQrCode, copyQrCode } = useQrCodeContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TextInputArea
          title={t('qrCode:urlInputLabel')}
          value={generatorState.textToEncode}
          onChange={setTextToEncode}
          placeholder={t('qrCode:urlInputPlaceholder')}
          showCount
          showClear
          allowCopy
          externalError={generatorState.inputError}
        />
      </div>
      <div>
        <QrCodePreview
          qrCodeDataUrl={generatorState.qrCodeDataUrl}
          onDownload={downloadQrCode}
          onCopy={copyQrCode}
        />
      </div>
    </div>
  );
}
