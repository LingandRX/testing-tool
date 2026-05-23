import { useCallback, useEffect, useState } from 'react';
import { MessageAction, sendMessageToContent } from '@/utils/messages';

export interface UseRightClickRestorerReturn {
  domain: string;
  isLoading: boolean;
  isUnlocked: boolean;
  unlock: () => Promise<void>;
}

export function useRightClickRestorer(): UseRightClickRestorerReturn {
  const [domain, setDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) {
          try {
            setDomain(new URL(tab.url).hostname);
          } catch {
            setDomain('');
          }
        }

        const response = await sendMessageToContent(MessageAction.QUERY_RIGHT_CLICK_STATUS);
        if (response?.success) {
          setIsUnlocked(response.restored);
        }
      } catch (err) {
        console.error('[RightClickRestorer] Failed to load state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const unlock = useCallback(async () => {
    try {
      const response = await sendMessageToContent(MessageAction.RESTORE_RIGHT_CLICK);
      if (response?.success) {
        setIsUnlocked(response.restored);
      }
    } catch (err) {
      console.error('[RightClickRestorer] Failed to unlock:', err);
    }
  }, []);

  return {
    domain,
    isLoading,
    isUnlocked,
    unlock,
  };
}
