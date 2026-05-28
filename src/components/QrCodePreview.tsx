import React from 'react';
import { Copy, Download } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 继承原生 HTML Div 属性，方便外部无缝扩充类名或监听事件
interface QrCodePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 二维码 Data URL */
  qrCodeDataUrl: string;
  /** 下载回调 */
  onDownload: () => void;
  /** 复制回调 */
  onCopy: () => void;
}

const QrCodePreview = ({
  qrCodeDataUrl,
  onDownload,
  onCopy,
  className,
  ...props
}: QrCodePreviewProps) => {
  const { t } = useI18n('qrCode');

  // 空状态下的虚线骨架屏
  if (!qrCodeDataUrl) {
    return (
      <div
        className={cn(
          'flex flex-col justify-center items-center min-h-[200px] border border-dashed border-input rounded-xl p-4 bg-muted/40',
          className,
        )}
        {...props}
      >
        <p className="text-sm text-muted-foreground text-center">{t('qrCode:qrCodeWillShow')}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center min-h-[200px] border border-input rounded-xl p-6 bg-muted/40',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center w-full max-w-xs">
        {/*
          2. 二维码容器适配：
          在暗黑模式下，纯黑白的二维码如果直接暴露在暗色背景下，会导致手机摄像头极难识别。
          通过裹一层 bg-white 和 p-3，确保黑白对比度绝对安全，同时加入 shadow 增强卡片感。
        */}
        <div className="p-3 bg-white rounded-lg shadow-sm border border-border/40">
          <img
            src={qrCodeDataUrl}
            alt="QR Code Preview"
            className="w-56 h-56 max-w-full object-contain block animate-in fade-in duration-300"
          />
        </div>

        <div className="flex w-full gap-2 mt-5">
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1">
            <Download className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{t('qrCode:downloadButton')}</span>
          </Button>

          <Button variant="default" size="sm" onClick={onCopy} className="flex-1">
            <Copy className="w-4 h-4" />
            <span className="truncate">{t('qrCode:copyQrButton')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QrCodePreview;
