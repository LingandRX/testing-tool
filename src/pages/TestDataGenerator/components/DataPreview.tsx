/**
 * 数据预览组件
 * 展示生成的数据，支持 JSON 和 CSV 格式切换
 */

import { useState } from 'react';
import { Copy, Check, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import { DataExporter } from '@/utils/dataExporter';
import type { GenerateResult } from '@/types/testDataGenerator';

interface DataPreviewProps {
  result: GenerateResult | null;
  pageSize?: number;
}

type PreviewFormat = 'json' | 'csv';

export default function DataPreview({ result, pageSize = 20 }: DataPreviewProps) {
  const { t } = useI18n('testDataGenerator');
  const [format, setFormat] = useState<PreviewFormat>('json');
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!result?.data || result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileJson className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">{t('testDataGenerator_noData')}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{t('testDataGenerator_noDataHint')}</p>
      </div>
    );
  }

  const data = result.data;
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const currentPageData = data.slice(startIndex, endIndex);

  const content =
    format === 'json' ? DataExporter.toJSON(currentPageData) : DataExporter.toCSV(currentPageData);

  const handleCopy = async () => {
    const fullContent = format === 'json' ? DataExporter.toJSON(data) : DataExporter.toCSV(data);
    const success = await DataExporter.copyToClipboard(fullContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={format === 'json' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFormat('json')}
            className="h-8 gap-1.5"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button
            variant={format === 'csv' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFormat('csv')}
            className="h-8 gap-1.5"
          >
            <FileText className="h-4 w-4" />
            CSV
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? t('testDataGenerator_copied') : t('testDataGenerator_copy')}
        </Button>
      </div>

      {/* 代码预览 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <pre className="h-full overflow-auto p-4 rounded-lg bg-muted/50 text-sm font-mono text-foreground whitespace-pre-wrap break-all">
          {content}
        </pre>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {t('testDataGenerator_pageInfo', {
              current: currentPage + 1,
              total: totalPages,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="h-7"
            >
              {t('testDataGenerator_prevPage')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-7"
            >
              {t('testDataGenerator_nextPage')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
