import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTextStats, type TextStats } from '@/utils/textStatistics';
import { useContextMenuData } from '@/utils/useContextMenuData';

export interface UseTextStatisticsReturn {
  text: string;
  stats: TextStats;
  setText: (text: string) => void;
}

export function useTextStatistics(): UseTextStatisticsReturn {
  const [text, setText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedText(text), 200);
    return () => clearTimeout(handle);
  }, [text]);

  const handleContextMenuData = useCallback((payload: string) => {
    setText(payload);
  }, []);

  useContextMenuData({ featureKey: 'textStatistics', onData: handleContextMenuData });

  const stats = useMemo(() => getTextStats(debouncedText), [debouncedText]);

  return { text, stats, setText };
}
