/**
 * 导出面板组件
 * 提供复制、下载 JSON、下载 CSV 选项
 */

import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataExporter } from '@/utils/dataExporter';
import type { GenerateResult } from '@/types/testDataGenerator';

interface ExportPanelProps {
  result: GenerateResult | null;
}

export default function ExportPanel({ result }: ExportPanelProps) {
  if (!result?.data || result.data.length === 0) {
    return null;
  }

  const handleCopyJSON = async () => {
    const content = DataExporter.toJSON(result.data!);
    const success = await DataExporter.copyToClipboard(content);
    if (success) {
      toast.success('已复制到剪贴板');
    } else {
      toast.error('复制失败');
    }
  };

  const handleCopyCSV = async () => {
    const content = DataExporter.toCSV(result.data!);
    const success = await DataExporter.copyToClipboard(content);
    if (success) {
      toast.success('已复制到剪贴板');
    } else {
      toast.error('复制失败');
    }
  };

  const handleDownloadJSON = () => {
    const file = DataExporter.toSingleFile(result.data!, 'json', 'test-data');
    DataExporter.download(file);
  };

  const handleDownloadCSV = () => {
    const file = DataExporter.toSingleFile(result.data!, 'csv', 'test-data');
    DataExporter.download(file);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{'导出数据'}</h4>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyJSON} className="h-9 gap-1.5">
          <Copy className="h-4 w-4" />
          {'复制 JSON'}
        </Button>

        <Button variant="outline" size="sm" onClick={handleCopyCSV} className="h-9 gap-1.5">
          <Copy className="h-4 w-4" />
          {'复制 CSV'}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="h-9 gap-1.5">
          <Download className="h-4 w-4" />
          {'下载 JSON'}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="h-9 gap-1.5">
          <Download className="h-4 w-4" />
          {'下载 CSV'}
        </Button>
      </div>
    </div>
  );
}
