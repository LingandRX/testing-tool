import TextInputArea from '@/components/TextInputArea';
import { formatByteSize } from '@/utils/textStatistics';
import { useI18n } from '@/utils/chromeI18n';
import { useTextStatistics } from './useTextStatistics';
import { cn } from '@/lib/utils';

export default function Index() {
  const { t } = useI18n('textStatistics');
  const { text, stats, setText } = useTextStatistics();

  const statItems = [
    { label: t('textStatistics:characters'), value: stats.characters },
    { label: t('textStatistics:words'), value: stats.words },
    { label: t('textStatistics:lines'), value: stats.lines },
    { label: t('textStatistics:bytes'), value: formatByteSize(stats.bytes) },
  ];

  return (
    <div className="p-4 w-full space-y-4">
      <TextInputArea
        value={text}
        onChange={setText}
        placeholder={t('textStatistics:placeholder')}
        minRows={10}
        maxRows={18}
        showClear={true}
        allowCopy={true}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex flex-col justify-center items-center p-4 text-center rounded-xl border border-border bg-card shadow-sm text-card-foreground',
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
