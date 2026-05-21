import { Download, Copy } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

interface QrCodePreviewProps {
  /** 二维码 Data URL */
  qrCodeDataUrl: string;
  /** 下载回调 */
  onDownload: () => void;
  /** 复制回调 */
  onCopy: () => void;
}

const QrCodePreview = ({ qrCodeDataUrl, onDownload, onCopy }: QrCodePreviewProps) => {
  const { t } = useLazyTranslation('qrCode');

  if (!qrCodeDataUrl) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
        <span className="text-sm text-gray-500 text-center">{t('qrCode:qrCodeWillShow')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
      <div className="flex flex-col items-center w-full">
        <img src={qrCodeDataUrl} alt="QR Code" className="w-[250px] h-[250px] block" />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('qrCode:downloadButton')}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {t('qrCode:copyQrButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCodePreview;
