import { useCallback, useSyncExternalStore } from 'react';

/**
 * 监听媒体查询，返回是否匹配。
 * 用于在窄屏（popup/sidepanel）与宽屏（tab）间切换布局。
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () =>
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
