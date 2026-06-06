/**
 * 数据预览组件
 * 展示一条示例数据，展示数据结构
 */

import { useMemo } from 'react';
import { FileJson, FileText } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import { getGeneratorById } from '@/lib/generators';
import type { FieldConfig } from '@/types/testDataGenerator';

interface DataPreviewProps {
  fields: FieldConfig[];
}

/** JSON 语法高亮渲染 */
function JsonHighlight({ data }: { data: Record<string, unknown> }) {
  const formatted = useMemo(() => {
    const lines: { indent: string; key?: string; value: string; isLast: boolean }[] = [];
    const entries = Object.entries(data);

    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const formattedValue =
        value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value);
      lines.push({ indent: '  ', key, value: formattedValue, isLast });
    });

    return lines;
  }, [data]);

  return (
    <pre className="text-sm font-mono leading-relaxed">
      <span className="text-muted-foreground">{'{'}</span>
      {formatted.map((line, i) => (
        <div key={i} className="flex">
          <span className="text-muted-foreground">{line.indent}</span>
          <span className="text-blue-500 dark:text-blue-400">&quot;{line.key}&quot;</span>
          <span className="text-muted-foreground">{': '}</span>
          <span className={getValueColor(line.value)}>{line.value}</span>
          {!line.isLast && <span className="text-muted-foreground">,</span>}
        </div>
      ))}
      <span className="text-muted-foreground">{'}'}</span>
    </pre>
  );
}

/** 根据值类型返回颜色类名 */
function getValueColor(value: string): string {
  if (value === 'null') return 'text-muted-foreground';
  if (value.startsWith('"')) return 'text-emerald-600 dark:text-emerald-400';
  if (/^\d+$/.test(value)) return 'text-amber-600 dark:text-amber-400';
  if (value === 'true' || value === 'false') return 'text-purple-600 dark:text-purple-400';
  return 'text-foreground';
}

export default function DataPreview({ fields }: DataPreviewProps) {
  const { t } = useI18n('testDataGenerator');

  // 生成一条示例数据
  const sampleData = useMemo(() => {
    if (fields.length === 0) return null;

    const record: Record<string, unknown> = {};
    for (const field of fields) {
      const generator = getGeneratorById(field.generatorId);
      if (generator) {
        record[field.name] = generator.generate(field.params);
      } else {
        record[field.name] = null;
      }
    }
    return record;
  }, [fields]);

  if (!sampleData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileJson className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground/50">{t('testDataGenerator_noDataHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 示例标签 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
            <FileText className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {t('testDataGenerator_sampleData')}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">
          {Object.keys(sampleData).length} {t('testDataGenerator_fields')}
        </span>
      </div>

      {/* 示例数据展示 */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-zinc-950 dark:bg-zinc-900 p-4">
        <JsonHighlight data={sampleData} />
      </div>
    </div>
  );
}
