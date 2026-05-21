import { useCallback, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TextInputArea from '@/components/TextInputArea';
import { formatByteSize, getTextStats } from '@/utils/textStatistics';
import { textStatisticsPageStyles } from '@/config/pageTheme';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useContextMenuData } from '@/utils/useContextMenuData';

/**
 * 文本统计页面组件
 *
 * 提供实时的文本分析功能，包括字符数、单词数、行数和字节大小。
 */
export default function Index() {
  const { t } = useLazyTranslation('textStatistics');
  const [text, setText] = useState('');

  const handleContextMenuData = useCallback((payload: string) => {
    setText(payload);
  }, []);

  useContextMenuData({ featureKey: 'textStatistics', onData: handleContextMenuData });

  // 实时计算统计信息，使用 useMemo 优化性能
  // 对于 10,000 字符以上的文本，Intl.Segmenter 也能保持良好的性能
  const stats = useMemo(() => getTextStats(text), [text]);

  const statItems = [
    { label: t('textStatistics:characters'), value: stats.characters },
    { label: t('textStatistics:words'), value: stats.words },
    { label: t('textStatistics:lines'), value: stats.lines },
    { label: t('textStatistics:bytes'), value: formatByteSize(stats.bytes) },
  ];

  return (
    <div>
      <div className="p-2">
        {/* 头部区域 */}
        <PageHeader
          title={t('textStatistics:pageTitle')}
          subtitle={t('textStatistics:pageSubtitle')}
          icon={<FileText />}
          iconColor={textStatisticsPageStyles.primaryColor}
        />

        {/* 文本输入区域 */}
        <TextInputArea
          value={text}
          onChange={setText}
          placeholder={t('textStatistics:placeholder')}
          minRows={8}
          maxRows={15}
          showClear={false}
          sx={{ marginBottom: '0.75rem' }}
        />

        {/* 统计结果展示区域 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="p-2 text-center rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[64px] md:min-h-[90px] flex flex-row md:flex-col items-center justify-between md:justify-center px-3 md:px-2 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(156,39,176,0.15)] hover:border-purple-600"
              style={{
                backgroundColor: `${textStatisticsPageStyles.primaryColor}0a`,
                borderColor: `${textStatisticsPageStyles.primaryColor}1a`,
              }}
            >
              <span className="text-gray-500 whitespace-nowrap mb-0 md:mb-1">{item.label}</span>
              <span
                className="break-all font-semibold"
                style={{ color: textStatisticsPageStyles.primaryColor }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
