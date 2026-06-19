import TextInputArea from '@/components/TextInputArea';
import { formatBytes } from '@/utils/format';
import StatCard from './components/StatCard';
import { useTextStatistics } from './useTextStatistics';

export default function Index() {
  const { text, stats, setText } = useTextStatistics();

  return (
    <div className="p-4 w-full space-y-4">
      <TextInputArea
        value={text}
        onChange={setText}
        placeholder={'在此输入或粘贴文本...'}
        minRows={10}
        maxRows={18}
        showClear={true}
        allowCopy={true}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="字符数" value={stats.characters} />
        <StatCard label="单词数" value={stats.words} />
        <StatCard label="行数" value={stats.lines} />
        <StatCard label="字节大小" value={formatBytes(stats.bytes)} />
      </div>
    </div>
  );
}
