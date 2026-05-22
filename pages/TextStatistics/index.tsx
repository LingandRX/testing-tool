import { useCallback, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TextInputArea from '@/components/TextInputArea';
import { formatByteSize, getTextStats } from '@/utils/textStatistics';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { cn } from '@/lib/utils';

export default function Index() {
  const { t } = useLazyTranslation('textStatistics');
  const [text, setText] = useState('');

  const handleContextMenuData = useCallback((payload: string) => {
    setText(payload);
  }, []);

  useContextMenuData({ featureKey: 'textStatistics', onData: handleContextMenuData });

  // 实时计算统计信息，由 useMemo 拦截非必要计算
  const stats = useMemo(() => getTextStats(text), [text]);

  const statItems = [
    { label: t('textStatistics:characters'), value: stats.characters },
    { label: t('textStatistics:words'), value: stats.words },
    { label: t('textStatistics:lines'), value: stats.lines },
    { label: t('textStatistics:bytes'), value: formatByteSize(stats.bytes) },
  ];

  return (
    <div className="p-4 w-full space-y-4 animate-in fade-in duration-300">
      {/* 头部区域 */}
      <PageHeader
        title={t('textStatistics:pageTitle')}
        subtitle={t('textStatistics:pageSubtitle')}
        icon={<FileText />}
        iconColor="text-purple-500"
      />

      {/* 文本输入区域 */}
      <TextInputArea
        value={text}
        onChange={setText}
        placeholder={t('textStatistics:placeholder')}
        minRows={10}
        maxRows={18}
        showClear={true}
        allowCopy={true}
      />

      {/* 统计结果展示区域 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex flex-col justify-center items-center p-4 text-center rounded-xl border border-border bg-card shadow-sm text-card-foreground',
              'transition-all duration-200 ease-out',
              'hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 focus-within:ring-1 focus-within:ring-ring',
            )}
          >
            <span className="text-xs font-medium text-muted-foreground tracking-wider mb-1 select-none">
              {item.label}
            </span>
            <span className="font-mono text-lg md:text-2xl font-extrabold text-primary break-all tracking-tight leading-none tabular-nums select-all">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
