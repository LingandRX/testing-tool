import { useCallback, useState } from 'react';
import { getTextStats, type TextStats } from '@/utils/textStatistics';
import { useContextMenuData } from '@/utils/useContextMenuData';

export interface UseTextStatisticsReturn {
  text: string;
  stats: TextStats;
  setText: (text: string) => void;
}

export function useTextStatistics(): UseTextStatisticsReturn {
  const [text, setText] = useState('');

  const handleContextMenuData = useCallback((payload: string) => {
    setText(payload);
  }, []);

  useContextMenuData({ featureKey: 'textStatistics', onData: handleContextMenuData });

  const stats = getTextStats(text);

  return { text, stats, setText };
}
