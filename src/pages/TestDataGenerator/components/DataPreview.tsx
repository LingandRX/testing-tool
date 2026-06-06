/**
 * 数据预览组件
 * 展示生成的数据，支持 JSON 和 CSV 格式切换
 * 大数据量使用虚拟列表优化性能
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { Copy, Check, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import { DataExporter } from '@/utils/dataExporter';
import type { GenerateResult } from '@/types/testDataGenerator';

interface DataPreviewProps {
  result: GenerateResult | null;
}

type PreviewFormat = 'json' | 'csv';

/** 虚拟列表配置 */
const VIRTUAL_ROW_HEIGHT = 20;
const VIRTUAL_OVERSCAN = 5;

export default function DataPreview({ result }: DataPreviewProps) {
  const { t } = useI18n('testDataGenerator');
  const [format, setFormat] = useState<PreviewFormat>('json');
  const [copied, setCopied] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = result?.data;
  const hasData = data && data.length > 0;

  // 将数据转换为预渲染的行文本（避免每次滚动重复计算）
  const rows = useMemo(() => {
    if (!hasData) return [];
    if (format === 'json') {
      return data.map((item) => JSON.stringify(item));
    }
    // CSV 格式：先生成表头，再逐行
    const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
    const headerLine = headers.join(',');
    const dataLines = data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? '');
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(','),
    );
    return [headerLine, ...dataLines];
  }, [data, hasData, format]);

  const totalRows = rows.length;
  const isLargeDataset = totalRows > 100;
  const containerHeight = 400;

  // 虚拟列表：计算可见范围
  const visibleStart = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
  const visibleEnd = Math.min(
    totalRows,
    Math.ceil((scrollTop + containerHeight) / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN,
  );
  const visibleRows = rows.slice(visibleStart, visibleEnd);
  const totalHeight = totalRows * VIRTUAL_ROW_HEIGHT;

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const handleCopy = async () => {
    if (!hasData) return;
    const fullContent = format === 'json' ? DataExporter.toJSON(data) : DataExporter.toCSV(data);
    const success = await DataExporter.copyToClipboard(fullContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileJson className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">{t('testDataGenerator_noData')}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{t('testDataGenerator_noDataHint')}</p>
      </div>
    );
  }

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
          {isLargeDataset && (
            <span className="text-xs text-muted-foreground ml-2">
              {t('testDataGenerator_virtualMode', { count: totalRows })}
            </span>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? t('testDataGenerator_copied') : t('testDataGenerator_copy')}
        </Button>
      </div>

      {/* 虚拟列表预览 */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto rounded-lg bg-muted/50"
        onScroll={handleScroll}
        style={{ height: containerHeight }}
      >
        {isLargeDataset ? (
          /* 虚拟滚动模式 */
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: visibleStart * VIRTUAL_ROW_HEIGHT,
                left: 0,
                right: 0,
              }}
            >
              {visibleRows.map((row, i) => (
                <div
                  key={visibleStart + i}
                  className="px-4 py-0.5 text-sm font-mono text-foreground whitespace-pre-wrap break-all hover:bg-muted/30"
                  style={{ height: VIRTUAL_ROW_HEIGHT, lineHeight: `${VIRTUAL_ROW_HEIGHT}px` }}
                >
                  {row}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 普通模式（小数据量） */
          <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-all">
            {rows.join('\n')}
          </pre>
        )}
      </div>

      {/* 数据统计 */}
      <div className="mt-2 text-xs text-muted-foreground text-right">
        {t('testDataGenerator_totalRows', { count: data.length })}
      </div>
    </div>
  );
}
