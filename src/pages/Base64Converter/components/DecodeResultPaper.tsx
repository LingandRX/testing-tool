import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBytes } from '@/utils/format';

interface DecodeResultPaperProps {
  title: string;
  mimeType: string;
  blobSize: number;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onDownload: () => void;
  children?: React.ReactNode;
}

export default function DecodeResultPaper({
  title,
  mimeType,
  blobSize,
  fileName,
  onFileNameChange,
  onDownload,
  children,
}: DecodeResultPaperProps) {
  return (
    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
      <span className="block mb-2 text-xs font-bold text-muted-foreground">{title}</span>

      {children}

      <div className="flex gap-4 mb-3">
        <span className="text-xs text-muted-foreground">推断的 MIME 类型: {mimeType}</span>
        <span className="text-xs text-muted-foreground">解码大小: {formatBytes(blobSize)}</span>
      </div>

      <div className="mb-3">
        <Label className="block text-xs font-medium text-muted-foreground mb-1">解码后文件名</Label>
        <Input value={fileName} onChange={(e) => onFileNameChange(e.target.value)} />
      </div>

      <Button
        variant="default"
        onClick={onDownload}
        disabled={!fileName.trim()}
        className="w-full rounded-lg font-bold"
      >
        <Download className="mr-2 h-4 w-4" />
        下载
      </Button>
    </div>
  );
}
