import React from 'react';
import { Copy, Download } from 'lucide-react';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
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
  /** 自定义占位文本，用于空状态提示 */
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
  // 空状态下的虚线骨架屏
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
        {/*
          二维码容器适配：
          在暗黑模式下，纯黑白的二维码如果直接暴露在暗色背景下，会导致手机摄像头极难识别。
          通过裹一层 bg-white 和 p-2，确保黑白对比度绝对安全，同时加入 shadow 增强卡片感。
        */}
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
            <span className="truncate text-xs">{'下载二维码'}</span>
          </Button>

          <Button variant="default" size="sm" onClick={onCopy} className="flex-1 h-8">
            <Copy className="w-3.5 h-3.5" />
            <span className="truncate text-xs">{'复制二维码'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QrCodePreview;
