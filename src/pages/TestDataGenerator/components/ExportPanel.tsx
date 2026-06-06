/**
 * 导出面板组件
 * 提供复制、下载 JSON、下载 CSV 选项
 */

import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import { DataExporter } from '@/utils/dataExporter';
import type { GenerateResult } from '@/types/testDataGenerator';

interface ExportPanelProps {
  result: GenerateResult | null;
}

export default function ExportPanel({ result }: ExportPanelProps) {
  const { t } = useI18n('testDataGenerator');

  if (!result?.data || result.data.length === 0) {
    return null;
  }

  const handleCopyJSON = async () => {
    const content = DataExporter.toJSON(result.data!);
    const success = await DataExporter.copyToClipboard(content);
    if (success) {
      toast.success(t('testDataGenerator_copySuccess'));
    } else {
      toast.error(t('testDataGenerator_copyFailed'));
    }
  };

  const handleCopyCSV = async () => {
    const content = DataExporter.toCSV(result.data!);
    const success = await DataExporter.copyToClipboard(content);
    if (success) {
      toast.success(t('testDataGenerator_copySuccess'));
    } else {
      toast.error(t('testDataGenerator_copyFailed'));
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
      <h4 className="text-sm font-medium text-foreground">{t('testDataGenerator_export')}</h4>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyJSON} className="h-9 gap-1.5">
          <Copy className="h-4 w-4" />
          {t('testDataGenerator_copyJSON')}
        </Button>

        <Button variant="outline" size="sm" onClick={handleCopyCSV} className="h-9 gap-1.5">
          <Copy className="h-4 w-4" />
          {t('testDataGenerator_copyCSV')}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="h-9 gap-1.5">
          <Download className="h-4 w-4" />
          {t('testDataGenerator_downloadJSON')}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="h-9 gap-1.5">
          <Download className="h-4 w-4" />
          {t('testDataGenerator_downloadCSV')}
        </Button>
      </div>
    </div>
  );
}
