import { useEffect, useState } from 'react';
import { getActiveTabDomain } from '@/utils/chromeTabs';

/**
 * 自动获取并维护当前活动标签页域名的 Hook
 */
export function useActiveTabDomain() {
  const [domain, setDomain] = useState<string>('');

  useEffect(() => {
    getActiveTabDomain().then(setDomain);

    // 如果需要实时同步（如切换标签页），可以监听 chrome.tabs.onActivated
    const handleActivated = () => getActiveTabDomain().then(setDomain);
    const handleUpdated = (_: number, changeInfo: { url?: string }) => {
      if (changeInfo.url) getActiveTabDomain().then(setDomain);
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, []);

  return domain;
}
