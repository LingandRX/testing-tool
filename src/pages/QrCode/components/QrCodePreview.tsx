import React from 'react';
import { Copy, Download } from 'lucide-react';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QrCodePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  qrCodeDataUrl: string;
  onDownload: () => void;
  onCopy: () => void;
  placeholderText?: string;
}

const QrCodePreview = ({
  qrCodeDataUrl,
  onDownload,
  onCopy,
  placeholderText,
  className,
  ...props
}: QrCodePreviewProps) => {
  if (!qrCodeDataUrl) {
    return (
      <EmptyPlaceholder
        className={cn('min-h-[200px] p-4', className)}
        messageClassName="text-sm text-muted-foreground max-w-none"
        {...props}
      >
        {placeholderText || '二维码将显示在这里'}
      </EmptyPlaceholder>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center border border-input rounded-xl p-4 bg-muted/40',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center w-full max-w-xs">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-border/40">
          <img
            src={qrCodeDataUrl}
            alt="QR Code Preview"
            className="w-48 h-48 max-w-full object-contain block animate-in fade-in duration-300"
          />
        </div>

        <div className="flex w-full gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1 h-8">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate text-xs">下载二维码</span>
          </Button>

          <Button variant="default" size="sm" onClick={onCopy} className="flex-1 h-8">
            <Copy className="w-3.5 h-3.5" />
            <span className="truncate text-xs">复制二维码</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QrCodePreview;
